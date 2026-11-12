'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Store, ShieldCheck, Star, ShoppingCart, Check, Package, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useStore, Product } from '@/store/useStore';

export default function PublicStorePage() {
  const params = useParams();
  const storeId = params?.id as string;

  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useStore();
  const [addedMap, setAddedMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    fetch(`/api/store/${storeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.store) {
          setStoreData(data.store);
          setProducts(data.products || []);
        } else {
          setError(data.error || 'Store not found.');
        }
      })
      .catch(() => {
        setError('Failed to load store profile.');
      })
      .finally(() => setLoading(false));
  }, [storeId]);

  const handleAddToCart = (product: Product) => {
    try {
      addToCart(product, 1);
      setAddedMap(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedMap(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Seller Storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md text-center space-y-4">
          <Store className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-black text-white">Store Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'This seller store does not exist or has been suspended.'}</p>
          <Link href="/" className="inline-block bg-primary text-gray-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-glow">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 antialiased">
      {/* Store Banner & Header */}
      <div className="relative bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-950 border-b border-white/10 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-bold">
            <ArrowLeft size={14} /> Back to Main Marketplace
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 to-amber-500/10 border border-primary/30 flex items-center justify-center text-primary shadow-glow shrink-0">
                <Store size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{storeData.name}</h1>
                  {storeData.isApproved && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                      <ShieldCheck size={12} /> VERIFIED SELLER
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {storeData.description || 'Official merchant partner on Zibonbaba Multi-Vendor Marketplace.'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1 text-yellow-400 font-bold">
                    <Star size={13} fill="#facc15" /> 4.9 (120+ Reviews)
                  </span>
                  <span>•</span>
                  <span>Owner: <strong className="text-white">{storeData.ownerName}</strong></span>
                  <span>•</span>
                  <span>{products.length} Listed Items</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/seller/login"
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Seller Center
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Catalog */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Store Products Catalog ({products.length})
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No products currently listed</h3>
            <p className="text-xs text-slate-400">This seller has not published products to their storefront yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-all group flex flex-col justify-between shadow-card"
              >
                <div className="p-4 space-y-3">
                  <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 bg-gray-950/80 backdrop-blur-md text-[9px] font-black px-2 py-0.5 rounded text-primary">
                      {product.sku}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase">{product.category}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 mt-0.5">{product.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{product.description}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="text-base font-black text-white">৳{product.price.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      addedMap[product.id]
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-glow'
                        : 'bg-primary hover:bg-primary-accent text-gray-950 font-black shadow-glow'
                    }`}
                  >
                    {addedMap[product.id] ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
