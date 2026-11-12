import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { error, status } = await requireAdminRole(request);
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    const riders = await prisma.user.findMany({
      where: {
        role: { in: ['DELIVERY_MAN', 'COURIER', 'DELIVERY_MANAGER'] },
        ...(query ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { profile: { fullName: { contains: query, mode: 'insensitive' } } },
            { deliveryProfile: { preferredZone: { contains: query, mode: 'insensitive' } } }
          ]
        } : {})
      },
      include: {
        profile: true,
        deliveryProfile: true,
        deliveryAssignments: {
          select: { id: true, status: true, codAmount: true, codCollected: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = riders.map((r) => {
      const assignments = r.deliveryAssignments || [];
      const activeCount = assignments.filter(a => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)).length;
      const completedCount = assignments.filter(a => a.status === 'DELIVERED').length;
      const failedCount = assignments.filter(a => a.status === 'FAILED').length;
      const totalCashCollected = assignments.filter(a => a.codCollected).reduce((sum, a) => sum + a.codAmount, 0);

      return {
        id: r.id,
        email: r.email,
        phone: r.phone,
        fullName: r.profile?.fullName || r.email.split('@')[0],
        avatar: r.avatar,
        status: r.deliveryProfile?.status || r.status,
        availabilityStatus: r.deliveryProfile?.availabilityStatus || 'OFFLINE',
        isOnline: r.deliveryProfile?.isOnline ?? false,
        vehicleType: r.deliveryProfile?.vehicleType || 'BIKE',
        vehicleNumber: r.deliveryProfile?.vehicleNumber || 'N/A',
        preferredZone: r.deliveryProfile?.preferredZone || 'Dhaka Central',
        activeAssignments: activeCount,
        completedDeliveries: completedCount,
        failedDeliveries: failedCount,
        cashInHand: totalCashCollected,
        walletBalance: r.walletBalance || 0,
        totalEarnings: r.deliveryProfile?.totalEarnings || (completedCount * 120),
        joinedAt: r.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      deliveryMen: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Admin Delivery Men GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error, status } = await requireAdminRole(request);
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { deliveryManId, newStatus, availabilityStatus, notes } = body;

    if (!deliveryManId || !newStatus) {
      return NextResponse.json({ error: 'Delivery Man ID and status are required.' }, { status: 400 });
    }

    const normalizedStatus = newStatus.toUpperCase().trim();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: deliveryManId },
        data: {
          status: normalizedStatus === 'APPROVED' ? 'ACTIVE' : normalizedStatus
        }
      }),
      prisma.deliveryProfile.upsert({
        where: { userId: deliveryManId },
        update: {
          status: normalizedStatus,
          ...(availabilityStatus ? { availabilityStatus } : {}),
          ...(notes ? { rejectReason: notes } : {})
        },
        create: {
          userId: deliveryManId,
          status: normalizedStatus,
          availabilityStatus: availabilityStatus || 'OFFLINE',
          rejectReason: notes || null
        }
      })
    ]);

    await logAdminAction(user.id, `ADMIN_DELIVERY_STATUS_CHANGE: DriverId=${deliveryManId}, Status=${normalizedStatus}`);

    // Notify rider
    await prisma.notification.create({
      data: {
        userId: deliveryManId,
        title: `Delivery Account ${normalizedStatus} 🛵`,
        body: `Your delivery partner account has been updated to: ${normalizedStatus}.`,
        type: normalizedStatus === 'APPROVED' || normalizedStatus === 'ACTIVE' ? 'SUCCESS' : 'WARNING',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Delivery driver status updated to ${normalizedStatus}`
    });
  } catch (err: any) {
    console.error('Admin Delivery PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
