'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight,
  TrendingUp, ShieldCheck, Headphones, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SellerLoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your seller email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Clear old session credentials first to prevent cross-account contamination
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zibonbaba_token');
        localStorage.removeItem('zibonbaba_user');
        localStorage.removeItem('zibonbaba_role');
        sessionStorage.clear();
      }

      const success = await login(email, password);
      if (success) {
        let userRole = '';
        if (typeof window !== 'undefined') {
          const uStr = localStorage.getItem('zibonbaba_user');
          if (uStr) {
            try { userRole = JSON.parse(uStr).role; } catch (_) {}
          }
        }
        const normalized = userRole ? userRole.toUpperCase() : '';
        if (['CUSTOMER'].includes(normalized)) {
          setError('This account is registered as a Customer. Please sign in with a Seller account or register your store.');
          useStore.getState().logout();
          return;
        }

        router.push('/seller');
      } else {
        setError('Invalid seller credentials. Please verify your email and password.');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
              Z
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Zibon<span className="text-primary">baba</span>
            </span>
          </Link>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold tracking-wide uppercase">
            Seller Center
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Marketplace
          </Link>
          <Link href="/seller/register" className="hidden sm:inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold px-3.5 py-1.5 rounded-lg transition-all">
            Open Store <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Center Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {/* Background Glowing Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Hero Benefits */}
          <div className="hidden md:flex flex-col space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-yellow-400 w-fit">
              <TrendingUp size={14} /> Accelerate Your E-Commerce Growth
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
              Manage your products, orders & payouts in one powerful hub.
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Join thousands of merchants growing their business with Zibonbaba Seller Center. Enjoy dedicated order logistics, guaranteed payouts, and real-time inventory management.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Fast onboarding & store approval</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Competitive platform commission rates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Direct bank & mobile wallet settlement</span>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-3">
                <Store size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Sign in to Seller Center</h2>
              <p className="text-xs text-gray-400 mt-1">Enter your merchant credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-5 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Business Email or Phone
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@zibonbaba.com"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-white/5 border-white/20 text-primary focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Remember session</span>
                </label>
                <Link href="/seller/forgot-password" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-extrabold py-3 rounded-lg transition-all shadow-glow hover:shadow-[0_0_25px_rgba(255,193,7,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Seller Account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Seller Center</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <p className="text-xs text-gray-400 text-center">
                New merchant? Register your store to start selling:
              </p>
              <Link
                href="/seller/register"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs hover:border-white/20"
              >
                <Store size={14} className="text-amber-400" />
                <span>Create Seller Account / Register Store</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-950 py-4 px-6 text-center text-xs text-gray-500 z-10">
        <p>© {new Date().getFullYear()} Zibonbaba Seller Center. All Rights Reserved. Dedicated Merchant Portal.</p>
      </footer>
    </div>
  );
}
