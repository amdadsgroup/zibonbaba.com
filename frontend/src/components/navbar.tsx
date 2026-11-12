'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import {
  Search, ShoppingCart, Heart, User, LogOut,
  Package, LayoutDashboard, Settings, X, Eye, EyeOff,
  ChevronRight, ShieldCheck, AlertCircle, Loader2,
  Bell, Check, Mic, ChevronDown, Globe, Sparkles, Store, Menu, HelpCircle, RefreshCw, CreditCard, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { translations } from '@/utils/translations';
import { getDashboardForRole } from '@/utils/roleRoutes';

// ─────────────────────────────────────────────
// Auth Modal Component
// ─────────────────────────────────────────────
function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, language } = useStore();
  const t = translations[language];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError(language === 'en' ? 'Please fill in all fields.' : 'সব তথ্য পূরণ করুন।');
      return;
    }
    setError('');
    setLoading(true);
    const ok = await login(loginEmail, loginPassword);
    setLoading(false);
    if (ok) {
      let userRole = '';
      if (typeof window !== 'undefined') {
        const uStr = localStorage.getItem('zibonbaba_user');
        if (uStr) {
          try { userRole = JSON.parse(uStr).role; } catch (_) {}
        }
      }
      const targetPath = getDashboardForRole(userRole || useStore.getState().role);
      router.push(targetPath);
      onClose();
    } else {
      setError(language === 'en' ? 'Invalid credentials or account is locked. Please try again.' : 'ভুল ইমেইল বা পাসওয়ার্ড। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setError(language === 'en' ? 'Name, email and password are required.' : 'নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।');
      return;
    }
    if (regPassword.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          fullName: regName,
          phone: regPhone,
          role: 'CUSTOMER'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (language === 'en' ? 'Registration failed. Try again.' : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।'));
      } else {
        setSuccess(language === 'en' ? 'Customer account created! Signing you in…' : 'ক্রেতা অ্যাকাউন্ট তৈরি হয়েছে! লগইন করা হচ্ছে...');
        const loginOk = await login(regEmail, regPassword);
        if (loginOk) {
          let userRole = '';
          if (typeof window !== 'undefined') {
            const uStr = localStorage.getItem('zibonbaba_user');
            if (uStr) {
              try { userRole = JSON.parse(uStr).role; } catch (_) {}
            }
          }
          const targetPath = getDashboardForRole(userRole || useStore.getState().role);
          router.push(targetPath);
        }
        onClose();
      }
    } catch {
      setError(language === 'en' ? 'Connection error. Please try again.' : 'সার্ভার সংযোগ সমস্যা। পুনরায় চেষ্টা করুন।');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-slate-900 px-8 pt-7 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
              Z
            </div>
            <div>
              <p className="font-extrabold text-white text-lg leading-tight">
                Zibon<span className="text-amber-500">baba</span>
              </p>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Customer Account' : 'ক্রেতা একাউন্ট'}
              </p>
            </div>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-1 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${tab === 'login' ? 'bg-amber-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
            >
              {language === 'en' ? 'Customer Sign In' : 'ক্রেতা লগইন'}
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${tab === 'register' ? 'bg-amber-500 text-slate-950 shadow' : 'text-white/70 hover:text-white'}`}
            >
              {language === 'en' ? 'Create Customer Account' : 'নতুন একাউন্ট খুলুন'}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-xs font-medium mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-xs font-medium mb-4">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <Link href="/forgot-password" onClick={onClose} className="text-[11px] text-amber-600 hover:underline font-bold">
                    {t.forgotPassword}
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {loading ? (language === 'en' ? 'Signing in…' : 'লগইন হচ্ছে...') : (language === 'en' ? 'Sign In as Customer' : 'ক্রেতা হিসেবে লগইন করুন')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.fullName}</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.emailLabel}</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.passwordLabel}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={language === 'en' ? 'Min 6 characters' : 'কমপক্ষে ৬ অক্ষরের'}
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">{t.phone} ({language === 'en' ? 'optional' : 'ঐচ্ছিক'})</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm py-3 rounded-xl transition-all disabled:opacity-60 shadow-sm mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {loading ? (language === 'en' ? 'Creating account…' : 'অ্যাকাউন্ট তৈরি হচ্ছে…') : (language === 'en' ? 'Create Customer Account' : 'ক্রেতা একাউন্ট খুলুন')}
              </button>
            </form>
          )}
        </div>

        {/* Merchant / Seller Redirect Footer */}
        <div className="px-8 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold">
            {language === 'en' ? 'Want to sell on Zibonbaba?' : 'পণ্য বিক্রি করতে চান?'}
          </span>
          <Link
            href="/seller/login"
            onClick={onClose}
            className="text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1 hover:underline"
          >
            <span>{language === 'en' ? 'Seller Center' : 'সেলার সেন্টার'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Profile Dropdown Component
// ─────────────────────────────────────────────
function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { username, userEmail, role, logout, language } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  let rawRole: string = role;
  let userObject: any = null;
  if (typeof window !== 'undefined') {
    const uStr = localStorage.getItem('zibonbaba_user');
    if (uStr) {
      try {
        userObject = JSON.parse(uStr);
        rawRole = userObject.role || role;
      } catch (_) {}
    }
  }

  const roleLabel =
    rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN' ? (language === 'en' ? 'Platform Administrator' : 'প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর') :
    rawRole === 'VENDOR_ADMIN' || rawRole === 'VENDOR_STAFF' || role === 'vendor' ? (language === 'en' ? 'Vendor / Merchant' : 'বিক্রেতা / মার্চেন্ট') :
    rawRole === 'RESELLER' || role === 'reseller' ? (language === 'en' ? 'Verified Reseller' : 'ভেরিফাইড রিসেলার') :
    rawRole === 'DELIVERY_MAN' || role === 'deliveryman' ? (language === 'en' ? 'Delivery Agent' : 'ডেলিভারি এজেন্ট') :
    (language === 'en' ? 'Customer Account' : 'কাস্টমার অ্যাকাউন্ট');

  const roleColor =
    rawRole === 'SUPER_ADMIN' || rawRole === 'ADMIN' ? 'text-red-700 bg-red-100 border-red-200' :
    rawRole === 'VENDOR_ADMIN' || rawRole === 'VENDOR_STAFF' || role === 'vendor' ? 'text-emerald-700 bg-emerald-100 border-emerald-200' :
    'text-amber-700 bg-amber-100 border-amber-200';

  const dashLink = getDashboardForRole(rawRole);
  const displayName = username || userObject?.fullName || userObject?.email || 'User';
  const displayEmail = userEmail || userObject?.email || '';

  const handleSignOut = async () => {
    await logout();
    onClose();
    window.location.href = '/login';
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2.5 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-slide-up"
    >
      {/* Profile Header */}
      <div className="bg-slate-900 px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-base font-black text-slate-950 uppercase shadow-md shrink-0">
            {displayName.charAt(0)}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-white font-extrabold text-sm truncate">{displayName}</p>
            {displayEmail && <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>}
            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 border ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-2 divide-y divide-slate-50 text-xs">
        <div className="py-1">
          <Link
            href="/dashboard?tab=profile"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            <User className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{language === 'en' ? 'My Profile & Account' : 'আমার প্রোফাইল ও অ্যাকাউন্ট'}</span>
          </Link>
          <Link
            href="/dashboard?tab=orders"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            <Package className="w-4 h-4 text-blue-500 shrink-0" />
            <span>{language === 'en' ? 'My Orders & Tracking' : 'আমার অর্ডার ও ট্র্যাকিং'}</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            <Heart className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{language === 'en' ? 'Saved Wishlist' : 'সংরক্ষিত পণ্যসমূহ'}</span>
          </Link>
          <Link
            href="/dashboard?tab=overview"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{language === 'en' ? 'Zibonbaba Wallet & Escrow' : 'জীবনবাবা ওয়ালেট ও এসক্রো'}</span>
          </Link>
        </div>

        {/* Staff / Admin / Vendor Hub */}
        {(rawRole !== 'CUSTOMER' && rawRole !== 'customer') && (
          <div className="py-1 bg-amber-50/50">
            <Link
              href={dashLink}
              onClick={onClose}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-amber-100/50 text-amber-900 font-black transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{language === 'en' ? 'Open Management Portal' : 'ম্যানেজমেন্ট পোর্টাল খুলুন'}</span>
            </Link>
          </div>
        )}

        <div className="py-1">
          <Link
            href="/dashboard?tab=profile"
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50 text-slate-600 font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{language === 'en' ? 'Customer Support & Tickets' : 'কাস্টমার সাপোর্ট ও টিকিট'}</span>
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="border-t border-slate-100 p-2 bg-slate-50/70">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'en' ? 'Sign Out of Account' : 'অ্যাকাউন্ট থেকে লগআউট'}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Notifications Dropdown Component
// ─────────────────────────────────────────────
function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const unreadList = notifications.filter((n: any) => !n.isRead);

  const getNotificationColor = (type: string) => {
    if (type === 'SUCCESS') return 'text-green-600 bg-green-50 border-green-200';
    if (type === 'WARNING') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (type === 'ERROR') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-megamenu border border-neutral-light overflow-hidden z-[100] animate-slide-up"
    >
      <div className="bg-neutral-dark px-5 py-4 flex items-center justify-between text-white border-b border-white/10">
        <h4 className="font-extrabold text-sm flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-primary" /> Notifications ({unreadList.length})
        </h4>
        {unreadList.length > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead()}
            className="text-[10px] text-primary hover:text-primary-dark font-extrabold transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-light scrollbar-none">
        {notifications.length === 0 ? (
          <div className="py-8 px-5 text-center text-xs text-neutral-muted">
            No system notifications yet.
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 hover:bg-neutral-light transition-colors text-left cursor-pointer flex gap-3 ${!n.isRead ? 'bg-neutral-light/30' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-neutral-dark truncate">{n.title}</p>
                <p className="text-[11px] text-neutral-body mt-1 leading-snug break-words">{n.body}</p>
                <span className="text-[9px] text-neutral-muted mt-1.5 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-neutral-light bg-neutral-light/20 p-2.5 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs text-amber-500 hover:text-amber-600 font-extrabold flex items-center justify-center gap-1"
        >
          View Notification Center →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────
export default function Navbar() {
  const {
    cart,
    wishlist,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    username,
    userEmail,
    isLoggedIn,
    role,
    notifications,
    fetchNotifications,
    language,
    setLanguage,
    syncAuthFromStorage
  } = useStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    syncAuthFromStorage();
  }, [syncAuthFromStorage]);

  const t = translations[language];

  const getCategoryTranslation = (cat: string) => {
    if (language === 'en') return cat;
    if (cat === 'All') return 'সব পণ্য';
    if (cat === 'Electronics') return 'ইলেকট্রনিক্স';
    if (cat === 'Home & Kitchen') return 'হোম ও কিচেন';
    if (cat === 'Apparel') return 'পোশাক';
    return cat;
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notifications every 10 seconds to maintain real-time sync across devices
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, fetchNotifications]);

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);

  const navLinks: { label: string; href: string; roles: string[]; color: string }[] = [
    { label: language === 'en' ? 'My Dashboard' : 'আমার ড্যাশবোর্ড',    href: '/dashboard', roles: ['customer'],        color: 'bg-amber-500' },
    { label: language === 'en' ? 'Vendor Dashboard' : 'বিক্রেতা ড্যাশবোর্ড',href: '/vendor',    roles: ['vendor'],          color: 'bg-emerald-500' },
    { label: language === 'en' ? 'SaaS ERP Modules' : 'ইআরপি মডিউলসমূহ',href: '/erp',       roles: ['vendor'],          color: 'bg-emerald-500' },
    { label: language === 'en' ? 'POS Terminal' : 'পিওএস টার্মিনাল',    href: '/erp/pos',   roles: ['vendor'],          color: 'bg-amber-500' },
    { label: language === 'en' ? 'Admin Console' : 'অ্যাডমিন কনসোল',   href: '/admin',     roles: ['admin'],           color: 'bg-red-500 animate-pulse' },
  ];

  const aiSuggestions = [
    { text: 'Samsung Galaxy S25 Ultra', tag: 'Trending' },
    { text: 'Nike Air Max Running Shoes', tag: 'New' },
    { text: 'Induction Cooktop Stove', tag: 'Popular' },
    { text: 'Wireless Noise Cancelling Earbuds', tag: 'Deal' },
    { text: 'Pure Organic Honey (500g)', tag: 'Grocery' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/90 backdrop-blur-lg shadow-sm">
        {/* Top Utility Bar */}
        <div className="w-full bg-[#0f172a] text-slate-300 py-1.5 px-3 sm:px-4 text-xs font-semibold flex items-center justify-between border-b border-slate-800 text-nowrap relative z-50">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Always-Visible Segmented Language Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shadow-inner shrink-0">
              <button
                type="button"
                id="lang-btn-en"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold transition-all select-none cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Switch platform language to English"
              >
                <Globe className={`w-3.5 h-3.5 ${language === 'en' ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>English</span>
              </button>
              <button
                type="button"
                id="lang-btn-bn"
                onClick={() => setLanguage('bn')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold transition-all select-none cursor-pointer ${
                  language === 'bn'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="প্ল্যাটফর্মের ভাষা বাংলায় পরিবর্তন করুন"
              >
                <span>বাংলা</span>
              </button>
            </div>
            {/* Seller Center Menu with Direct Access & Popover */}
            <div className="relative group flex items-center">
              <Link
                href={isLoggedIn && (role === 'vendor' || role === 'admin' || role === 'superadmin') ? '/seller' : '/seller/login'}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5 py-0.5 font-bold"
              >
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'en' ? 'Seller Center' : 'সেলার সেন্টার'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
              </Link>

              {/* Seller Quick Action Popover */}
              <div className="absolute top-full left-0 mt-1 bg-slate-900 text-white shadow-2xl border border-slate-700/80 rounded-xl py-2 w-56 hidden group-hover:block z-50 animate-slide-up">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                    {language === 'en' ? 'Merchant Portal' : 'মার্চেন্ট পোর্টাল'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {language === 'en' ? 'Manage your shop & sales' : 'আপনার দোকান ও পণ্য পরিচালনা করুন'}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/seller/login"
                    className="w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-slate-800 hover:text-amber-400 transition-colors flex items-center justify-between"
                  >
                    <span>{language === 'en' ? 'Seller Login' : 'সেলার লগইন'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/seller/register"
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors flex items-center justify-between"
                  >
                    <span>{language === 'en' ? 'Register / Open Store' : 'দোকান রেজিস্টার করুন'}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">NEW</span>
                  </Link>
                  <Link
                    href="/seller"
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>{language === 'en' ? 'Seller Dashboard' : 'সেলার ড্যাশবোর্ড'}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-3">
            <span className="text-amber-500 font-extrabold hidden sm:inline">{language === 'en' ? 'Helpline: +880 9612-ZIBONBABA' : 'হেল্পলাইন: +৮৮০ ৯৬১২-জীবনবাবা'}</span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Compare List' : 'তুলনা তালিকা'}</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/wishlist" className="hover:text-white transition-colors flex items-center gap-1 relative">
              <Heart className="w-3.5 h-3.5 text-red-400" />
              <span>{language === 'en' ? 'Wishlist' : 'উইশলিস্ট'} ({wishlist.length})</span>
            </Link>
          </div>
        </div>

        {/* Main Header Brand & Search */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between gap-4 lg:gap-6 relative">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-extrabold text-white text-xl shadow-md transition-transform duration-200 group-hover:scale-105">
              Z
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">
              Zibon<span className="text-amber-500">baba</span>
            </span>
          </Link>

          {/* AI Search Bar Container */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:border-amber-500 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
              <input
                type="text"
                placeholder={language === 'en' ? 'Search for products, brands and more...' : 'পণ্য, ব্র্যান্ড এবং আরও অনেক কিছু খুঁজুন...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="flex-grow bg-transparent text-sm text-slate-800 py-3 px-4 outline-none placeholder:text-slate-400 font-semibold"
              />
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={() => {
                  setListening(true);
                  setTimeout(() => setListening(false), 3000);
                }}
                className={`p-2 hover:bg-slate-100 text-slate-400 hover:text-amber-500 rounded-full transition-all mr-1 ${listening ? 'animate-bounce text-red-500' : ''}`}
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 py-3.5 flex items-center justify-center transition-colors shadow-sm">
                <Search className="w-4 h-4 mr-1.5" />
                <span>{language === 'en' ? 'Search' : 'খুঁজুন'}</span>
              </button>
            </div>

            {/* AI Live Search Suggestions dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white shadow-2xl border border-slate-100 rounded-2xl p-4 z-[100] animate-slide-up">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>AI Live Smart Suggestions</span>
                </div>
                <div className="space-y-1">
                  {aiSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onMouseDown={() => setSearchQuery(item.text)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-amber-50/50 hover:text-amber-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>{item.text}</span>
                      </div>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        item.tag === 'Trending' ? 'bg-red-50 text-red-600' :
                        item.tag === 'New' ? 'bg-blue-50 text-blue-600' :
                        item.tag === 'Popular' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Notifications Bell */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsDropdown((v) => !v)}
                  className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 hover:text-amber-500 active:scale-95"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
                {showNotificationsDropdown && (
                  <NotificationsDropdown onClose={() => setShowNotificationsDropdown(false)} />
                )}
              </div>
            )}

            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 hover:text-amber-500 flex items-center gap-1"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Auth */}
            <div className="relative border-l border-slate-200 pl-4">
              {isMounted && isLoggedIn ? (
                <button
                  id="profile-btn"
                  onClick={() => setShowProfileDropdown((v) => !v)}
                  className="flex items-center gap-2 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl transition-all group border border-slate-200/60 shadow-xs cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-xs font-black text-slate-950 uppercase shadow-xs">
                    {(username || 'U').charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-black text-slate-800 leading-tight max-w-[110px] truncate">{username || 'My Account'}</p>
                    <p className="text-[9px] text-amber-600 capitalize font-extrabold">{role || 'Customer'}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  id="signin-btn"
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-amber-600 hover:bg-amber-50/70 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer border border-slate-200/80 hover:border-amber-400 shadow-xs"
                >
                  <User className="w-4.5 h-4.5 text-amber-500" />
                  <span className="whitespace-nowrap">{language === 'en' ? 'Login or Register' : 'লগইন বা রেজিস্টার'}</span>
                </button>
              )}
              {showProfileDropdown && isLoggedIn && (
                <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
              )}
            </div>
          </div>
        </div>

        {/* Subheader Mega Menu & Links */}
        <div className="bg-slate-50 border-t border-slate-200/50 overflow-x-auto no-scrollbar">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex items-center justify-between py-2 relative gap-4 min-w-max md:min-w-0">
            <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto no-scrollbar">
              {/* All Categories Dropdown Button */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                  onBlur={() => setTimeout(() => setShowCategoriesDropdown(false), 200)}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 lg:px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
                >
                  <Menu className="w-4 h-4" />
                  <span>{language === 'en' ? 'All Categories' : 'সব ক্যাটাগরি'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Categories Dropdown Popover */}
                {showCategoriesDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-white shadow-2xl border border-slate-100 rounded-2xl py-2 z-[100] animate-slide-up">
                    {['All', 'Electronics', 'Home & Kitchen', 'Apparel', 'Grocery', 'Beauty', 'Health', 'Sports', 'Automotive', 'Baby', 'Books'].map((cat) => (
                      <button
                        key={cat}
                        onMouseDown={() => {
                          let backendCat = cat;
                          if (cat === 'Grocery' || cat === 'Beauty' || cat === 'Health' || cat === 'Books') backendCat = 'Home & Kitchen';
                          if (cat === 'Sports' || cat === 'Fashion') backendCat = 'Apparel';
                          if (cat === 'Automotive' || cat === 'Baby') backendCat = 'Electronics';
                          setSelectedCategory(backendCat);
                          const el = document.getElementById('shop-catalog');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-between"
                      >
                        <span>{getCategoryTranslation(cat)}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Horizontal Navigation Links */}
              <nav className="flex items-center gap-4 lg:gap-6 text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
                <Link href="/" className="hover:text-amber-500 transition-colors whitespace-nowrap">
                  {language === 'en' ? 'Home' : 'হোম'}
                </Link>
                <Link href="/#shop-catalog" className="hover:text-amber-500 transition-colors whitespace-nowrap">
                  {language === 'en' ? 'All Brands' : 'সব ব্র্যান্ড'}
                </Link>
                <Link href="/#flash-sale" className="hover:text-amber-500 transition-colors text-red-500 animate-pulse flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'en' ? 'Offers' : 'অফারসমূহ'}</span>
                </Link>
                <Link href="/#vendors" className="hover:text-amber-500 transition-colors whitespace-nowrap">
                  {language === 'en' ? 'All Shops' : 'সব শপ'}
                </Link>
                <button
                  onClick={() => {
                    setSelectedCategory('Apparel');
                    const el = document.getElementById('shop-catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-500 transition-colors uppercase text-left whitespace-nowrap cursor-pointer"
                >
                  {language === 'en' ? 'Men Clothing & Fashion' : 'পুরুষের পোশাক'}
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory('Electronics');
                    const el = document.getElementById('shop-catalog');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-500 transition-colors uppercase text-left whitespace-nowrap cursor-pointer"
                >
                  {language === 'en' ? 'Computer & Accessories' : 'কম্পিউটার ও এক্সেসরিজ'}
                </button>
              </nav>
            </div>

            {/* Role Desk Links */}
            {isLoggedIn && (
              <div className="flex gap-2 shrink-0">
                {navLinks
                  .filter((link) => link.roles.includes(role))
                  .map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className={`text-[9.5px] font-black text-white px-3 py-1.5 rounded-lg shadow-sm tracking-wider uppercase transition-transform active:scale-95 whitespace-nowrap ${link.color}`}
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Listening Voice Search Popup */}
      {listening && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 animate-ping opacity-60"></div>
              <Mic className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Listening...</h3>
            <p className="text-xs text-slate-500">Speak the name of a product, category, or brand.</p>
            <button
              onClick={() => setListening(false)}
              className="mt-6 text-xs text-slate-400 hover:text-slate-600 font-bold underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
