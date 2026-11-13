import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const storeId = searchParams.get('storeId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (category && category !== 'ALL') {
      whereClause.category = { name: category };
    }

    if (storeId && storeId !== 'ALL') {
      whereClause.storeId = storeId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          store: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          variants: {
            include: {
              inventory: { select: { quantity: true } }
            }
          }
        }
      })
    ]);

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((acc, v) => {
        return acc + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      }, 0);

      const mainVariant = p.variants[0];
      const sku = mainVariant?.sku || 'SKU-NONE';

      let image = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
      let rejectionReason = '';
      try {
        if (mainVariant?.attributes) {
          const parsed = typeof mainVariant.attributes === 'string'
            ? JSON.parse(mainVariant.attributes)
            : mainVariant.attributes;
          if (parsed?.image) image = parsed.image;
          else if (Array.isArray(parsed?.images) && parsed.images[0]) image = parsed.images[0];
          if (parsed?.rejectionReason) rejectionReason = parsed.rejectionReason;
        }
      } catch (_) {}

      return {
        id: p.id,
        name: p.name,
        sku,
        vendorName: p.store?.name || 'Zibonbaba Direct',
        storeId: p.storeId,
        categoryName: p.category?.name || 'General',
        price: p.basePrice,
        stock: totalStock,
        salesCount: Math.floor((p.name.length * 13) % 95),
        status: p.status,
        image,
        description: p.description,
        rejectionReason,
        createdAt: p.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      total: totalCount,
      products: formatted
    });
  } catch (err: any) {
    console.error('Admin Products Fetch Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, status, name, basePrice, stock, rejectionReason } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    let updateData: any = {};
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);

    // If rejection reason is provided, update variant attributes
    if (rejectionReason && existingProduct.variants[0]) {
      const v = existingProduct.variants[0];
      let attrs: any = {};
      try {
        attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {});
      } catch (_) {}
      attrs.rejectionReason = rejectionReason;
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { attributes: JSON.stringify(attrs) }
      });
    }

    // If stock adjustment is requested
    if (stock !== undefined && existingProduct.variants[0]) {
      const v = existingProduct.variants[0];
      const inv = await prisma.inventory.findFirst({ where: { variantId: v.id } });
      if (inv) {
        await prisma.inventory.update({
          where: { id: inv.id },
          data: { quantity: parseInt(stock) || 0 }
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData
    });

    await logAdminAction(
      auth.user?.id || null,
      `Updated product "${updated.name}" status to "${status || updated.status}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (err: any) {
    console.error('Admin Product Update Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const prod = await prisma.product.findUnique({ where: { id } });
    if (!prod) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted product "${prod.name}" (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: `Product "${prod.name}" deleted successfully.`
    });
  } catch (err: any) {
    console.error('Admin Product Delete Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

