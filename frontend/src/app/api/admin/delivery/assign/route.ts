import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: Request) {
  try {
    const { user, error, status } = await requireAdminRole(request);
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { orderId, deliveryManId, deliveryFee, hubId, specialInstructions } = body;

    if (!orderId || !deliveryManId) {
      return NextResponse.json({ error: 'Order ID and Delivery Man ID are required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, resellerOrder: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const rider = await prisma.user.findUnique({
      where: { id: deliveryManId },
      include: { profile: true, deliveryProfile: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Delivery rider not found.' }, { status: 404 });
    }

    let resolvedHubId: string | null = hubId || null;
    let hubName = 'Central Dispatch Hub';
    if (hubId) {
      const hub = await prisma.deliveryHub.findFirst({
        where: { OR: [{ id: hubId }, { code: hubId }] }
      });
      if (hub) {
        resolvedHubId = hub.id;
        hubName = hub.name;
      }
    } else if (rider.deliveryProfile?.hubId) {
      resolvedHubId = rider.deliveryProfile.hubId;
    }

    const deliveryOtp = generateDeliveryOtp();
    const fee = deliveryFee ? parseFloat(deliveryFee) : 120.0;

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
        deliveredAt: null,
        failedAt: null,
        failedReason: null
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

    const nextVersion = (order.version || 1) + 1;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'ASSIGNED',
        version: nextVersion,
        ...(resolvedHubId ? { hubId: resolvedHubId } : {})
      }
    });

    // Record Status History
    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: order.status,
        newStatus: 'ASSIGNED',
        changedById: user.id,
        changedByRole: user.role,
        changedByName: user.email?.split('@')[0] || 'Admin',
        reason: `Assigned to rider ${rider.profile?.fullName || rider.email}`,
        version: nextVersion
      }
    });

    await logAdminAction(user.id, `ADMIN_ASSIGN_DELIVERY: OrderId=${orderId}, DriverId=${deliveryManId}`);

    // Notify Rider
    await prisma.notification.create({
      data: {
        userId: deliveryManId,
        title: 'New Delivery Assignment! 📦',
        body: `You have been assigned order #${orderId.slice(0, 8).toUpperCase()}. Open delivery dashboard to accept.`,
        type: 'INFO',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    // Notify Customer or Reseller
    const notifyTargetUserId = order.resellerOrder ? order.resellerOrder.resellerId : order.customerId;
    if (notifyTargetUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyTargetUserId,
          title: 'Courier Dispatched! 🛵',
          body: `Order #${orderId.slice(0, 8).toUpperCase()} has been assigned to courier ${rider.profile?.fullName || 'agent'}. Your delivery OTP is ${deliveryOtp}.`,
          type: 'INFO',
          priority: 'MEDIUM',
          module: 'MARKETPLACE'
        }
      });
    }

    // Broadcast Real-time event across channels
    try {
      const { realtimeEngine } = await import('@/lib/services/realtimeEngine');
      const { PlatformEventType } = await import('@/lib/constants/events');
      await realtimeEngine.broadcast({
        eventId: `evt_assign_${Date.now()}`,
        eventType: PlatformEventType.ORDER_ASSIGNED,
        aggregateType: 'ORDER',
        aggregateId: orderId,
        timestamp: new Date().toISOString(),
        version: nextVersion,
        channels: [
          `order:${orderId}`,
          `user:${deliveryManId}`,
          `role:ADMIN`,
          `role:SUPER_ADMIN`,
          ...(order.customerId ? [`user:${order.customerId}`] : []),
          ...(order.resellerOrder ? [`user:${order.resellerOrder.resellerId}`] : [])
        ],
        data: {
          orderId,
          orderCode: orderId.slice(0, 8).toUpperCase(),
          deliveryManId,
          riderName: rider.profile?.fullName || rider.email,
          status: 'ASSIGNED',
          version: nextVersion
        }
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Order #${orderId.slice(0, 8).toUpperCase()} assigned to ${rider.profile?.fullName || rider.email}.`,
      assignment
    });

  } catch (err: any) {
    console.error('Admin Delivery Assign Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
