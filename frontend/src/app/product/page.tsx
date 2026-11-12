'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, SlidersHorizontal, ShoppingBag, Star, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ProductListingPage() {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    addToCart,
  } = useStore();

  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(500);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchPrice = p.price <= maxPrice;
    return matchSearch && matchCategory && matchPrice;
  });

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up">
      <div className="border-b border-neutral-light pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-dark">Marketplace Catalog</h1>
        <p className="text-xs text-neutral-muted mt-1">Explore all premium products, SKU models, and active vendor listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card h-fit space-y-6">
          <div>
            <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-3">Search Keywords</h3>
            <div className="flex items-center border border-neutral-light bg-neutral-light rounded p-2 text-xs">
              <Search className="w-4 h-4 text-neutral-muted mr-2" />
              <input
                type="text"
                placeholder="Product name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full outline-none text-neutral-dark"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-3">Categories</h3>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-xs py-1.5 px-3 rounded transition-colors font-semibold ${
                    selectedCategory === cat ? 'bg-primary text-neutral-dark font-bold' : 'hover:bg-neutral-light text-neutral-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-3">Price Cap (${maxPrice})</h3>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-neutral-muted mt-1 font-bold">
              <span>$0</span>
              <span>$500</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setMaxPrice(500);
            }}
            className="w-full border border-neutral-dark text-neutral-dark hover:bg-neutral-light text-xs font-bold py-2 rounded transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="bg-white text-center py-20 rounded-lg border border-neutral-light shadow-card">
              <p className="text-sm font-bold text-neutral-muted">No items matched your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-lg border border-neutral-light hover:border-primary hover:shadow-glow transition-all overflow-hidden flex flex-col justify-between"
                >
                  <Link href={`/product/${p.id}`} className="relative aspect-video bg-neutral-light overflow-hidden block group">
                    <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] text-neutral-muted font-bold uppercase">{p.category}</p>
                      <Link href={`/product/${p.id}`} className="hover:text-amber-600 transition-colors block">
                        <h3 className="text-xs font-bold text-neutral-dark mt-1 line-clamp-1">{p.name}</h3>
                      </Link>
                      <p className="text-[10px] text-neutral-muted mt-1 line-clamp-2">{p.description}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-light flex items-center justify-between">
                      <span className="text-sm font-extrabold text-neutral-dark">৳{p.price.toFixed(2)}</span>
                      <span className="text-[10px] text-success font-semibold">{p.stock} units left</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => {
                        addToCart(p);
                        alert(`${p.name} added to cart!`);
                      }}
                      className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
