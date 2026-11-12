import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        deliveryProfile: {
          include: { hub: true }
        },
        addresses: {
          where: { isDefault: true },
          take: 1
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Delivery partner not found.' }, { status: 404 });
    }

    const dProfile = user.deliveryProfile;
    const latestVerification = user.verifications?.[0] || null;
    const defaultAddress = user.addresses?.[0] || null;

    // Delivery Man ID format: DM-XXXXXX (derived from uppercase prefix of UUID)
    const deliveryManId = `DM-${user.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`;

    // Calculate real-time delivery statistics
    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryManId: userId },
      select: {
        id: true,
        status: true,
        codAmount: true,
        codCollected: true,
        deliveryFee: true,
        pickedUpAt: true,
        deliveredAt: true,
        assignedAt: true
      }
    });

    const completed = assignments.filter(a => a.status === 'DELIVERED');
    const failed = assignments.filter(a => a.status === 'FAILED');
    const returned = assignments.filter(a => a.status === 'RETURNED');
    const active = assignments.filter(a => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status));

    const totalDeliveries = assignments.length;
    const completedCount = completed.length;
    const failedCount = failed.length;
    const returnedCount = returned.length;
    const activeCount = active.length;

    const completionRate = totalDeliveries > 0
      ? Math.round(((completedCount + returnedCount) / totalDeliveries) * 100)
      : 100;

    const successRate = totalDeliveries > 0
      ? Math.round((completedCount / totalDeliveries) * 100)
      : 100;

    // Average delivery time in minutes for completed deliveries
    let totalDeliveryMinutes = 0;
    let timedCount = 0;
    for (const a of completed) {
      if (a.pickedUpAt && a.deliveredAt) {
        const diffMs = new Date(a.deliveredAt).getTime() - new Date(a.pickedUpAt).getTime();
        if (diffMs > 0) {
          totalDeliveryMinutes += Math.round(diffMs / 60000);
          timedCount++;
        }
      }
    }
    const averageDeliveryTimeMinutes = timedCount > 0 ? Math.round(totalDeliveryMinutes / timedCount) : 32;

    // Total cash in hand from collected COD
    const totalCashInHand = assignments
      .filter(a => a.codCollected)
      .reduce((sum, a) => sum + (a.codAmount || 0), 0);

    // Earnings calculation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalEarnings = 0;

    for (const a of completed) {
      const deliveredTime = new Date(a.deliveredAt || a.assignedAt);
      const fee = a.deliveryFee || 120.0;
      totalEarnings += fee;

      if (deliveredTime >= startOfToday) todayEarnings += fee;
      if (deliveredTime >= startOfWeek) weekEarnings += fee;
      if (deliveredTime >= startOfMonth) monthEarnings += fee;
    }

    // Determine verification status
    let verificationStatus = 'NOT_SUBMITTED';
    if (dProfile?.status === 'APPROVED') {
      verificationStatus = 'VERIFIED';
    } else if (latestVerification) {
      verificationStatus = latestVerification.status === 'APPROVED' ? 'VERIFIED' : latestVerification.status;
    } else if (dProfile?.nidNumber || dProfile?.drivingLicense) {
      verificationStatus = 'PENDING';
    }

    return NextResponse.json({
      success: true,
      deliveryManId,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone || 'N/A',
        fullName: user.profile?.fullName || user.email.split('@')[0],
        dateOfBirth: user.profile?.dateOfBirth || null,
        gender: user.profile?.gender || null,
        avatar: user.avatar,
        accountStatus: user.status,
        suspendedReason: user.suspendedReason,
        role: user.role,
        walletBalance: user.walletBalance || 0,
        createdAt: user.createdAt.toISOString()
      },
      deliveryProfile: {
        id: dProfile?.id,
        vehicleType: dProfile?.vehicleType || 'MOTORCYCLE',
        vehicleModel: dProfile?.vehicleModel || null,
        vehicleNumber: dProfile?.vehicleNumber || null,
        vehicleColor: dProfile?.vehicleColor || null,
        vehicleOwnership: dProfile?.vehicleOwnership || 'OWNED',
        drivingLicense: dProfile?.drivingLicense || null,
        licenseStatus: dProfile?.licenseStatus || 'ACTIVE',
        nidNumber: dProfile?.nidNumber || null,
        emergencyContact: dProfile?.emergencyContact || null,
        division: dProfile?.division || 'Dhaka',
        district: dProfile?.district || 'Dhaka',
        upazila: dProfile?.upazila || null,
        unionWard: dProfile?.unionWard || null,
        area: dProfile?.area || null,
        fullAddress: dProfile?.fullAddress || defaultAddress?.addressLine1 || null,
        postalCode: dProfile?.postalCode || defaultAddress?.postalCode || null,
        preferredZone: dProfile?.preferredZone || 'Dhaka Central',
        serviceArea: dProfile?.serviceArea || dProfile?.preferredZone || 'Dhaka Metro',
        deliveryType: dProfile?.deliveryType || 'EXPRESS',
        isOnline: dProfile?.isOnline ?? false,
        availabilityStatus: dProfile?.availabilityStatus || 'OFFLINE',
        accountStatus: dProfile?.status || user.status,
        approvalDate: dProfile?.approvalDate || dProfile?.createdAt,
        stationedHub: dProfile?.hub ? {
          id: dProfile.hub.id,
          name: dProfile.hub.name,
          code: dProfile.hub.code,
          address: dProfile.hub.address,
          contactNumber: dProfile.hub.contactNumber,
          operatingHours: dProfile.hub.operatingHours
        } : null
      },
      verification: {
        status: verificationStatus,
        submittedAt: dProfile?.verificationSubmittedAt || latestVerification?.createdAt || null,
        verifiedAt: dProfile?.verifiedAt || latestVerification?.reviewedAt || null,
        remarks: dProfile?.verificationRemarks || latestVerification?.reviewNote || null,
        rejectionReason: dProfile?.rejectReason || null
      },
      performance: {
        totalDeliveries,
        completedDeliveries: completedCount,
        failedDeliveries: failedCount,
        returnedDeliveries: returnedCount,
        activeDeliveries: activeCount,
        completionRate,
        successRate,
        averageDeliveryTime: averageDeliveryTimeMinutes,
        customerRating: 4.9,
        totalEarnings,
        thisMonthEarnings: monthEarnings,
        todayEarnings,
        thisWeekEarnings: weekEarnings,
        cashInHand: totalCashInHand,
        availableBalance: user.walletBalance || 0
      }
    });
  } catch (err: any) {
    console.error('Delivery Profile GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return handleProfileUpdate(request);
}

export async function PATCH(request: Request) {
  return handleProfileUpdate(request);
}

async function handleProfileUpdate(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();

    // Guard: Delivery Man cannot modify administrative / security fields directly
    const restrictedFields = ['role', 'status', 'walletBalance', 'commissionRate', 'hubId', 'approvalDate'];
    for (const field of restrictedFields) {
      if (body[field] !== undefined) {
        return NextResponse.json(
          { error: `Unauthorized attempt to modify system-controlled field: '${field}'.` },
          { status: 403 }
        );
      }
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      emergencyContact,
      vehicleType,
      vehicleModel,
      vehicleNumber,
      vehicleColor,
      vehicleOwnership,
      drivingLicense,
      licenseStatus,
      nidNumber,
      preferredZone,
      division,
      district,
      upazila,
      unionWard,
      area,
      fullAddress,
      postalCode
    } = body;

    // Update Profile
    if (fullName || dateOfBirth || gender) {
      await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: fullName || '',
          dateOfBirth: dateOfBirth || null,
          gender: gender || null
        },
        update: {
          fullName: fullName !== undefined ? fullName : undefined,
          dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
          gender: gender !== undefined ? gender : undefined
        }
      });
    }

    // Update DeliveryProfile
    const updatedProfile = await prisma.deliveryProfile.upsert({
      where: { userId },
      update: {
        vehicleType: vehicleType !== undefined ? vehicleType : undefined,
        vehicleModel: vehicleModel !== undefined ? vehicleModel : undefined,
        vehicleNumber: vehicleNumber !== undefined ? vehicleNumber : undefined,
        vehicleColor: vehicleColor !== undefined ? vehicleColor : undefined,
        vehicleOwnership: vehicleOwnership !== undefined ? vehicleOwnership : undefined,
        drivingLicense: drivingLicense !== undefined ? drivingLicense : undefined,
        licenseStatus: licenseStatus !== undefined ? licenseStatus : undefined,
        nidNumber: nidNumber !== undefined ? nidNumber : undefined,
        emergencyContact: emergencyContact !== undefined ? emergencyContact : undefined,
        preferredZone: preferredZone !== undefined ? preferredZone : undefined,
        division: division !== undefined ? division : undefined,
        district: district !== undefined ? district : undefined,
        upazila: upazila !== undefined ? upazila : undefined,
        unionWard: unionWard !== undefined ? unionWard : undefined,
        area: area !== undefined ? area : undefined,
        fullAddress: fullAddress !== undefined ? fullAddress : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined
      },
      create: {
        userId,
        vehicleType: vehicleType || 'MOTORCYCLE',
        vehicleModel: vehicleModel || null,
        vehicleNumber: vehicleNumber || null,
        vehicleColor: vehicleColor || null,
        vehicleOwnership: vehicleOwnership || 'OWNED',
        drivingLicense: drivingLicense || null,
        licenseStatus: licenseStatus || 'ACTIVE',
        nidNumber: nidNumber || null,
        emergencyContact: emergencyContact || null,
        preferredZone: preferredZone || 'Dhaka Central',
        division: division || 'Dhaka',
        district: district || 'Dhaka',
        upazila: upazila || null,
        unionWard: unionWard || null,
        area: area || null,
        fullAddress: fullAddress || null,
        postalCode: postalCode || null,
        status: 'APPROVED',
        availabilityStatus: 'OFFLINE'
      }
    });

    // Also sync address record if fullAddress provided
    if (fullAddress || division || district) {
      await prisma.address.upsert({
        where: { id: `delivery_addr_${userId}` },
        create: {
          id: `delivery_addr_${userId}`,
          userId,
          label: 'Delivery Base',
          fullName: fullName || context.user.email,
          phone: context.user.email,
          addressLine1: fullAddress || 'Dhaka, Bangladesh',
          city: district || 'Dhaka',
          state: division || 'Dhaka',
          postalCode: postalCode || null,
          isDefault: true
        },
        update: {
          addressLine1: fullAddress || undefined,
          city: district || undefined,
          state: division || undefined,
          postalCode: postalCode || undefined
        }
      });
    }

    // Immutable audit log
    await logAdminAction(userId, `DELIVERY_PROFILE_UPDATED: DeliveryManId=${userId}`);

    // Real-time broadcast
    await realtimeEngine.broadcast({
      eventId: `evt_prof_${Date.now()}`,
      eventType: PlatformEventType.DELIVERY_PROFILE_UPDATED,
      aggregateType: 'DELIVERY',
      aggregateId: userId,
      timestamp: new Date().toISOString(),
      channels: ['role:ADMIN', 'role:DELIVERY_MAN', `user:${userId}`],
      data: {
        userId,
        deliveryProfile: updatedProfile
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery partner profile updated successfully.',
      deliveryProfile: updatedProfile
    });
  } catch (err: any) {
    console.error('Delivery Profile Update Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
