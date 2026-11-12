import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        profile: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
            supportTickets: true,
            walletTransactions: true
          }
        }
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
        walletBalance: user.walletBalance,
        loyaltyPoints: user.loyaltyPoints,
        profile: user.profile,
        addresses: user.addresses,
        stats: {
          ordersCount: user._count.orders,
          ticketsCount: user._count.supportTickets,
          transactionsCount: user._count.walletTransactions
        },
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Get Profile Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, phone, avatar, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    let passwordHash = undefined;
    if (newPassword) {
      if (currentPassword) {
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
        }
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        phone: phone !== undefined ? phone : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
        passwordHash: passwordHash || undefined,
        profile: {
          upsert: {
            create: {
              fullName: fullName || user.email.split('@')[0]
            },
            update: {
              ...(fullName !== undefined && { fullName })
            }
          }
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        profile: updated.profile
      }
    });
  } catch (err: any) {
    console.error('Update Profile Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
