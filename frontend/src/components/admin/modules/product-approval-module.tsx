'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Store,
  DollarSign,
  Package,
  Calendar,
  X,
  Check,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ProductItem } from '../types';

interface ProductApprovalModuleProps {
  pendingProducts: ProductItem[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export default function ProductApprovalModule({
  pendingProducts,
  isLoading,
  onApprove,
  onReject,
  onRefresh
}: ProductApprovalModuleProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenReject = (id: string) => {
    setTargetId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!targetId || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(targetId, rejectReason);
      setRejectModalOpen(false);
      setTargetId(null);
      if (selectedProduct?.id === targetId) setSelectedProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmApprove = async (id: string) => {
    setIsSubmitting(true);
    try {
      await onApprove(id);
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-neutral-900 tracking-tight">
              Product Moderation & Approval Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {pendingProducts.length} Pending Review
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Evaluate vendor listing submissions for quality control, copyright compliance, and accurate pricing.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          Refresh Queue
        </button>
      </div>

      {/* Queue Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-400">
          Loading submission queue...
        </div>
      ) : pendingProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Queue is Clear!</h3>
          <p className="text-xs text-neutral-500 mt-1">
            All submitted vendor products have been evaluated and moderated.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative h-44 bg-neutral-100 overflow-hidden group">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-neutral-800 shadow-2xs border border-white/60">
                    {p.categoryName}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-500 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    Pending
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{p.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span>SKU: {p.sku}</span>
                      <span>•</span>
                      <span>{p.vendorName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Price</span>
                      <span className="font-black text-neutral-900">৳{p.price.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Declared Stock</span>
                      <span className="font-bold text-neutral-700">{p.stock} units</span>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-neutral-100 mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleOpenReject(p.id)}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200 flex items-center gap-1"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleConfirmApprove(p.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Check size={14} />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert size={24} />
              <h3 className="font-black text-base text-neutral-900">
                Reject Listing Submission
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mb-4 font-medium">
              You must provide a constructive reason for rejecting this product. The vendor will be instructed to revise and re-submit.
            </p>

            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unclear product image, inaccurate pricing, or missing warranty specifications..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-rose-400 text-neutral-800 font-medium placeholder:text-neutral-400 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || isSubmitting}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

