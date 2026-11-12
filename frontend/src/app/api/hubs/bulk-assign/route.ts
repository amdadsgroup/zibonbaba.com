import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * POST /api/hubs/bulk-assign
 * Assign multiple orders at a hub to a single delivery rider in one batch action.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'WAREHOUSE_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { hubId, orderIds, deliveryManId, deliveryFee, specialInstructions } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !deliveryManId) {
      return NextResponse.json({ error: 'Order IDs array and Delivery Rider ID are required.' }, { status: 400 });
    }

    const rider = await prisma.user.findUnique({
      where: { id: deliveryManId },
      include: { profile: true, deliveryProfile: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Delivery rider not found.' }, { status: 404 });
    }

    let hubName = 'Central Logistics Hub';
    let resolvedHubId: string | null = null;
    if (hubId) {
      const hub = await prisma.deliveryHub.findFirst({
        where: { OR: [{ id: hubId }, { code: hubId }] }
      });
      if (hub) {
        resolvedHubId = hub.id;
        hubName = hub.name;
      }
    }

    const fee = deliveryFee ? parseFloat(deliveryFee) : 120.0;
    const assignedResults = [];

    for (const orderId of orderIds) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { resellerOrder: true, customer: true }
      });

      if (!order) continue;

      const deliveryOtp = generateDeliveryOtp();

      const assignment = await prisma.deliveryAssignment.upsert({
        where: { orderId },
        update: {
          deliveryManId,
          assignedById: user.id,
          ...(resolvedHubId ? { hubId: resolvedHubId } : {}),
          status: 'ASSIGNED',
          deliveryOtp,
          deliveryFee: fee,
          specialInstructions: specialInstructions || null,
          codAmount: order.total,
          codCollected: false,
          assignedAt: new Date(),
          acceptedAt: null,
          pickedUpAt: null,
          deliveredAt: null
        },
        create: {
          orderId,
          deliveryManId,
          assignedById: user.id,
          ...(resolvedHubId ? { hubId: resolvedHubId } : {}),
          status: 'ASSIGNED',
          deliveryOtp,
          deliveryFee: fee,
          specialInstructions: specialInstructions || null,
          codAmount: order.total,
          codCollected: false
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PROCESSING',
          ...(resolvedHubId ? { hubId: resolvedHubId } : {})
        }
      });

      // Notify customer / reseller
      const notifyTargetUserId = order.resellerOrder ? order.resellerOrder.resellerId : order.customerId;
      if (notifyTargetUserId) {
        await prisma.notification.create({
          data: {
            userId: notifyTargetUserId,
            title: 'Package Dispatched from Hub! 🛵',
            body: `Order #${orderId.slice(0, 8).toUpperCase()} dispatched via rider ${rider.profile?.fullName || 'Courier'}. Delivery OTP: ${deliveryOtp}.`,
            type: 'INFO',
            priority: 'MEDIUM',
            module: 'MARKETPLACE'
          }
        }).catch(() => {});
      }

      assignedResults.push({
        orderId,
        assignmentId: assignment.id,
        otp: deliveryOtp,
        cod: order.total
      });
    }

    await logAdminAction(
      user.id,
      `BULK_DISPATCH_RIDER: Rider=${rider.profile?.fullName || rider.email}, Count=${assignedResults.length}, Hub=${hubName}`
    );

    // Notify Rider with Batch Count
    await prisma.notification.create({
      data: {
        userId: deliveryManId,
        title: `Batch Assignment: ${assignedResults.length} Orders! 📦📦`,
        body: `You have been assigned a batch of ${assignedResults.length} orders from ${hubName}. Open Delivery Portal to view manifest and begin pickups.`,
        type: 'INFO',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched ${assignedResults.length} orders to ${rider.profile?.fullName || rider.email}.`,
      count: assignedResults.length,
      assignments: assignedResults
    });
  } catch (err: any) {
    console.error('Bulk Assign POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
