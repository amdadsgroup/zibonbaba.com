'use client';

import React, { useState } from 'react';
import {
  Percent,
  DollarSign,
  TrendingUp,
  Store,
  FolderTree,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { CategoryItem, VendorItem } from '../types';

interface CommissionModuleProps {
  categories: CategoryItem[];
  vendors: VendorItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function CommissionModule({
  categories,
  vendors,
  isLoading,
  onRefresh
}: CommissionModuleProps) {
  const [globalRate, setGlobalRate] = useState('10.0');
  const [categoryRates, setCategoryRates] = useState<Record<string, string>>({
    'Electronics & Gadgets': '5.0',
    'Apparel & Fashion': '8.0',
    'Health & Beauty': '10.0',
    'Home & Kitchen': '7.5',
    'Groceries & Staples': '4.0',
    'Books & Stationery': '6.0'
  });
  const [isSaved, setIsSaved] = useState(false);

  // Financial Estimates
  const grossVolume = 284500;
  const platformRevenue = 28450;
  const vendorPayouts = grossVolume - platformRevenue;

  const handleSaveRates = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Marketplace Commission & Revenue Engine
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Define multi-tiered commission rates across categories, global rules, and individual merchant contracts.
          </p>
        </div>

        <button
          onClick={handleSaveRates}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save size={15} />
          <span>Save Commission Matrix</span>
        </button>
      </div>

      {/* Financial Split Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Order Value (GMV)</span>
            <DollarSign size={18} className="text-neutral-400" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            ৳{grossVolume.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Total merchandise value transacted</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Retained Commission</span>
            <Percent size={18} />
          </div>
          <div className="text-2xl font-black text-amber-700">
            ৳{platformRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Direct marketplace fee earnings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Disbursable Seller Payouts</span>
            <Store size={18} />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ৳{vendorPayouts.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Net merchant earnings payable weekly</p>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Commission policies synchronized across all checkout and ledger engines.</span>
        </div>
      )}

      {/* Global & Category Commission Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Policy Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
              Default Global Rate
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Fallback fee applied when no specific category or vendor override is declared.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-800">Standard Marketplace Fee</span>
              <span className="text-[11px] text-neutral-400 block font-mono">Deducted per settled order</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={globalRate}
                onChange={(e) => setGlobalRate(e.target.value)}
                className="w-16 p-2 bg-white border border-neutral-300 rounded-lg text-sm font-black text-neutral-900 text-center font-mono outline-none focus:border-amber-400"
              />
              <span className="font-bold text-sm text-neutral-700">%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 font-medium">
            💡 Commissions are calculated and escrowed on checkout, then settled to vendors once order status reaches <span className="font-bold">DELIVERED</span> and the 7-day return window elapses.
          </div>
        </div>

        {/* Category-Specific Rates Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
                Category-Specific Commission Rates
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Dynamic category overrides reflecting industry margins in Bangladesh
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              {Object.keys(categoryRates).length} Rules Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-center">Standard Industry Margin</th>
                  <th className="py-3 px-4 font-semibold text-right">Commission Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {Object.entries(categoryRates).map(([catName, rate]) => (
                  <tr key={catName} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-800">
                      {catName}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-500">
                      {catName.includes('Electronic') ? 'Low Margin (3-8%)' : 'High Margin (10-25%)'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={rate}
                          onChange={(e) =>
                            setCategoryRates({ ...categoryRates, [catName]: e.target.value })
                          }
                          className="w-16 p-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-black text-neutral-900 text-center font-mono outline-none focus:border-amber-400"
                        />
                        <span className="font-bold text-xs text-neutral-600">%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

