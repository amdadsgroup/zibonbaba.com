import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId, role: 'RESELLER' },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      withdrawals,
      total: withdrawals.length
    });
  } catch (err: any) {
    console.error('Reseller Withdrawals GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const body = await request.json();
    const { amount, paymentMethod, accountNumber, accountDetails, notes } = body;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      return NextResponse.json({ error: 'Minimum withdrawal request amount is ৳100.' }, { status: 400 });
    }

    if (!paymentMethod || !accountNumber) {
      return NextResponse.json({ error: 'Payment method and account number are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.walletBalance < numAmount) {
      return NextResponse.json({
        error: `Insufficient wallet balance. Available balance: ৳${(user?.walletBalance || 0).toLocaleString()}`
      }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet balance
      const newBalance = user.walletBalance - numAmount;
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance }
      });

      // Record transaction ledger entry
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          userId,
          type: 'DEBIT',
          amount: numAmount,
          balance: newBalance,
          description: `Withdrawal request via ${paymentMethod} (${accountNumber})`,
          reference: `WDR-${Date.now().toString().slice(-6)}`
        }
      });

      // Create withdrawal request
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          userId,
          role: 'RESELLER',
          amount: numAmount,
          paymentMethod,
          accountNumber: accountNumber.trim(),
          accountDetails: accountDetails ? JSON.stringify(accountDetails) : null,
          notes: notes || null,
          status: 'PENDING'
        }
      });

      return { withdrawal, ledgerEntry, newBalance };
    });

    await logAdminAction(userId, `RESELLER_WITHDRAWAL_REQUEST: Amount=৳${numAmount}`);

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Withdrawal Request Submitted ⏳',
        body: `Your payout request for ৳${numAmount.toLocaleString()} via ${paymentMethod} has been submitted for finance review.`,
        type: 'WARNING',
        priority: 'MEDIUM',
        module: 'WALLET'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for ৳${numAmount.toLocaleString()} submitted successfully.`,
      withdrawal: result.withdrawal,
      availableBalance: result.newBalance
    }, { status: 201 });

  } catch (err: any) {
    console.error('Reseller Withdrawal POST Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
