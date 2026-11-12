import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function PATCH(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    // Check account status
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { deliveryProfile: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const accountStatus = dbUser.status ? dbUser.status.toUpperCase() : 'ACTIVE';
    if (accountStatus === 'SUSPENDED' || accountStatus === 'BLOCKED') {
      return NextResponse.json(
        { error: `Account is ${accountStatus}. Availability changes are restricted. Reason: ${dbUser.suspendedReason || 'Administrative suspension.'}` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isOnline, availabilityStatus } = body;

    // Check if rider has active assignments currently in progress
    const activeAssignment = await prisma.deliveryAssignment.findFirst({
      where: {
        deliveryManId: userId,
        status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
      }
    });

    let targetStatus: string;
    let targetOnline: boolean;

    if (activeAssignment) {
      targetStatus = 'ON_DELIVERY';
      targetOnline = true;
    } else {
      if (availabilityStatus) {
        const norm = availabilityStatus.toUpperCase().trim();
        targetStatus = norm === 'OFFLINE' ? 'OFFLINE' : 'ONLINE';
        targetOnline = targetStatus === 'ONLINE';
      } else {
        targetOnline = Boolean(isOnline);
        targetStatus = targetOnline ? 'ONLINE' : 'OFFLINE';
      }
    }

    const updated = await prisma.deliveryProfile.upsert({
      where: { userId },
      update: {
        isOnline: targetOnline,
        availabilityStatus: targetStatus
      },
      create: {
        userId,
        isOnline: targetOnline,
        availabilityStatus: targetStatus,
        status: 'APPROVED'
      }
    });

    // Audit log
    await logAdminAction(userId, `AVAILABILITY_CHANGED: RiderId=${userId}, Status=${targetStatus}, Online=${targetOnline}`);

    // Real-time broadcast to Admin, Delivery Fleet, and User
    await realtimeEngine.broadcast({
      eventId: `evt_avail_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_AVAILABILITY_CHANGED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        deliveryManId: userId,
        isOnline: targetOnline,
        availabilityStatus: targetStatus,
        hasActiveTask: Boolean(activeAssignment),
        activeOrderId: activeAssignment?.orderId || null
      }
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${targetStatus === 'ONLINE' ? 'Available' : targetStatus}`,
      isOnline: targetOnline,
      availabilityStatus: targetStatus,
      profile: updated
    });
  } catch (err: any) {
    console.error('Delivery Availability PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
