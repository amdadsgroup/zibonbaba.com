'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  Search, Bell, ShoppingCart, ArrowLeft, X, HelpCircle, Globe, User,
  Menu, Sparkles, Store, Heart, Package, Phone, ChevronRight, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileHeader() {
  const {
    cart,
    wishlist,
    mobileTab,
    setMobileTab,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    categories,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    language,
    setLanguage,
    isLoggedIn,
    username,
    role
  } = useStore();

  const pathname = usePathname();
  const router = useRouter();

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleLogoClick = () => {
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleCartClick = () => {
    setMobileTab('cart');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setShowSearchOverlay(false);
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleSuggestionClick = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
    setShowSearchOverlay(false);
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-light/70 shadow-sm h-14 flex items-center justify-between px-3 md:hidden">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDrawerMenu(true)}
            className="p-1.5 hover:bg-neutral-light rounded-lg text-slate-800 active:scale-90 transition-transform"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-neutral-dark text-lg shadow-sm">
              Z
            </div>
            <span className="font-extrabold text-base text-neutral-dark tracking-tight hidden xs:inline">
              Zibon<span className="text-primary-accent">baba</span>
            </span>
          </div>
        </div>

        {/* Search Box - triggers overlay */}
        <div 
          onClick={() => setShowSearchOverlay(true)}
          className="flex-grow mx-2 bg-neutral-light border border-neutral-light/80 rounded-lg flex items-center h-8 px-2.5 text-neutral-muted text-xs font-semibold cursor-pointer active:bg-neutral-muted/10 transition-colors"
        >
          <Search className="w-3.5 h-3.5 mr-1.5 shrink-0 text-neutral-muted" />
          <span className="line-clamp-1 text-[11px]">
            {searchQuery || (language === 'en' ? 'Search catalog, SKUs...' : 'পণ্য ও এসকেইউ খুঁজুন...')}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 hover:bg-neutral-light rounded-full transition-colors relative active:scale-90"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5 text-neutral-dark" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-error text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-neutral-light shadow-modal rounded-xl py-2.5 z-50 animate-slide-up">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-neutral-light/70 mb-1.5">
                  <span className="text-xs font-bold text-neutral-dark">Notifications</span>
                  <button 
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[9px] text-primary-dark font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {notifications.length === 0 ? (
                    <p className="text-center text-[10px] text-neutral-muted py-6">No new updates</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n.id)}
                        className={`px-4 py-2 hover:bg-neutral-light cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-dark truncate max-w-[150px]">{n.title}</span>
                          <span className="text-[8px] text-neutral-muted">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[9px] text-neutral-body mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-neutral-light mt-1.5 pt-2 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[9px] text-primary-dark font-extrabold block hover:underline"
                  >
                    Open Notification Center →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            onClick={handleCartClick}
            className={`p-1.5 rounded-full transition-colors relative active:scale-90 ${mobileTab === 'cart' ? 'bg-primary/20 text-primary-dark font-extrabold' : 'text-neutral-dark'}`}
            aria-label="Cart"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-primary-accent text-neutral-dark text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Profile / Sign In Link */}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-black text-slate-950 uppercase shadow-xs active:scale-90 transition-transform ml-0.5"
              title="My Account"
            >
              {(username || 'U').charAt(0)}
            </Link>
          ) : (
            <Link
              href="/customer/login"
              className="p-1.5 hover:bg-neutral-light rounded-full text-neutral-dark active:scale-90 transition-transform ml-0.5"
              title="Sign In"
            >
              <User className="w-4.5 h-4.5" />
            </Link>
          )}
        </div>
      </header>

      {/* SLIDE-OUT MOBILE HAMBURGER DRAWER */}
      {showDrawerMenu && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex md:hidden animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDrawerMenu(false); }}
        >
          <div className="w-[82%] max-w-[320px] bg-white h-full flex flex-col justify-between shadow-2xl animate-slide-up overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-black text-neutral-dark text-base shadow-sm">
                  Z
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight text-white leading-tight">
                    Zibon<span className="text-primary">baba</span>
                  </h3>
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block">
                    {language === 'en' ? 'Enterprise Marketplace' : 'এন্টারপ্রাইজ মার্কেটপ্লেস'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowDrawerMenu(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Links */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Language Selection System in Slidebar */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 shadow-xs">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-black">
                      {language === 'en' ? 'Language' : 'ভাষা'}
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {language === 'en' ? 'English (EN)' : 'বাংলা (BN)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
                      language === 'en'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
                      language === 'bn'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>বাংলা</span>
                    {language === 'bn' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                  </button>
                </div>
              </div>

              {/* User Greeting / Login Status */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setShowDrawerMenu(false)}
                    className="flex items-center justify-between w-full group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-black text-slate-950 uppercase">
                        {(username || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">{username || 'User'}</p>
                        <p className="text-[9px] text-amber-600 font-extrabold uppercase">{role || 'CUSTOMER'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-xs font-black text-slate-800">Welcome Guest</p>
                      <p className="text-[9px] text-slate-400">Sign in for member perks</p>
                    </div>
                    <Link
                      href="/customer/login"
                      onClick={() => setShowDrawerMenu(false)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Login / Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Main Destinations */}
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  {language === 'en' ? 'Explore Zibonbaba' : 'জীবনবাবা এক্সপ্লোর'}
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setMobileTab('home');
                      setShowDrawerMenu(false);
                      if (pathname !== '/') router.push('/');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span>{language === 'en' ? 'Marketplace Home' : 'মার্কেটপ্লেস হোম'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => {
                      setMobileTab('categories');
                      setShowDrawerMenu(false);
                      if (pathname !== '/') router.push('/');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span>{language === 'en' ? 'All Categories Catalog' : 'সব ক্যাটালগ ক্যাটাগরি'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <Link
                    href="/wishlist"
                    onClick={() => setShowDrawerMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>{language === 'en' ? 'Saved Wishlist' : 'উইশলিস্ট'}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">({wishlist.length})</span>
                  </Link>
                  <Link
                    href="/tracking"
                    onClick={() => setShowDrawerMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-blue-500" />
                      <span>{language === 'en' ? 'Track Live Order' : 'অর্ডার ট্র্যাক করুন'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Seller / Merchant Portal Access */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block mb-2 px-1">
                  {language === 'en' ? 'Seller Center & ERP' : 'সেলার সেন্টার ও ইআরপি'}
                </span>
                <div className="space-y-1">
                  <Link
                    href="/seller/login"
                    onClick={() => setShowDrawerMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-amber-50/60 hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'en' ? 'Seller Login' : 'সেলার লগইন'}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </Link>
                  <Link
                    href="/seller/register"
                    onClick={() => setShowDrawerMenu(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>{language === 'en' ? 'Open a Store / Register' : 'দোকান খুলুন / রেজিস্টার'}</span>
                    <span className="text-[8px] bg-amber-500/20 text-amber-700 font-black px-1.5 py-0.5 rounded">NEW</span>
                  </Link>
                </div>
              </div>

              {/* Helpline & Support */}
              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1.5 px-1">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>+880 9612-ZIBONBABA</span>
                </div>
                <p className="text-[10px] text-slate-400">Available 24/7 for friendly customer support</p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
              <p className="text-[10px] font-bold text-slate-400">© {new Date().getFullYear()} Zibonbaba.com</p>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN SEARCH OVERLAY */}
      {showSearchOverlay && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:hidden animate-fade-in">
          {/* Search Header Input */}
          <div className="h-14 border-b border-neutral-light flex items-center px-4 gap-3">
            <button 
              onClick={() => setShowSearchOverlay(false)}
              className="p-1 hover:bg-neutral-light rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-dark" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center bg-neutral-light rounded-md border border-neutral-light focus-within:border-primary-accent px-2">
              <input
                type="text"
                autoFocus
                placeholder="Search products, brands, categories..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-xs py-2 px-1 outline-none text-neutral-dark placeholder:text-neutral-muted font-medium"
              />
              {localSearch && (
                <button 
                  type="button" 
                  onClick={() => setLocalSearch('')}
                  className="p-0.5 hover:bg-neutral-muted/20 rounded-full"
                >
                  <X className="w-3.5 h-3.5 text-neutral-body" />
                </button>
              )}
            </form>
            <button 
              onClick={handleSearchSubmit}
              className="text-xs font-bold text-neutral-dark bg-primary hover:bg-primary-dark px-3 py-2 rounded-md transition-colors"
            >
              Search
            </button>
          </div>

          {/* Suggestions Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Popular Searches */}
            <div>
              <h3 className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider mb-2.5">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Wireless Headphones', 'Smart Mug', 'Sneakers', 'Laptop Stand', 'Leather Journal', 'Condenser Mic'].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleSuggestionClick(kw)}
                    className="text-xs bg-neutral-light hover:bg-primary/20 text-neutral-dark font-semibold px-3.5 py-1.5 rounded-full border border-neutral-light transition-all active:scale-95"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Categories Filter */}
            <div>
              <h3 className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider mb-2.5">Search by Category</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowSearchOverlay(false);
                      setMobileTab('home');
                      if (pathname !== '/') {
                        router.push('/');
                      }
                    }}
                    className="w-full flex items-center justify-between text-left py-2.5 border-b border-neutral-light text-xs font-semibold text-neutral-dark active:text-primary-dark"
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] text-neutral-muted">Browse →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Helper tips */}
            <div className="bg-neutral-light p-4 rounded-lg flex gap-3 items-start border border-neutral-light/50">
              <HelpCircle className="w-4 h-4 text-primary-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-neutral-dark">Search Smart Tip</p>
                <p className="text-[9px] text-neutral-body mt-0.5 leading-relaxed">
                  Type specific SKU codes (e.g. `HP-PRO-WHT` or `RUN-CNV-RED`) to find specific warehouse items immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
