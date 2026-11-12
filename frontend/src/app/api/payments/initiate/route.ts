import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentService, SupportedPaymentMethod } from '@/lib/services/paymentService';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const rateLimitRes = checkRateLimit(req, 'payment-initiate', { limit: 10, windowSeconds: 60 });
  if (rateLimitRes) return rateLimitRes;

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, paymentMethod = 'COD' } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { include: { profile: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Ensure order belongs to current user or user is admin
    if (order.customerId !== user.id && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to access this order.' }, { status: 403 });
    }

    const result = await paymentService.initiatePayment({
      orderId: order.id,
      amount: order.total,
      paymentMethod: paymentMethod.toUpperCase() as SupportedPaymentMethod,
      customer: {
        id: user.id,
        name: order.customer?.profile?.fullName || user.fullName || 'Customer',
        email: user.email,
        phone: order.customer?.phone || '+8801700000000',
        address: 'Dhaka, Bangladesh'
      }
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Payment Initiation Error:', err);
    return NextResponse.json({ error: err.message || 'Payment initiation failed.' }, { status: 500 });
  }
}
