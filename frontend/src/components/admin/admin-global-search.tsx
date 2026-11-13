'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Store, User, Package, ShoppingCart, ArrowRight, CornerDownLeft } from 'lucide-react';
import { AdminModule } from './types';

interface AdminGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: AdminModule) => void;
}

export default function AdminGlobalSearch({ isOpen, onClose, onNavigate }: AdminGlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    vendors: Array<{ id: string; title: string; subtitle: string; module: AdminModule }>;
    products: Array<{ id: string; title: string; subtitle: string; module: AdminModule }>;
    orders: Array<{ id: string; title: string; subtitle: string; module: AdminModule }>;
    customers: Array<{ id: string; title: string; subtitle: string; module: AdminModule }>;
  }>({
    vendors: [],
    products: [],
    orders: [],
    customers: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults({ vendors: [], products: [], orders: [], customers: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('zibonbaba_token');
        const headers = { Authorization: `Bearer ${token}` };

        // Search products & vendors
        const [prodRes, sellRes, orderRes] = await Promise.all([
          fetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=5`, { headers }).catch(() => null),
          fetch(`/api/admin/sellers?search=${encodeURIComponent(query)}`, { headers }).catch(() => null),
          fetch(`/api/admin/orders?search=${encodeURIComponent(query)}&limit=5`, { headers }).catch(() => null),
        ]);

        const prodData = prodRes ? await prodRes.json() : null;
        const sellData = sellRes ? await sellRes.json() : null;
        const orderData = orderRes ? await orderRes.json() : null;

        setResults({
          products: (prodData?.products || []).map((p: any) => ({
            id: p.id,
            title: p.name,
            subtitle: `${p.categoryName} • ৳${p.price} • ${p.vendorName}`,
            module: 'products' as AdminModule
          })),
          vendors: (sellData?.sellers || []).map((s: any) => ({
            id: s.id,
            title: s.name,
            subtitle: `${s.owner?.email || 'Vendor'} • ${s._count?.products || 0} products`,
            module: 'vendors' as AdminModule
          })),
          orders: (orderData?.orders || []).map((o: any) => ({
            id: o.id,
            title: `Order #${o.id.slice(0, 8).toUpperCase()}`,
            subtitle: `${o.customer?.email || 'Customer'} • ৳${o.total} • ${o.status}`,
            module: 'orders' as AdminModule
          })),
          customers: []
        });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const totalResults =
    results.vendors.length + results.products.length + results.orders.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 gap-3">
          <Search size={20} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across products, vendors, orders, customers (Ctrl+K)..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-400 text-neutral-800 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X size={16} />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3">
          {isLoading ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              Searching platform records...
            </div>
          ) : query && totalResults === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : !query ? (
            <div className="py-6 px-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Products & Moderation', module: 'products' as AdminModule, icon: Package },
                  { name: 'Vendors & Approval', module: 'vendors' as AdminModule, icon: Store },
                  { name: 'Orders Management', module: 'orders' as AdminModule, icon: ShoppingCart },
                  { name: 'Customer Directory', module: 'customers' as AdminModule, icon: User },
                ].map((item) => (
                  <button
                    key={item.module}
                    onClick={() => {
                      onNavigate(item.module);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all text-neutral-700 text-left font-medium"
                  >
                    <item.icon size={16} className="text-[#FFB800]" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Package size={12} /> Products ({results.products.length})
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('products');
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-800 group-hover:text-amber-600 transition-colors">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-neutral-500">{p.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.vendors.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <Store size={12} /> Vendors ({results.vendors.length})
                  </div>
                  <div className="space-y-1">
                    {results.vendors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          onNavigate('vendors');
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-800 group-hover:text-amber-600 transition-colors">
                            {v.title}
                          </div>
                          <div className="text-[11px] text-neutral-500">{v.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.orders.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <ShoppingCart size={12} /> Orders ({results.orders.length})
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          onNavigate('orders');
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-800 group-hover:text-amber-600 transition-colors">
                            {o.title}
                          </div>
                          <div className="text-[11px] text-neutral-500">{o.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Search records across all platform entities</span>
          <div className="flex items-center gap-1">
            <CornerDownLeft size={12} />
            <span>Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}

