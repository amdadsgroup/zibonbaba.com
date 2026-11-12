import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAdminRole(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. Fetch verification requests
    const verifications = await prisma.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          include: {
            profile: true,
            stores: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Also check unapproved stores
    const unapprovedStores = await prisma.store.findMany({
      where: { isApproved: false },
      include: {
        owner: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Merge or present pending items
    const pendingList = [
      ...verifications.map(v => ({
        id: v.id,
        type: v.type,
        userId: v.userId,
        userName: v.user.profile?.fullName || v.user.email.split('@')[0],
        email: v.user.email,
        phone: v.user.phone || 'N/A',
        storeName: v.user.stores[0]?.name || 'Pending Store Application',
        status: v.status,
        data: v.data,
        createdAt: v.createdAt
      })),
      ...unapprovedStores.map(s => ({
        id: `store-${s.id}`,
        storeId: s.id,
        type: 'TRADE_LICENSE',
        userId: s.ownerId,
        userName: s.owner.profile?.fullName || s.owner.email.split('@')[0],
        email: s.owner.email,
        phone: s.owner.phone || 'N/A',
        storeName: s.name,
        status: 'PENDING',
        data: JSON.stringify({ commissionRate: s.commissionRate, description: s.description }),
        createdAt: s.createdAt
      }))
    ];

    // Remove duplicates if any
    const seen = new Set();
    const uniquePending = pendingList.filter(item => {
      if (seen.has(item.userId)) return false;
      seen.add(item.userId);
      return true;
    });

    return NextResponse.json({
      success: true,
      count: uniquePending.length,
      verifications: uniquePending
    });
  } catch (err: any) {
    console.error('Pending Verifications Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
