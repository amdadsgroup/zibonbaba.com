'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  CreditCard,
  RefreshCcw,
  FileText,
  Send,
  Receipt,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '$482,900', icon: DollarSign, color: 'bg-green-50 text-green-600', trend: '+12.4%' },
  { label: 'Monthly Expenses', value: '$38,400', icon: TrendingDown, color: 'bg-red-50 text-red-600', trend: '+3.1%' },
  { label: 'Vendor Payouts', value: '$156,200', icon: CreditCard, color: 'bg-blue-50 text-blue-600', trend: '-2.0%' },
  { label: 'Pending Refunds', value: '$4,800', icon: RefreshCcw, color: 'bg-orange-50 text-orange-600', trend: '+8.5%' },
];

const revenueData = [
  { month: 'Feb', amount: 62000, max: 100000 },
  { month: 'Mar', amount: 74000, max: 100000 },
  { month: 'Apr', amount: 68000, max: 100000 },
  { month: 'May', amount: 85000, max: 100000 },
  { month: 'Jun', amount: 91000, max: 100000 },
  { month: 'Jul', amount: 102900, max: 110000 },
];

const vendors = [
  { name: 'TechWorld BD', sales: 48000, commission: 12, payout: 5760, status: 'Paid' },
  { name: 'FashionHub', sales: 32000, commission: 10, payout: 3200, status: 'Pending' },
  { name: 'HomeGoods Co.', sales: 27500, commission: 8, payout: 2200, status: 'Paid' },
  { name: 'SportZone BD', sales: 19000, commission: 11, payout: 2090, status: 'Pending' },
  { name: 'EcoNature Ltd.', sales: 15800, commission: 9, payout: 1422, status: 'Paid' },
];

const expenses = [
  { category: 'Logistics', pct: 40, color: 'bg-blue-500' },
  { category: 'Operations', pct: 30, color: 'bg-purple-500' },
  { category: 'Marketing', pct: 20, color: 'bg-yellow-400' },
  { category: 'Other', pct: 10, color: 'bg-gray-400' },
];

export default function AccountantDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredVendors = activeFilter === 'all'
    ? vendors
    : vendors.filter(v => v.status.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Control Center</h1>
          <p className="text-gray-500 mt-1">Financial overview for July 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
            <FileText size={16} /> Generate Report
          </button>
          <button className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-400 transition">
            <Send size={16} /> Process Payouts
          </button>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-700 transition">
            <Receipt size={16} /> Tax Summary
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${s.color}`}>
                <s.icon size={20} />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#FFC107]" /> Monthly Revenue (Last 6 Months)
          </h2>
          <div className="flex items-end justify-around gap-3 h-44">
            {revenueData.map((d) => {
              const heightPct = Math.round((d.amount / 110000) * 100);
              return (
                <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-gray-500 font-medium">৳{(d.amount / 1000).toFixed(0)}k</span>
                  <div className="w-full relative group" style={{ height: '140px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#FFC107] rounded-t-lg transition-all duration-500 group-hover:bg-yellow-400"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Expense Breakdown</h2>
          <div className="space-y-4">
            {expenses.map((e) => (
              <div key={e.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{e.category}</span>
                  <span className="text-gray-500 font-semibold">{e.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${e.color} rounded-full transition-all duration-700`}
                    style={{ width: `${e.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-xs text-yellow-700 font-semibold">Total Monthly Expenses</p>
            <p className="text-xl font-bold text-gray-800 mt-1">$38,400</p>
            <p className="text-xs text-gray-500 mt-0.5">July 2026</p>
          </div>
        </div>
      </div>

      {/* Vendor Payout Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Vendor Payout Summary</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['all', 'paid', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${activeFilter === f ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-gray-500 font-semibold">Vendor Name</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">Sales</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">Commission %</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">Payout Amount</th>
                <th className="text-center py-3 px-2 text-gray-500 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.name} className="border-b border-gray-50 hover:bg-yellow-50/40 transition">
                  <td className="py-3 px-2 font-medium text-gray-800">{v.name}</td>
                  <td className="py-3 px-2 text-right text-gray-700">৳{v.sales.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right text-gray-700">{v.commission}%</td>
                  <td className="py-3 px-2 text-right font-semibold text-gray-800">৳{v.payout.toLocaleString()}</td>
                  <td className="py-3 px-2 text-center">
                    {v.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVendors.length === 0 && (
            <p className="text-center text-gray-400 py-8">No records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
