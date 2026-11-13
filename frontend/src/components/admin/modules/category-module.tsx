'use client';

import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Layers,
  Image as ImageIcon,
  Tag,
  Percent,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryModuleProps {
  categories: CategoryItem[];
  isLoading: boolean;
  onCreateCategory: (data: Partial<CategoryItem>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function CategoryModule({
  categories,
  isLoading,
  onCreateCategory,
  onDeleteCategory,
  onRefresh
}: CategoryModuleProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [commissionRate, setCommissionRate] = useState<string>('10.0');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setParentId('');
    setCommissionRate('10.0');
    setSeoTitle('');
    setSeoDesc('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        parentId: parentId || null,
        commissionRate: parseFloat(commissionRate) || 10.0,
        seoTitle,
        seoDescription: seoDesc
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = categories.filter((c) =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Category & Hierarchy Management
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Define multi-level category taxonomy, commission percentages, and SEO metadata.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name, slug code..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Category Cards / Tree Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            Loading taxonomy categories...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            No categories found matching your query.
          </div>
        ) : (
          filtered.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                      <FolderTree size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{cat.name}</h3>
                      <p className="text-[11px] text-neutral-400 font-mono">/{cat.slug}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-mono">
                    {cat.productCount} products
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 my-3">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">Commission</span>
                    <span className="font-bold text-amber-700">{cat.commissionRate || 10}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">Hierarchy</span>
                    <span className="font-medium text-neutral-700">{cat.parentName || 'Root Parent'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-black text-base text-neutral-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Category Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder="e.g. Consumer Electronics"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="e.g. consumer-electronics"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  >
                    <option value="">None (Top-Level Parent)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="10.0"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Buy Electronics Online in Bangladesh | Zibonbaba"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  placeholder="Browse high-grade consumer electronics with fast home delivery across 64 districts..."
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

