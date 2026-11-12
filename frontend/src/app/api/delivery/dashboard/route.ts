import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    // Fetch user with delivery profile, user profile, and stationed hub
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        deliveryProfile: {
          include: { hub: true }
        }
      }
    });

    const dProfile = user?.deliveryProfile;
    const deliveryManId = `DM-${userId.replace(/-/g, '').substring(0, 6).toUpperCase()}`;

    // Fetch all assignments for this delivery partner
    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryManId: userId },
      include: {
        hub: true,
        order: {
          include: {
            customer: { include: { profile: true } },
            store: true,
            hub: true,
            resellerOrder: true,
            items: {
              include: {
                variant: { include: { product: true } }
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayDeliveriesCount = 0;
    let todayEarnings = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let failedCount = 0;
    let returnedCount = 0;
    let totalCashInHand = 0;

    let activeDelivery: any = null;

    for (const a of assignments) {
      const isToday = new Date(a.assignedAt) >= startOfToday;

      if (a.status === 'DELIVERED') {
        completedCount++;
        if (isToday) {
          todayDeliveriesCount++;
          todayEarnings += a.deliveryFee;
        }
        if (a.codCollected) {
          totalCashInHand += a.codAmount;
        }
      } else if (['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)) {
        pendingCount++;
        // Find most relevant active task
        if (!activeDelivery && ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)) {
          activeDelivery = a;
        }
      } else if (a.status === 'FAILED') {
        failedCount++;
      } else if (a.status === 'RETURNED') {
        returnedCount++;
      }
    }

    // If no in-progress task, pick earliest ASSIGNED task
    if (!activeDelivery) {
      activeDelivery = assignments.find(a => a.status === 'ASSIGNED') || null;
    }

    const formatAssignment = (a: any) => {
      if (!a) return null;
      const ro = a.order?.resellerOrder;
      const cust = a.order?.customer;
      const recipientName = ro?.customerName || cust?.profile?.fullName || 'Valued Customer';
      const recipientPhone = ro?.customerPhone || cust?.phone || '+8801700000000';
      const shippingAddress = ro?.shippingAddress || 'Customer Address, Bangladesh';

      return {
        id: a.id,
        orderId: a.orderId,
        status: a.status,
        customerName: recipientName,
        customerPhone: recipientPhone,
        address: shippingAddress,
        district: ro?.district || 'Dhaka',
        upazila: ro?.upazila || '',
        codAmount: a.codAmount > 0 ? a.codAmount : (a.order?.total || 0),
        codCollected: a.codCollected,
        deliveryFee: a.deliveryFee,
        deliveryOtp: a.deliveryOtp,
        storeName: a.order?.store?.name || 'Zibonbaba Seller Store',
        itemsSummary: a.order?.items?.map((it: any) => `${it.quantity}x ${it.variant?.product?.name || 'Item'}`).join(', ') || 'Package',
        assignedAt: a.assignedAt,
        acceptedAt: a.acceptedAt,
        pickedUpAt: a.pickedUpAt,
        deliveredAt: a.deliveredAt
      };
    };

    return NextResponse.json({
      success: true,
      profile: {
        deliveryManId,
        fullName: user?.profile?.fullName || user?.email.split('@')[0],
        avatar: user?.avatar,
        isOnline: dProfile?.isOnline ?? false,
        availabilityStatus: dProfile?.availabilityStatus || 'OFFLINE',
        vehicleType: dProfile?.vehicleType || 'MOTORCYCLE',
        vehicleModel: (dProfile as any)?.vehicleModel || null,
        vehicleNumber: dProfile?.vehicleNumber || 'N/A',
        preferredZone: dProfile?.preferredZone || 'Dhaka Central',
        serviceArea: (dProfile as any)?.serviceArea || dProfile?.preferredZone || 'Dhaka Metro',
        status: dProfile?.status || 'APPROVED',
        cashInHand: totalCashInHand,
        walletBalance: user?.walletBalance || 0,
        stationedHub: dProfile?.hub ? {
          id: dProfile.hub.id,
          name: dProfile.hub.name,
          code: dProfile.hub.code,
          address: dProfile.hub.address,
          contactNumber: dProfile.hub.contactNumber,
          operatingHours: dProfile.hub.operatingHours
        } : null
      },
      stats: {
        todayDeliveries: todayDeliveriesCount,
        todayEarnings,
        pendingDeliveries: pendingCount,
        completedDeliveries: completedCount,
        failedDeliveries: failedCount,
        returnedDeliveries: returnedCount,
        totalEarnings: dProfile?.totalEarnings || (completedCount * 120),
        availableBalance: user?.walletBalance || 0,
        cashInHand: totalCashInHand
      },
      activeDelivery: formatAssignment(activeDelivery),
      recentAssignments: assignments.slice(0, 10).map(formatAssignment)
    });
  } catch (err: any) {
    console.error('Delivery Dashboard GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
