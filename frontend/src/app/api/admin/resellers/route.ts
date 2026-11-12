import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { error, status } = await requireAdminRole(request);
    if (error) return NextResponse.json({ error }, { status });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase().trim() || '';

    const resellers = await prisma.user.findMany({
      where: {
        role: 'RESELLER',
        ...(query ? {
          OR: [
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { profile: { fullName: { contains: query, mode: 'insensitive' } } },
            { resellerProfile: { businessName: { contains: query, mode: 'insensitive' } } }
          ]
        } : {})
      },
      include: {
        profile: true,
        resellerProfile: true,
        resellerOrders: {
          select: {
            id: true,
            status: true,
            sellingAmount: true,
            resellerProfit: true
          }
        },
        withdrawals: {
          where: { role: 'RESELLER' },
          select: { id: true, amount: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = resellers.map((r) => {
      const orders = r.resellerOrders || [];
      const grossSales = orders.reduce((sum, o) => sum + o.sellingAmount, 0);
      const totalProfit = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.resellerProfit, 0);
      const pendingProfit = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RETURNED').reduce((sum, o) => sum + o.resellerProfit, 0);

      return {
        id: r.id,
        email: r.email,
        phone: r.phone,
        fullName: r.profile?.fullName || r.email.split('@')[0],
        avatar: r.avatar,
        status: r.resellerProfile?.status || r.status,
        businessName: r.resellerProfile?.businessName || `${r.profile?.fullName || 'User'}'s Reseller Hub`,
        district: r.resellerProfile?.district || 'N/A',
        division: r.resellerProfile?.division || 'N/A',
        paymentMethod: r.resellerProfile?.paymentMethod || 'bKash',
        paymentNumber: r.resellerProfile?.paymentNumber || r.phone || 'N/A',
        commissionRate: r.resellerProfile?.commissionRate || 5.0,
        walletBalance: r.walletBalance || 0,
        totalOrders: orders.length,
        deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
        grossSales,
        totalProfit,
        pendingProfit,
        joinedAt: r.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      resellers: formatted,
      total: formatted.length
    });
  } catch (err: any) {
    console.error('Admin Resellers GET Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error, status } = await requireAdminRole(request);
    if (error || !user) return NextResponse.json({ error }, { status });

    const body = await request.json();
    const { resellerId, newStatus, commissionRate, notes } = body;

    if (!resellerId || !newStatus) {
      return NextResponse.json({ error: 'Reseller ID and new status are required.' }, { status: 400 });
    }

    const normalizedStatus = newStatus.toUpperCase().trim();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resellerId },
        data: {
          status: normalizedStatus === 'APPROVED' ? 'ACTIVE' : normalizedStatus
        }
      }),
      prisma.resellerProfile.upsert({
        where: { userId: resellerId },
        update: {
          status: normalizedStatus,
          ...(commissionRate !== undefined ? { commissionRate: parseFloat(commissionRate) } : {}),
          ...(notes ? { rejectReason: notes } : {})
        },
        create: {
          userId: resellerId,
          status: normalizedStatus,
          commissionRate: commissionRate ? parseFloat(commissionRate) : 5.0,
          rejectReason: notes || null
        }
      })
    ]);

    await logAdminAction(user.id, `ADMIN_RESELLER_STATUS_CHANGE: ResellerId=${resellerId}, Status=${normalizedStatus}`);

    // Notify reseller
    await prisma.notification.create({
      data: {
        userId: resellerId,
        title: `Reseller Account ${normalizedStatus} 🔔`,
        body: `Your reseller partner account status has been updated to: ${normalizedStatus}. ${notes ? `Note: ${notes}` : ''}`,
        type: normalizedStatus === 'ACTIVE' || normalizedStatus === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        priority: 'HIGH',
        module: 'SECURITY'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Reseller status updated to ${normalizedStatus}`
    });
  } catch (err: any) {
    console.error('Admin Reseller PATCH Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
