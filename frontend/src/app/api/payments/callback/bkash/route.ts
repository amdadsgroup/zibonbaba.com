import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { realtimeEngine } from '@/lib/services/realtimeEngine';
import { PlatformEventType } from '@/lib/constants/events';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const paymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

  if (status === 'success' && orderId) {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: 'PENDING',
          newStatus: 'CONFIRMED',
          reason: `Payment verified via bKash. PaymentID: ${paymentID}`
        }
      });

      await realtimeEngine.broadcast({
        eventId: `evt_pay_bks_${Date.now()}`,
        eventType: PlatformEventType.ORDER_STATUS_UPDATED,
        aggregateType: 'ORDER',
        aggregateId: orderId,
        timestamp: new Date().toISOString(),
        channels: ['role:ADMIN', `order:${orderId}`],
        data: {
          orderId,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          transactionId: paymentID
        }
      });

      return NextResponse.redirect(`${baseUrl}/tracking?orderId=${orderId}&payment=success`, 303);
    } catch (err) {
      console.error('bKash Payment Finalize Error:', err);
    }
  }

  if (orderId) {
    return NextResponse.redirect(`${baseUrl}/tracking?orderId=${orderId}&payment=${status || 'failed'}`, 303);
  }

  return NextResponse.redirect(`${baseUrl}/`, 303);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
