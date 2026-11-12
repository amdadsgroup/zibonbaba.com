import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';

export async function GET(
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

    // Find assignment by ID or by orderId
    const assignment = await prisma.deliveryAssignment.findFirst({
      where: {
        deliveryManId: userId,
        OR: [{ id }, { orderId: id }]
      },
      include: {
        order: {
          include: {
            customer: { include: { profile: true } },
            store: true,
            resellerOrder: true,
            items: {
              include: {
                variant: { include: { product: true } }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Delivery assignment not found or access denied.' }, { status: 404 });
    }

    const ro = assignment.order?.resellerOrder;
    const cust = assignment.order?.customer;
    const recipientName = ro?.customerName || cust?.profile?.fullName || 'Valued Customer';
    const recipientPhone = ro?.customerPhone || cust?.phone || '+8801700000000';
    const shippingAddress = ro?.shippingAddress || 'Customer Delivery Address, Bangladesh';

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        orderId: assignment.orderId,
        status: assignment.status,
        customerName: recipientName,
        customerPhone: recipientPhone,
        altPhone: ro?.altPhone || null,
        address: shippingAddress,
        district: ro?.district || 'Dhaka',
        upazila: ro?.upazila || '',
        codAmount: assignment.codAmount > 0 ? assignment.codAmount : (assignment.order?.total || 0),
        codCollected: assignment.codCollected,
        deliveryFee: assignment.deliveryFee,
        deliveryOtp: assignment.deliveryOtp,
        storeName: assignment.order?.store?.name || 'Zibonbaba Seller Store',
        items: assignment.order?.items?.map((it) => ({
          id: it.id,
          name: it.variant?.product?.name || 'Item',
          sku: it.variant?.sku || 'SKU',
          quantity: it.quantity,
          price: it.price
        })) || [],
        assignedAt: assignment.assignedAt.toISOString(),
        acceptedAt: assignment.acceptedAt?.toISOString() || null,
        pickedUpAt: assignment.pickedUpAt?.toISOString() || null,
        deliveredAt: assignment.deliveredAt?.toISOString() || null,
        failedReason: assignment.failedReason || null,
        proofNotes: assignment.proofNotes || null
      }
    });
  } catch (err: any) {
    console.error('Delivery Order Detail GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
