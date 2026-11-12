import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

/**
 * POST /api/hubs/receive
 * Receive / scan an inbound parcel into a delivery hub.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'WAREHOUSE_MANAGER', 'INVENTORY_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { hubId, orderId, notes } = body;

    if (!hubId || !orderId) {
      return NextResponse.json({ error: 'Hub ID and Order ID are required.' }, { status: 400 });
    }

    const hub = await prisma.deliveryHub.findFirst({
      where: { OR: [{ id: hubId }, { code: hubId }] }
    });
    if (!hub) {
      return NextResponse.json({ error: 'Delivery Hub not found.' }, { status: 404 });
    }

    // Clean orderId if scanned with prefix
    const cleanOrderId = orderId.replace('#', '').trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanOrderId },
          { id: { startsWith: cleanOrderId } }
        ]
      },
      include: {
        customer: { include: { profile: true } },
        resellerOrder: true,
        store: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: `Order '${orderId}' not found in system.` }, { status: 404 });
    }

    // Update order with hubId and mark READY_FOR_DELIVERY
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        hubId: hub.id,
        status: 'PROCESSING'
      }
    });

    await logAdminAction(
      user.id,
      `HUB_RECEIVE_PARCEL: Order=${order.id.slice(0, 8).toUpperCase()}, Hub=${hub.name} (${hub.code})`
    );

    // Notify Customer / Reseller that parcel has arrived at local Hub
    const notifyTargetUserId = order.resellerOrder ? order.resellerOrder.resellerId : order.customerId;
    if (notifyTargetUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyTargetUserId,
          title: 'Package Arrived at Local Hub 🏢📦',
          body: `Order #${order.id.slice(0, 8).toUpperCase()} has arrived at ${hub.name} (${hub.address}). It is being scheduled for final mile courier dispatch.`,
          type: 'INFO',
          priority: 'MEDIUM',
          module: 'MARKETPLACE'
        }
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Parcel #${order.id.slice(0, 8).toUpperCase()} checked in successfully at ${hub.name}.`,
      order: {
        id: updated.id,
        status: updated.status,
        hubName: hub.name,
        hubCode: hub.code,
        customerName: order.resellerOrder?.customerName || order.customer?.profile?.fullName || 'Customer',
        total: order.total
      }
    });
  } catch (err: any) {
    console.error('Hub Receive POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
