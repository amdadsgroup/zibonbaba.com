'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  DollarSign,
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react';
import { PaymentItem } from '../types';

interface PaymentModuleProps {
  payments?: PaymentItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function PaymentModule({
  payments = [],
  isLoading = false,
  onRefresh
}: PaymentModuleProps) {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const defaultPayments: PaymentItem[] = [
    {
      id: 'pay-1',
      transactionId: 'TRX-SSL-847291-9842',
      orderId: 'ord-847291',
      customerName: 'Fahim Shakil',
      vendorName: 'Tech Baba Electronics',
      amount: 4200,
      method: 'SSLCOMMERZ',
      status: 'PAID',
      date: '2026-11-13 14:20'
    },
    {
      id: 'pay-2',
      transactionId: 'TRX-BKS-847292-1204',
      orderId: 'ord-847292',
      customerName: 'Sadia Rahman',
      vendorName: 'Glamour Baba Beauty',
      amount: 1900,
      method: 'BKASH',
      status: 'PAID',
      date: '2026-11-13 13:45'
    },
    {
      id: 'pay-3',
      transactionId: 'TRX-COD-847293-4412',
      orderId: 'ord-847293',
      customerName: 'Mohammad Ali',
      vendorName: 'Kitchen Baba Hub',
      amount: 3800,
      method: 'COD',
      status: 'PENDING',
      date: '2026-11-13 12:10'
    },
    {
      id: 'pay-4',
      transactionId: 'TRX-SSL-847294-8831',
      orderId: 'ord-847294',
      customerName: 'Tanjila Akter',
      vendorName: 'Organic Baba Farm Fresh',
      amount: 680,
      method: 'SSLCOMMERZ',
      status: 'PAID',
      date: '2026-11-13 11:30'
    },
    {
      id: 'pay-5',
      transactionId: 'TRX-BKS-847295-9921',
      orderId: 'ord-847295',
      customerName: 'Zubair Hossain',
      vendorName: 'Tech Baba Electronics',
      amount: 3450,
      method: 'BKASH',
      status: 'FAILED',
      date: '2026-11-13 09:15'
    }
  ];

  const list = payments.length > 0 ? payments : defaultPayments;

  const filtered = list.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase());

    const matchesMethod =
      methodFilter === 'ALL' || p.method === methodFilter;

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Transaction ID', 'Order ID', 'Customer', 'Vendor', 'Amount (BDT)', 'Method', 'Status', 'Date'];
    const rows = filtered.map(p => [p.transactionId, p.orderId, p.customerName, p.vendorName, p.amount, p.method, p.status, p.date]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zibonbaba_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusPills: Record<string, { label: string; color: string }> = {
    PAID: { label: 'Settled / Paid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending Verification', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    FAILED: { label: 'Failed Transaction', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    REFUNDED: { label: 'Refunded to Buyer', color: 'bg-neutral-100 text-neutral-600 border-neutral-300' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Payment & Gateway Transactions
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Audit gateway logs across Cash on Delivery, SSLCommerz, bKash, and mobile banking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID, customer, order reference..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Methods</option>
            <option value="COD">Cash on Delivery</option>
            <option value="SSLCOMMERZ">SSLCommerz (Cards/MFS)</option>
            <option value="BKASH">bKash Direct</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid / Settled</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Vendor</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => {
                const pill = statusPills[p.status] || { label: p.status, color: 'bg-neutral-100 text-neutral-600' };

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-700">
                      #{p.orderId.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      {p.customerName}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {p.vendorName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-neutral-900">
                      ৳{p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pill.color}`}>
                        {pill.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-400 font-mono">
                      {p.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

