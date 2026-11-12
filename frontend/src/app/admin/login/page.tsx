'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle,
  KeyRound, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getDashboardForRole, isNonCustomerRole } from '@/utils/roleRoutes';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter administrative credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        let userRole = '';
        if (typeof window !== 'undefined') {
          const uStr = localStorage.getItem('zibonbaba_user');
          if (uStr) {
            try { userRole = JSON.parse(uStr).role; } catch (_) {}
          }
        }
        if (!isNonCustomerRole(userRole)) {
          setError('Access Denied. You do not have platform administrator privileges.');
          useStore.getState().logout();
          return;
        }

        const targetDashboard = getDashboardForRole(userRole);
        router.push(targetDashboard === '/' ? '/admin' : targetDashboard);
      } else {
        setError('Invalid administrative credentials or account locked.');
      }
    } catch {
      setError('Administrative authorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Subtle security grid & red/amber glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-gray-900 to-black" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-black text-base shadow-glow">
            Z
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Zibonbaba <span className="text-primary text-xs font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/20 ml-1.5">CONTROL PLANE</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <ShieldCheck size={14} className="text-green-400" />
          <span>Restricted Portal</span>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-2xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-3 shadow-glow">
                <KeyRound size={26} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">Enterprise Administrator Login</h1>
              <p className="text-xs text-gray-400 mt-1 font-mono">Authorized Personnel Only</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3.5 mb-5 text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Admin Identifier / Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@zibonbaba.com"
                    required
                    autoComplete="email"
                    className="w-full bg-neutral-950/80 border border-neutral-800 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Security Passphrase
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-neutral-950/80 border border-neutral-800 text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-accent text-neutral-950 font-extrabold py-3 rounded-lg transition-all shadow-glow hover:shadow-[0_0_20px_rgba(255,193,7,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Authenticating System Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
              <p className="text-[11px] text-gray-500">
                Security notice: All administrative access attempts are cryptographically signed and logged in immutable system audit trails.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/10 text-center text-xs text-gray-600 font-mono relative z-10">
        Zibonbaba Enterprise System v1.0 • Internal Administrative Console
      </footer>
    </div>
  );
}
