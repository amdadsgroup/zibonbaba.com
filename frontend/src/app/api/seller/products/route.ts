import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ products: [], error }, { status: status || 200 });
    }

    const products = await prisma.product.findMany({
      where: { storeId: context.store.id },
      include: {
        category: true,
        variants: {
          include: {
            inventory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedProducts = products.map((p) => {
      let totalStock = 0;
      p.variants.forEach((v) => {
        v.inventory.forEach((inv) => {
          totalStock += inv.quantity;
        });
      });

      const firstVariant = p.variants[0];
      let variantAttrs: any = {};
      try {
        if (firstVariant?.attributes) {
          variantAttrs = typeof firstVariant.attributes === 'string' ? JSON.parse(firstVariant.attributes) : firstVariant.attributes;
        }
      } catch (_) {}

      const mainImage = variantAttrs.image || (Array.isArray(variantAttrs.images) && variantAttrs.images[0]) || null;
      const galleryImages = Array.isArray(variantAttrs.images) ? variantAttrs.images : (mainImage ? [mainImage] : []);

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: p.basePrice,
        category: p.category?.name || 'General',
        categoryId: p.categoryId,
        status: p.status,
        sku: firstVariant?.sku || p.id.substring(0, 8).toUpperCase(),
        stock: totalStock || 10,
        image: mainImage,
        images: galleryImages,
        createdAt: p.createdAt
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (err: any) {
    console.error('Seller Products GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Store not configured.' }, { status: status || 400 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, category, sku, stock = 20, image, images } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    // Resolve category
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
      } else {
        const newCat = await prisma.category.create({
          data: {
            name: category,
            slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)
          }
        });
        targetCategoryId = newCat.id;
      }
    }

    if (!targetCategoryId) {
      const defaultCat = await prisma.category.findFirst();
      targetCategoryId = defaultCat?.id;
    }

    if (!targetCategoryId) {
      return NextResponse.json({ error: 'Valid category is required.' }, { status: 400 });
    }

    const generatedSku = sku ? sku.trim().toUpperCase() : `SKU-${Date.now().toString().slice(-6)}`;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const numStock = typeof stock === 'string' ? parseInt(stock, 10) : stock;

    const primaryImage = image ? image.trim() : (Array.isArray(images) && images.length > 0 ? images[0] : null);
    const gallery = Array.isArray(images) && images.length > 0 ? images : (primaryImage ? [primaryImage] : []);

    const variantAttributes = JSON.stringify({
      variant: 'Standard',
      image: primaryImage,
      images: gallery
    });

    // Create product, variant, and inventory
    const newProduct = await prisma.product.create({
      data: {
        storeId: context.store.id,
        categoryId: targetCategoryId,
        name: name.trim(),
        description: description ? description.trim() : '',
        basePrice: numPrice,
        status: context.store.isApproved ? 'PUBLISHED' : 'PENDING_APPROVAL',
        variants: {
          create: {
            sku: generatedSku,
            price: numPrice,
            attributes: variantAttributes,
            inventory: {
              create: {
                quantity: isNaN(numStock) ? 20 : numStock,
                reorderPoint: 5
              }
            }
          }
        }
      },
      include: {
        category: true,
        variants: {
          include: { inventory: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product SKU created successfully with image.',
      product: {
        ...newProduct,
        image: primaryImage,
        images: gallery
      }
    }, { status: 201 });
  } catch (err: any) {
    console.error('Seller Product Create API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
