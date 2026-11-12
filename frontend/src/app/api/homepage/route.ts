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

export const revalidate = 60;

interface HomepageCache {
  data: any;
  timestamp: number;
}

let memoryCache: HomepageCache | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function GET() {
  // 1. Serve from in-memory cache if fresh
  if (memoryCache && (Date.now() - memoryCache.timestamp < CACHE_TTL_MS)) {
    return NextResponse.json(memoryCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  }

  try {
    const banners = [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
        title: 'Grand Seasonal Campaign 2026',
        desc: 'Up to 50% discount on gadgets, health & apparel',
        linkText: 'Shop Now',
        cat: 'Electronics & Gadgets'
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
        title: 'Tech & Lifestyle Festival',
        desc: 'Extra 10% instant cashback with Zibonbaba Wallet',
        linkText: 'Explore Tech',
        cat: 'Electronics & Gadgets'
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
        title: 'Exclusive Fashion Collection',
        desc: 'New arrivals from verified multi-vendor stores',
        linkText: 'View Outfits',
        cat: 'Apparel & Fashion'
      }
    ];

    // Parallelize category and product queries with selective column projections
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        select: { name: true },
        orderBy: { name: 'asc' }
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        take: 36,
        select: {
          id: true,
          name: true,
          basePrice: true,
          description: true,
          category: { select: { name: true } },
          store: { select: { name: true } },
          variants: {
            take: 1,
            select: {
              sku: true,
              inventory: { select: { quantity: true } }
            }
          }
        }
      })
    ]);

    const formattedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((total, v) => {
        return total + (v.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0);
      }, 0);

      const mainVariant = p.variants[0];
      const sku = mainVariant ? mainVariant.sku : 'SKU-NONE';
      const img = getProductImage(p.category?.name || '', p.name);

      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category?.name || 'General',
        rating: 4.7 + (p.name.length % 4) * 0.08,
        image: img,
        sku,
        stock: totalStock > 0 ? totalStock : 50,
        vendor: p.store?.name || 'Zibonbaba Verified',
        description: p.description || ''
      };
    });

    const payload = {
      banners,
      categories: ['All', ...categories.map((c) => c.name)],
      products: formattedProducts,
      flashSales: formattedProducts.slice(0, 6)
    };

    // Cache computed payload in memory
    memoryCache = {
      data: payload,
      timestamp: Date.now()
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (err: any) {
    // If database connection fails but we have stale cache, serve stale cache
    if (memoryCache?.data) {
      return NextResponse.json(memoryCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60'
        }
      });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
