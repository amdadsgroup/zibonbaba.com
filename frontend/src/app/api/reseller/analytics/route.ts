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
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30D'; // 7D | 30D | THIS_MONTH | ALL

    const now = new Date();
    let startDate = new Date();

    if (range === '7D') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === '30D') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'THIS_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }

    const orders = await prisma.resellerOrder.findMany({
      where: {
        resellerId: userId,
        createdAt: { gte: startDate }
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                variant: { include: { product: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Time-series grouping by day or month
    const timelineMap = new Map<string, { date: string; sales: number; profit: number; orders: number }>();

    let totalSales = 0;
    let totalProfit = 0;
    let deliveredSales = 0;
    let deliveredProfit = 0;

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      IN_TRANSIT: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      RETURNED: 0
    };

    const productSalesMap = new Map<string, { name: string; sales: number; profit: number; count: number }>();

    for (const ro of orders) {
      totalSales += ro.sellingAmount;
      totalProfit += ro.resellerProfit;

      if (ro.status === 'DELIVERED') {
        deliveredSales += ro.sellingAmount;
        deliveredProfit += ro.resellerProfit;
      }

      statusCounts[ro.status] = (statusCounts[ro.status] || 0) + 1;

      const dayKey = ro.createdAt.toISOString().split('T')[0];
      const entry = timelineMap.get(dayKey) || { date: dayKey, sales: 0, profit: 0, orders: 0 };
      entry.sales += ro.sellingAmount;
      entry.profit += ro.resellerProfit;
      entry.orders += 1;
      timelineMap.set(dayKey, entry);

      if (ro.order?.items) {
        for (const item of ro.order.items) {
          const pName = item.variant?.product?.name || 'Item';
          const pEntry = productSalesMap.get(pName) || { name: pName, sales: 0, profit: 0, count: 0 };
          pEntry.count += item.quantity;
          pEntry.sales += (item.price * item.quantity);
          pEntry.profit += (ro.resellerProfit / Math.max(1, ro.order.items.length));
          productSalesMap.set(pName, pEntry);
        }
      }
    }

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    const averageOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;
    const profitMarginPercent = totalSales > 0 ? Math.round((totalProfit / totalSales) * 100) : 0;

    return NextResponse.json({
      success: true,
      range,
      summary: {
        totalSales,
        totalProfit,
        deliveredSales,
        deliveredProfit,
        totalOrders: orders.length,
        averageOrderValue,
        profitMarginPercent
      },
      statusDistribution: statusCounts,
      timeline: Array.from(timelineMap.values()),
      topProducts: topSellingProducts
    });

  } catch (err: any) {
    console.error('Reseller Analytics API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
