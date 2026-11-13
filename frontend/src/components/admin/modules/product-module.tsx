'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Store,
  DollarSign
} from 'lucide-react';
import { ProductItem } from '../types';

interface ProductModuleProps {
  products: ProductItem[];
  categories: string[];
  isLoading: boolean;
  onUpdateProduct: (id: string, data: Partial<ProductItem>) => Promise<void>;
  onCreateProduct: (data: any) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function ProductModule({
  products,
  categories,
  isLoading,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  onRefresh
}: ProductModuleProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdCategory, setNewProdCategory] = useState(categories[0] || 'Electronics');
  const [newProdDesc, setNewProdDesc] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      p.categoryName.toLowerCase() === categoryFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      await onUpdateProduct(editingProduct.id, {
        name: editingProduct.name,
        price: editingProduct.price,
        stock: editingProduct.stock,
        status: editingProduct.status
      });
      setEditingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku || !newProdPrice) return;
    setIsSubmitting(true);
    try {
      await onCreateProduct({
        name: newProdName,
        sku: newProdSku,
        price: newProdPrice,
        stock: newProdStock,
        category: newProdCategory,
        description: newProdDesc
      });
      setCreateModalOpen(false);
      setNewProdName('');
      setNewProdSku('');
      setNewProdPrice('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadges: Record<string, { label: string; color: string }> = {
    PUBLISHED: { label: 'Published', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    PENDING_APPROVAL: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    DRAFT: { label: 'Draft', color: 'bg-neutral-100 text-neutral-600 border-neutral-300' },
    REJECTED: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    SUSPENDED: { label: 'Suspended', color: 'bg-red-50 text-red-700 border-red-200' },
    OUT_OF_STOCK: { label: 'Out of Stock', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Product Catalog Management
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Monitor all marketplace listings, pricing, SKU inventories, and catalog status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU code, vendor..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:border-amber-400"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING_APPROVAL">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Product & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Vendor / Store</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold text-right">Unit Price</th>
                <th className="py-3.5 px-4 font-semibold text-center">In Stock</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    Loading catalog items...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-neutral-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const badge = statusBadges[p.status] || {
                    label: p.status,
                    color: 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  };

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0 bg-neutral-50"
                          />
                          <div>
                            <div className="font-bold text-neutral-900 line-clamp-1 max-w-xs">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              SKU: {p.sku}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-700">{p.vendorName}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-black text-neutral-900">
                        ৳{p.price.toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            p.stock > 10
                              ? 'text-neutral-800 bg-neutral-100'
                              : p.stock > 0
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {p.stock} pcs
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingProduct({ ...p })}
                            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-black text-base text-neutral-900">Modify Product Listing</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Product Title
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Price (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Publishing Status
                </label>
                <select
                  value={editingProduct.status}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      status: e.target.value as ProductItem['status']
                    })
                  }
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                >
                  <option value="PUBLISHED">Published & Live</option>
                  <option value="PENDING_APPROVAL">Pending Review</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 border-t border-neutral-100 mt-6">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-black text-base text-neutral-900">Add New Marketplace Product</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Product Name *
                </label>
                <input
                  required
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    SKU Code *
                  </label>
                  <input
                    required
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                    placeholder="e.g. ZIB-AUDIO-001"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Base Price (৳) *
                  </label>
                  <input
                    required
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                    Category
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
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
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-500 uppercase tracking-wider text-[10px] block mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detailed specs and warranty details..."
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-400 text-neutral-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

