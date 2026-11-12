'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
  TrendingUp, ShieldCheck, CheckCircle2, DollarSign, Building2, MapPin, CreditCard
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const BANGLADESH_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'
];

export default function ResellerRegisterPage() {
  const router = useRouter();
  const login = useStore((s) => s.login);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim() || !email.includes('@')) return setError('A valid email address is required.');
    if (!phone.trim() || phone.length < 11) return setError('A valid 11-digit mobile number is required.');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters long.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (!termsAccepted) return setError('You must accept the Reseller Partner Terms & Conditions.');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          role: 'RESELLER',
          businessName: businessName.trim() || `${fullName.trim()}'s Reseller Hub`,
          division,
          district: district.trim() || division,
          city: city.trim() || district.trim() || division,
          address: address.trim(),
          paymentMethod,
          paymentNumber: paymentNumber.trim() || phone.trim(),
          nidNumber: nidNumber.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create reseller account.');
      }

      setSuccess(true);

      // Perform direct session login
      await login(email.trim().toLowerCase(), password);

      setTimeout(() => {
        router.push('/reseller');
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Reseller Registration
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to Marketplace
          </Link>
          <Link href="/reseller/login" className="text-primary hover:underline font-bold">
            Already have an account? Sign In
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {/* Glowing Backgrounds */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

        <div className="w-full max-w-3xl bg-gray-900/80 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
              <TrendingUp size={14} /> Official Zibonbaba Reseller Program
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Start Your Online Business Today
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Zero product inventory required. Set your own prices, create orders on behalf of your customers, and earn guaranteed profit payouts.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>Reseller account created successfully! Redirecting to your dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <User size={14} /> 1. Personal & Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="reseller@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Business & Address Information */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Building2 size={14} /> 2. Business & Address Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Reseller / Business Page Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Trendy Zone BD / Dhaka Fashion Mart"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {BANGLADESH_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dhaka / Chattogram"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City / Upazila</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhanmondi / Mirpur"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Business / Contact Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area details"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Profit Payout Preferences */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <CreditCard size={14} /> 3. Profit Payout Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Preferred Payout Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="bKash">bKash (Personal/Merchant)</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket (DBBL)</option>
                    <option value="Bank Transfer">Bank Transfer (Any BD Bank)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Payout Account Number / Phone</label>
                  <input
                    type="text"
                    value={paymentNumber}
                    onChange={(e) => setPaymentNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Password & Security */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Lock size={14} /> 4. Security Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Create Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-400 select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary mt-0.5"
                />
                <span>
                  I agree to the Zibonbaba Reseller Partner Policy, profit settlement terms, and fair marketplace pricing guidelines.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-black py-3.5 px-6 rounded-xl text-sm transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Reseller Account...
                  </>
                ) : (
                  <>
                    Complete Registration & Open Dashboard <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-950 py-4 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Zibonbaba.com — Reseller Commerce Ecosystem. All rights reserved.
      </footer>
    </div>
  );
}
