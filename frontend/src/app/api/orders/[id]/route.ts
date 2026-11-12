import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, logAdminAction } from '@/lib/auth';

const VALID_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'DISPATCHED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, email: true, phone: true, profile: true } },
        store: { select: { id: true, name: true, ownerId: true } },
        branch: { select: { id: true, name: true } },
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newStatus = (body.status || '').toUpperCase().trim();

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid order status. Allowed: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus }
    });

    await logAdminAction(user.id, `ORDER_UPDATE: Order #${id} set to ${newStatus}`);

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
