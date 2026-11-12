import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * POST /api/hubs/[id]/assign
 * Assign or reassign a rider from this delivery hub to deliver a specific product/order.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'WAREHOUSE_MANAGER', 'MANAGER'];
    if (!allowedRoles.includes(user.role.toUpperCase())) {
      return NextResponse.json({ error: 'Access Denied: Insufficient permissions to dispatch riders.' }, { status: 403 });
    }

    const { id: hubId } = await params;
    const body = await request.json();
    const { orderId, deliveryManId, deliveryFee, specialInstructions, estimatedDeliveryHours } = body;

    if (!orderId || !deliveryManId) {
      return NextResponse.json({ error: 'Order ID and Delivery Rider ID are required.' }, { status: 400 });
    }

    // Verify Hub
    const hub = await prisma.deliveryHub.findFirst({
      where: {
        OR: [{ id: hubId }, { code: hubId }]
      }
    });

    if (!hub) {
      return NextResponse.json({ error: 'Delivery Hub not found.' }, { status: 404 });
    }

    // Verify Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { include: { profile: true } },
        resellerOrder: true,
        store: true,
        items: {
          include: {
            variant: { include: { product: true } }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify Rider
    const rider = await prisma.user.findUnique({
      where: { id: deliveryManId },
      include: { profile: true, deliveryProfile: true }
    });

    if (!rider) {
      return NextResponse.json({ error: 'Delivery rider not found.' }, { status: 404 });
    }

    const deliveryOtp = generateDeliveryOtp();
    const fee = deliveryFee ? parseFloat(deliveryFee) : 120.0;

    let estimatedDeliveryAt: Date | null = null;
    if (estimatedDeliveryHours) {
      estimatedDeliveryAt = new Date(Date.now() + parseInt(estimatedDeliveryHours, 10) * 3600000);
    } else {
      // Default 24 hours estimated delivery
      estimatedDeliveryAt = new Date(Date.now() + 24 * 3600000);
    }

    const assignment = await prisma.deliveryAssignment.upsert({
      where: { orderId },
      update: {
        deliveryManId,
        assignedById: user.id,
        hubId: hub.id,
        status: 'ASSIGNED',
        deliveryOtp,
        deliveryFee: fee,
        specialInstructions: specialInstructions || null,
        estimatedDeliveryAt,
        codAmount: order.total,
        codCollected: false,
        assignedAt: new Date(),
        acceptedAt: null,
        pickedUpAt: null,
        deliveredAt: null,
        failedAt: null,
        failedReason: null
      },
      create: {
        orderId,
        deliveryManId,
        assignedById: user.id,
        hubId: hub.id,
        status: 'ASSIGNED',
        deliveryOtp,
        deliveryFee: fee,
        specialInstructions: specialInstructions || null,
        estimatedDeliveryAt,
        codAmount: order.total,
        codCollected: false
      }
    });

    // Update order status and attach to hub
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        hubId: hub.id
      }
    });

    // Auto update rider's hub if not assigned yet
    if (!rider.deliveryProfile?.hubId) {
      await prisma.deliveryProfile.update({
        where: { userId: deliveryManId },
        data: { hubId: hub.id }
      }).catch(() => {});
    }

    await logAdminAction(
      user.id,
      `HUB_DISPATCH_RIDER: Hub=${hub.name}, Order=${orderId.slice(0, 8).toUpperCase()}, Rider=${rider.profile?.fullName || rider.email}`
    );

    // Notify Rider with Hub Pickup & Delivery Details
    const ro = order.resellerOrder;
    const cust = order.customer;
    const recipientName = ro?.customerName || cust?.profile?.fullName || 'Customer';
    const recipientPhone = ro?.customerPhone || cust?.phone || 'N/A';
    const shippingAddress = ro?.shippingAddress || 'Customer Address';

    await prisma.notification.create({
      data: {
        userId: deliveryManId,
        title: 'New Dispatch Task Assigned! 📦🛵',
        body: `Order #${orderId.slice(0, 8).toUpperCase()} assigned at ${hub.name}. Collect package from Hub and deliver to ${recipientName} (${shippingAddress}). COD: ৳${order.total.toLocaleString()}.`,
        type: 'INFO',
        priority: 'HIGH',
        module: 'DELIVERY'
      }
    });

    // Notify Customer / Reseller
    const notifyTargetUserId = order.resellerOrder ? order.resellerOrder.resellerId : order.customerId;
    if (notifyTargetUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyTargetUserId,
          title: 'Dispatched from Delivery Hub! 🛵',
          body: `Order #${orderId.slice(0, 8).toUpperCase()} has been dispatched from ${hub.name} via rider ${rider.profile?.fullName || 'Courier Agent'}. Delivery OTP: ${deliveryOtp}.`,
          type: 'INFO',
          priority: 'MEDIUM',
          module: 'MARKETPLACE'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Order #${orderId.slice(0, 8).toUpperCase()} assigned to ${rider.profile?.fullName || rider.email} from ${hub.name}.`,
      assignment: {
        ...assignment,
        hubName: hub.name,
        hubCode: hub.code,
        riderName: rider.profile?.fullName || rider.email,
        deliveryOtp
      }
    });
  } catch (err: any) {
    console.error('Hub Assign Rider Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
