'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { ChevronRight, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';

export default function MobileCategoryPage() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    setMobileTab,
  } = useStore();

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden h-[calc(100vh-120px)] animate-slide-up md:hidden">
      {/* Top Bar: Horizontal Category Tabs */}
      <div className="border-b border-neutral-light bg-neutral-light/50 overflow-x-auto flex flex-row scrollbar-none py-2.5 px-3 shrink-0 gap-2 items-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 text-[10px] font-black text-center rounded-full border transition-all select-none whitespace-nowrap active:scale-95 leading-tight ${
                isActive
                  ? 'bg-primary border-primary text-neutral-dark font-black shadow-sm'
                  : 'bg-white border-neutral-light/80 text-neutral-muted'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Area: Category Showcase */}
      <div className="flex-grow overflow-y-auto p-4 h-full">
        <div className="flex items-center justify-between border-b border-neutral-light pb-2 mb-4">
          <div>
            <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider">{selectedCategory}</h2>
            <p className="text-[9px] text-neutral-muted">{filteredProducts.length} items available</p>
          </div>
          <span className="text-[9px] font-bold bg-primary/20 text-neutral-dark px-2 py-0.5 rounded-full">
            {selectedCategory === 'All' ? 'All categories' : 'Warehouse Direct'}
          </span>
        </div>

        {/* Promo banner inside category */}
        <div className="relative rounded-lg overflow-hidden h-20 bg-neutral-dark mb-4 shadow-sm border border-black/5">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&auto=format&fit=crop&q=60" 
            alt="promo" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-y-0 left-3.5 z-20 flex flex-col justify-center text-white">
            <span className="text-[7px] font-black uppercase text-primary tracking-widest">Flash Promotion</span>
            <p className="text-[10px] font-black leading-tight">Up to 25% Off SKU Direct</p>
          </div>
        </div>

        {/* Products list inside active category */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-neutral-light/50 border border-neutral-light rounded-md">
            <Layers className="w-8 h-8 text-neutral-muted mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-dark">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-8">
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="bg-neutral-light/45 border border-neutral-light rounded-lg p-2 flex flex-col justify-between hover:border-primary active:scale-95 transition-transform"
              >
                <div className="aspect-square rounded bg-white overflow-hidden border border-neutral-light/50 mb-2">
                  <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h4 className="text-[9px] font-extrabold text-neutral-dark line-clamp-1 leading-tight">{p.name}</h4>
                  <p className="text-[7px] text-neutral-muted truncate mt-0.5">{p.vendor}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-light/50">
                    <span className="text-xs font-black text-neutral-dark">৳{p.price.toFixed(2)}</span>
                    <span className="text-[8px] font-extrabold text-primary-dark">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
