import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, userId, reason } = body;

    const reviewReason = reason || 'Documentation submitted did not meet requirements.';
    let targetUserId = userId;

    if (id && !id.startsWith('store-')) {
      const vr = await prisma.verificationRequest.findUnique({ where: { id } });
      if (vr) {
        targetUserId = vr.userId;
        await prisma.verificationRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            reviewNote: reviewReason
          }
        });
      }
    }

    if (targetUserId) {
      // Create notification for the applicant
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Store Verification Update',
          body: `Your verification submission was not approved. Reason: ${reviewReason}. Please update your information and re-apply.`,
          type: 'WARNING',
          priority: 'HIGH',
          module: 'MARKETPLACE'
        }
      });
    }

    await logAdminAction(
      auth.user?.id || null,
      `Rejected verification request for user [${targetUserId}]. Reason: ${reviewReason}`
    );

    return NextResponse.json({
      success: true,
      message: 'Verification request rejected.'
    });
  } catch (err: any) {
    console.error('Reject Verification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
