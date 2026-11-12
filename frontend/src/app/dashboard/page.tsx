'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDashboard from '@/components/mobile-dashboard';
import {
  Package,
  Heart,
  User,
  Clock,
  Star,
  Truck,
  CheckCircle,
  RefreshCcw,
  ShoppingBag,
  Settings,
  Bell,
  ChevronRight,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

type DashTab = 'overview' | 'orders' | 'wishlist' | 'profile';

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as DashTab | null;

  const { orders, wishlist, products, toggleWishlist, addToCart, username, isLoggedIn, token, logout, language } = useStore();
  const { isMobile, isMounted } = useIsMobile();

  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam && ['overview', 'orders', 'wishlist', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Live profile & address state
  const [profileName, setProfileName] = useState(username || '');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddr, setProfileAddr] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const getHeaders = useCallback(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    return {
      'Content-Type': 'application/json',
      'Authorization': activeToken ? `Bearer ${activeToken}` : ''
    };
  }, [token]);

  // Load real profile details from API
  useEffect(() => {
    if (!isLoggedIn) return;

    fetch('/api/me/profile', { headers: getHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) {
          const u = data.user;
          const name = u.profile?.fullName || username || u.email?.split('@')[0] || 'User';
          setProfileName(name);
          setProfileEmail(u.email || '');
          setProfilePhone(u.phone || '');
          if (u.addresses && u.addresses.length > 0) {
            setAddresses(u.addresses);
            setProfileAddr(u.addresses[0].addressLine1 || '');
          }
        }
      })
      .catch(() => {});

    fetch('/api/me/addresses', { headers: getHeaders() })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.addresses) {
          setAddresses(data.addresses);
          if (data.addresses.length > 0 && !profileAddr) {
            setProfileAddr(data.addresses[0].addressLine1 || '');
          }
        }
      })
      .catch(() => {});
  }, [isLoggedIn, getHeaders, username]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileError('');
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          fullName: profileName,
          phone: profilePhone
        })
      });
      if (res.ok) {
        setProfileSaved(true);
        useStore.setState({ username: profileName });
        setTimeout(() => setProfileSaved(false), 3500);
      } else {
        const err = await res.json();
        setProfileError(err.error || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Network error while saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // If mobile view is active and mounted, render mobile dashboard component
  if (isMobile && isMounted) {
    return <MobileDashboard />;
  }

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-300',
    DISPATCHED: 'bg-orange-100 text-orange-700 border-orange-300',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-300',
    DELIVERED: 'bg-green-100 text-green-700 border-green-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  };

  const displayName = profileName || username || 'My Account';

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-light pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-xl font-black text-slate-950 uppercase shadow-sm">
            {displayName.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-dark">{displayName}</h1>
            <p className="text-xs text-neutral-muted">
              {isLoggedIn ? 'Verified Customer Account · Zibonbaba Marketplace' : 'Guest Account · Browse or sign in for member perks'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => logout()}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/customer/login"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-neutral-light mb-8 overflow-x-auto">
        {([
          { id: 'overview', label: 'Overview', icon: Package },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'profile', label: 'Profile & Settings', icon: Settings },
        ] as { id: DashTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              router.replace(`/dashboard?tab=${id}`, { scroll: false });
            }}
            className={`flex items-center gap-1.5 text-xs font-bold py-3 px-5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === id
                ? 'border-amber-500 text-amber-600 font-extrabold'
                : 'border-transparent text-neutral-muted hover:text-neutral-dark'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'wishlist' && wishlist.length > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ml-1">
                {wishlist.length}
              </span>
            )}
            {id === 'orders' && orders.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center justify-center ml-1">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- OVERVIEW TAB ---- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-slide-up">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-amber-600' },
              { label: 'Wishlist Items', value: wishlist.length, icon: Heart, color: 'text-rose-500' },
              { label: 'Total Spent', value: `৳${totalSpent.toFixed(2)}`, icon: CreditCard, color: 'text-emerald-600' },
              { label: 'Active Shipments', value: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length, icon: Truck, color: 'text-blue-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-neutral-light shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-neutral-muted font-black uppercase tracking-wider">{stat.label}</p>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-black text-neutral-dark">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-light pb-3">
              <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider">Recent Orders</h2>
              <button 
                onClick={() => {
                  setActiveTab('orders');
                  router.replace('/dashboard?tab=orders', { scroll: false });
                }} 
                className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-neutral-muted text-xs">
                No orders placed yet. Explore products to place your first order.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3.5 bg-neutral-light/50 border border-neutral-light rounded-xl text-xs">
                    <div>
                      <span className="font-mono font-black text-neutral-dark">{order.id}</span>
                      <p className="text-[10px] text-neutral-muted mt-0.5">{order.date} · {order.items.length} item(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-neutral-dark">৳{order.total.toFixed(2)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {order.status}
                      </span>
                      <Link href={`/tracking?orderId=${order.id}`} className="text-amber-600 hover:underline font-black flex items-center gap-0.5">
                        Track <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Order Tracking Node for the most recent active order */}
          {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-xs">
              <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-6">
                Active Shipment Milestone
              </h2>
              {(() => {
                const activeOrder = orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
                if (!activeOrder) return null;
                const statusLevels = ['PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED'];
                const activeIndex = statusLevels.indexOf(activeOrder.status);
                return (
                  <div>
                    <p className="text-[10px] text-neutral-muted font-bold mb-4">Order: <span className="font-mono font-black text-neutral-dark">{activeOrder.id}</span></p>
                    <div className="relative flex justify-between items-center px-4">
                      <div className="absolute top-1/2 left-8 right-8 h-1 bg-neutral-light -translate-y-1/2 -z-10"></div>
                      <div
                        className="absolute top-1/2 left-8 h-1 bg-amber-500 -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${Math.max(0, (activeIndex / (statusLevels.length - 1)) * 100)}%` }}
                      ></div>
                      {statusLevels.map((lvl, index) => {
                        const isCompleted = index < activeIndex;
                        const isActive = index === activeIndex;
                        return (
                          <div key={lvl} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${isCompleted ? 'bg-amber-500 border-amber-500 text-slate-950' : isActive ? 'bg-white border-amber-500 text-amber-600 scale-110 shadow-sm' : 'bg-neutral-light border-neutral-light text-neutral-muted'}`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={`text-[9px] font-black uppercase ${isActive ? 'text-amber-600' : 'text-neutral-muted'}`}>{lvl}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ---- ORDERS TAB ---- */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-sm font-black text-neutral-dark mb-4">All Purchase Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-light rounded-2xl shadow-xs">
              <ShoppingBag className="w-10 h-10 text-neutral-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-dark">No orders placed yet</p>
              <p className="text-xs text-neutral-muted mt-1">Explore the marketplace to place your first order.</p>
              <Link href="/" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl mt-4 transition-colors shadow-sm">
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-neutral-light shadow-xs space-y-4">
                {/* Order header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-light pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-neutral-dark">{order.id}</span>
                    <p className="text-[10px] text-neutral-muted mt-0.5">Placed: {order.date} · Source: {order.source}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-black text-neutral-dark">৳{order.total.toFixed(2)}</span>
                    <Link href={`/tracking?orderId=${order.id}`} className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-800 transition-colors">
                      <Truck className="w-3 h-3" /> Track Shipment
                    </Link>
                  </div>
                </div>
                {/* Order items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-light shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-grow">
                        <Link href={`/product/${item.product.id}`} className="font-bold text-neutral-dark hover:text-amber-600 transition-colors line-clamp-1">
                          {item.product.name}
                        </Link>
                        <p className="text-[10px] text-neutral-muted">Qty: {item.quantity} · SKU: {item.product.sku}</p>
                      </div>
                      <span className="font-black text-neutral-dark">৳{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- WISHLIST TAB ---- */}
      {activeTab === 'wishlist' && (
        <div className="animate-slide-up">
          <h2 className="text-sm font-black text-neutral-dark mb-6">My Saved Wishlist ({wishlistProducts.length} items)</h2>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-light rounded-2xl shadow-xs">
              <Heart className="w-10 h-10 text-neutral-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-dark">Your wishlist is empty</p>
              <p className="text-xs text-neutral-muted mt-1">Browse products and save items you want to buy later.</p>
              <Link href="/" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl mt-4 transition-colors shadow-sm">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-neutral-light shadow-xs overflow-hidden hover:border-amber-400 transition-all group">
                  <Link href={`/product/${p.id}`} className="relative aspect-video bg-neutral-light overflow-hidden block">
                    <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[9px] text-neutral-muted font-black uppercase">{p.category} · {p.vendor}</p>
                      <Link href={`/product/${p.id}`} className="hover:text-amber-600 transition-colors block">
                        <h3 className="text-xs font-bold text-neutral-dark mt-1 line-clamp-1">{p.name}</h3>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-neutral-dark">৳{p.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3.5 h-3.5 text-warning fill-current" />
                        <span className="font-black">{p.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- PROFILE TAB ---- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Profile form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-light shadow-xs space-y-5">
            <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">
              Personal Profile & Contact
            </h2>
            {profileSaved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Profile details saved successfully!
              </div>
            )}
            {profileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2 animate-fade-in font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" /> {profileError}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-neutral-light border border-neutral-light rounded-xl p-3 text-xs text-neutral-dark outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={isLoggedIn}
                    className="w-full bg-neutral-light border border-neutral-light rounded-xl p-3 text-xs text-neutral-dark outline-none focus:border-amber-500 disabled:opacity-70 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full bg-neutral-light border border-neutral-light rounded-xl p-3 text-xs text-neutral-dark outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Primary Address</label>
                  <input
                    type="text"
                    value={profileAddr}
                    onChange={e => setProfileAddr(e.target.value)}
                    placeholder="House, Road, City, District"
                    className="w-full bg-neutral-light border border-neutral-light rounded-xl p-3 text-xs text-neutral-dark outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Account security panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-xs space-y-4">
              <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">Account Security</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-xl">
                  <span className="font-bold text-neutral-dark">Password</span>
                  <Link href="/forgot-password" className="text-amber-600 font-bold hover:underline">Change</Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-xl">
                  <span className="font-bold text-neutral-dark">Account Status</span>
                  <span className="text-emerald-600 font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active & Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-xl">
                  <span className="font-bold text-neutral-dark">Role Tier</span>
                  <span className="text-neutral-dark font-black uppercase text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    Customer
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-xs space-y-4">
              <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">Notifications</h2>
              <div className="space-y-3 text-xs">
                {['Order updates via SMS', 'Promotional deals', 'Live tracking alerts'].map((item, i) => (
                  <label key={i} className="flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-neutral-dark">{item}</span>
                    <div className="relative">
                      <input type="checkbox" defaultChecked={i !== 1} className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-light peer-checked:bg-amber-500 rounded-full transition-colors cursor-pointer"></div>
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-xs"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CustomerDashboardContent />
    </Suspense>
  );
}
