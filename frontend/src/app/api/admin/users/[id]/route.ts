import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        stores: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { items: true }
        },
        loginHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        addresses: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        name: user.profile?.fullName,
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        stores: user.stores,
        orders: user.orders,
        loginHistory: user.loginHistory,
        addresses: user.addresses,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Admin Get User Details Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status, fullName, phone, password, suspendedReason, walletBalance, loyaltyPoints } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Protect Super Admin account from demotion by non-superadmin
    if (existingUser.role === 'SUPER_ADMIN' && auth.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can modify Super Admin accounts.' }, { status: 403 });
    }

    let updateData: any = {};
    if (role) updateData.role = role.toUpperCase();
    if (status) {
      updateData.status = status.toUpperCase();
      if (status.toUpperCase() === 'SUSPENDED') {
        updateData.suspendedAt = new Date();
        updateData.suspendedReason = suspendedReason || 'Administrative suspension';
      } else {
        updateData.suspendedAt = null;
        updateData.suspendedReason = null;
      }
    }
    if (phone !== undefined) updateData.phone = phone;
    if (walletBalance !== undefined && !isNaN(parseFloat(walletBalance))) {
      updateData.walletBalance = parseFloat(walletBalance);
    }
    if (loyaltyPoints !== undefined && !isNaN(parseInt(loyaltyPoints, 10))) {
      updateData.loyaltyPoints = parseInt(loyaltyPoints, 10);
    }
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        profile: fullName
          ? {
              upsert: {
                create: { fullName },
                update: { fullName }
              }
            }
          : undefined
      },
      include: { profile: true }
    });

    await logAdminAction(
      auth.user?.id || null,
      `Updated user ${existingUser.email}: status=[${updatedUser.status}], role=[${updatedUser.role}]`
    );

    // Broadcast Real-Time User Status Update (instant session revocation if SUSPENDED)
    try {
      const { realtimeEngine } = await import('@/lib/services/realtimeEngine');
      const { PlatformEventType } = await import('@/lib/constants/events');
      await realtimeEngine.broadcast({
        eventId: `evt_user_${Date.now()}`,
        eventType: PlatformEventType.USER_STATUS_UPDATED,
        aggregateType: 'USER',
        aggregateId: updatedUser.id,
        timestamp: new Date().toISOString(),
        channels: [`user:${updatedUser.id}`, 'role:ADMIN', 'role:SUPER_ADMIN'],
        data: {
          userId: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          isSuspended: updatedUser.status === 'SUSPENDED' || updatedUser.status === 'BLOCKED'
        }
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} updated successfully.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.profile?.fullName,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone
      }
    });
  } catch (err: any) {
    console.error('Admin Update User Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Platform Superadmin accounts cannot be deleted.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted user account ${existingUser.email}`);

    // Broadcast Real-Time User Session Revocation
    try {
      const { realtimeEngine } = await import('@/lib/services/realtimeEngine');
      const { PlatformEventType } = await import('@/lib/constants/events');
      await realtimeEngine.broadcast({
        eventId: `evt_user_del_${Date.now()}`,
        eventType: PlatformEventType.SESSION_REVOKED,
        aggregateType: 'USER',
        aggregateId: id,
        timestamp: new Date().toISOString(),
        channels: [`user:${id}`, 'role:ADMIN', 'role:SUPER_ADMIN'],
        data: {
          userId: id,
          status: 'DELETED'
        }
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `User ${existingUser.email} deleted successfully.`
    });
  } catch (err: any) {
    console.error('Admin Delete User Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
