'use client';

import React, { useState } from 'react';
import {
  Store,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  Shield,
  X,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Download,
  AlertOctagon
} from 'lucide-react';
import { VendorItem } from '../types';

interface VendorModuleProps {
  vendors: VendorItem[];
  isLoading: boolean;
  onApproveVendor: (id: string) => Promise<void>;
  onRejectVendor: (id: string, reason: string) => Promise<void>;
  onSuspendVendor: (id: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export default function VendorModule({
  vendors,
  isLoading,
  onApproveVendor,
  onRejectVendor,
  onSuspendVendor,
  onRefresh
}: VendorModuleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetVendorId, setTargetVendorId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter vendors
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      !search.trim() ||
      v.storeName.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && v.isApproved) ||
      (statusFilter === 'PENDING' && !v.isApproved);

    return matchesSearch && matchesStatus;
  });

  const handleOpenReject = (id: string) => {
    setTargetVendorId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetVendorId || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onRejectVendor(targetVendorId, rejectReason);
      setRejectModalOpen(false);
      setTargetVendorId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusPills: Record<string, { label: string; color: string }> = {
    APPROVED: { label: 'Verified & Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PENDING: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    SUSPENDED: { label: 'Suspended', color: 'bg-neutral-100 text-neutral-600 border-neutral-300' }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Vendor & Store Management
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Audit seller registrations, KYC documentation, commissions, and merchant status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
          >
            Refresh Records
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, owner, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 transition-colors font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-600 shrink-0">
          {[
            { id: 'ALL', label: 'All Stores' },
            { id: 'APPROVED', label: 'Approved & Active' },
            { id: 'PENDING', label: 'Pending KYC' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Store / Brand</th>
                <th className="py-3.5 px-4 font-semibold">Owner & Contact</th>
                <th className="py-3.5 px-4 font-semibold text-center">Catalog</th>
                <th className="py-3.5 px-4 font-semibold text-right">Gross Sales</th>
                <th className="py-3.5 px-4 font-semibold text-center">Commission</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    Loading vendor database...
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    No vendors found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const statusKey = v.isApproved ? 'APPROVED' : 'PENDING';
                  const pill = statusPills[statusKey];

                  return (
                    <tr key={v.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Store */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 shrink-0">
                            {v.storeName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>{v.storeName}</span>
                              {v.rating > 0 && (
                                <span className="text-[10px] text-amber-600 font-bold">
                                  ★ {v.rating}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              ID: {v.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800">{v.ownerName}</div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                          <span>{v.email}</span>
                          <span>•</span>
                          <span>{v.phone || 'No phone'}</span>
                        </div>
                      </td>

                      {/* Catalog */}
                      <td className="py-3 px-4 text-center font-bold text-neutral-800">
                        {v.productsCount} items
                      </td>

                      {/* Gross Sales */}
                      <td className="py-3 px-4 text-right font-black text-neutral-900">
                        ৳{v.revenue.toLocaleString()}
                      </td>

                      {/* Commission */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {v.commissionRate}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${pill.color}`}>
                          {pill.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedVendor(v)}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="View Complete Vendor Profile"
                          >
                            <Eye size={15} />
                          </button>

                          {!v.isApproved ? (
                            <>
                              <button
                                onClick={() => onApproveVendor(v.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenReject(v.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors border border-rose-200"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenReject(v.id)}
                              className="px-2 py-1 rounded-lg text-neutral-500 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            >
                              Suspend
                            </button>
                          )}
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

      {/* Vendor Detail Slide-Over Drawer */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-[#FFC107] font-black flex items-center justify-center text-base">
                    {selectedVendor.storeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-900 text-base">{selectedVendor.storeName}</h3>
                    <p className="text-xs text-neutral-400 font-mono">Store ID: {selectedVendor.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVendor(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6">
                {/* Financial Overview Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Gross Sales</span>
                    <div className="text-base font-black text-neutral-900 mt-1">
                      ৳{selectedVendor.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Products</span>
                    <div className="text-base font-black text-neutral-900 mt-1">
                      {selectedVendor.productsCount}
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase">Commission</span>
                    <div className="text-base font-black text-amber-700 mt-1">
                      {selectedVendor.commissionRate}%
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    Merchant Profile
                  </h4>
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Owner Full Name</span>
                      <span className="font-bold text-neutral-800">{selectedVendor.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Official Email</span>
                      <span className="font-bold text-neutral-800">{selectedVendor.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Phone Number</span>
                      <span className="font-bold text-neutral-800">{selectedVendor.phone || '01700-000000'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Store Registered</span>
                      <span className="font-mono text-neutral-600">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance & KYC Documents */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    KYC & Compliance Documents
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Trade License (Government Validated)', status: 'VERIFIED', icon: FileText },
                      { name: 'National ID Card (NID) Scan', status: 'VERIFIED', icon: Shield },
                      { name: 'Bank Account & Cheque Leaf', status: 'ACTIVE', icon: DollarSign }
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                        <div className="flex items-center gap-2.5">
                          <doc.icon size={16} className="text-amber-600" />
                          <span className="font-semibold text-neutral-800">{doc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedVendor(null)}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {!selectedVendor.isApproved ? (
                  <button
                    onClick={async () => {
                      await onApproveVendor(selectedVendor.id);
                      setSelectedVendor(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Authorize & Approve
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const id = selectedVendor.id;
                      setSelectedVendor(null);
                      handleOpenReject(id);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    Suspend Merchant
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject / Suspend Reason Required Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="font-black text-base text-neutral-900">
                Action Reason Required
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mb-4 font-medium">
              Please specify the reason for rejecting or suspending this vendor. This explanation will be dispatched to the merchant.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete trade license document or regulatory mismatch..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-rose-400 text-neutral-800 font-medium placeholder:text-neutral-400 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                disabled={!rejectReason.trim() || isSubmitting}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

