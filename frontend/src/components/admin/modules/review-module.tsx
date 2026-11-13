'use client';

import React, { useState } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  EyeOff,
  Trash2,
  MessageSquare,
  X,
  AlertTriangle,
  User,
  Package,
  Store
} from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewModuleProps {
  reviews?: ReviewItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ReviewModule({
  reviews = [],
  isLoading = false,
  onRefresh
}: ReviewModuleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');

  const sampleReviews: ReviewItem[] = [
    {
      id: 'rev-1',
      customerName: 'Tanvir Hossain',
      productName: 'Zibonbaba Ultra Smartwatch Series 9',
      vendorName: 'Tech Baba Electronics',
      rating: 5,
      comment: 'Excellent battery backup and responsive AMOLED display! Fast delivery in Dhanmondi.',
      status: 'APPROVED',
      date: '2026-11-13 11:20'
    },
    {
      id: 'rev-2',
      customerName: 'Mariya Sultana',
      productName: 'Botanical Vitamin C Brightening Cream',
      vendorName: 'Glamour Baba Beauty',
      rating: 4,
      comment: 'Original product with authentic seal. Skin feels fresh, but packaging was slightly dented.',
      status: 'APPROVED',
      date: '2026-11-12 16:45'
    },
    {
      id: 'rev-3',
      customerName: 'Ashikur Rahman',
      productName: 'RGB Mechanical Gaming Keyboard',
      vendorName: 'Tech Baba Electronics',
      rating: 1,
      comment: 'Spacebar switch was sticky upon arrival. Requesting replacement.',
      status: 'PENDING',
      date: '2026-11-12 10:15'
    },
    {
      id: 'rev-4',
      customerName: 'Farhana Kabir',
      productName: 'Sundarban Raw Forest Honey 500g',
      vendorName: 'Organic Baba Farm Fresh',
      rating: 5,
      comment: '100% natural aroma and taste. Highly recommended!',
      status: 'APPROVED',
      date: '2026-11-11 18:30'
    }
  ];

  const list = reviews.length > 0 ? reviews : sampleReviews;

  const filtered = list.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Customer Review & Rating Moderation
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Monitor feedback across products and merchant storefronts to prevent spam and abuse.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors self-start sm:self-auto"
          >
            Refresh Reviews
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, product, or review keyword..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-bold text-neutral-600 shrink-0">
          {['ALL', 'APPROVED', 'PENDING', 'HIDDEN'].map((st) => (
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

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                    <span>{rev.customerName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{rev.date}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {rev.productName} • <span className="text-neutral-700 font-semibold">{rev.vendorName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < rev.rating ? 'text-amber-500' : 'text-neutral-200'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-700 font-medium my-3 italic">
                &ldquo;{rev.comment}&rdquo;
              </div>

              {rev.response && (
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 mb-3">
                  <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800">
                    Official Admin Response
                  </span>
                  {rev.response}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  rev.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : rev.status === 'PENDING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                {rev.status}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setReplyingReview(rev);
                    setReplyText(rev.response || '');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors flex items-center gap-1"
                >
                  <MessageSquare size={13} />
                  <span>Respond</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <h3 className="font-black text-sm text-neutral-900">
                Official Marketplace Response
              </h3>
              <button onClick={() => setReplyingReview(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-3 font-medium">
              Your response will be visibly appended to the customer&apos;s product review.
            </p>

            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. Thank you for your feedback! Our support team has dispatched a replacement..."
              className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 text-neutral-800 font-medium mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setReplyingReview(null)}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  replyingReview.response = replyText;
                  setReplyingReview(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 text-xs font-bold shadow-xs"
              >
                Post Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

