import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase().trim() || '';
    const category = searchParams.get('category') || '';
    const onlyInCatalog = searchParams.get('onlyInCatalog') === 'true';

    const userId = context.user.id;

    // Build filter for products
    const where: any = {
      status: 'PUBLISHED'
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'All') {
      where.category = { name: category };
    }

    // Fetch products with variants and store info
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        store: true,
        variants: {
          include: {
            inventory: true
          }
        },
        resellerProducts: {
          where: { resellerId: userId }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = products.map((p) => {
      const resellerItem = p.resellerProducts[0] || null;
      const primaryVariant = p.variants[0] || null;
      const basePrice = primaryVariant?.price || p.basePrice;
      const totalStock = p.variants.reduce((acc, v) => {
        return acc + v.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
      }, 0);

      // Reseller pricing
      const inCatalog = Boolean(resellerItem && resellerItem.isActive);
      const resellerPrice = resellerItem?.resellerPrice || Math.round(basePrice * 1.1); // Default 10% markup if not set
      const profit = Math.max(0, resellerPrice - basePrice);

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        basePrice,
        resellerPrice,
        profit,
        markupPercent: Math.round(((resellerPrice - basePrice) / basePrice) * 100),
        inCatalog,
        category: p.category?.name || 'General',
        storeName: p.store?.name || 'Zibonbaba Verified Seller',
        stock: totalStock,
        variantsCount: p.variants.length,
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: v.attributes,
          price: v.price,
          stock: v.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        })),
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
      };
    });

    const filtered = onlyInCatalog ? formatted.filter(p => p.inCatalog) : formatted;

    return NextResponse.json({
      success: true,
      products: filtered,
      total: filtered.length
    });
  } catch (err: any) {
    console.error('Reseller Products GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { productId, resellerPrice, resellerMarkup, action } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const basePrice = product.variants[0]?.price || product.basePrice;

    if (action === 'remove') {
      await prisma.resellerProduct.deleteMany({
        where: { resellerId: userId, productId }
      });
      return NextResponse.json({
        success: true,
        message: 'Product removed from your reseller catalog.',
        inCatalog: false
      });
    }

    // Validate selling price cannot be lower than base wholesale price
    const finalPrice = resellerPrice ? parseFloat(resellerPrice) : basePrice;
    if (finalPrice < basePrice) {
      return NextResponse.json({
        error: `Reseller selling price (৳${finalPrice}) cannot be lower than the base wholesale price (৳${basePrice}).`
      }, { status: 400 });
    }

    const item = await prisma.resellerProduct.upsert({
      where: {
        resellerId_productId: {
          resellerId: userId,
          productId
        }
      },
      update: {
        resellerPrice: finalPrice,
        resellerMarkup: resellerMarkup ? parseFloat(resellerMarkup) : (finalPrice - basePrice),
        isActive: true
      },
      create: {
        resellerId: userId,
        productId,
        resellerPrice: finalPrice,
        resellerMarkup: resellerMarkup ? parseFloat(resellerMarkup) : (finalPrice - basePrice),
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product added to reseller catalog successfully.',
      resellerProduct: item,
      inCatalog: true,
      profit: Math.max(0, finalPrice - basePrice)
    });
  } catch (err: any) {
    console.error('Reseller Products POST API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
