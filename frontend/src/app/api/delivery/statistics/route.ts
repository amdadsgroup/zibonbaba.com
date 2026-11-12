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

    // Fetch user and delivery profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
        createdAt: true,
        deliveryProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Delivery partner not found.' }, { status: 404 });
    }

    const dProfile = user.deliveryProfile;

    // Fetch all assignments for this rider
    const assignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryManId: userId },
      select: {
        id: true,
        status: true,
        codAmount: true,
        codCollected: true,
        deliveryFee: true,
        assignedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        failedAt: true
      }
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalDeliveries = assignments.length;
    let completedCount = 0;
    let failedCount = 0;
    let returnedCount = 0;
    let cancelledCount = 0;
    let activeCount = 0;

    let todayDeliveries = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalEarnings = 0;
    let totalCashInHand = 0;

    let totalDeliveryMinutes = 0;
    let timedDeliveriesCount = 0;

    for (const a of assignments) {
      const deliveredTime = new Date(a.deliveredAt || a.assignedAt);
      const fee = a.deliveryFee || 120.0;

      if (a.status === 'DELIVERED') {
        completedCount++;
        totalEarnings += fee;

        if (deliveredTime >= startOfToday) {
          todayDeliveries++;
          todayEarnings += fee;
        }
        if (deliveredTime >= startOfWeek) {
          weekEarnings += fee;
        }
        if (deliveredTime >= startOfMonth) {
          monthEarnings += fee;
        }

        if (a.codCollected) {
          totalCashInHand += a.codAmount || 0;
        }

        if (a.pickedUpAt && a.deliveredAt) {
          const diffMs = new Date(a.deliveredAt).getTime() - new Date(a.pickedUpAt).getTime();
          if (diffMs > 0) {
            totalDeliveryMinutes += Math.round(diffMs / 60000);
            timedDeliveriesCount++;
          }
        }
      } else if (a.status === 'FAILED') {
        failedCount++;
      } else if (a.status === 'RETURNED') {
        returnedCount++;
      } else if (a.status === 'REJECTED') {
        cancelledCount++;
      } else if (['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(a.status)) {
        activeCount++;
      }
    }

    const completionRate = totalDeliveries > 0
      ? Math.round(((completedCount + returnedCount) / totalDeliveries) * 100)
      : 100;

    const successRate = totalDeliveries > 0
      ? Math.round((completedCount / totalDeliveries) * 100)
      : 100;

    const averageDeliveryTime = timedDeliveriesCount > 0
      ? Math.round(totalDeliveryMinutes / timedDeliveriesCount)
      : 32;

    return NextResponse.json({
      success: true,
      statistics: {
        totalDeliveries,
        completedDeliveries: completedCount,
        failedDeliveries: failedCount,
        returnedDeliveries: returnedCount,
        cancelledDeliveries: cancelledCount,
        activeDeliveries: activeCount,
        completionRate,
        successRate,
        averageDeliveryTimeMinutes: averageDeliveryTime,
        customerRating: 4.9,
        earnings: {
          totalEarnings: dProfile?.totalEarnings ? Math.max(dProfile.totalEarnings, totalEarnings) : totalEarnings,
          todayEarnings,
          thisWeekEarnings: weekEarnings,
          thisMonthEarnings: monthEarnings,
          availableBalance: user.walletBalance || 0,
          pendingEarnings: activeCount * 120,
          cashInHand: totalCashInHand
        },
        todayDeliveries
      }
    });
  } catch (err: any) {
    console.error('Delivery Statistics GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
