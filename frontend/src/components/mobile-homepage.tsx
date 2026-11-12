'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product } from '@/store/useStore';
import {
  Percent,
  Star,
  ShoppingBag,
  Flame,
  Clock,
  Heart,
  ChevronRight,
  Store,
  SlidersHorizontal,
  Package,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  Truck,
  Users,
  CheckCircle,
  Gift,
  Tag,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { translations } from '@/utils/translations';

export default function MobileHomepage() {
  const {
    products,
    categories,
    setSelectedCategory,
    setMobileTab,
    wishlist,
    toggleWishlist,
    addToCart,
    language
  } = useStore();

  const t = translations[language];

  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60',
      title: 'Just For You',
      desc: 'Get flat 30% off on premium catalog',
      linkText: 'Shop Apparel',
      cat: 'Apparel'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=60',
      title: 'Radiant Skin Special',
      desc: 'Up to 20% off on verified skincare',
      linkText: 'Explore Beauty',
      cat: 'Home & Kitchen'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=60',
      title: 'Trending Outfits',
      desc: 'Exclusive new catalog designs active now',
      linkText: 'Discover Now',
      cat: 'Apparel'
    }
  ];

  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 14, sec: 45 });
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [activeHomeTab, setActiveHomeTab] = useState<'trending' | 'new-arrivals'>('trending');

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    const savedRecentIds = localStorage.getItem('zibonbaba-recent');
    if (savedRecentIds) {
      try {
        const ids: string[] = JSON.parse(savedRecentIds);
        const filtered = ids
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentlyViewed(filtered.slice(0, 5));
      } catch (err) {
        console.error('Failed to parse recently viewed', err);
      }
    } else {
      setRecentlyViewed(products.slice(0, 2));
    }

    return () => {
      clearInterval(slideInterval);
      clearInterval(timer);
    };
  }, [products]);

  const formatNum = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 pb-24 overflow-x-hidden animate-slide-up">
      
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full h-[220px] bg-slate-900 overflow-hidden">
        {slides.map((slide, idx) => {
          const displayTitle = language === 'en' ? slide.title :
            slide.title === 'Just For You' ? 'শুধু আপনার জন্য' :
            slide.title === 'Radiant Skin Special' ? 'উজ্জ্বল ত্বকের বিশেষ অফার' :
            slide.title === 'Trending Outfits' ? 'ট্রেন্ডিং পোশাক কালেকশন' : slide.title;

          const displayDesc = language === 'en' ? slide.desc :
            slide.desc === 'Get flat 30% off on premium catalog' ? 'প্রিমিয়াম ক্যাটালগে ফ্ল্যাট ৩০% ছাড়' :
            slide.desc === 'Up to 20% off on verified skincare' ? 'যাচাইকৃত স্কিনকেয়ারে ২০% পর্যন্ত ছাড়' :
            slide.desc === 'Exclusive new catalog designs active now' ? 'এক্সক্লুসিভ নতুন ক্যাটালগ ডিজাইন সক্রিয়' : slide.desc;

          const displayLinkText = language === 'en' ? slide.linkText :
            slide.linkText === 'Shop Apparel' ? 'পোশাক কিনুন' :
            slide.linkText === 'Explore Beauty' ? 'সৌন্দর্য পণ্য দেখুন' :
            slide.linkText === 'Discover Now' ? 'আবিষ্কার করুন' : slide.linkText;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === activeSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10"></div>
              <img src={slide.image} alt={displayTitle} decoding="async" className="w-full h-full object-cover" />
              
              <div className="absolute inset-x-5 inset-y-0 z-20 flex flex-col justify-center text-white">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-1 rounded-full w-fit mb-2 shadow-sm tracking-wider">
                  {language === 'en' ? 'Special Campaign' : 'বিশেষ ক্যাম্পেইন'}
                </span>
                <h2 className="text-xl font-black leading-tight drop-shadow-md">{displayTitle}</h2>
                <p className="text-[11px] text-slate-200 mt-1 line-clamp-1 leading-tight">{displayDesc}</p>
                <button
                  onClick={() => {
                    setSelectedCategory(slide.cat);
                    setMobileTab('categories');
                  }}
                  className="bg-[#FFC107] hover:bg-amber-600 text-slate-950 text-[10px] font-black px-4 py-2 rounded-xl w-fit mt-4 active:scale-95 transition-transform uppercase tracking-wider"
                >
                  {displayLinkText}
                </button>
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-3 right-5 z-20 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeSlide ? 'bg-amber-500 w-3.5' : 'bg-white/50'}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="bg-white px-4 py-6 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Popular Categories</h3>
          <button
            onClick={() => { setSelectedCategory('All'); setMobileTab('categories'); }}
            className="text-[10px] text-amber-500 font-extrabold flex items-center"
          >
            <span>View All</span> <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-none -mx-4 px-4">
          {[
            { name: language === 'en' ? 'Electronics' : 'ইলেকট্রনিক্স', cat: 'Electronics', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Fashion' : 'ফ্যাশন', cat: 'Apparel', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Grocery' : 'মুদিখানা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Beauty' : 'রূপচর্চা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80' },
            { name: language === 'en' ? 'Home' : 'গৃহসজ্জা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150&auto=format&fit=crop&q=80' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedCategory(item.cat);
                setMobileTab('categories');
              }}
              className="flex flex-col items-center cursor-pointer select-none shrink-0"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm border border-slate-100 relative bg-slate-50 flex items-center justify-center">
                <img src={item.img} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-650 mt-2 leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <div className="bg-red-500 text-white p-1 rounded-lg">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">{t.flashSale}</h2>
            <div className="flex items-center gap-1 ml-2">
              <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-sm">{formatNum(timeLeft.hrs)}</span>
              <span className="text-[10px] font-bold text-red-500">:</span>
              <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-sm">{formatNum(timeLeft.min)}</span>
              <span className="text-[10px] font-bold text-red-500">:</span>
              <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-sm">{formatNum(timeLeft.sec)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x">
          {products.slice(0, 3).map((p) => {
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="w-[145px] shrink-0 bg-slate-50 border border-slate-200/60 rounded-2xl p-3 snap-start shadow-sm flex flex-col justify-between">
                <div className="relative">
                  <Link href={`/product/${p.id}`} className="block relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-white font-black text-[8px] px-2 py-0.5 rounded-full shadow-sm">
                    -20% OFF
                  </span>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 hover:text-red-500 border border-slate-100"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">{p.vendor}</p>
                  
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-sm font-black text-slate-800">৳{(p.price * 80 * 0.8).toFixed(0)}</span>
                    <span className="text-[9px] text-slate-450 line-through font-bold">৳{(p.price * 80).toFixed(0)}</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: p.stock <= 5 ? '92%' : '52%' }}></div>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block font-bold uppercase tracking-wider">
                    {p.stock <= 5 ? `Only ${p.stock} left` : '15 sold'}
                  </span>
                  
                  <button
                    onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                    className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TODAY'S DEALS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Today's Deals</h2>
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-wider">Savings Refresh Daily</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((p) => {
            const isWished = wishlist.includes(p.id);
            const discountPercent = p.stock <= 5 ? 25 : 15;
            const finalPrice = (p.price * 80 * (1 - discountPercent/100)).toFixed(0);

            return (
              <div key={p.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm relative">
                <span className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full z-10">
                  -{discountPercent}% OFF
                </span>
                
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 hover:text-red-500 border border-slate-100 z-10 cursor-pointer"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <div className="flex items-center gap-0.5 text-amber-400 mt-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="text-[9px] font-bold text-slate-455">4.9</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xs font-black text-slate-800">৳{finalPrice}</span>
                    <span className="text-[9px] text-slate-400 line-through font-bold">৳{(p.price * 80).toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                  className="w-full mt-3 bg-slate-900 hover:bg-slate-850 text-white font-black text-[10px] py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Buy</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW: 4.1 FEATURED PRODUCTS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Featured Showcase</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.slice(1, 5).map((p) => {
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm relative">
                <span className="absolute top-2 left-2 bg-slate-900 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10">
                  FEATURED
                </span>
                
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 border border-slate-100 z-10 cursor-pointer"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xs font-black text-slate-800">৳{(p.price * 80).toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Add to Cart</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CODES & CASHBACKS */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white mt-3.5 border-y border-slate-900 p-5 shadow-lg relative overflow-hidden mx-4 rounded-3xl">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div>
          <span className="bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-2">Welcome Offer</span>
          <h3 className="text-base font-black uppercase leading-tight">৳200 Flat Cashback</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">On bKash or Nagad payment methods.</p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center gap-3">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Code: ZIBON20</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('ZIBON20');
              alert('Coupon code ZIBON20 copied!');
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[9px] font-black px-3.5 py-1.5 rounded-lg transition-all"
          >
            Copy Code
          </button>
        </div>
      </section>

      {/* 6. TRENDING & NEW ARRIVALS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex gap-4 border-b border-slate-100 pb-3 mb-4">
          <button
            onClick={() => setActiveHomeTab('trending')}
            className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 transition-all ${
              activeHomeTab === 'trending' ? 'border-amber-500 text-slate-800' : 'border-transparent text-slate-400'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveHomeTab('new-arrivals')}
            className={`text-xs font-black uppercase tracking-wider pb-1 border-b-2 transition-all ${
              activeHomeTab === 'new-arrivals' ? 'border-amber-500 text-slate-800' : 'border-transparent text-slate-400'
            }`}
          >
            New Arrivals
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(activeHomeTab === 'trending' ? products.slice(1, 3) : [...products].reverse().slice(0, 2)).map((p) => {
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm">
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 border border-slate-100"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-805 line-clamp-1 leading-tight">{p.name}</h4>
                  <span className="text-xs font-black text-slate-800 mt-1 block">৳{(p.price * 80).toFixed(0)}</span>
                </div>
                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                  className="w-full mt-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-[9px] py-2 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                  Add
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW: 6.1 BEST SELLING PRODUCTS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4 text-amber-500 fill-current" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Best Sellers</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {products.slice(0, 4).map((p, idx) => {
            const isWished = wishlist.includes(p.id);
            const salesCount = 180 - (idx * 34);
            return (
              <div key={p.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm relative">
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full z-10 shadow-sm">
                  {salesCount} Sold
                </span>
                
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 border border-slate-100 z-10 cursor-pointer"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xs font-black text-slate-800">৳{(p.price * 80).toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Quick Add</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. AI PERSONALIZED RECOMMENDATIONS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-4">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-current animate-pulse" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Recommended For You</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...products].reverse().slice(1, 3).map((p) => {
            const isWished = wishlist.includes(p.id);
            return (
              <div key={p.id} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between shadow-sm relative">
                <span className="absolute top-2 left-2 bg-amber-500/10 text-amber-605 border border-amber-500/20 text-[7px] font-black px-1.5 py-0.5 rounded-full z-10">
                  98% Match
                </span>
                
                <div className="relative aspect-square bg-white rounded-xl overflow-hidden mb-2 border border-slate-100">
                  <Link href={`/product/${p.id}`}>
                    <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm text-slate-400 border border-slate-100 z-10"
                  >
                    <Star className={`w-3 h-3 ${isWished ? 'text-amber-400 fill-current' : ''}`} />
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{p.name}</h4>
                  <span className="text-xs font-black text-slate-800 mt-1 block">৳{(p.price * 80).toFixed(0)}</span>
                </div>

                <button
                  onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                  className="w-full mt-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. RECENTLY VIEWED PRODUCTS */}
      {recentlyViewed.length > 0 && (
        <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3.5">{t.recentlyViewed}</h2>
          <div className="flex gap-3 overflow-x-auto pb-1.5 -mx-4 px-4 scrollbar-none">
            {recentlyViewed.map((p) => (
              <Link 
                key={p.id} 
                href={`/product/${p.id}`}
                className="w-14 shrink-0 flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shadow-sm border border-slate-100">
                  <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="object-cover w-full h-full" />
                </div>
                <span className="text-[8px] text-slate-505 truncate w-full text-center mt-1 leading-tight font-black uppercase tracking-wide">
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 9. KYC VERIFIED WAREHOUSE VENDORS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
          Verified Warehouse Vendors
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { name: 'TechHub Ltd.', logo: 'TH', desc: language === 'en' ? 'Warehouse Hub A (Verified)' : 'ওয়্যারহাউস হাব এ (যাচাইকৃত)' },
            { name: 'FashionBox', logo: 'FB', desc: language === 'en' ? 'Central Warehouse Dhaka (Verified)' : 'সেন্ট্রাল ওয়্যারহাউস ঢাকা (যাচাইকৃত)' },
            { name: 'Zibonbaba Brand Store', logo: 'ZB', desc: language === 'en' ? 'Multiple Branches' : 'একাধিক শাখা' }
          ].map((v, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center font-black text-amber-600 border border-amber-500 text-sm shadow-inner shrink-0">
                  {v.logo}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-slate-805 leading-tight">{v.name}</h4>
                    <span className="bg-emerald-50 text-emerald-600 text-[6px] font-black px-1 py-0.5 rounded uppercase">KYC</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">{v.desc}</span>
                </div>
              </div>
              <button
                onClick={() => alert(`Visiting ${v.name} catalog!`)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] px-3.5 py-1.5 rounded-lg shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                Visit Store
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: 9.1 SHOP BY BRAND */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Shop By Featured Brands</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Apple Inc.', logo: ' Apple' },
            { name: 'Nike Sportswear', logo: '✓ Nike' },
            { name: 'Samsung Tech', logo: 'SAMSUNG' },
            { name: 'Sony Electronics', logo: 'SONY' },
            { name: 'Philips Domestic', logo: 'PHILIPS' },
            { name: 'L\'Oreal Cosmetics', logo: 'L\'OREAL' }
          ].map((b, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 py-3 rounded-xl text-center font-black text-slate-400 active:bg-amber-50 active:border-amber-200 active:text-slate-700 transition-all select-none cursor-pointer shadow-sm">
              <span className="text-[9px] tracking-widest uppercase">{b.logo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: 9.2 CUSTOMER TESTIMONIALS */}
      <section className="bg-white mt-3.5 border-t border-b border-slate-100 py-5 px-4 shadow-sm">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">What Customers Say</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x">
          {[
            { name: 'Kazi A. Rakib', role: 'Business Owner', text: 'Zibonbaba SaaS ERP tools saved us hours of barcode POS scanning! Multi-vendor checkout operates seamlessly.', rating: 5, avatar: 'R' },
            { name: 'Nusrat Jahan', role: 'Online Consumer', text: 'Prompt shipping and highly secure bKash checkout gateway. Very satisfied with the customer service dispatch support.', rating: 5, avatar: 'N' },
            { name: 'Mahbub Alam', role: 'Wholesale Buyer', text: 'Direct delivery from verified warehouses works perfectly. Real-time stock alerts prevent out-of-stock situations.', rating: 5, avatar: 'M' }
          ].map((t, idx) => (
            <div key={idx} className="w-[240px] shrink-0 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 snap-start shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-[10px] text-slate-655 italic leading-relaxed">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-2 mt-4 border-t border-slate-200/50 pt-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-800">{t.name}</h4>
                  <p className="text-[8px] text-slate-400 font-bold">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FULL TRUST VALUE PILLARS (Expanded from 3 to 5 for parity) */}
      <section className="bg-slate-50 py-6 px-4 border-b border-slate-100 shadow-inner">
        <h2 className="text-[10px] text-center text-slate-400 font-black uppercase tracking-widest mb-4">Our Marketplace Guarantees</h2>
        <div className="grid grid-cols-2 gap-3 text-center">
          {[
            { title: 'Secure Check', icon: ShieldCheck },
            { title: 'Easy Returns', icon: ArrowRight },
            { title: 'Fast Delivery', icon: Truck },
            { title: '24/7 Support', icon: Users },
            { title: 'Buyer Protect', icon: CheckCircle }
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className={`bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center ${idx === 4 ? 'col-span-2' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <h4 className="text-[9px] font-black text-slate-800 leading-tight">{item.title}</h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. NEWSLETTER SUBSCRIPTION FORM */}
      <section className="py-10 px-4 bg-slate-900 text-white relative overflow-hidden mx-4 my-4 rounded-3xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <h2 className="text-lg font-black uppercase tracking-tight">Stay Ahead of the Market</h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Receive exclusive discount notifications directly.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to newsletter catalog!'); }} className="mt-5 flex flex-col gap-2 p-1 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
            <input
              type="email"
              placeholder="Enter your email..."
              className="bg-transparent text-xs text-white px-3.5 py-3 outline-none placeholder:text-slate-500 font-medium"
              required
            />
            <button
              type="submit"
              className="bg-[#FFC107] hover:bg-amber-600 text-slate-950 font-black text-[10px] py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
