'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Ticket,
  Zap,
  Image as ImageIcon,
  Plus,
  Search,
  Calendar,
  Percent,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { CampaignItem, CouponItem, BannerItem } from '../types';

interface MarketingModuleProps {
  categories: string[];
}

export default function MarketingModule({ categories }: MarketingModuleProps) {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'flash' | 'coupons' | 'banners'>('campaigns');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Sample marketing data
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: 'cmp-1',
      title: 'Boishakhi Mega Tech Sale',
      type: 'CAMPAIGN',
      discountType: 'PERCENT',
      discountValue: 15,
      startDate: '2026-11-10',
      endDate: '2026-11-20',
      targetCategory: 'Electronics & Gadgets',
      status: 'ACTIVE'
    },
    {
      id: 'cmp-2',
      title: 'Winter Beauty & Care Festival',
      type: 'CAMPAIGN',
      discountType: 'PERCENT',
      discountValue: 20,
      startDate: '2026-11-15',
      endDate: '2026-11-30',
      targetCategory: 'Health & Beauty',
      status: 'SCHEDULED'
    }
  ]);

  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      id: 'cpn-1',
      code: 'ZIBONBABA100',
      discountType: 'FLAT',
      discountValue: 100,
      minOrder: 1000,
      usageLimit: 500,
      usedCount: 142,
      expiryDate: '2026-12-31',
      status: 'ACTIVE'
    },
    {
      id: 'cpn-2',
      code: 'FIRSTORDER',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrder: 500,
      maxDiscount: 250,
      usageLimit: 1000,
      usedCount: 389,
      expiryDate: '2026-12-31',
      status: 'ACTIVE'
    }
  ]);

  const [banners, setBanners] = useState<BannerItem[]>([
    {
      id: 'ban-1',
      title: 'Top Consumer Tech Deals',
      desktopImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      ctaText: 'Shop Electronics',
      targetUrl: '/product?category=Electronics',
      sortOrder: 1,
      status: 'ACTIVE'
    },
    {
      id: 'ban-2',
      title: 'Organic Farm Fresh Deliveries',
      desktopImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
      ctaText: 'Explore Groceries',
      targetUrl: '/product?category=Groceries',
      sortOrder: 2,
      status: 'ACTIVE'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Marketing, Campaigns & Promotion Engine
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Drive buyer conversions through sitewide flash sales, coupon vouchers, and homepage carousel banners.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create New {activeTab.slice(0, -1)}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-2xl shadow-2xs w-fit">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
          { id: 'flash', label: 'Flash Sales', icon: Zap },
          { id: 'coupons', label: 'Discount Coupons', icon: Ticket },
          { id: 'banners', label: 'Homepage Banners', icon: ImageIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-neutral-900 text-[#FFC107] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((cmp) => (
            <div
              key={cmp.id}
              className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-sm text-neutral-900">{cmp.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      cmp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {cmp.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                  <Calendar size={13} className="text-neutral-400" />
                  <span>
                    {cmp.startDate} to {cmp.endDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">Discount</span>
                    <span className="font-black text-amber-700 text-sm">{cmp.discountValue}% OFF</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">Target Scope</span>
                    <span className="font-medium text-neutral-800">{cmp.targetCategory || 'Sitewide'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 mt-4 flex items-center justify-end gap-2">
                <button className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Flash Sales */}
      {activeTab === 'flash' && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
                Active 24-Hour Flash Sale Countdown
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Limited-time doorbuster deals featured in prime hero slots on the marketplace.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-mono font-bold text-xs border border-rose-200">
              <Clock size={14} />
              <span>Ends in 08h : 42m : 19s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Zibonbaba Ultra Smartwatch Series 9', regular: 4200, flash: 3290, quota: '45/50 claimed' },
              { name: 'RGB Mechanical Gaming Keyboard', regular: 3450, flash: 2690, quota: '28/30 claimed' },
              { name: 'Botanical Vitamin C Brightening Cream', regular: 950, flash: 750, quota: '82/100 claimed' }
            ].map((f, i) => (
              <div key={i} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                <div className="font-bold text-neutral-900 line-clamp-1">{f.name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-sm text-rose-600">৳{f.flash}</span>
                  <span className="line-through text-neutral-400 text-[11px]">৳{f.regular}</span>
                </div>
                <div className="text-[10px] font-bold text-neutral-500 font-mono bg-white p-1 rounded border border-neutral-200 text-center">
                  Quota: {f.quota}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Coupons */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Coupon Code</th>
                <th className="py-3 px-4 font-semibold">Discount</th>
                <th className="py-3 px-4 font-semibold text-center">Min Order</th>
                <th className="py-3 px-4 font-semibold text-center">Usage Progress</th>
                <th className="py-3 px-4 font-semibold text-center">Expiry</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.map((cpn) => (
                <tr key={cpn.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                    <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      {cpn.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-neutral-800">
                    {cpn.discountType === 'PERCENT' ? `${cpn.discountValue}%` : `৳${cpn.discountValue} Flat`}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-neutral-700">
                    ৳{cpn.minOrder}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-[11px] text-neutral-600">
                      {cpn.usedCount} / {cpn.usageLimit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-neutral-500">
                    {cpn.expiryDate}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cpn.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Banners */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((ban) => (
            <div
              key={ban.id}
              className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden"
            >
              <div className="h-40 bg-neutral-100 overflow-hidden relative">
                <img src={ban.desktopImage} alt={ban.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-neutral-900/80 text-[#FFC107] text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                  Slot #{ban.sortOrder}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">{ban.title}</h4>
                  <p className="text-[11px] text-neutral-400 font-mono">{ban.targetUrl}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ban.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

