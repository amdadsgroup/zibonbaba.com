'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Store,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getDashboardForRole } from '@/utils/roleRoutes';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
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
      setError('Please enter your email address and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Clear old session credentials to prevent stale token pollution
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
            try {
              userRole = JSON.parse(uStr).role;
            } catch (_) {}
          }
        }

        const normalized = userRole ? userRole.trim().toUpperCase() : 'CUSTOMER';

        // Non-customer roles redirect to their specific dashboard
        if (normalized !== 'CUSTOMER') {
          const targetPath = getDashboardForRole(normalized);
          router.push(targetPath);
          return;
        }

        // Customer destination
        if (redirectParam && redirectParam.startsWith('/')) {
          router.push(redirectParam);
        } else {
          router.push('/');
        }
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } catch {
      setError('An error occurred during sign in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-10 relative z-10">
      {/* Branding Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-glow mb-4 hover:scale-105 transition-transform">
          <span className="text-3xl font-black text-gray-950">Z</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-2">
          <Sparkles size={13} /> Customer Portal
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to track orders, wishlist & loyalty rewards</p>
      </div>

      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3.5 mb-5 text-xs sm:text-sm animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="customer-email" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="customer-password" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="customer-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label htmlFor="customer-remember" className="flex items-center gap-2 cursor-pointer text-gray-400 select-none">
              <div className="relative">
                <input
                  id="customer-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  {rememberMe && <CheckCircle2 size={11} className="text-gray-950" />}
                </div>
              </div>
              <span>Remember me</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-primary hover:text-yellow-300 font-semibold transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            id="customer-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-black py-3.5 rounded-xl transition-all shadow-glow hover:shadow-[0_0_25px_rgba(255,193,7,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-[11px] uppercase tracking-widest font-semibold">or sign in with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Login Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl py-2.5 text-xs sm:text-sm font-medium transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl py-2.5 text-xs sm:text-sm font-medium transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>

        {/* Customer Register Link */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-3">
          <p className="text-xs sm:text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/customer/register"
              className="text-primary hover:text-yellow-300 font-bold transition-colors"
            >
              Create Customer Account
            </Link>
          </p>

          {/* Seller Portal Switch Link */}
          <div className="pt-2">
            <Link
              href="/seller/login"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Store size={14} className="text-amber-400" />
              <span>Are you a merchant? Go to <strong className="text-gray-300">Seller Center</strong></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-6 text-gray-500 text-xs">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-green-400" />
          <span>256-Bit SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShoppingBag size={14} className="text-primary" />
          <span>Verified Marketplace</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 text-white">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        aria-label="Back to Marketplace"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Ambient Lighting Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      </div>

      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
