import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        profile: true,
        stores: {
          select: {
            id: true,
            name: true,
            description: true,
            isApproved: true,
            commissionRate: true,
            logo: true,
            banner: true,
            createdAt: true
          }
        }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 });
    }

    const primaryStore = dbUser.stores && dbUser.stores.length > 0 ? dbUser.stores[0] : null;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        phone: dbUser.phone,
        role: dbUser.role,
        status: dbUser.status,
        fullName: dbUser.profile?.fullName || dbUser.email,
        avatar: dbUser.avatar,
        loyaltyPoints: dbUser.loyaltyPoints,
        walletBalance: dbUser.walletBalance,
        referralCode: dbUser.referralCode
      },
      store: primaryStore
    });
  } catch (err: any) {
    console.error('Auth /me API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
