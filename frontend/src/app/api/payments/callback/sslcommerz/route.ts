import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/paymentService';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);
    const searchParams = req.nextUrl.searchParams;

    const orderId = searchParams.get('orderId') || formData?.get('value_a') as string || '';
    const status = searchParams.get('status') || formData?.get('status') as string || '';
    const valId = formData?.get('val_id') as string || searchParams.get('val_id') || '';
    const tranId = formData?.get('tran_id') as string || searchParams.get('tran_id') || '';
    const amount = parseFloat(formData?.get('amount') as string || '0');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

    if (status === 'VALID' || status === 'VALIDATED' || status === 'success') {
      if (orderId) {
        await paymentService.finalizeSslCommerzPayment(orderId, valId, tranId, amount);
        return NextResponse.redirect(`${baseUrl}/tracking?orderId=${orderId}&payment=success`, 303);
      }
    }

    // If cancelled or failed
    if (orderId) {
      return NextResponse.redirect(`${baseUrl}/tracking?orderId=${orderId}&payment=failed`, 303);
    }

    return NextResponse.redirect(`${baseUrl}/`, 303);
  } catch (err: any) {
    console.error('SSLCommerz Callback Error:', err);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';
    return NextResponse.redirect(`${baseUrl}/?payment=error`, 303);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
