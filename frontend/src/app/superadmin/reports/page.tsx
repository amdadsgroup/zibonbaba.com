'use client';

import React, { useState } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Users,
  ShoppingBag,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from 'lucide-react';

interface RevenueItem {
  module: string;
  transactions: number;
  grossVolume: string;
  commission: string;
  growth: string;
  positive: boolean;
}

const REVENUE_BREAKDOWN: RevenueItem[] = [
  { module: 'Multi-Vendor Retail Marketplace', transactions: 48920, grossVolume: '৳112,450,000', commission: '৳11,245,000', growth: '+18.4%', positive: true },
  { module: 'Enterprise SaaS ERP Subscriptions', transactions: 2340, grossVolume: '৳28,080,000', commission: '৳2,808,000', growth: '+24.1%', positive: true },
  { module: 'Barcode POS Hardware & Cloud Terminals', transactions: 1560, grossVolume: '৳15,600,000', commission: '৳1,560,000', growth: '+12.0%', positive: true },
  { module: 'Zibonbaba Express Logistics & Courier', transactions: 34100, grossVolume: '৳6,820,000', commission: '৳682,000', growth: '-3.2%', positive: false },
];

export default function ReportsAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Module Name,Transactions,Gross Volume,Platform Commission,Growth Rate\n' +
      REVENUE_BREAKDOWN.map(
        (r) => `"${r.module}",${r.transactions},"${r.grossVolume}","${r.commission}","${r.growth}"`
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zibonbaba_Financial_Report_${timeframe.toUpperCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Financial report for ${timeframe.toUpperCase()} downloaded successfully.`);
  };

  return (
    <SuperAdminLayout
      activeNav="reports"
      title="Platform Financial & System Reports"
      subtitle="Gross Revenue, Commission Breakdown, Merchant Settlement & Performance Analytics"
    >
      {toastMessage && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-white">✕</button>
        </div>
      )}

      {/* ── Top Bar Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-2xl">
          {(['today', 'week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                timeframe === t
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Download Button */}
        <button
          onClick={handleExportCsv}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Download size={16} /> Export Financial CSV
        </button>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Gross Merchandise Value (GMV)', value: '৳162.9M', trend: '+19.2%', positive: true, icon: TrendingUp },
          { label: 'Platform Net Commission', value: '৳16.29M', trend: '+21.5%', positive: true, icon: DollarSign },
          { label: 'SaaS Subscription Revenue', value: '৳3.48M', trend: '+14.0%', positive: true, icon: CreditCard },
          { label: 'Merchant Payouts Settled', value: '৳146.6M', trend: '+18.8%', positive: true, icon: ShoppingBag },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-400">
                <ArrowUpRight size={14} />
                <span>{stat.trend} vs previous {timeframe}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detailed Breakdown Table ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" /> Revenue Stream Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Financial contribution per business unit</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Business Module</th>
                <th className="py-3 px-4">Total Transactions</th>
                <th className="py-3 px-4">Gross Volume</th>
                <th className="py-3 px-4">Platform Commission</th>
                <th className="py-3 px-4">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {REVENUE_BREAKDOWN.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {row.module}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">{row.transactions.toLocaleString()} orders</td>
                  <td className="py-4 px-4 font-extrabold text-white">{row.grossVolume}</td>
                  <td className="py-4 px-4 font-extrabold text-amber-400">{row.commission}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-black ${row.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {row.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
