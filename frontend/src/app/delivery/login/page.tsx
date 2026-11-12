'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  ShieldCheck, CheckCircle2, ArrowLeft, Bike, MapPin, DollarSign
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function DeliveryLoginPage() {
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
      setError('Please enter your delivery partner email/mobile and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
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
          setError('This account is registered as a Customer. Please sign in with a Delivery Partner account.');
          useStore.getState().logout();
          return;
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/delivery';
        } else {
          router.push('/delivery');
        }
      } else {
        setError('Invalid delivery partner credentials. Please verify and try again.');
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
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold tracking-wide uppercase flex items-center gap-1">
            <Bike size={14} /> Rider Portal
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Marketplace
          </Link>
          <Link href="/delivery/register" className="hidden sm:inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold px-3.5 py-1.5 rounded-lg transition-all">
            Join as Delivery Partner <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Left: Value Proposition */}
          <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4">
                <Bike size={14} /> Fast Deliveries & High Earnings
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Deliver Orders with Zibonbaba Express
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 leading-relaxed">
                Receive instant delivery tasks in your zone, navigate with 1-tap Google Maps, complete deliveries with secure customer OTP verification, and withdraw delivery fees directly.
              </p>

              <div className="space-y-3 mt-6">
                {[
                  { title: 'Flexible Delivery Shifts', desc: 'Toggle Online or Offline whenever you want.' },
                  { title: 'Fixed Delivery Fee per Order', desc: 'Earn guaranteed ৳120+ per completed package.' },
                  { title: 'Direct Mobile Payouts', desc: 'Withdraw earnings to bKash, Nagad or Bank.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-200">{item.title}</h4>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span>Driver Support Hotline:</span>
              <a href="tel:+8801700000000" className="text-primary hover:underline font-bold">
                +880 1700-000000
              </a>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-xl font-black text-white">Rider Login</h3>
              <p className="text-gray-400 text-xs mt-1">Sign in to your delivery partner console</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Email or Registered Phone
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@example.com / 017XXXXXXXX"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
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
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                  />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-primary hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-black py-3 px-4 rounded-xl text-sm transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in to Rider Console...
                  </>
                ) : (
                  <>
                    Sign In as Delivery Partner <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400">
              Want to join the fleet?{' '}
              <Link href="/delivery/register" className="text-primary hover:underline font-bold">
                Register as Delivery Partner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950 py-4 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Zibonbaba Express Logistics Network. All rights reserved.
      </footer>
    </div>
  );
}
