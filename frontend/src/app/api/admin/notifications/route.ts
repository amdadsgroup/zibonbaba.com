import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const notifications = await prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (err: any) {
    console.error('Admin Notifications Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, [
      'SUPER_ADMIN',
      'ADMIN',
      'MARKETING',
      'CUSTOMER_SUPPORT'
    ]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { title, body: messageBody, target, type, priority, channels } = body;

    if (!title || !messageBody) {
      return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 });
    }

    const targetGroup = (target || 'ALL').toUpperCase();
    let whereClause: any = {};

    if (targetGroup === 'SELLERS') {
      whereClause.role = { in: ['VENDOR_ADMIN', 'VENDOR_STAFF'] };
    } else if (targetGroup === 'CUSTOMERS') {
      whereClause.role = 'CUSTOMER';
    }

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true }
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map(u => ({
          userId: u.id,
          title,
          body: messageBody,
          type: (type || 'INFO').toUpperCase(),
          priority: (priority || 'NORMAL').toUpperCase(),
          channels: channels || 'In-App',
          module: 'MARKETPLACE'
        }))
      });
    }

    await logAdminAction(
      auth.user?.id || null,
      `Broadcast notification dispatched to [${targetGroup}] (${targetUsers.length} users): "${title}"`
    );

    return NextResponse.json({
      success: true,
      message: `Notification dispatched successfully to ${targetUsers.length} users.`,
      dispatchedCount: targetUsers.length
    });
  } catch (err: any) {
    console.error('Admin Send Notification Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
