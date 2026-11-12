'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, Product } from '@/store/useStore';
import { translations } from '@/utils/translations';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Star,
  Package,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Lock
} from 'lucide-react';

export default function WishlistPage() {
  const {
    wishlist,
    wishlistProducts,
    fetchWishlist,
    toggleWishlist,
    addToCart,
    isLoggedIn,
    language
  } = useStore();

  const t = translations[language];
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (isLoggedIn) {
        await fetchWishlist();
      }
      setIsLoading(false);
    };
    load();
  }, [isLoggedIn]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    await toggleWishlist(productId);
    setRemovingId(null);
  };
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  // --- Not logged in ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-9 h-9 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            {language === 'en' ? 'Sign in to view your wishlist' : 'আপনার উইশলিস্ট দেখতে সাইন ইন করুন'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {language === 'en'
              ? 'Save your favourite products and access them anytime across all your devices.'
              : 'আপনার পছন্দের পণ্য সংরক্ষণ করুন এবং যেকোনো সময় যেকোনো ডিভাইস থেকে দেখুন।'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {language === 'en' ? 'Go to Homepage' : 'হোমপেইজে যান'}
          </Link>
        </div>
      </div>
    );
  }

  // --- Loading skeleton ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-9 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Empty state ---
  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="relative mx-auto mb-6 w-28 h-28">
            <div className="w-28 h-28 bg-pink-50 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-gray-900" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">
            {language === 'en' ? 'Your wishlist is empty' : 'আপনার উইশলিস্ট খালি'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {language === 'en'
              ? 'Tap the ★ on any product to save it here. Your wishlist is synced across all your devices.'
              : 'যেকোনো পণ্যে ★ আইকনে ট্যাপ করুন এবং এখানে সংরক্ষণ করুন।'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            {language === 'en' ? 'Browse Products' : 'পণ্য দেখুন'}
          </Link>
        </div>
      </div>
    );
  }

  // --- Wishlist grid ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500 fill-current" />
                {language === 'en' ? 'My Wishlist' : 'আমার উইশলিস্ট'}
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                {wishlistProducts.length} {language === 'en' ? 'saved items' : 'টি সংরক্ষিত পণ্য'}
              </p>
            </div>
          </div>
          {wishlistProducts.length > 0 && (
            <button
              onClick={() => wishlistProducts.forEach(p => handleAddToCart(p))}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {language === 'en' ? 'Add All to Cart' : 'সব কার্টে যোগ করুন'}
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => {
            const isRemoving = removingId === product.id;
            const isAdded = addedIds.has(product.id);
            const bdtPrice = (product.price * 80).toFixed(0);

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group ${
                  isRemoving ? 'opacity-40 scale-95 pointer-events-none' : ''
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Remove from wishlist */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    disabled={!!removingId}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm border border-red-100 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 transition-all duration-200 group/remove"
                    title={language === 'en' ? 'Remove from wishlist' : 'উইশলিস্ট থেকে সরান'}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover/remove:text-red-600 transition-colors" />
                  </button>

                  {/* Stock badge */}
                  {product.stock <= 5 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {language === 'en' ? `Only ${product.stock} left` : `মাত্র ${product.stock} টি`}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Category & Vendor */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">
                      {language === 'en' ? product.category :
                        product.category === 'Electronics' ? 'ইলেকট্রনিক্স' :
                        product.category === 'Home & Kitchen' ? 'হোম ও কিচেন' :
                        product.category === 'Apparel' ? 'পোশাক' : product.category}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-[10px] font-bold text-gray-500">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Product Name */}
                  <Link
                    href={`/product/${product.id}`}
                    className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug hover:text-yellow-600 transition-colors mb-1 flex-grow"
                  >
                    {product.name}
                  </Link>

                  {/* Vendor */}
                  <p className="text-[11px] text-gray-400 font-medium mb-3 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {product.vendor}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-black text-gray-900">৳{bdtPrice}</span>
                    <span className="text-xs text-gray-400 line-through font-medium">
                      ৳{(product.price * 80 * 1.2).toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">-20%</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 ${
                        isAdded
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {isAdded
                        ? (language === 'en' ? '✓ Added!' : '✓ যোগ হয়েছে!')
                        : (language === 'en' ? 'Add to Cart' : 'কার্টে যোগ করুন')}
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200"
                      title={language === 'en' ? 'View Product' : 'পণ্য দেখুন'}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-gray-900">
              {wishlistProducts.length} {language === 'en' ? 'items saved' : 'টি পণ্য সংরক্ষিত'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {language === 'en'
                ? 'Total value: '
                : 'মোট মূল্য: '}
              <span className="font-bold text-gray-700">
                ৳{wishlistProducts.reduce((sum, p) => sum + p.price * 80, 0).toFixed(0)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
            >
              {language === 'en' ? 'Continue Shopping' : 'কেনাকাটা চালিয়ে যান'}
            </Link>
            <button
              onClick={() => wishlistProducts.forEach(p => handleAddToCart(p))}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {language === 'en' ? 'Add All to Cart' : 'সব কার্টে যোগ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
