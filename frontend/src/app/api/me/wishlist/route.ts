import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// @ts-ignore
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, c) => {
        const parts = c.trim().split('=');
        acc[parts[0]] = parts.slice(1).join('=');
        return acc;
      }, {});
      token = cookies.zibonbaba_token || null;
    }
  }

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    const productIds = wishlistItems.map(w => w.productId);
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
        store: true,
        variants: {
          include: { inventory: true }
        }
      }
    }) : [];

    const formatted = products.map((p) => {
      const totalStock = p.variants.reduce((t, v) =>
        t + v.inventory.reduce((s, inv) => s + inv.quantity, 0), 0);

      return {
        id: p.id,
        name: p.name,
        price: p.basePrice,
        category: p.category?.name || 'Uncategorized',
        rating: 4.5 + Math.random() * 0.5,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        sku: p.variants[0]?.sku || 'SKU-NONE',
        stock: totalStock,
        vendor: p.store?.name || 'Unknown',
        description: p.description || ''
      };
    });

    return NextResponse.json({
      wishlist: productIds,
      products: formatted
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
