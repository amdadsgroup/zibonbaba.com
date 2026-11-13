'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  KeyRound,
  UserX,
  UserCheck,
  Wallet,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CustomerItem } from '../types';

interface CustomerModuleProps {
  customers: CustomerItem[];
  isLoading: boolean;
  onToggleCustomerStatus: (id: string, currentStatus: string) => Promise<void>;
  onResetPassword: (id: string, email: string) => Promise<void>;
  onRefresh: () => void;
}

export default function CustomerModule({
  customers,
  isLoading,
  onToggleCustomerStatus,
  onResetPassword,
  onRefresh
}: CustomerModuleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [resetModalEmail, setResetModalEmail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleResetPassword = async (email: string, id: string) => {
    setIsProcessing(true);
    try {
      await onResetPassword(id, email);
      setResetModalEmail(email);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Customer Directory & Accounts
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Manage buyer profiles, transaction metrics, wallet balances, and authentication status.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          Refresh Customers
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email address, phone..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold text-neutral-600 shrink-0">
          {(['ALL', 'ACTIVE', 'DISABLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                statusFilter === st ? 'bg-white text-neutral-900 shadow-2xs' : 'hover:text-neutral-900'
              }`}
            >
              {st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                <th className="py-3.5 px-4 font-semibold text-center">Orders</th>
                <th className="py-3.5 px-4 font-semibold text-right">Lifetime Spent</th>
                <th className="py-3.5 px-4 font-semibold text-center">Wallet / Loyalty</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isActive = c.status === 'ACTIVE';

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-[#FFC107] font-black flex items-center justify-center text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{c.name}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              Joined {c.joinedDate || '2026'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-700">{c.email}</div>
                        <div className="text-[11px] text-neutral-400">{c.phone || 'No phone'}</div>
                      </td>

                      {/* Orders */}
                      <td className="py-3 px-4 text-center font-bold text-neutral-800">
                        {c.ordersCount}
                      </td>

                      {/* Lifetime Spent */}
                      <td className="py-3 px-4 text-right font-black text-neutral-900">
                        ৳{c.totalSpent.toLocaleString()}
                      </td>

                      {/* Wallet */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-[11px] font-bold text-neutral-800">
                          ৳{c.walletBalance || 0}
                        </div>
                        <div className="text-[10px] text-amber-600 font-semibold">
                          {c.loyaltyPoints || 0} pts
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="Inspect Customer Profile"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleResetPassword(c.email, c.id)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-neutral-400 hover:text-amber-700 transition-colors"
                            title="Dispatch Password Reset"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => onToggleCustomerStatus(c.id, c.status)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'hover:bg-rose-50 text-neutral-400 hover:text-rose-600'
                                : 'hover:bg-emerald-50 text-neutral-400 hover:text-emerald-600'
                            }`}
                            title={isActive ? 'Disable Customer' : 'Activate Customer'}
                          >
                            {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-[#FFC107] font-black flex items-center justify-center text-sm">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-900 text-base">{selectedCustomer.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono">User ID: {selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Lifetime Spent</span>
                    <div className="text-base font-black text-neutral-900 mt-1">
                      ৳{selectedCustomer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Orders</span>
                    <div className="text-base font-black text-neutral-900 mt-1">
                      {selectedCustomer.ordersCount}
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Wallet</span>
                    <div className="text-base font-black text-amber-700 mt-1">
                      ৳{selectedCustomer.walletBalance}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Email</span>
                    <span className="font-bold text-neutral-800">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Phone</span>
                    <span className="font-bold text-neutral-800">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Joined Date</span>
                    <span className="font-mono text-neutral-700">{selectedCustomer.joinedDate || '2026-01-15'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Default Delivery Address</span>
                    <span className="font-medium text-neutral-800 text-right truncate max-w-[200px]">
                      {selectedCustomer.address || 'Dhaka, Bangladesh'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Close Drawer
              </button>
              <button
                onClick={() => handleResetPassword(selectedCustomer.email, selectedCustomer.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-900 text-xs font-bold"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Dispatched Confirmation Toast/Modal */}
      {resetModalEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-black text-base text-neutral-900">Reset Email Dispatched</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-5">
              A secure password reset link was sent to <span className="font-bold text-neutral-800">{resetModalEmail}</span>.
            </p>
            <button
              onClick={() => setResetModalEmail(null)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-[#FFC107] font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

