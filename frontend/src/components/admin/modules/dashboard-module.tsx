'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Package,
  Percent,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { KPIStats, OrderItem, VendorItem, AdminModule } from '../types';

interface DashboardModuleProps {
  stats: KPIStats | null;
  isLoading: boolean;
  recentOrders: OrderItem[];
  topVendors: VendorItem[];
  onNavigate: (module: AdminModule) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export default function DashboardModule({
  stats,
  isLoading,
  recentOrders,
  topVendors,
  onNavigate,
  onUpdateOrderStatus
}: DashboardModuleProps) {
  const [chartView, setChartView] = useState<'revenue' | 'orders' | 'commission'>('revenue');
  const [chartTimeframe, setChartTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Interactive Chart Mock Curve Points
  const chartData = [
    { label: 'Mon', revenue: 42000, orders: 38, commission: 4200 },
    { label: 'Tue', revenue: 58000, orders: 49, commission: 5800 },
    { label: 'Wed', revenue: 51000, orders: 44, commission: 5100 },
    { label: 'Thu', revenue: 79000, orders: 67, commission: 7900 },
    { label: 'Fri', revenue: 95000, orders: 82, commission: 9500 },
    { label: 'Sat', revenue: 112000, orders: 98, commission: 11200 },
    { label: 'Sun', revenue: 86000, orders: 74, commission: 8600 }
  ];

  const maxVal = Math.max(...chartData.map((d) => d[chartView]));

  const kpis = [
    {
      title: 'Total Revenue',
      value: `৳${(stats?.totalRevenue || 284500).toLocaleString()}`,
      growth: stats?.revenueGrowth || 14.8,
      period: 'vs previous period',
      icon: DollarSign,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200'
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 142).toLocaleString(),
      growth: stats?.ordersGrowth || 9.2,
      period: 'vs previous period',
      icon: ShoppingCart,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      title: 'Total Customers',
      value: (stats?.totalCustomers || 580).toLocaleString(),
      growth: stats?.newCustomers || 24,
      isCount: true,
      period: 'new this week',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Active Vendors',
      value: `${stats?.totalVendors || 10}`,
      growth: stats?.pendingVendors || 2,
      isCount: true,
      period: 'pending approvals',
      icon: Store,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200'
    },
    {
      title: 'Products Listed',
      value: (stats?.totalProducts || 10).toLocaleString(),
      growth: stats?.pendingProducts || 1,
      isCount: true,
      period: 'pending review',
      icon: Package,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    {
      title: 'Platform Commission',
      value: `৳${(stats?.platformCommission || 28450).toLocaleString()}`,
      growth: stats?.commissionGrowth || 12.4,
      period: 'vs previous period',
      icon: Percent,
      color: 'bg-[#FFC107]/20 text-neutral-900 border-amber-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isPositive = kpi.growth >= 0;

          if (isLoading) {
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 mb-3" />
                <div className="w-16 h-3 bg-neutral-100 rounded mb-2" />
                <div className="w-24 h-6 bg-neutral-200 rounded" />
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 truncate">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div className="text-xl font-black text-neutral-900 tracking-tight">{kpi.value}</div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-neutral-500">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {kpi.isCount ? `+${kpi.growth}` : `${kpi.growth}%`}
                  </span>
                  <span className="truncate">{kpi.period}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Interactive Revenue & Order Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interactive Chart */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                Financial & Volume Performance
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                Real-time marketplace revenue, volume, and commission trajectory
              </p>
            </div>

            {/* Metric Selector & Timeframe */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-bold text-neutral-600">
                {(['revenue', 'orders', 'commission'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartView(m)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                      chartView === m
                        ? 'bg-white text-neutral-900 shadow-2xs'
                        : 'hover:text-neutral-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Visualizer */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2 border-b border-neutral-100">
            {chartData.map((pt, i) => {
              const val = pt[chartView];
              const heightPercent = Math.max((val / maxVal) * 100, 10);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold px-2 py-1 bg-neutral-900 text-white rounded-md shadow-lg pointer-events-none whitespace-nowrap mb-1">
                    {chartView === 'orders' ? `${val} orders` : `৳${val.toLocaleString()}`}
                  </div>
                  {/* Bar Element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 group-hover:brightness-95 ${
                      chartView === 'revenue'
                        ? 'bg-[#FFC107]'
                        : chartView === 'commission'
                        ? 'bg-amber-600'
                        : 'bg-neutral-800'
                    }`}
                  />
                  {/* Label */}
                  <span className="text-[11px] font-bold text-neutral-500 pt-2">{pt.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-[#FFC107]" />
                <span>Gross Marketplace Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-600" />
                <span>Platform Commission (10%)</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Order Lifecycle Funnel */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                Order Lifecycle
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Active Funnel
              </span>
            </div>

            <div className="space-y-3">
              {[
                { status: 'Pending Review', count: 18, color: 'bg-amber-500', icon: Clock },
                { status: 'Confirmed & Paid', count: 42, color: 'bg-blue-600', icon: CheckCircle2 },
                { status: 'In Processing / Packed', count: 26, color: 'bg-indigo-600', icon: Package },
                { status: 'Out for Courier Delivery', count: 34, color: 'bg-purple-600', icon: Truck },
                { status: 'Delivered Successfully', count: 184, color: 'bg-emerald-600', icon: CheckCircle2 },
                { status: 'Cancelled / Returned', count: 6, color: 'bg-rose-500', icon: XCircle }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="font-semibold text-neutral-700">{item.status}</span>
                  </div>
                  <span className="font-black font-mono text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage All Orders</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Top Vendors & Recent Orders Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Vendors Leaderboard */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                Top Vendors
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">Ranked by gross sales volume</p>
            </div>
            <button
              onClick={() => onNavigate('vendors')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {(topVendors.length > 0 ? topVendors.slice(0, 5) : [
              { id: '1', storeName: 'Tech Baba Electronics', ownerName: 'Abir Hasan', revenue: 142000, productsCount: 4, rating: 4.8 },
              { id: '2', storeName: 'Glamour Baba Beauty', ownerName: 'Nusrat Jahan', revenue: 98000, productsCount: 2, rating: 4.9 },
              { id: '3', storeName: 'Kitchen Baba Hub', ownerName: 'Rafiqul Islam', revenue: 64000, productsCount: 1, rating: 4.7 },
              { id: '4', storeName: 'Fashion Baba Outfitters', ownerName: 'Tanvir Ahmed', revenue: 52000, productsCount: 1, rating: 4.6 },
              { id: '5', storeName: 'Organic Baba Farm Fresh', ownerName: 'Kamal Hossain', revenue: 38000, productsCount: 1, rating: 4.9 },
            ]).map((v, i) => (
              <div
                key={v.id || i}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/60 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 text-[#FFC107] font-black flex items-center justify-center text-xs shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{v.storeName}</div>
                    <div className="text-[11px] text-neutral-400">{v.ownerName} • {v.productsCount} items</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-neutral-900">৳{v.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">★ {v.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Stream */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wider">
                Recent Orders
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium">Live customer purchasing activity</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              Order Central <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Store</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(recentOrders.length > 0 ? recentOrders.slice(0, 6) : [
                  { id: 'ord-847291', customerName: 'Fahim Shakil', storeName: 'Tech Baba Electronics', total: 4200, status: 'CONFIRMED' },
                  { id: 'ord-847292', customerName: 'Sadia Rahman', storeName: 'Glamour Baba Beauty', total: 1900, status: 'PROCESSING' },
                  { id: 'ord-847293', customerName: 'Mohammad Ali', storeName: 'Kitchen Baba Hub', total: 3800, status: 'SHIPPED' },
                  { id: 'ord-847294', customerName: 'Tanjila Akter', storeName: 'Organic Baba Farm Fresh', total: 680, status: 'DELIVERED' },
                  { id: 'ord-847295', customerName: 'Zubair Hossain', storeName: 'Tech Baba Electronics', total: 3450, status: 'PENDING' },
                ]).map((o: any) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
                    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
                    PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
                    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200'
                  };

                  return (
                    <tr key={o.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 font-mono font-bold text-neutral-900">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 font-medium text-neutral-700">
                        {o.customerName || 'Customer'}
                      </td>
                      <td className="py-3 text-neutral-500">
                        {o.storeName}
                      </td>
                      <td className="py-3 text-right font-black text-neutral-900">
                        ৳{o.total.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[o.status] || 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onNavigate('orders')}
                          className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Inspect Order"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

