import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId, role: 'DELIVERY_MAN' },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      withdrawals,
      total: withdrawals.length
    });
  } catch (err: any) {
    console.error('Delivery Withdrawals GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { amount, paymentMethod, accountNumber, notes } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      return NextResponse.json({ error: 'Minimum payout amount is ৳100.' }, { status: 400 });
    }

    if (!paymentMethod || !accountNumber) {
      return NextResponse.json({ error: 'Payment method and account number are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.walletBalance < numAmount) {
      return NextResponse.json({
        error: `Insufficient balance. Available: ৳${(user?.walletBalance || 0).toLocaleString()}`
      }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newBalance = user.walletBalance - numAmount;
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance }
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'DEBIT',
          amount: numAmount,
          balance: newBalance,
          description: `Delivery earnings payout request via ${paymentMethod} (${accountNumber})`,
          reference: `DVR-${Date.now().toString().slice(-6)}`
        }
      });

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          role: 'DELIVERY_MAN',
          amount: numAmount,
          paymentMethod,
          accountNumber: accountNumber.trim(),
          notes: notes || null,
          status: 'PENDING'
        }
      });

      return { withdrawal, newBalance };
    });

    await logAdminAction(userId, `DELIVERY_WITHDRAWAL_REQUEST: Amount=৳${numAmount}`);

    return NextResponse.json({
      success: true,
      message: `Payout request for ৳${numAmount.toLocaleString()} submitted successfully.`,
      withdrawal: result.withdrawal,
      availableBalance: result.newBalance
    }, { status: 201 });

  } catch (err: any) {
    console.error('Delivery Withdrawal POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
