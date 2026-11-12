'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Store } from 'lucide-react';

export default function SellerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered seller email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch password recovery link.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Could not process password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-gray-900 text-lg shadow-glow">
            Z
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Zibon<span className="text-primary">baba</span>
          </span>
        </Link>
        <Link href="/seller/login" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> Back to Seller Login
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Check Your Email</h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  If an active seller account is associated with <span className="text-white font-medium">{email}</span>, we have sent instructions to reset your password.
                </p>
                <div className="pt-4">
                  <Link
                    href="/seller/login"
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-accent text-gray-950 font-bold py-2.5 rounded-lg text-xs transition-all"
                  >
                    Return to Seller Login
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-3">
                    <Store size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Reset Seller Password</h2>
                  <p className="text-xs text-gray-400 mt-1">Enter your registered merchant email to receive a recovery link</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-xs">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Seller Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vendor@zibonbaba.com"
                        required
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-extrabold py-3 rounded-lg transition-all shadow-glow disabled:opacity-60 flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Recovery Email...</span>
                      </>
                    ) : (
                      <span>Send Recovery Link</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <Link href="/seller/login" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Back to Seller Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-gray-950 py-4 text-center text-xs text-gray-600 z-10">
        © {new Date().getFullYear()} Zibonbaba Seller Center.
      </footer>
    </div>
  );
}
