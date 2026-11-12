import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    // Ownership check: Product must belong to this seller's store (or user is Super Admin)
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const isOwner = product.storeId === context.store.id;
    const isAdmin = context.user.role === 'SUPER_ADMIN' || context.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access Denied. You do not own this product.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, stock, status: productStatus, category, categoryId, image, images } = body;

    let targetCategoryId = categoryId;
    if (!targetCategoryId && category) {
      const existingCat = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: category, mode: 'insensitive' } },
            { slug: { equals: category.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
          ]
        }
      });
      if (existingCat) {
        targetCategoryId = existingCat.id;
      }
    }

    const numPrice = price !== undefined ? (typeof price === 'string' ? parseFloat(price) : price) : undefined;
    const numStock = stock !== undefined ? (typeof stock === 'string' ? parseInt(stock, 10) : stock) : undefined;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(numPrice !== undefined ? { basePrice: numPrice } : {}),
        ...(productStatus ? { status: productStatus } : {}),
        ...(targetCategoryId ? { categoryId: targetCategoryId } : {})
      }
    });

    // Update variant price / stock / image attributes if provided
    if (product.variants[0]) {
      const primaryVariant = product.variants[0];
      const variantId = primaryVariant.id;
      
      let existingAttrs: any = {};
      try {
        if (primaryVariant.attributes) {
          existingAttrs = typeof primaryVariant.attributes === 'string' ? JSON.parse(primaryVariant.attributes) : primaryVariant.attributes;
        }
      } catch (_) {}

      if (image !== undefined || images !== undefined) {
        if (image !== undefined) existingAttrs.image = image;
        if (images !== undefined) existingAttrs.images = images;
        else if (image && !existingAttrs.images) existingAttrs.images = [image];
      }

      await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          ...(numPrice !== undefined ? { price: numPrice } : {}),
          attributes: JSON.stringify(existingAttrs)
        }
      });

      if (numStock !== undefined) {
        const inv = await prisma.inventory.findFirst({ where: { variantId } });
        if (inv) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: numStock }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (err: any) {
    console.error('Seller Product PUT API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const isOwner = product.storeId === context.store.id;
    const isAdmin = context.user.role === 'SUPER_ADMIN' || context.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access Denied. You do not own this product.' }, { status: 403 });
    }

    const variants = await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } });
    const variantIds = variants.map(v => v.id);

    if (variantIds.length > 0) {
      await prisma.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
      await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Product SKU deleted successfully.'
    });
  } catch (err: any) {
    console.error('Seller Product DELETE API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
