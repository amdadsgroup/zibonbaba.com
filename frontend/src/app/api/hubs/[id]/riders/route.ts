import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

/**
 * GET /api/hubs/[id]/riders
 * Fetch all riders stationed at a specific delivery hub with current dispatch status.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hub = await prisma.deliveryHub.findUnique({
      where: { id },
      select: { id: true, name: true, code: true }
    });

    if (!hub) {
      return NextResponse.json({ error: 'Delivery Hub not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const filterOnline = searchParams.get('online');

    const where: any = { hubId: id };
    if (filterOnline === 'true') {
      where.isOnline = true;
    }

    const riders = await prisma.deliveryProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatar: true,
            status: true,
            walletBalance: true,
            profile: { select: { fullName: true, bio: true } },
            deliveryAssignments: {
              where: {
                status: { in: ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] }
              },
              select: { id: true, status: true, codAmount: true }
            }
          }
        }
      },
      orderBy: [
        { isOnline: 'desc' },
        { completedDeliveries: 'desc' }
      ]
    });

    const formatted = riders.map((r) => {
      const activeDeliveries = r.user.deliveryAssignments || [];
      const isBusy = activeDeliveries.length >= 3;

      return {
        id: r.id,
        userId: r.userId,
        fullName: r.user.profile?.fullName || r.user.email.split('@')[0],
        email: r.user.email,
        phone: r.user.phone || 'N/A',
        avatar: r.user.avatar,
        vehicleType: r.vehicleType,
        vehicleNumber: r.vehicleNumber || 'N/A',
        drivingLicense: r.drivingLicense || 'N/A',
        nidNumber: r.nidNumber || 'N/A',
        emergencyContact: r.emergencyContact || 'N/A',
        preferredZone: r.preferredZone || 'Hub Operating Area',
        isOnline: r.isOnline,
        availabilityStatus: r.isOnline ? (isBusy ? 'BUSY' : 'AVAILABLE') : 'OFFLINE',
        status: r.status,
        activeTasksCount: activeDeliveries.length,
        cashInHand: r.cashInHand,
        completedDeliveries: r.completedDeliveries,
        failedDeliveries: r.failedDeliveries,
        totalEarnings: r.totalEarnings,
        walletBalance: r.user.walletBalance || 0,
        hub: {
          id: hub.id,
          name: hub.name,
          code: hub.code
        }
      };
    });

    return NextResponse.json({
      success: true,
      hub: { id: hub.id, name: hub.name, code: hub.code },
      riders: formatted,
      total: formatted.length,
      onlineCount: formatted.filter(r => r.isOnline).length
    });
  } catch (err: any) {
    console.error('Hub Riders GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/hubs/[id]/riders
 * Station or transfer a rider to this delivery hub.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { riderUserId, vehicleType, preferredZone } = body;

    if (!riderUserId) {
      return NextResponse.json({ error: 'Rider User ID is required.' }, { status: 400 });
    }

    const hub = await prisma.deliveryHub.findUnique({
      where: { id }
    });
    if (!hub) {
      return NextResponse.json({ error: 'Delivery Hub not found.' }, { status: 404 });
    }

    // Verify user is a delivery rider
    const targetUser = await prisma.user.findUnique({
      where: { id: riderUserId },
      include: { profile: true, deliveryProfile: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId: riderUserId },
      update: {
        hubId: id,
        ...(vehicleType ? { vehicleType } : {}),
        ...(preferredZone ? { preferredZone } : {})
      },
      create: {
        userId: riderUserId,
        hubId: id,
        vehicleType: vehicleType || 'BIKE',
        preferredZone: preferredZone || `${hub.name} Area`,
        status: 'APPROVED',
        availabilityStatus: 'OFFLINE'
      }
    });

    await logAdminAction(
      user.id,
      `STATION_RIDER_TO_HUB: Rider=${targetUser.profile?.fullName || targetUser.email}, Hub=${hub.name} (${hub.code})`
    );

    // Notify Rider
    await prisma.notification.create({
      data: {
        userId: riderUserId,
        title: 'Assigned to Delivery Hub 🏢',
        body: `You are now stationed at ${hub.name} (${hub.code}). Hub Address: ${hub.address}. Contact: ${hub.contactNumber || 'Admin'}.`,
        type: 'SUCCESS',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Rider ${targetUser.profile?.fullName || targetUser.email} has been stationed at ${hub.name}.`,
      profile: updatedProfile
    });
  } catch (err: any) {
    console.error('Hub Station Rider POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
