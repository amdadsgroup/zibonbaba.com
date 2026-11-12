import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  try {
    const minVal = minPrice ? parseFloat(minPrice) : 0;
    const maxVal = maxPrice ? parseFloat(maxPrice) : 999999;

    let whereClause: any = {
      basePrice: { gte: minVal, lte: maxVal }
    };

    if (category && category !== 'All') {
      whereClause.category = {
        name: category
      };
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { description: { contains: query } }
      ];
    }

    const dbProducts = await prisma.product.findMany({
      where: whereClause,
      take: 48,
      select: {
        id: true,
        name: true,
        basePrice: true,
        description: true,
        store: { select: { name: true } },
        category: { select: { name: true } },
        variants: {
          select: {
            sku: true,
            attributes: true,
            inventory: { select: { quantity: true } }
          }
        }
      }
    });

    const formattedProducts = dbProducts.map((p) => {
      const totalStock = p.variants.reduce((total, v) => {
        return total + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      }, 0);

      const mainVariant = p.variants[0];
      const sku = mainVariant ? mainVariant.sku : 'SKU-NONE';

      let customImage: string | null = null;
      try {
        if (mainVariant?.attributes) {
          const parsed = typeof mainVariant.attributes === 'string' ? JSON.parse(mainVariant.attributes) : mainVariant.attributes;
          if (parsed?.image) customImage = parsed.image;
          else if (Array.isArray(parsed?.images) && parsed.images[0]) customImage = parsed.images[0];
        }
      } catch (_) {}

      const displayImage = customImage || getProductImage(p.category?.name || '', p.name);

      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category?.name || 'Uncategorized',
        rating: 4.5 + (p.name.length % 5) * 0.1,
        image: displayImage,
        sku,
        stock: totalStock > 0 ? totalStock : 50,
        vendor: p.store?.name || 'Unknown',
        description: p.description || 'No description provided.'
      };
    });

    return NextResponse.json(
      { products: formattedProducts },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, stock, sku, description, attributes, storeId } = body;
    
    if (!name || !price || !sku) {
      return NextResponse.json({ error: 'Name, Base Price and SKU are required.' }, { status: 400 });
    }

    let dbCategory = await prisma.category.findUnique({ where: { name: category } });
    if (!dbCategory) {
      dbCategory = await prisma.category.create({
        data: { name: category, slug: category.toLowerCase().replace(/\s+/g, '-') }
      });
    }

    let store = storeId ? await prisma.store.findUnique({ where: { id: storeId } }) : null;
    if (!store) {
      store = await prisma.store.findFirst();
    }

    if (!store) {
      return NextResponse.json({ error: 'No store found.' }, { status: 400 });
    }

    const existingVariant = await prisma.productVariant.findUnique({ where: { sku: sku.toUpperCase() } });
    if (existingVariant) {
      return NextResponse.json({ error: 'SKU code is already registered in catalog.' }, { status: 400 });
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          storeId: store.id,
          categoryId: dbCategory.id,
          name,
          basePrice: parseFloat(price),
          description,
          status: 'PUBLISHED'
        }
      });

      const variant = await tx.productVariant.create({
        data: {
          productId: prod.id,
          sku: sku.toUpperCase(),
          attributes: JSON.stringify(attributes || {}),
          price: parseFloat(price)
        }
      });

      const wh = await tx.warehouse.findFirst({ where: { storeId: store.id } });
      const qty = parseInt(stock) || 0;

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: wh ? wh.id : null,
          quantity: qty,
          reorderPoint: 10
        }
      });

      return prod;
    });

    return NextResponse.json({ message: 'SKU published successfully.', product: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
