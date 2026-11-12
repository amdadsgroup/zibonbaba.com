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

    const filterStatus = searchParams.get('status')?.toUpperCase().trim() || 'ALL';
    const searchQuery = searchParams.get('search')?.toLowerCase().trim() || '';
    const dateFilter = searchParams.get('date'); // 'today', 'week', 'month', or ISO date
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      deliveryManId: userId
    };

    if (filterStatus !== 'ALL') {
      where.status = filterStatus;
    }

    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.assignedAt = { gte: today };
    } else if (dateFilter === 'week') {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      where.assignedAt = { gte: weekStart };
    } else if (dateFilter === 'month') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      where.assignedAt = { gte: monthStart };
    }

    const [assignments, totalCount] = await Promise.all([
      prisma.deliveryAssignment.findMany({
        where,
        include: {
          hub: {
            select: { id: true, name: true, code: true, address: true, contactNumber: true }
          },
          order: {
            include: {
              customer: {
                select: {
                  id: true,
                  phone: true,
                  profile: { select: { fullName: true } }
                }
              },
              store: {
                select: { id: true, name: true, logo: true }
              },
              resellerOrder: {
                select: {
                  customerName: true,
                  customerPhone: true,
                  altPhone: true,
                  shippingAddress: true,
                  district: true,
                  upazila: true
                }
              },
              items: {
                include: {
                  variant: {
                    include: {
                      product: { select: { name: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.deliveryAssignment.count({ where })
    ]);

    // Apply client search query filter on customer name or order id if provided
    let results = assignments.map((a) => {
      const ro = a.order?.resellerOrder;
      const cust = a.order?.customer;
      const recipientName = ro?.customerName || cust?.profile?.fullName || 'Customer';
      const recipientPhone = ro?.customerPhone || cust?.phone || 'N/A';
      const shippingAddress = ro?.shippingAddress || 'Delivery Address, Bangladesh';

      return {
        id: a.id,
        orderId: a.orderId,
        orderDisplayId: `#ORD-${a.orderId.substring(0, 8).toUpperCase()}`,
        status: a.status,
        customerName: recipientName,
        customerPhone: recipientPhone,
        address: shippingAddress,
        district: ro?.district || 'Dhaka',
        upazila: ro?.upazila || '',
        codAmount: a.codAmount > 0 ? a.codAmount : (a.order?.total || 0),
        codCollected: a.codCollected,
        deliveryFee: a.deliveryFee,
        deliveryOtp: a.deliveryOtp,
        specialInstructions: a.specialInstructions || null,
        proofNotes: a.proofNotes || null,
        failedReason: a.failedReason || null,
        hub: a.hub,
        storeName: a.order?.store?.name || 'Zibonbaba Store',
        itemsCount: a.order?.items?.length || 1,
        itemsSummary: a.order?.items?.map(it => `${it.quantity}x ${it.variant?.product?.name || 'Item'}`).join(', ') || 'Package',
        assignedAt: a.assignedAt.toISOString(),
        acceptedAt: a.acceptedAt?.toISOString() || null,
        pickedUpAt: a.pickedUpAt?.toISOString() || null,
        deliveredAt: a.deliveredAt?.toISOString() || null,
        failedAt: a.failedAt?.toISOString() || null
      };
    });

    if (searchQuery) {
      results = results.filter(r =>
        r.orderId.toLowerCase().includes(searchQuery) ||
        r.orderDisplayId.toLowerCase().includes(searchQuery) ||
        r.customerName.toLowerCase().includes(searchQuery) ||
        r.address.toLowerCase().includes(searchQuery) ||
        r.district.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      deliveries: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err: any) {
    console.error('Deliveries GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
