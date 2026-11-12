import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { error, status } = await requireAdminRole(request);
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role'); // RESELLER | DELIVERY_MAN | VENDOR_ADMIN
    const statusFilter = searchParams.get('status');

    const where: any = {};
    if (roleFilter && roleFilter !== 'ALL') where.role = roleFilter;
    if (statusFilter && statusFilter !== 'ALL') where.status = statusFilter;

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where,
      include: {
        user: {
          include: { profile: true, resellerProfile: true, deliveryProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = withdrawals.map((w) => {
      const u = w.user;
      return {
        id: w.id,
        userId: w.userId,
        userName: u?.profile?.fullName || u?.email?.split('@')[0] || 'User',
        userEmail: u?.email,
        userPhone: u?.phone,
        role: w.role,
        amount: w.amount,
        paymentMethod: w.paymentMethod,
        accountNumber: w.accountNumber,
        accountDetails: w.accountDetails,
        notes: w.notes,
        status: w.status,
        adminNote: w.adminNote,
        transactionRef: w.transactionRef,
        createdAt: w.createdAt.toISOString(),
        processedAt: w.processedAt?.toISOString() || null
      };
    });

    return NextResponse.json({
      success: true,
      withdrawals: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Admin Withdrawals GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error, status } = await requireAdminRole(request);
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { withdrawalId, newStatus, transactionRef, adminNote } = body;

    if (!withdrawalId || !newStatus) {
      return NextResponse.json({ error: 'Withdrawal ID and new status are required.' }, { status: 400 });
    }

    const normalizedStatus = newStatus.toUpperCase().trim();

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { user: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found.' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // If rejected, refund money back to user's wallet
      if (normalizedStatus === 'REJECTED' && withdrawal.status !== 'REJECTED') {
        const currentBal = withdrawal.user.walletBalance || 0;
        const refundedBal = currentBal + withdrawal.amount;

        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { walletBalance: refundedBal }
        });

        await tx.walletTransaction.create({
          data: {
            userId: withdrawal.userId,
            type: 'CREDIT',
            amount: withdrawal.amount,
            balance: refundedBal,
            description: `Refund for rejected withdrawal request #${withdrawal.id.slice(0, 6).toUpperCase()}`,
            reference: withdrawal.id
          }
        });
      }

      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: normalizedStatus,
          adminNote: adminNote || withdrawal.adminNote,
          transactionRef: transactionRef || withdrawal.transactionRef,
          processedById: user.id,
          processedAt: new Date()
        }
      });

      return updated;
    });

    await logAdminAction(user.id, `ADMIN_WITHDRAWAL_STATUS_CHANGE: Id=${withdrawalId}, Status=${normalizedStatus}`);

    // Notify User
    await prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        title: `Withdrawal Request ${normalizedStatus} 💳`,
        body: `Your payout request of ৳${withdrawal.amount.toLocaleString()} has been updated to: ${normalizedStatus}. ${transactionRef ? `Txn Ref: ${transactionRef}` : ''}`,
        type: normalizedStatus === 'COMPLETED' ? 'SUCCESS' : normalizedStatus === 'REJECTED' ? 'ERROR' : 'INFO',
        priority: 'HIGH',
        module: 'WALLET'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request #${withdrawalId.slice(0, 6).toUpperCase()} marked as ${normalizedStatus}.`,
      withdrawal: result
    });

  } catch (err: any) {
    console.error('Admin Withdrawal PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
