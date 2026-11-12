import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ earnings: 0, withdrawals: [] });
    }

    const sellerStore = context.store;

    // Calculate total delivered sales for this store
    const completedOrders = await prisma.order.findMany({
      where: {
        storeId: sellerStore.id,
        status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] }
      }
    });

    const commissionRate = sellerStore.commissionRate || 8.5;
    let totalGrossSales = 0;
    let totalPlatformCommission = 0;

    completedOrders.forEach((o) => {
      totalGrossSales += o.total;
      totalPlatformCommission += Math.round((o.subTotal * commissionRate) / 100);
    });

    const netEarnings = Math.max(0, totalGrossSales - totalPlatformCommission);

    // Fetch user wallet transactions if any
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const formattedWithdrawals = transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      status: t.type === 'DEBIT' ? 'COMPLETED' : 'CREDIT',
      date: t.createdAt.toLocaleDateString(),
      description: t.description
    }));

    return NextResponse.json({
      earnings: netEarnings,
      grossSales: totalGrossSales,
      platformCommission: totalPlatformCommission,
      commissionRate,
      withdrawals: formattedWithdrawals
    });
  } catch (err: any) {
    console.error('Seller Wallet API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireSeller(request);
    if (error || !context || !context.store) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const body = await request.json();
    const { amount, bankDetails, payoutMethod } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid payout amount is required.' }, { status: 400 });
    }

    // Record wallet transaction request
    const tx = await prisma.walletTransaction.create({
      data: {
        userId: context.user.id,
        type: 'DEBIT',
        amount: numAmount,
        description: `Payout withdrawal request via ${payoutMethod || 'Bank Transfer'}`,
        balance: 0
      }
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ৳${numAmount.toLocaleString()} submitted for platform settlement.`,
      transaction: tx
    });
  } catch (err: any) {
    console.error('Seller Payout Request Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
