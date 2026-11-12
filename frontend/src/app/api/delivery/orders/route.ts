import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDeliveryMan } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireDeliveryMan(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'ALL';

    const where: any = { deliveryManId: userId };

    if (tab === 'NEW') {
      where.status = 'ASSIGNED';
    } else if (tab === 'ACCEPTED') {
      where.status = 'ACCEPTED';
    } else if (tab === 'PICKUP') {
      where.status = 'PICKED_UP';
    } else if (tab === 'IN_TRANSIT') {
      where.status = 'IN_TRANSIT';
    } else if (tab === 'DELIVERED') {
      where.status = 'DELIVERED';
    } else if (tab === 'FAILED') {
      where.status = 'FAILED';
    } else if (tab === 'RETURNED') {
      where.status = 'RETURNED';
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where,
      include: {
        hub: true,
        order: {
          include: {
            customer: { include: { profile: true } },
            store: true,
            hub: true,
            resellerOrder: true,
            items: {
              include: {
                variant: { include: { product: true } }
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    const formatted = assignments.map((a) => {
      const ro = a.order?.resellerOrder;
      const cust = a.order?.customer;
      const recipientName = ro?.customerName || cust?.profile?.fullName || 'Valued Customer';
      const recipientPhone = ro?.customerPhone || cust?.phone || '+8801700000000';
      const shippingAddress = ro?.shippingAddress || 'Customer Address, Bangladesh';
      const originHub = a.hub || a.order?.hub;

      return {
        id: a.id,
        orderId: a.orderId,
        status: a.status,
        customerName: recipientName,
        customerPhone: recipientPhone,
        altPhone: ro?.altPhone || null,
        address: shippingAddress,
        district: ro?.district || 'Dhaka',
        upazila: ro?.upazila || '',
        codAmount: a.codAmount > 0 ? a.codAmount : (a.order?.total || 0),
        codCollected: a.codCollected,
        deliveryFee: a.deliveryFee,
        deliveryOtp: a.deliveryOtp,
        specialInstructions: a.specialInstructions || null,
        hub: originHub ? {
          id: originHub.id,
          name: originHub.name,
          code: originHub.code,
          address: originHub.address,
          contactNumber: originHub.contactNumber
        } : null,
        storeName: a.order?.store?.name || 'Zibonbaba Seller Store',
        items: a.order?.items?.map((it) => ({
          id: it.id,
          name: it.variant?.product?.name || 'Item',
          sku: it.variant?.sku || 'SKU',
          quantity: it.quantity,
          price: it.price
        })) || [],
        assignedAt: a.assignedAt.toISOString(),
        acceptedAt: a.acceptedAt?.toISOString() || null,
        pickedUpAt: a.pickedUpAt?.toISOString() || null,
        deliveredAt: a.deliveredAt?.toISOString() || null,
        failedReason: a.failedReason || null,
        proofNotes: a.proofNotes || null
      };
    });

    return NextResponse.json({
      success: true,
      orders: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Delivery Orders GET API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
