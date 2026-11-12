import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { executeOrderStatusTransition } from '@/lib/services/orderTransitionService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, expectedVersion, reason, otp, proofNotes, codCollected, failedReason } = body;

    if (!status) {
      return NextResponse.json({ error: 'New order status is required.' }, { status: 400 });
    }

    const result = await executeOrderStatusTransition({
      orderId: id,
      targetStatus: status,
      user: {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      },
      expectedVersion,
      reason,
      otp,
      proofNotes,
      codCollected,
      failedReason
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Order Status Update Error:', err);
    const isConflict = err.message && err.message.startsWith('Conflict:');
    const isUnauthorized = err.message && (err.message.includes('Unauthorized') || err.message.includes('permission') || err.message.includes('not permitted'));
    const isBadRequest = err.message && (err.message.includes('Illegal') || err.message.includes('required') || err.message.includes('Invalid'));

    const statusCode = isConflict ? 409 : isUnauthorized ? 403 : isBadRequest ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Internal server error updating order status.' }, { status: statusCode });
  }
}
