import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireReseller } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { context, error, status } = await requireReseller(request);
    if (error || !context) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: status || 401 });
    }

    const userId = context.user.id;

    // Fetch reseller user with profile and wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { resellerProfile: true }
    });

    // Fetch all reseller orders
    const resellerOrders = await prisma.resellerOrder.findMany({
      where: { resellerId: userId },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: {
                  include: { product: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate aggregated metrics
    let totalSales = 0;
    let totalProfit = 0;
    let pendingProfit = 0;
    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    let inTransitOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let returnedOrdersCount = 0;

    // Monthly breakdown map (last 6 months)
    const monthlyMap = new Map<string, { month: string; sales: number; profit: number; orders: number }>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize current + previous 5 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyMap.set(key, { month: key, sales: 0, profit: 0, orders: 0 });
    }

    // Top product sales counter
    const productSalesMap = new Map<string, { id: string; name: string; price: number; profit: number; salesCount: number; image?: string }>();

    for (const ro of resellerOrders) {
      totalSales += ro.sellingAmount;
      
      if (ro.status === 'DELIVERED') {
        totalProfit += ro.resellerProfit;
        deliveredOrdersCount++;
      } else if (['PENDING', 'CONFIRMED', 'PROCESSING', 'PICKED_UP'].includes(ro.status)) {
        pendingProfit += ro.resellerProfit;
        pendingOrdersCount++;
      } else if (ro.status === 'IN_TRANSIT') {
        pendingProfit += ro.resellerProfit;
        inTransitOrdersCount++;
      } else if (ro.status === 'CANCELLED') {
        cancelledOrdersCount++;
      } else if (['RETURNED', 'FAILED'].includes(ro.status)) {
        returnedOrdersCount++;
      }

      // Group by month
      const roDate = new Date(ro.createdAt);
      const mKey = `${monthNames[roDate.getMonth()]} ${roDate.getFullYear().toString().slice(-2)}`;
      if (monthlyMap.has(mKey)) {
        const m = monthlyMap.get(mKey)!;
        m.sales += ro.sellingAmount;
        m.profit += ro.resellerProfit;
        m.orders += 1;
      }

      // Track item sales
      if (ro.order?.items) {
        for (const item of ro.order.items) {
          const pName = item.variant?.product?.name || 'Product';
          const pId = item.variant?.productId || item.id;
          const current = productSalesMap.get(pId) || {
            id: pId,
            name: pName,
            price: item.price,
            profit: 0,
            salesCount: 0,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
          };
          current.salesCount += item.quantity;
          current.profit += (ro.resellerProfit / Math.max(1, ro.order.items.length));
          productSalesMap.set(pId, current);
        }
      }
    }

    // Fetch recent withdrawal requests
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId, role: 'RESELLER' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const pendingPayoutAmount = withdrawals
      .filter(w => w.status === 'PENDING' || w.status === 'PROCESSING')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0);

    // Reseller product catalog count
    const catalogCount = await prisma.resellerProduct.count({
      where: { resellerId: userId, isActive: true }
    });

    // Recent 8 orders formatted
    const recentOrders = resellerOrders.slice(0, 8).map(ro => ({
      id: ro.orderId,
      resellerOrderId: ro.id,
      customerName: ro.customerName,
      customerPhone: ro.customerPhone,
      address: ro.shippingAddress,
      baseAmount: ro.baseAmount,
      sellingAmount: ro.sellingAmount,
      profit: ro.resellerProfit,
      status: ro.status,
      date: ro.createdAt.toISOString()
    }));

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalOrders: resellerOrders.length,
        totalProfit,
        pendingProfit,
        availableBalance: user?.walletBalance || 0,
        pendingPayout: pendingPayoutAmount,
        totalWithdrawn,
        catalogCount,
        counts: {
          pending: pendingOrdersCount,
          inTransit: inTransitOrdersCount,
          delivered: deliveredOrdersCount,
          cancelled: cancelledOrdersCount,
          returned: returnedOrdersCount
        }
      },
      monthlyTrends: Array.from(monthlyMap.values()),
      recentOrders,
      topProducts,
      profile: user?.resellerProfile || null
    });
  } catch (err: any) {
    console.error('Reseller Dashboard API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
