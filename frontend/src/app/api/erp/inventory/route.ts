import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export async function GET(req: Request) {
  const user = await getUser(req);
  const allowedRoles = ['VENDOR_ADMIN', 'VENDOR_STAFF', 'ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_MANAGER', 'MANAGER'];
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 403 });
  }

  try {
    const isPlatformStaff = ['ADMIN', 'SUPER_ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_MANAGER', 'MANAGER'].includes(user.role);
    let store = null;
    if (!isPlatformStaff) {
      store = await prisma.store.findFirst({ where: { ownerId: user.id } });
      if (!store) return NextResponse.json({ stock: [] });
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: store ? {
        OR: [
          { warehouse: { storeId: store.id } },
          { branch: { storeId: store.id } }
        ]
      } : undefined,
      include: {
        variant: { include: { product: true } },
        warehouse: true,
        branch: true
      }
    });

    const stock = inventoryItems.map((inv: any) => ({
      sku: inv.variant.sku,
      productName: inv.variant.product.name,
      quantity: inv.quantity,
      reorderPoint: inv.reorderPoint,
      warehouse: inv.warehouse ? inv.warehouse.name : null,
      branch: inv.branch ? inv.branch.name : null
    }));

    return NextResponse.json({ stock });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
