import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';
import { executeOrderStatusTransition } from '@/lib/services/orderTransitionService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const { id } = await params;
    const userId = context.user.id;
    const body = await request.json();
    const { newStatus, otp, failedReason, proofNotes, codCollected, expectedVersion } = body;

    if (!newStatus) {
      return NextResponse.json({ error: 'Target status is required.' }, { status: 400 });
    }

    // Resolve assignment
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        deliveryManId: userId,
        OR: [{ id }, { orderId: id }]
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Delivery assignment not found or access denied.' }, { status: 404 });
    }

    const result = await executeOrderStatusTransition({
      orderId: assignment.orderId,
      targetStatus: newStatus,
      user: {
        id: userId,
        role: context.user.role,
        fullName: context.user.fullName,
        email: context.user.email
      },
      expectedVersion,
      otp,
      proofNotes,
      codCollected,
      failedReason
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      order: result.order
    });

  } catch (err: any) {
    console.error('Delivery Status POST Error:', err);
    const isConflict = err.message && err.message.startsWith('Conflict:');
    const isUnauthorized = err.message && (err.message.includes('Unauthorized') || err.message.includes('permission') || err.message.includes('not permitted'));
    const isBadRequest = err.message && (err.message.includes('Illegal') || err.message.includes('required') || err.message.includes('Invalid'));

    const statusCode = isConflict ? 409 : isUnauthorized ? 403 : isBadRequest ? 400 : 500;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: statusCode });
  }
}
