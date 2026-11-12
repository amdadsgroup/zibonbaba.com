'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Loader2, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft,
  Store, Briefcase, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const BUSINESS_CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Health & Beauty',
  'Home & Kitchen',
  'Groceries & Food',
  'Books & Stationery',
  'Toys & Kids',
  'Sports & Fitness',
  'Automotive & Motor Accessories',
  'Jewelry & Luxury Watches',
  'General Retail'
];

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  required?: boolean;
}

function Field({ id, label, type = 'text', value, onChange, placeholder, icon, required = true }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-300 mb-1.5">
        {label}{!required && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
        <input
          id={id}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SellerRegisterPage() {
  const router = useRouter();

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Electronics & Gadgets');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid business email address.');
      return;
    }
    if (!storeName.trim()) {
      setError('Please enter your Store / Business name.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Seller Agreement and Terms to continue.');
      return;
    }

    setLoading(true);

    try {
      // Clear old session credentials first to guarantee clean account isolation
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zibonbaba_token');
        localStorage.removeItem('zibonbaba_user');
        localStorage.removeItem('zibonbaba_role');
        sessionStorage.clear();
      }

      const body = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        role: 'VENDOR_ADMIN',
        storeName: storeName.trim(),
        businessType: businessCategory,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || 'Registration failed. Please try again.');
        return;
      }

      // Establish fresh isolated session
      if (data.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('zibonbaba_token', data.accessToken);
        localStorage.setItem('zibonbaba_user', JSON.stringify(data.user));
        localStorage.setItem('zibonbaba_role', data.user.role || 'VENDOR_ADMIN');
        document.cookie = `zibonbaba_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `zibonbaba_role=${data.user.role || 'VENDOR_ADMIN'}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `zibonbaba_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=604800; SameSite=Lax`;

        useStore.setState({
          isLoggedIn: true,
          token: data.accessToken,
          role: 'vendor',
          username: data.user?.fullName || data.user?.email || 'Seller',
          userEmail: data.user?.email || '',
          cart: [],
          orders: []
        });
      }

      setSuccess(true);
    } catch {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white relative overflow-hidden px-4">
        <Link
          href="/"
          className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary shadow-glow">
            <Store size={36} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Store Registered Successfully! 🏪
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
            Your store application for <span className="text-white font-bold">&quot;{storeName}&quot;</span> has been created. You can now access your Seller Center dashboard to manage products, orders, and sales.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/seller"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-accent text-gray-950 font-black px-6 py-3.5 rounded-xl transition-all shadow-glow text-sm"
            >
              Open Seller Dashboard <ArrowRight size={16} />
            </Link>
            <Link
              href="/seller/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Sign In to Seller Center
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-950 text-white py-10 px-4 sm:px-6">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10 backdrop-blur-sm"
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </Link>

      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Branding & Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-glow mb-3">
            <Store className="w-7 h-7 text-gray-950" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary mb-2">
            <TrendingUp size={14} /> Merchant Partner Program
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Seller Store</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Start selling on Zibonbaba and reach millions of active customers
          </p>
        </div>

        {/* Card Container */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs sm:text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="seller-fullname"
              label="Owner / Representative Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="e.g. John Doe"
              icon={<User size={16} />}
            />

            <Field
              id="seller-storename"
              label="Store / Business Name"
              value={storeName}
              onChange={setStoreName}
              placeholder="e.g. Dhaka Electronics Mart"
              icon={<Store size={16} />}
              required={true}
            />

            <div>
              <label htmlFor="seller-category" className="block text-xs font-semibold text-gray-300 mb-1.5">
                Business Category
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                  <Briefcase size={16} />
                </span>
                <select
                  id="seller-category"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <Field
              id="seller-email"
              label="Business Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="vendor@example.com"
              icon={<Mail size={16} />}
            />

            <Field
              id="seller-phone"
              label="Contact Phone Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+880 1XXX-XXXXXX"
              icon={<Phone size={16} />}
              required={false}
            />

            <Field
              id="seller-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 6 characters"
              icon={<Lock size={16} />}
            />

            <Field
              id="seller-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter your password"
              icon={<Lock size={16} />}
            />

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label htmlFor="seller-terms-checkbox" className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="seller-terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-white/20 rounded bg-white/5 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                    {termsAccepted && <CheckCircle2 size={11} className="text-gray-950" />}
                  </div>
                </div>
                <span className="text-xs text-gray-400 leading-relaxed select-none">
                  I agree to the{' '}
                  <span className="text-primary font-bold hover:underline cursor-pointer">Seller Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary font-bold hover:underline cursor-pointer">Merchant Agreement</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="seller-register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-accent text-gray-950 font-black py-3.5 rounded-xl transition-all shadow-glow hover:shadow-[0_0_25px_rgba(255,193,7,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Registering Store...</span>
                </>
              ) : (
                <>
                  <span>Create Seller Store</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs sm:text-sm text-gray-400 pt-2 border-t border-white/10">
            Already have a seller account?{' '}
            <Link
              href="/seller/login"
              className="text-primary hover:text-yellow-300 font-bold transition-colors"
            >
              Sign In to Seller Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
