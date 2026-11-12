import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser, error, status } = await requireAdminRole(request);
    if (error || !adminUser) {
      return NextResponse.json({ error }, { status });
    }

    const { id } = await params;

    const rider = await prisma.user.findFirst({
      where: {
        id,
        role: { in: ['DELIVERY_MAN', 'COURIER', 'DELIVERY_MANAGER'] }
      },
      include: {
        profile: true,
        deliveryProfile: {
          include: { hub: true }
        },
        addresses: true,
        verifications: {
          orderBy: { createdAt: 'desc' }
        },
        deliveryAssignments: {
          include: {
            order: {
              select: {
                id: true,
                total: true,
                status: true,
                resellerOrder: {
                  select: { customerName: true, customerPhone: true, shippingAddress: true, district: true }
                }
              }
            },
            hub: {
              select: { id: true, name: true, code: true }
            }
          },
          orderBy: { assignedAt: 'desc' },
          take: 50
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 30
        }
      }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Delivery rider not found.' }, { status: 404 });
    }

    const dProfile = rider.deliveryProfile;
    const assignments = rider.deliveryAssignments || [];
    const completed = assignments.filter(a => a.status === 'DELIVERED');
    const failed = assignments.filter(a => a.status === 'FAILED');
    const active = assignments.filter(a => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status));

    const totalDeliveries = assignments.length;
    const completedCount = completed.length;
    const failedCount = failed.length;
    const activeCount = active.length;

    const completionRate = totalDeliveries > 0 ? Math.round((completedCount / totalDeliveries) * 100) : 100;
    const totalCashInHand = assignments.filter(a => a.codCollected).reduce((sum, a) => sum + a.codAmount, 0);

    // Fetch all hubs for assignment dropdown
    const availableHubs = await prisma.deliveryHub.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, code: true, district: true, division: true }
    });

    const deliveryManId = `DM-${rider.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      deliveryMan: {
        id: rider.id,
        deliveryManId,
        email: rider.email,
        phone: rider.phone || 'N/A',
        fullName: rider.profile?.fullName || rider.email.split('@')[0],
        avatar: rider.avatar,
        accountStatus: rider.status,
        suspendedReason: rider.suspendedReason,
        role: rider.role,
        walletBalance: rider.walletBalance || 0,
        createdAt: rider.createdAt.toISOString(),
        profile: rider.profile,
        deliveryProfile: dProfile,
        stationedHub: dProfile?.hub || null,
        availableHubs,
        stats: {
          totalDeliveries,
          completedDeliveries: completedCount,
          failedDeliveries: failedCount,
          activeDeliveries: activeCount,
          completionRate,
          customerRating: 4.9,
          cashInHand: totalCashInHand,
          totalEarnings: dProfile?.totalEarnings || (completedCount * 120),
          walletBalance: rider.walletBalance || 0
        },
        verifications: rider.verifications,
        recentAssignments: assignments.slice(0, 15),
        walletTransactions: rider.walletTransactions,
        auditLogs: rider.auditLogs
      }
    });
  } catch (err: any) {
    console.error('Admin Delivery Man Details GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: adminUser, error, status } = await requireAdminRole(request);
    if (error || !adminUser) {
      return NextResponse.json({ error }, { status });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      accountStatus,
      verificationStatus,
      rejectReason,
      suspendedReason,
      hubId,
      preferredZone,
      serviceArea,
      deliveryType,
      availabilityStatus
    } = body;

    const rider = await prisma.user.findUnique({
      where: { id },
      include: { deliveryProfile: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Delivery rider not found.' }, { status: 404 });
    }

    // 1. Update User account status if provided
    let updatedAccountStatus = rider.status;
    if (accountStatus) {
      const normStatus = accountStatus.toUpperCase().trim();
      const isSuspended = normStatus === 'SUSPENDED' || normStatus === 'BLOCKED';

      await prisma.user.update({
        where: { id },
        data: {
          status: normStatus,
          suspendedAt: isSuspended ? new Date() : null,
          suspendedReason: isSuspended ? (suspendedReason || 'Suspended by admin') : null
        }
      });
      updatedAccountStatus = normStatus;

      // Real-time broadcast user status change
      await realtimeEngine.broadcast({
        eventId: `evt_status_${Date.now()}`,
        eventType: PlatformEventType.USER_STATUS_UPDATED,
        aggregateType: 'USER',
        aggregateId: id,
        timestamp: new Date().toISOString(),
        channels: ['role:ADMIN', `user:${id}`],
        data: {
          userId: id,
          status: normStatus,
          isSuspended,
          reason: suspendedReason || null
        }
      });
    }

    // 2. Update DeliveryProfile
    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId: id },
      update: {
        status: verificationStatus ? verificationStatus.toUpperCase().trim() : (accountStatus ? accountStatus.toUpperCase().trim() : undefined),
        rejectReason: rejectReason !== undefined ? rejectReason : undefined,
        hubId: hubId !== undefined ? (hubId || null) : undefined,
        preferredZone: preferredZone !== undefined ? preferredZone : undefined,
        serviceArea: serviceArea !== undefined ? serviceArea : undefined,
        deliveryType: deliveryType !== undefined ? deliveryType : undefined,
        availabilityStatus: availabilityStatus !== undefined ? availabilityStatus : undefined,
        ...(verificationStatus === 'APPROVED' ? { verifiedAt: new Date(), approvalDate: new Date() } : {})
      } as any,
      create: {
        userId: id,
        status: verificationStatus ? verificationStatus.toUpperCase().trim() : 'APPROVED',
        rejectReason: rejectReason || null,
        hubId: hubId || null,
        preferredZone: preferredZone || 'Dhaka Central',
        serviceArea: serviceArea || 'Dhaka Metro',
        deliveryType: deliveryType || 'EXPRESS',
        availabilityStatus: availabilityStatus || 'OFFLINE'
      } as any
    });

    // 3. Immutable audit log
    await logAdminAction(
      adminUser.id,
      `ADMIN_UPDATED_DELIVERY_MAN: TargetId=${id}, AccountStatus=${accountStatus || 'unchanged'}, HubId=${hubId || 'unchanged'}`
    );

    // 4. In-App Notification to rider
    await prisma.notification.create({
      data: {
        userId: id,
        title: `Account Profile Updated by Admin 📋`,
        body: `Your delivery account settings have been updated by operations. Status: ${updatedAccountStatus}.`,
        type: updatedAccountStatus === 'ACTIVE' || updatedAccountStatus === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    // 5. Real-time broadcast to rider & admin channels
    await realtimeEngine.broadcast({
      eventId: `evt_adm_upd_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: id,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${id}`],
      data: {
        deliveryManId: id,
        accountStatus: updatedAccountStatus,
        deliveryProfile: updatedProfile
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery partner profile updated successfully.',
      deliveryProfile: updatedProfile
    });
  } catch (err: any) {
    console.error('Admin Delivery Man Update PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
