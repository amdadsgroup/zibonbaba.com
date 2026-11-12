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

    // Fetch user & delivery profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { deliveryProfile: true }
    });

    const dProfile = user?.deliveryProfile;

    // Completed deliveries
    const completedAssignments = await prisma.deliveryAssignment.findMany({
      where: { deliveryManId: userId, status: 'DELIVERED' },
      include: {
        order: {
          include: { resellerOrder: true, customer: { include: { profile: true } } }
        }
      },
      orderBy: { deliveredAt: 'desc' }
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayEarnings = 0;
    let weekEarnings = 0;
    let monthEarnings = 0;
    let totalEarnings = 0;
    let totalCashInHand = 0;

    for (const a of completedAssignments) {
      const deliveredTime = a.deliveredAt || a.assignedAt;
      const fee = a.deliveryFee || 120.0;
      totalEarnings += fee;

      if (deliveredTime >= startOfToday) todayEarnings += fee;
      if (deliveredTime >= startOfWeek) weekEarnings += fee;
      if (deliveredTime >= startOfMonth) monthEarnings += fee;

      if (a.codCollected) {
        totalCashInHand += a.codAmount;
      }
    }

    // Immutable transactions ledger
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Withdrawals
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId, role: 'DELIVERY_MAN' },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      earnings: {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        totalEarnings,
        availableBalance: user?.walletBalance || 0,
        cashInHand: totalCashInHand,
        completedCount: completedAssignments.length
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balance: t.balance,
        description: t.description,
        reference: t.reference,
        date: t.createdAt.toISOString()
      })),
      withdrawals
    });

  } catch (err: any) {
    console.error('Delivery Earnings GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
