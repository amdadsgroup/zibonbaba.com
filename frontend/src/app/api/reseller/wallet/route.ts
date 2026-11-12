import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    // Fetch user with wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, walletBalance: true }
    });

    // Fetch delivered orders profit
    const deliveredOrders = await prisma.resellerOrder.findMany({
      where: { resellerId: userId, status: 'DELIVERED' }
    });
    const totalEarnedProfit = deliveredOrders.reduce((sum, o) => sum + o.resellerProfit, 0);

    // Fetch pending orders profit
    const pendingOrders = await prisma.resellerOrder.findMany({
      where: {
        resellerId: userId,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'PICKED_UP', 'IN_TRANSIT'] }
      }
    });
    const pendingProfit = pendingOrders.reduce((sum, o) => sum + o.resellerProfit, 0);

    // Fetch withdrawals
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId, role: 'RESELLER' },
      orderBy: { createdAt: 'desc' }
    });

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    const pendingWithdrawalAmount = withdrawals
      .filter(w => w.status === 'PENDING' || w.status === 'PROCESSING')
      .reduce((sum, w) => sum + w.amount, 0);

    // Fetch immutable transactions ledger
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      balance: t.balance,
      description: t.description,
      reference: t.reference,
      date: t.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      wallet: {
        availableBalance: user?.walletBalance || 0,
        pendingBalance: pendingProfit,
        totalEarnings: totalEarnedProfit,
        totalWithdrawn,
        pendingWithdrawals: pendingWithdrawalAmount
      },
      transactions: formattedTransactions
    });
  } catch (err: any) {
    console.error('Reseller Wallet GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
