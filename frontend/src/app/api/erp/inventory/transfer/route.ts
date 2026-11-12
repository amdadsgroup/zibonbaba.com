import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'zibonbaba_super_secure_jwt_session_secret_token_123';

async function getUser(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

async function createAuditLog(userId: string | null, action: string) {
  try {
    await prisma.auditLog.create({ data: { userId, action } });
  } catch (err) {}
}

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user || !['VENDOR_ADMIN', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 403 });
  }

  try {
    const { sku, sourceWarehouseId, targetBranchId, qty } = await req.json();
    if (!sku || !sourceWarehouseId || !targetBranchId || !qty) {
      return NextResponse.json({ error: 'SKU, Source Warehouse, Target Branch and Quantity are required.' }, { status: 400 });
    }

    const transferQty = parseInt(qty);
    const dbVariant = await prisma.productVariant.findUnique({
      where: { sku: sku.toUpperCase() },
      include: { inventory: true }
    });

    if (!dbVariant) return NextResponse.json({ error: 'Product Variant SKU not found.' }, { status: 404 });

    const sourceInv = dbVariant.inventory.find((i: any) => i.warehouseId === sourceWarehouseId);
    if (!sourceInv || sourceInv.quantity < transferQty) {
      return NextResponse.json({ error: 'Insufficient stock in source warehouse.' }, { status: 400 });
    }

    let targetInv = dbVariant.inventory.find((i: any) => i.branchId === targetBranchId);

    await prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { quantity: sourceInv.quantity - transferQty }
      });

      if (targetInv) {
        await tx.inventory.update({
          where: { id: targetInv.id },
          data: { quantity: targetInv.quantity + transferQty }
        });
      } else {
        await tx.inventory.create({
          data: {
            variantId: dbVariant.id,
            branchId: targetBranchId,
            quantity: transferQty,
            reorderPoint: 10
          }
        });
      }
    });

    await createAuditLog(user.id, `STOCK_TRANSFER: SKU=${sku} Qty=${transferQty}`);
    return NextResponse.json({ message: 'Stock relocation completed successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
