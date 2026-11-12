import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Store ID required.' }, { status: 400 });
    }

    // Lookup store by ID or by name/slug match
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id },
          { name: { equals: id, mode: 'insensitive' } }
        ]
      },
      include: {
        owner: {
          select: {
            profile: true
          }
        },
        products: {
          where: { status: 'PUBLISHED' },
          include: {
            category: true,
            variants: {
              include: { inventory: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
    }

    const formattedProducts = store.products.map(p => {
      let totalStock = 0;
      p.variants.forEach(v => {
        v.inventory.forEach(inv => {
          totalStock += inv.quantity;
        });
      });
      const firstVariant = p.variants[0];
      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category?.name || 'General',
        sku: firstVariant?.sku || p.id.slice(0, 8),
        stock: totalStock || 20,
        description: p.description || '',
        vendor: store.name,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        rating: 4.8
      };
    });

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        isApproved: store.isApproved,
        commissionRate: store.commissionRate,
        createdAt: store.createdAt,
        ownerName: store.owner?.profile?.fullName || 'Verified Seller'
      },
      products: formattedProducts,
      totalProducts: formattedProducts.length
    });
  } catch (err: any) {
    console.error('Store Public API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
