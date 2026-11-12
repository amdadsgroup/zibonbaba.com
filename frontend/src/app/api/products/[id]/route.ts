import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

const getProductImage = (cat: string, name: string) => {
  const c = (cat || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (c.includes('electronic') || c.includes('gadget') || c.includes('tech')) {
    if (n.includes('earbud') || n.includes('headphone') || n.includes('headset')) return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80';
    if (n.includes('watch')) return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80';
    if (n.includes('keyboard')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80';
    if (n.includes('speaker')) return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80';
    if (n.includes('mouse')) return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80';
    if (n.includes('webcam')) return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('beauty') || c.includes('health') || c.includes('skincare')) {
    if (n.includes('cream') || n.includes('moisturizer')) return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80';
    if (n.includes('lipstick') || n.includes('makeup')) return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('kitchen') || c.includes('home')) {
    if (n.includes('kettle') || n.includes('coffee')) return 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80';
    if (n.includes('pan') || n.includes('cooker')) return 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('apparel') || c.includes('fashion') || c.includes('clothing')) {
    if (n.includes('shirt') || n.includes('polo') || n.includes('t-shirt')) return 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80';
    if (n.includes('denim') || n.includes('pants') || n.includes('jacket')) return 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('grocery') || c.includes('organic') || c.includes('food')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('book') || c.includes('library')) {
    return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('toy') || c.includes('game')) {
    return 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('sport') || c.includes('outdoor') || c.includes('fit')) {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('auto') || c.includes('gear') || c.includes('car')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80';
  }
  if (c.includes('jewel') || c.includes('gem') || c.includes('luxury')) {
    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80';
  }

  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        category: true,
        variants: {
          include: {
            inventory: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const totalStock = product.variants.reduce((total, v) => {
      return total + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    }, 0);

    const mainVariant = product.variants[0];
    const sku = mainVariant ? mainVariant.sku : 'SKU-NONE';

    const formattedProduct = {
      id: product.id,
      name: product.name,
      price: product.basePrice,
      category: product.category?.name || 'Uncategorized',
      categoryId: product.categoryId,
      status: product.status,
      rating: 4.5 + Math.random() * 0.5,
      image: getProductImage(product.category?.name || '', product.name),
      sku,
      stock: totalStock,
      vendor: product.store?.name || 'Unknown',
      storeId: product.storeId,
      description: product.description || 'No description provided.'
    };

    return NextResponse.json({ product: formattedProduct }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    const { id } = await params;
    const body = await request.json();
    const { name, price, description, status, category, categoryId, stock } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        variants: { include: { inventory: true } }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Check authorization if user is logged in
    if (user) {
      const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'INVENTORY_MANAGER'];
      const isAdmin = adminRoles.includes(user.role.toUpperCase());
      const isOwner = existingProduct.store?.ownerId === user.id;

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access Denied. You are not authorized to modify this product.' }, { status: 403 });
      }
    }

    // Resolve category if provided
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

    const numPrice = price !== undefined ? (typeof price === 'string' ? parseFloat(price) : price) : undefined;
    const numStock = stock !== undefined ? (typeof stock === 'string' ? parseInt(stock, 10) : stock) : undefined;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        basePrice: numPrice !== undefined && !isNaN(numPrice) ? numPrice : undefined,
        description: description !== undefined ? description.trim() : undefined,
        status: status || undefined,
        categoryId: targetCategoryId || undefined
      },
      include: {
        category: true,
        store: true,
        variants: { include: { inventory: true } }
      }
    });

    // Update variant price / stock
    if (existingProduct.variants[0]) {
      const variantId = existingProduct.variants[0].id;
      if (numPrice !== undefined && !isNaN(numPrice)) {
        await prisma.productVariant.update({
          where: { id: variantId },
          data: { price: numPrice }
        });
      }
      if (numStock !== undefined && !isNaN(numStock)) {
        const inv = await prisma.inventory.findFirst({ where: { variantId } });
        if (inv) {
          await prisma.inventory.update({
            where: { id: inv.id },
            data: { quantity: numStock }
          });
        }
      }
    }

    if (user) {
      await logAdminAction(user.id, `Updated product SKU [${updatedProduct.name}] - Price: ৳${updatedProduct.basePrice}`);
    }

    // Broadcast Real-Time Product & Inventory Update Event
    try {
      const { realtimeEngine } = await import('@/lib/services/realtimeEngine');
      const { PlatformEventType } = await import('@/lib/constants/events');
      await realtimeEngine.broadcast({
        eventId: `evt_prod_${Date.now()}`,
        eventType: status ? PlatformEventType.PRODUCT_STATUS_UPDATED : PlatformEventType.PRODUCT_UPDATED,
        aggregateType: 'PRODUCT',
        aggregateId: updatedProduct.id,
        timestamp: new Date().toISOString(),
        channels: ['all', 'role:ADMIN', `store:${updatedProduct.storeId}`],
        data: {
          productId: updatedProduct.id,
          name: updatedProduct.name,
          price: updatedProduct.basePrice,
          status: updatedProduct.status,
          stock: numStock,
          storeId: updatedProduct.storeId
        }
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct
    }, { status: 200 });
  } catch (err: any) {
    console.error('Product PUT Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser(request);
    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        variants: { include: { inventory: true } }
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Check authorization if user is logged in
    if (user) {
      const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'INVENTORY_MANAGER'];
      const isAdmin = adminRoles.includes(user.role.toUpperCase());
      const isOwner = existingProduct.store?.ownerId === user.id;

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access Denied. You are not authorized to delete this product.' }, { status: 403 });
      }
    }

    // Safely delete inventory, order items, and variants before deleting product
    const variantIds = existingProduct.variants.map((v) => v.id);
    if (variantIds.length > 0) {
      await prisma.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
      await prisma.orderItem.deleteMany({ where: { variantId: { in: variantIds } } });
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    await prisma.product.delete({
      where: { id }
    });

    if (user) {
      await logAdminAction(user.id, `Deleted product [${existingProduct.name}]`);
    }

    // Broadcast Real-Time Product Deletion
    try {
      const { realtimeEngine } = await import('@/lib/services/realtimeEngine');
      const { PlatformEventType } = await import('@/lib/constants/events');
      await realtimeEngine.broadcast({
        eventId: `evt_prod_del_${Date.now()}`,
        eventType: PlatformEventType.PRODUCT_STATUS_UPDATED,
        aggregateType: 'PRODUCT',
        aggregateId: id,
        timestamp: new Date().toISOString(),
        channels: ['all', 'role:ADMIN', `store:${existingProduct.storeId}`],
        data: {
          productId: id,
          status: 'DELETED',
          storeId: existingProduct.storeId
        }
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Product ${existingProduct.name} deleted successfully.`
    }, { status: 200 });
  } catch (err: any) {
    console.error('Product DELETE Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
