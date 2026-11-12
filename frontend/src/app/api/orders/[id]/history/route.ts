import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        store: true,
        resellerOrder: true,
        deliveryAssignment: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Access check
    const roleUpper = user.role.toUpperCase();
    const isPlatformAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER_SUPPORT', 'DELIVERY_MANAGER'].includes(roleUpper);
    const isCustomerOwner = order.customerId === user.id;
    const isSellerOwner = order.store?.ownerId === user.id;
    const isResellerOwner = order.resellerOrder?.resellerId === user.id;
    const isAssignedCourier = order.deliveryAssignment?.deliveryManId === user.id;

    if (!isPlatformAdmin && !isCustomerOwner && !isSellerOwner && !isResellerOwner && !isAssignedCourier) {
      return NextResponse.json({ error: 'Unauthorized to view history for this order.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      currentStatus: order.status,
      version: order.version,
      history: order.statusHistory.map((h) => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedBy: h.changedByName || h.changedByRole || 'System',
        role: h.changedByRole,
        reason: h.reason,
        version: h.version,
        timestamp: h.createdAt
      }))
    });
  } catch (err: any) {
    console.error('Order History Fetch Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
