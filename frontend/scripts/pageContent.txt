'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product } from '../store/useStore';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  CheckCircle,
  AlertTriangle,
  Building,
  Plus,
  Lock,
  Percent,
  Search,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Truck,
  Flame,
  Sparkles,
  Gift,
  Tag,
  ThumbsUp,
  Store,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileHomepage from '@/components/mobile-homepage';
import MobileCategoryPage from '@/components/mobile-category-page';
import MobileCart from '@/components/mobile-cart';
import MobileDashboard from '@/components/mobile-dashboard';
import { translations } from '../utils/translations';

export default function HomePage() {
  const {
    role,
    products,
    addProduct,
    crmCustomers,
    orders,
    wishlist,
    toggleWishlist,
    addToCart,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    categories,
    setSelectedCategory,
    mobileTab,
    banners,
    fetchHomepage,
    language,
    isLoggedIn
  } = useStore();

  const router = useRouter();

  const t = translations[language];

  const { isMobile, isMounted } = useIsMobile();

  // Dynamic Advertisement Slideshow state
  const [activeSlide, setActiveSlide] = useState(0);

  // Shared Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 14, sec: 45 });
  // Shared Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [activeHomeTab, setActiveHomeTab] = useState<'trending' | 'new-arrivals'>('trending');

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'superadmin') router.push('/superadmin');
      else if (role === 'admin') router.push('/admin');
      else if (['manager', 'accountant', 'support', 'crm_manager', 'hr_manager'].includes(role)) router.push('/admin');
      else if (['vendor', 'staff'].includes(role)) router.push('/seller');
      else if (role === 'reseller') router.push('/reseller');
      else if (['deliveryman', 'delivery_manager'].includes(role)) router.push('/delivery');
    }
  }, [isLoggedIn, role, router]);

  useEffect(() => {
    if (banners && banners.length > 0) {
      const interval = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % banners.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    // 1. Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    // 2. Load recently viewed from localStorage
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
      clearInterval(timer);
    };
  }, [products]);

  // Storefront Filter States
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Vendor Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdSKU, setNewProdSKU] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [vendorSuccessMsg, setVendorSuccessMsg] = useState('');

  // Admin Config States
  const [commissionRate, setCommissionRate] = useState(10);
  const [kycPendingStores, setKycPendingStores] = useState([
    { id: 'store-a', name: 'Techno Gadgets', owner: 'Rana Ahmed', type: 'Electronics', file: 'KYC_Rana_Passport.pdf' },
    { id: 'store-b', name: 'Dacca Weaves', owner: 'Mitu Islam', type: 'Apparel', file: 'Trade_License_382.pdf' }
  ]);
  const [kycApprovedIds, setKycApprovedIds] = useState<string[]>([]);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Filter products based on search queries and category filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdSKU) {
      alert('Please fill out Name, Price, and SKU.');
      return;
    }

    const newProd: Product = {
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      sku: newProdSKU.toUpperCase(),
      stock: parseInt(newProdStock) || 10,
      vendor: 'Sarah Jenkins Store',
      description: newProdDesc || 'No description provided.',
    };

    addProduct(newProd);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdSKU('');
    setNewProdStock('20');
    setNewProdDesc('');
    setVendorSuccessMsg('Product registered successfully to database and catalog!');
    setTimeout(() => setVendorSuccessMsg(''), 4000);
  };

  const approveStore = (id: string, name: string) => {
    setKycApprovedIds([...kycApprovedIds, id]);
    setAdminSuccessMsg(`Vendor "${name}" registration has been approved. Access keys issued.`);
    setTimeout(() => setAdminSuccessMsg(''), 4000);
  };

  // --- 1. CUSTOMER SHOPPING STOREFRONT VIEW ---
  if (role === 'customer') {
    return (
      <div className="w-full h-full relative bg-slate-50 text-slate-800">
        {/* MOBILE CUSTOMER VIEWS SWITCHER (CSS Responsive) */}
        <div className="block md:hidden pb-16">
          {mobileTab === 'home' && <MobileHomepage />}
          {mobileTab === 'categories' && <MobileCategoryPage />}
          {mobileTab === 'cart' && <MobileCart />}
          {(mobileTab === 'orders' || mobileTab === 'account') && <MobileDashboard />}
        </div>

        {/* DESKTOP CUSTOMER STOREFRONT VIEW (CSS Responsive) */}
        <div className="hidden md:block w-full pb-20 animate-slide-up">
          
          {/* Asymmetric Campaign Banners Grid (Amazon / Alibaba / Shopify inspired) */}
          <section className="py-8 px-4 lg:px-8 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left Large Banner (col-span-2, row-span-2) */}
              <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] h-[440px] bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 shadow-xl flex items-center">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300 z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="New Arrivals Campaign"
                  className="absolute right-0 bottom-0 h-full w-2/3 object-cover object-top select-none group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                />
                <div className="relative z-20 pl-10 lg:pl-16 max-w-sm text-slate-900">
                  <span className="bg-slate-900 text-amber-400 text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full w-fit mb-4 block shadow-md">
                    Seasonal Campaign
                  </span>
                  <h1 className="text-3xl lg:text-5xl font-black leading-tight tracking-tight mb-2 uppercase drop-shadow-sm text-slate-955">
                    Just For <br />
                    <span className="text-slate-900 font-extrabold underline decoration-amber-300 decoration-wavy">You</span>
                  </h1>
                  <p className="text-4xl lg:text-5xl font-black text-slate-950 mb-8">30% OFF</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Apparel');
                      const el = document.getElementById('shop-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 uppercase tracking-widest"
                  >
                    Shop Collection
                  </button>
                </div>
              </div>

              {/* Middle Vertical Skincare Banner (col-span-1, row-span-2) */}
              <div className="md:col-span-1 md:row-span-2 relative group overflow-hidden rounded-[2.5rem] h-[440px] bg-pink-100 shadow-xl flex flex-col justify-between p-8 text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 group-hover:from-black/50 transition-all duration-300 z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"
                  alt="Skincare Special"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 pointer-events-none"
                />
                <div className="relative z-20">
                  <span className="bg-pink-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full w-fit mb-3 block">
                    Care Your Skin
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-black leading-tight drop-shadow-md">
                    Naturally <br /> Radiant
                  </h2>
                </div>
                <div className="relative z-20">
                  <p className="text-xs font-bold text-slate-100 drop-shadow mb-4 uppercase tracking-wide">UPTO 20% OFF ON SKINCARE PRODUCTS</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Home & Kitchen');
                      const el = document.getElementById('shop-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs px-5 py-3 rounded-2xl transition-all duration-200 shadow-md active:scale-95 w-full text-center uppercase tracking-wider"
                  >
                    Explore Beauty
                  </button>
                </div>
              </div>

              {/* Right Stacked Banner 1 (col-span-1) */}
              <div className="relative group overflow-hidden rounded-[2rem] h-[208px] bg-amber-50 shadow-lg border border-amber-200/20 flex items-center p-6 text-slate-800">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-300 z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80"
                  alt="Your Style"
                  className="absolute right-0 bottom-0 h-full w-1/2 object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                />
                <div className="relative z-20 max-w-[50%]">
                  <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">Trends</span>
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-tight tracking-tight mb-2.5">
                    Your <br /> Style
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('Apparel');
                      const el = document.getElementById('shop-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] font-black text-amber-600 hover:text-amber-700 underline uppercase tracking-widest"
                  >
                    View Catalog
                  </button>
                </div>
              </div>

              {/* Right Stacked Banner 2 (col-span-1) */}
              <div className="relative group overflow-hidden rounded-[2rem] h-[208px] bg-slate-900 shadow-lg border border-slate-850 flex items-center p-6 text-white">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-300 z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80"
                  alt="Your Outfit"
                  className="absolute right-0 bottom-0 h-full w-1/2 object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                />
                <div className="relative z-20 max-w-[50%]">
                  <span className="text-[9px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">Hot Deal</span>
                  <h3 className="text-lg font-black text-white uppercase leading-tight tracking-tight mb-2.5">
                    Your <br /> Outfit
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('Apparel');
                      const el = document.getElementById('shop-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[10px] font-black text-amber-400 hover:text-amber-500 underline uppercase tracking-widest"
                  >
                    Discover Now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Popular Categories circles section */}
          <section className="bg-white py-12 px-4 lg:px-8 border-y border-slate-100">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Popular Categories</h2>
                  <p className="text-xs text-slate-400 mt-1">Discover trending collections across our verified catalog hubs.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    const el = document.getElementById('shop-catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>View All Categories</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-6">
                {[
                  { name: language === 'en' ? 'Electronics' : 'ইলেকট্রনিক্স', cat: 'Electronics', img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Fashion' : 'ফ্যাশন', cat: 'Apparel', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Grocery' : 'মুদিখানা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Beauty' : 'রূপচর্চা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Home & Living' : 'গৃহসজ্জা', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Health' : 'স্বাস্থ্য', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Sports' : 'খেলাধুলা', cat: 'Apparel', img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Automotive' : 'মোটরযান', cat: 'Electronics', img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Baby Care' : 'শিশুর যত্ন', cat: 'Electronics', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80' },
                  { name: language === 'en' ? 'Books' : 'বইপত্র', cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=80' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(item.cat);
                      const el = document.getElementById('shop-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex flex-col items-center cursor-pointer group text-center select-none"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-sm border border-slate-100 group-hover:border-amber-500 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative bg-slate-100 flex items-center justify-center">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-600 group-hover:text-amber-500 transition-colors mt-2.5 leading-tight">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Flash Deals Carousel Section */}
          <section id="flash-sale" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto">
              {/* Header with Countdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500 text-white p-2 rounded-2xl shadow-md">
                    <Flame className="w-6 h-6 fill-current animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      {t.flashSale}
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-bounce">Limited Special</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{t.flashSaleSubtitle}</p>
                  </div>
                </div>
                {/* Timer countdown widgets */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-400 mr-1.5">{language === 'en' ? 'Ends In:' : 'শেষ হবে:'}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">{String(timeLeft.hrs).padStart(2, '0')}</span>
                    <span className="text-xs font-black text-red-500">:</span>
                    <span className="bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">{String(timeLeft.min).padStart(2, '0')}</span>
                    <span className="text-xs font-black text-red-500">:</span>
                    <span className="bg-red-500 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-sm">{String(timeLeft.sec).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* Grid block for Flash Products */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.slice(0, 3).map((p) => {
                  const isWished = wishlist.includes(p.id);
                  return (
                    <div key={p.id} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                      <div className="relative">
                        <Link href={`/product/${p.id}`} className="block relative aspect-[16/10] bg-white rounded-2xl overflow-hidden mb-4 border border-slate-100">
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        {/* Tags */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <span className="bg-red-500 text-white font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            -20% OFF
                          </span>
                          <span className="bg-slate-900/80 backdrop-blur-md text-amber-400 font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm w-fit">
                            FREE SHIPPING
                          </span>
                        </div>
                        {/* Wishlist triggers */}
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit mb-1.5">
                          {p.category}
                        </span>
                        <h4 className="text-sm font-black text-slate-850 line-clamp-1 leading-snug hover:text-amber-500 transition-colors">
                          <Link href={`/product/${p.id}`}>{p.name}</Link>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-300" />
                          <span>{p.vendor}</span>
                        </p>
                        
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-xl font-black text-slate-800">৳{(p.price * 80 * 0.8).toFixed(0)}</span>
                          <span className="text-xs text-slate-400 line-through font-bold">৳{(p.price * 80).toFixed(0)}</span>
                        </div>

                        {/* Animated progress bar indicator */}
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: p.stock <= 5 ? '92%' : '52%' }}></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">
                          <span>{p.stock <= 5 ? `Only ${p.stock} items left` : '15 sold'}</span>
                          <span className="text-red-500 font-extrabold">{t.hurryUp}</span>
                        </div>

                        <button
                          onClick={() => {
                            addToCart(p);
                            alert(`${p.name} added to cart!`);
                          }}
                          className="w-full mt-5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>{t.addToCart}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Today's Deals Section (Inspire by Daraz / Temu) */}
          <section id="todays-deals" className="py-12 px-4 lg:px-8 border-b border-slate-100">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Today's Deals</h2>
                  <p className="text-xs text-slate-400 mt-1">Super savers and best discount offers refreshed daily.</p>
                </div>
                <div className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-0.5 uppercase tracking-widest cursor-pointer">
                  <span>Show More</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((p) => {
                  const isWished = wishlist.includes(p.id);
                  const discountPercent = p.stock <= 5 ? 25 : 15;
                  const finalPrice = (p.price * 80 * (1 - discountPercent/100)).toFixed(0);

                  return (
                    <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/50 hover:border-amber-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative">
                      {/* Badge indicator */}
                      <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-20 shadow-md">
                        -{discountPercent}% OFF
                      </span>
                      
                      <div className="relative aspect-square bg-slate-100 overflow-hidden border-b border-slate-100">
                        <Link href={`/product/${p.id}`}>
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        {/* Wishlist triggers */}
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border z-20 ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase mb-1 tracking-wider">
                            <span>{p.category}</span>
                            <span className="text-amber-500">{p.vendor}</span>
                          </div>
                          <Link href={`/product/${p.id}`} className="text-sm font-black text-slate-800 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                            {p.name}
                          </Link>
                          {/* Rating and review mockup */}
                          <div className="flex items-center gap-1 mt-1.5">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                              <Star className="w-3 h-3 fill-current" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">(24 reviews)</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-slate-450 uppercase block tracking-wide">Deal Price</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-black text-slate-800">৳{finalPrice}</span>
                              <span className="text-xs text-slate-400 line-through font-bold">৳{(p.price * 80).toFixed(0)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                            className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-2xl shadow-sm transition-colors active:scale-95 cursor-pointer"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured Products Zoom Section */}
          <section id="featured-products" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500 fill-current" />
                    <span>Featured Showcase</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Top-rated items handpicked by Zibonbaba editors for premium quality.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.slice(1, 5).map((p) => {
                  const isWished = wishlist.includes(p.id);
                  return (
                    <div key={p.id} className="group bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full relative">
                      <span className="absolute top-3 left-3 bg-slate-900 text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest z-20 shadow-md">
                        FEATURED
                      </span>
                      <div className="relative aspect-video bg-white overflow-hidden border-b border-slate-100">
                        <Link href={`/product/${p.id}`}>
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border z-20 ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black text-amber-600 uppercase block tracking-wider mb-0.5">{p.category}</span>
                          <Link href={`/product/${p.id}`} className="text-sm font-black text-slate-800 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">{p.description}</p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Standard Price</span>
                            <span className="text-base font-black text-slate-800 block">৳{(p.price * 80).toFixed(0)}</span>
                          </div>
                          <button
                            onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-95"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Trending Products / New Arrivals tab section */}
          <section className="py-12 px-4 lg:px-8 border-b border-slate-100">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-5 gap-4 mb-8">
                {/* Tabs */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveHomeTab('trending')}
                    className={`text-xl font-black uppercase tracking-tight pb-2 border-b-4 transition-all ${
                      activeHomeTab === 'trending' ? 'border-amber-500 text-slate-800 scale-102' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Trending Products
                  </button>
                  <button
                    onClick={() => setActiveHomeTab('new-arrivals')}
                    className={`text-xl font-black uppercase tracking-tight pb-2 border-b-4 transition-all ${
                      activeHomeTab === 'new-arrivals' ? 'border-amber-500 text-slate-800 scale-102' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    New Arrivals
                  </button>
                </div>
                <div className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-0.5 uppercase tracking-widest cursor-pointer">
                  <span>Browse Category</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Tab grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(activeHomeTab === 'trending' ? products.slice(2, 6) : [...products].reverse().slice(0, 4)).map((p) => {
                  const isWished = wishlist.includes(p.id);
                  return (
                    <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/50 hover:border-amber-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative">
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                        <Link href={`/product/${p.id}`}>
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border z-20 ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase mb-1 tracking-wider">
                            <span>{p.category}</span>
                            <span className="text-emerald-600 font-bold">{language === 'en' ? 'Verified' : 'যাচাইকৃত'}</span>
                          </div>
                          <Link href={`/product/${p.id}`} className="text-sm font-black text-slate-800 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{p.vendor}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-base font-black text-slate-800">৳{(p.price * 80).toFixed(0)}</span>
                          </div>
                          <button
                            onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                          >
                            Quick Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Best Selling Products Section */}
          <section id="best-selling" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                    <ThumbsUp className="w-6 h-6 text-amber-500 fill-current animate-bounce" />
                    <span>Best Sellers</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Highly demanding products backed by high transactional volume.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.slice(0, 4).map((p, idx) => {
                  const isWished = wishlist.includes(p.id);
                  const salesCount = 180 - (idx * 34);
                  return (
                    <div key={p.id} className="group bg-slate-50 border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full relative">
                      {/* Sales Rank Badge */}
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider z-20 shadow-md">
                        {salesCount} Sold
                      </span>
                      
                      <div className="relative aspect-video bg-white overflow-hidden border-b border-slate-100">
                        <Link href={`/product/${p.id}`}>
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border z-20 ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">{p.category}</span>
                          <Link href={`/product/${p.id}`} className="text-sm font-black text-slate-800 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                          {/* Rating and review mockup */}
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span className="text-[10px] font-bold text-slate-500">4.9 rating</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Retail Price</span>
                            <span className="text-base font-black text-slate-800 block">৳{(p.price * 80).toFixed(0)}</span>
                          </div>
                          <button
                            onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors active:scale-95"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Shop by Sellers Section */}
          <section id="vendors" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-slate-50">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t.featuredVendors}</h2>
                  <p className="text-xs text-slate-400 mt-1">{t.vendorsSubtitle}</p>
                </div>
                <Link
                  href="/seller"
                  className="text-xs font-black text-amber-500 hover:text-amber-600 flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>{t.viewVendors}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'TechHub Ltd.', logo: 'TH', rating: '4.8', products: 124, followers: 820, category: 'Electronics & Mobiles', warehouse: language === 'en' ? 'Warehouse Hub A' : 'ওয়্যারহাউস হাব এ' },
                  { name: 'FashionBox', logo: 'FB', rating: '4.9', products: 82, followers: 490, category: 'Clothing & Accessories', warehouse: language === 'en' ? 'Central Warehouse Dhaka' : 'সেন্ট্রাল ওয়্যারহাউস ঢাকা' },
                  { name: 'Zibonbaba Brand Store', logo: 'ZB', rating: '5.0', products: 45, followers: 1200, category: 'General & Groceries', warehouse: language === 'en' ? 'Multiple Branches' : 'একাধিক শাখা' }
                ].map((v, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-amber-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center font-black text-amber-600 text-xl border-2 border-amber-500 shrink-0">
                        {v.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-slate-850">{v.name}</h3>
                          <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">KYC Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{v.category}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 my-5 py-4 border-y border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
                        <span className="text-sm font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                          <Star className="w-3.5 h-3.5 text-warning fill-current" />
                          <span>{v.rating}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Products</span>
                        <span className="text-sm font-black text-slate-800 block mt-0.5">{v.products}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Followers</span>
                        <span className="text-sm font-black text-slate-800 block mt-0.5">{v.followers}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">{v.warehouse}</span>
                      <button
                        onClick={() => alert(`Visiting ${v.name} catalog!`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all"
                      >
                        Visit Store
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Brands Grid */}
          <section id="featured-brands" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-xl font-black text-slate-850 uppercase tracking-wider">Shop By Featured Brands</h2>
                <p className="text-xs text-slate-400 mt-1">Get authentic warranties directly from official global partners.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center">
                {[
                  { name: 'Apple Inc.', logo: ' Apple' },
                  { name: 'Nike Sportswear', logo: '✓ Nike' },
                  { name: 'Samsung Tech', logo: 'SAMSUNG' },
                  { name: 'Sony Electronics', logo: 'SONY' },
                  { name: 'Philips Domestic', logo: 'PHILIPS' },
                  { name: 'L\'Oreal Cosmetics', logo: 'L\'OREAL' }
                ].map((b, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center font-black text-slate-400 hover:text-slate-700 hover:bg-amber-50 hover:border-amber-200 transition-all duration-300 select-none cursor-pointer">
                    <span className="text-sm tracking-widest uppercase">{b.logo}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* AI Recommended Section */}
          <section id="ai-recommendations" className="py-12 px-4 lg:px-8 border-b border-slate-100">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/10 p-2 rounded-2xl text-amber-500 shadow-sm border border-amber-200/20">
                    <Sparkles className="w-5 h-5 fill-current animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-850 uppercase tracking-tight">Recommended For You</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Personalized recommendations tailored based on your browsing logs.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...products].reverse().slice(0, 4).map((p) => {
                  const isWished = wishlist.includes(p.id);
                  return (
                    <div key={p.id} className="bg-white border border-slate-200/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500 transition-all duration-300 flex flex-col justify-between h-full relative">
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-slate-100">
                        <Link href={`/product/${p.id}`}>
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border z-20 ${
                            isWished ? 'bg-amber-400 border-amber-400 text-slate-800' : 'bg-white/90 backdrop-blur-sm border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase mb-1 tracking-wider">
                            <span>{p.category}</span>
                            <span className="text-amber-500">98% Match</span>
                          </div>
                          <Link href={`/product/${p.id}`} className="text-sm font-black text-slate-800 group-hover:text-amber-500 transition-colors line-clamp-1">
                            {p.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{p.vendor}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-base font-black text-slate-800">৳{(p.price * 80).toFixed(0)}</span>
                          </div>
                          <button
                            onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                            className="bg-amber-500 hover:bg-amber-600 text-white p-2.5 rounded-2xl shadow-sm transition-colors active:scale-95"
                          >
                            <ShoppingBag className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Promotional Section: Coupons Register & Cashback Banners */}
          <section className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cashback Banner (Col span 1) */}
              <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden h-[240px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
                <div>
                  <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm block w-fit mb-3">Instant Cashback</span>
                  <h3 className="text-2xl font-black uppercase leading-tight">৳200 Flat <br /> Cashback</h3>
                  <p className="text-xs text-slate-400 mt-2 font-medium">On paying via bKash, SSLCommerz, or Nagad checkout gateways.</p>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valid until 30 July 2026</div>
              </div>

              {/* Coupon Code 1 */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col justify-between h-[240px] shadow-sm relative group hover:border-amber-500 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">Welcome Offer</span>
                    <h3 className="text-xl font-black text-slate-800 mt-2 leading-tight">20% discount on clothing</h3>
                  </div>
                  <Tag className="w-8 h-8 text-amber-400 opacity-60" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-3">Copy code below and paste at checkout to redeem.</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('ZIBON20');
                      alert('Coupon code ZIBON20 copied to clipboard!');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Code: ZIBON20</span>
                    <span className="text-[9px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-black uppercase">Copy</span>
                  </button>
                </div>
              </div>

              {/* Coupon Code 2 */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col justify-between h-[240px] shadow-sm relative group hover:border-amber-500 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">Delivery Special</span>
                    <h3 className="text-xl font-black text-slate-800 mt-2 leading-tight">Free shipping on orders above ৳1000</h3>
                  </div>
                  <Gift className="w-8 h-8 text-emerald-450 opacity-60" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-3">Apply this code at shopping cart segment to subtract shipping cost.</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('FREESHIP');
                      alert('Coupon code FREESHIP copied to clipboard!');
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl transition-all shadow active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Code: FREESHIP</span>
                    <span className="text-[9px] bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-black uppercase">Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Main Catalog Workspace */}
          <section id="shop-catalog" className="max-w-[1440px] mx-auto py-12 px-4 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Product Showcase</h2>
                <p className="text-xs text-slate-450 mt-1">
                  Discover quality and verified components from our global network of marketplace vendors.
                </p>
              </div>
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-sm bg-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {language === 'en' ? 'Filters' : 'ফিল্টারস'}
              </button>
            </div>

            {/* Category Quick Filter Tabs */}
            <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-200 pb-6">
              {categories.map((cat) => {
                const getCategoryTranslation = (c: string) => {
                  if (language === 'en') return c;
                  if (c === 'All') return 'সব পণ্য';
                  if (c === 'Electronics') return 'ইলেকট্রনিক্স';
                  if (c === 'Home & Kitchen') return 'হোম ও কিচেন';
                  if (c === 'Apparel') return 'পোশাক';
                  return c;
                };
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-5 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-white shadow-md scale-[1.02]'
                        : 'bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 shadow-sm'
                    }`}
                  >
                    {getCategoryTranslation(cat)}
                  </button>
                );
              })}
            </div>

            {/* Collapsible Advanced Filters Panel */}
            {showFilters && (
              <div className="bg-white border border-slate-200 p-6 rounded-3xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">{language === 'en' ? 'Category Filter' : 'ক্যাটাগরি ফিল্টার'}</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const getCategoryTranslation = (c: string) => {
                        if (language === 'en') return c;
                        if (c === 'All') return 'সব পণ্য';
                        if (c === 'Electronics') return 'ইলেকট্রনিক্স';
                        if (c === 'Home & Kitchen') return 'হোম ও কিচেন';
                        if (c === 'Apparel') return 'পোশাক';
                        return c;
                      };
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors ${
                            selectedCategory === cat ? 'bg-amber-500 text-white font-bold shadow-sm' : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {getCategoryTranslation(cat)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    {language === 'en' ? `Price Cap ($${maxPrice})` : `সর্বোচ্চ মূল্য সীমা (${t.currency}${(maxPrice * 80).toFixed(0)})`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                    <span>{t.currency}0</span>
                    <span>{t.currency}{(1000 * 80).toFixed(0)}</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setMaxPrice(1000);
                      setSearchQuery('');
                    }}
                    className="w-full text-center border border-red-500 text-red-500 hover:bg-red-50 text-xs font-bold py-2.5 rounded-xl transition-colors"
                  >
                    {language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
                  </button>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="text-base font-black text-slate-800">{language === 'en' ? 'No products found' : 'কোন পণ্য পাওয়া যায়নি'}</h3>
                <p className="text-xs text-slate-400 mt-1">{language === 'en' ? 'Try resetting search filters or keywords.' : 'অনুগ্রহ করে ফিল্টার বা কিওয়ার্ড রিসেট করুন।'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((p) => {
                  const isWished = wishlist.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/50 hover:border-amber-500 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Wishlist Trigger */}
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all border ${
                            isWished
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'bg-white border-slate-100 text-slate-400 hover:text-red-500'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      {/* Meta info */}
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-extrabold uppercase mb-1 tracking-wider">
                            <span>
                              {language === 'en' ? p.category :
                                p.category === 'Electronics' ? 'ইলেকট্রনিক্স' :
                                p.category === 'Home & Kitchen' ? 'হোম ও কিচেন' :
                                p.category === 'Apparel' ? 'পোশাক' : p.category}
                            </span>
                            <span className="text-amber-550 flex items-center gap-1">
                              <Store className="w-3 h-3" />
                              <span>{p.vendor}</span>
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-slate-805 group-hover:text-amber-500 transition-colors line-clamp-1">
                            <Link href={`/product/${p.id}`}>{p.name}</Link>
                          </h3>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">{language === 'en' ? 'Retail Price' : 'মূল্য'}</p>
                            <p className="text-lg font-black text-slate-800">৳{(p.price * 80).toFixed(0)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">{language === 'en' ? 'Inventory' : 'স্টক'}</p>
                            <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${p.stock <= 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {p.stock <= 10
                                ? (language === 'en' ? `Only ${p.stock} left` : `মাত্র ${p.stock} টি বাকি`)
                                : (language === 'en' ? `${p.stock} units` : `${p.stock} টি`)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="px-6 pb-6">
                        <button
                          onClick={() => {
                            addToCart(p);
                            alert(language === 'en' ? `${p.name} added to shopping cart!` : `${p.name} কার্টে যোগ করা হয়েছে!`);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t.addToCart}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recently Viewed Products Section */}
          {recentlyViewed.length > 0 && (
            <section className="bg-white py-12 px-4 lg:px-8 border-t border-b border-slate-100">
              <div className="max-w-[1440px] mx-auto">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-8">{t.recentlyViewed}</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {recentlyViewed.map((p) => (
                    <Link 
                      key={p.id} 
                      href={`/product/${p.id}`}
                      className="w-24 shrink-0 flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden shadow-sm border border-slate-100 hover:border-amber-500 transition-colors">
                        <img src={p.image} alt={p.name} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-[10px] text-slate-500 truncate w-full text-center mt-2 font-bold uppercase tracking-wide">
                        {p.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Trust Value Badges Banner */}
          <section id="trust-banner" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-slate-50">
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { title: 'Secure Payments', desc: 'PCI-DSS Level 1 payment encryption.', icon: ShieldCheck },
                { title: 'Easy Returns', desc: '14-day hassle-free refund process.', icon: ArrowRight },
                { title: 'Fast Delivery', desc: 'SLA backed warehouse direct logistics.', icon: Truck },
                { title: '24/7 Support', desc: 'Live ticketing support portal helpdesk.', icon: Users },
                { title: 'Buyer Protection', desc: 'KYC verified store escrow security.', icon: CheckCircle }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-amber-500 hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-slate-800">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer Testimonials section */}
          <section id="testimonials" className="py-12 px-4 lg:px-8 border-b border-slate-100 bg-white">
            <div className="max-w-[1440px] mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-slate-850 uppercase tracking-wider">What Our Customers Say</h2>
                <p className="text-xs text-slate-400 mt-1">Real reviews and experiences logs verified from our checkout pipeline.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Kazi A. Rakib', role: 'Business Owner', text: 'Zibonbaba SaaS ERP tools saved us hours of barcode POS scanning! Multi-vendor checkout operates seamlessly.', rating: 5, avatar: 'R' },
                  { name: 'Nusrat Jahan', role: 'Online Consumer', text: 'Prompt shipping and highly secure bKash checkout gateway. Very satisfied with the customer service dispatch support.', rating: 5, avatar: 'N' },
                  { name: 'Mahbub Alam', role: 'Wholesale Buyer', text: 'Direct delivery from verified warehouses works perfectly. Real-time stock alerts prevent out-of-stock situations.', rating: 5, avatar: 'M' }
                ].map((t, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-0.5 text-amber-400 mb-4">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-655 italic leading-relaxed">"{t.text}"</p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-6 border-t border-slate-200/50 pt-4">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{t.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter Form */}
          <section id="newsletter" className="py-16 px-4 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
            <div className="max-w-xl mx-auto text-center relative z-20">
              <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider block w-fit mx-auto mb-4 shadow-md">
                Newsletter
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight">Stay Ahead of the Market</h2>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">Subscribe to receive exclusive coupons, trend digests, and price drop notifications.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to newsletter catalog!'); }} className="mt-8 flex flex-col sm:flex-row gap-3 rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-1.5 backdrop-blur-sm">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  className="bg-transparent text-sm text-white px-4 py-3.5 w-full outline-none placeholder:text-slate-500 font-medium"
                  required
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs px-6 py-3.5 rounded-xl shrink-0 transition-all active:scale-95 uppercase tracking-wider"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>

        </div>
      </div>
    );
  }

  // --- 2. VENDOR PORTAL VIEW ---
  if (role === 'vendor') {
    return (
      <div className="w-full max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-light pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
              <span className="text-xs font-bold text-neutral-muted uppercase tracking-widest">Vendor Dashboard v1.1</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-dark mt-1">Storefront & Inventory Manager</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/erp"
              className="bg-neutral-dark hover:bg-neutral-dark/90 text-white text-xs font-bold px-4 py-2.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Building className="w-4 h-4 text-primary" />
              SaaS ERP Hub
            </Link>
            <Link
              href="/erp/pos"
              className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-4 py-2.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              POS Register
            </Link>
          </div>
        </div>

        {/* Success messaging */}
        {vendorSuccessMsg && (
          <div className="bg-success/10 border border-success text-success p-4 rounded-md mb-8 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            {vendorSuccessMsg}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Store Sales (Monthly)</p>
            <h3 className="text-2xl font-extrabold text-neutral-dark mt-1">$14,240.00</h3>
            <span className="text-[10px] text-success font-bold mt-1 inline-block">↗ +12% vs last month</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Total Listed SKUs</p>
            <h3 className="text-2xl font-extrabold text-neutral-dark mt-1">{products.length} Items</h3>
            <span className="text-[10px] text-neutral-muted font-semibold mt-1 inline-block">14 active categories</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Low Stock Alerts</p>
            <h3 className="text-2xl font-extrabold text-error mt-1">
              {products.filter(p => p.stock <= 10).length} Items
            </h3>
            <span className="text-[10px] text-error font-bold mt-1 inline-block">⚠ Action required</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">CRM Active Customers</p>
            <h3 className="text-2xl font-extrabold text-neutral-dark mt-1">{crmCustomers.length} Profiled</h3>
            <span className="text-[10px] text-success font-bold mt-1 inline-block">100% sync rate</span>
          </div>
        </div>

        {/* Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Creation Form */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-1 h-fit">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-accent" />
              Upload New Product
            </h2>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise headphones"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 49.00"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Stock Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SKU-PROD-XYZ"
                    value={newProdSKU}
                    onChange={(e) => setNewProdSKU(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1">Product Description</label>
                <textarea
                  placeholder="Provide technical specifications and attributes..."
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded-md p-2 text-xs text-neutral-dark outline-none focus:border-primary resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2.5 rounded-md transition-colors"
              >
                Register SKU to Database
              </button>
            </form>
          </div>

          {/* Current Products list */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card lg:col-span-2">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-4 flex items-center justify-between">
              <span>Current Catalog Store SKU list</span>
              <span className="text-xs text-neutral-muted lowercase font-normal">{products.length} registered</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-light bg-neutral-light/50 text-neutral-muted font-bold">
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Base Price</th>
                    <th className="py-2.5 px-3">Warehouse Stock</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-light/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-primary-dark">{p.sku}</td>
                      <td className="py-3 px-3 font-semibold text-neutral-dark">{p.name}</td>
                      <td className="py-3 px-3">{p.category}</td>
                      <td className="py-3 px-3 font-bold">৳{p.price.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${p.stock <= 10 ? 'text-error' : 'text-success'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          p.stock > 0 ? 'bg-success/15 text-success border border-success/30' : 'bg-error/15 text-error border border-error/30'
                        }`}>
                          {p.stock > 0 ? 'Active' : 'Stockout'}
                        </span>
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

  // --- 3. PLATFORM ADMINISTRATOR VIEW ---
  if (role === 'admin') {
    return (
      <div className="w-full max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up">
        {/* Header */}
        <div className="border-b border-neutral-light pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
              <span className="text-xs font-bold text-neutral-muted uppercase tracking-widest">Platform Admin Console v2.0</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-dark mt-1">Superadmin Security & Governance</h1>
          </div>
          <div className="bg-neutral-dark text-white px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            System Secure Node 01
          </div>
        </div>

        {/* Alerts messages */}
        {adminSuccessMsg && (
          <div className="bg-success/10 border border-success text-success p-4 rounded-md mb-8 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            {adminSuccessMsg}
          </div>
        )}

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Total Platform GMV</p>
            <h3 className="text-2xl font-extrabold text-neutral-dark mt-1">$482,900.00</h3>
            <span className="text-[10px] text-success font-bold mt-1 inline-block">↗ +18.4% monthly velocity</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Superadmin Audit Logs</p>
            <h3 className="text-2xl font-extrabold text-neutral-dark mt-1">1,482 Entries</h3>
            <span className="text-[10px] text-success font-bold mt-1 inline-block">No anomalies recorded</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">KYC Pending Requests</p>
            <h3 className="text-2xl font-extrabold text-warning mt-1">
              {kycPendingStores.length - kycApprovedIds.length} Stores
            </h3>
            <span className="text-[10px] text-neutral-muted font-semibold mt-1 inline-block">Verification needed</span>
          </div>
          <div className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
            <p className="text-[10px] text-neutral-muted font-bold uppercase">Commission Rate</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-neutral-dark">{commissionRate}%</h3>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 bg-neutral-light border border-neutral-light rounded p-1 text-xs text-neutral-dark font-extrabold"
              />
            </div>
            <span className="text-[10px] text-neutral-muted font-semibold mt-1 inline-block">Global category default</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vendor Approvals */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-4">
              KYC Vendor Approvals & Auditing
            </h2>
            {kycPendingStores.filter(s => !kycApprovedIds.includes(s.id)).length === 0 ? (
              <div className="text-center py-10 bg-neutral-light/20 rounded-md">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-xs text-neutral-muted">All pending store registrations verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {kycPendingStores.filter(s => !kycApprovedIds.includes(s.id)).map((store) => (
                  <div key={store.id} className="p-4 bg-neutral-light/50 border border-neutral-light rounded-md flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-dark">{store.name}</h4>
                      <p className="text-[10px] text-neutral-muted font-semibold">Owner: {store.owner} | Type: {store.type}</p>
                      <span className="inline-block text-[9px] bg-neutral-dark text-white rounded px-2 py-0.5 font-mono mt-1">
                        📄 {store.file}
                      </span>
                    </div>
                    <button
                      onClick={() => approveStore(store.id, store.name)}
                      className="bg-success hover:bg-success-dark text-white text-xs font-bold px-3.5 py-1.5 rounded-md transition-colors"
                    >
                      Approve & Issue Access Keys
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card">
            <h2 className="text-sm font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-4">
              Security Monitoring & System Logs
            </h2>
            <div className="space-y-3 font-mono text-[10px]">
              {[
                { time: '01:45:10', ip: '192.168.1.104', type: 'AUTH_SUCCESS', desc: 'User Sarah Jenkins logged in successfully.', severity: 'INFO' },
                { time: '01:44:48', ip: '203.82.19.4', type: 'API_DEFIANCE', desc: 'Blocked rate limit on POST /api/auth/login.', severity: 'WARNING' },
                { time: '01:42:15', ip: '192.168.1.1', type: 'DB_BACKUP', desc: 'Automated WAL snapshot archived in AWS S3.', severity: 'INFO' },
                { time: '01:38:02', ip: '203.82.19.4', type: 'FRAUD_FLAG', desc: 'Card trial detected from IP. Blocked transaction.', severity: 'ERROR' }
              ].map((log, index) => (
                <div key={index} className="p-2 border-l-2 border-neutral-dark bg-neutral-light/50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-neutral-muted">[{log.time}]</span>{' '}
                    <span className="font-bold text-neutral-dark">{log.type}</span>{' '}
                    <span className="text-neutral-body">{log.desc}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    log.severity === 'INFO' ? 'bg-success/20 text-success' : log.severity === 'WARNING' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
