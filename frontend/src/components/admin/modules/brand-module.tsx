'use client';

import React, { useState } from 'react';
import { Tag, Plus, Search, Edit, Trash2, X, ExternalLink, Globe } from 'lucide-react';
import { BrandItem } from '../types';

interface BrandModuleProps {
  brands: BrandItem[];
  categories: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function BrandModule({
  brands,
  categories,
  isLoading,
  onRefresh
}: BrandModuleProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Electronics');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  const sampleBrands: BrandItem[] = [
    {
      id: 'b-1',
      name: 'Sony Bangladesh',
      slug: 'sony',
      logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format&fit=crop&q=80',
      description: 'Global electronics and entertainment technology brand.',
      categoryName: 'Electronics & Gadgets',
      productCount: 18,
      status: 'ACTIVE'
    },
    {
      id: 'b-2',
      name: 'Samsung Official',
      slug: 'samsung',
      logo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&auto=format&fit=crop&q=80',
      description: 'Smartphones, home appliances, and display hardware.',
      categoryName: 'Electronics & Gadgets',
      productCount: 24,
      status: 'ACTIVE'
    },
    {
      id: 'b-3',
      name: 'Aarong Handcrafts',
      slug: 'aarong',
      logo: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=100&auto=format&fit=crop&q=80',
      description: 'Traditional Bangladeshi apparel, fabrics, and artisan gifts.',
      categoryName: 'Apparel & Fashion',
      productCount: 12,
      status: 'ACTIVE'
    },
    {
      id: 'b-4',
      name: 'Walton Hi-Tech',
      slug: 'walton',
      logo: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=100&auto=format&fit=crop&q=80',
      description: 'Leading home and electrical appliances manufactured in Bangladesh.',
      categoryName: 'Home & Kitchen',
      productCount: 30,
      status: 'ACTIVE'
    }
  ];

  const displayList = brands.length > 0 ? brands : sampleBrands;

  const filtered = displayList.filter(
    (b) =>
      !search.trim() ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Brand Administration
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Manage authenticated marketplace brands, official logos, and catalog associations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingBrand(null);
              setName('');
              setDescription('');
              setWebsite('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Add Brand</span>
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by official name, category..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((brand) => (
          <div
            key={brand.id}
            className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-black text-neutral-800 text-base shrink-0 overflow-hidden">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                  ) : (
                    brand.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{brand.name}</h3>
                  <span className="text-[10px] font-semibold text-neutral-400 block">
                    {brand.categoryName}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                {brand.description}
              </p>

              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Products</span>
                <span className="font-mono font-bold text-neutral-800">{brand.productCount} SKUs</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Brand
              </span>
              <button
                onClick={() => {
                  setEditingBrand(brand);
                  setName(brand.name);
                  setDescription(brand.description);
                  setIsModalOpen(true);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <Edit size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-black text-base text-neutral-900">
                {editingBrand ? 'Edit Brand' : 'Register New Brand'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Brand Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Brand Story & Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official manufacturer warranty and profile..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 text-xs font-bold shadow-xs"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

