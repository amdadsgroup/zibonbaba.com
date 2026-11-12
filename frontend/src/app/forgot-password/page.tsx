'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Send, KeyRound } from 'lucide-react';

type PageState = 'idle' | 'loading' | 'success' | 'error';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (tokenParam) {
      setIsResetMode(true);
      setToken(tokenParam);
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [tokenParam, emailParam]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setPageState('error');
      setErrorMsg('Please enter your email address.');
      return;
    }
    setErrorMsg('');
    setPageState('loading');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || data.message || 'Failed to send reset link. Please try again.');
        setPageState('error');
        return;
      }
      setSuccessMsg(data.message || 'If this email is registered, a password reset link has been dispatched.');
      setPageState('success');
    } catch {
      setErrorMsg('Could not connect to the server. Please try again later.');
      setPageState('error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please enter and confirm your new password.');
      setPageState('error');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setPageState('error');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setPageState('error');
      return;
    }

    setErrorMsg('');
    setPageState('loading');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password. The link may have expired.');
        setPageState('error');
        return;
      }

      setSuccessMsg('Your password has been reset successfully. Redirecting to login...');
      setPageState('success');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setErrorMsg('Network error. Please try again later.');
      setPageState('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-neutral-dark">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,193,7,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,193,7,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-glow mb-4">
            <span className="text-3xl font-black text-gray-900">Z</span>
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Zibonbaba</h1>
          <p className="text-gray-400 text-sm mt-1">{isResetMode ? 'Set New Password' : 'Account Recovery'}</p>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl shadow-modal p-8">
          {pageState === 'success' ? (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{isResetMode ? 'Password Reset Complete' : 'Check Your Email'}</h2>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {successMsg}
              </p>
              {!isResetMode && <p className="text-primary font-medium text-sm mb-6 break-all">{email}</p>}
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-accent text-gray-900 font-bold px-8 py-3 rounded-lg transition-all shadow-glow"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : isResetMode ? (
            /* Reset Password Form */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <KeyRound size={24} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Create New Password</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter a new strong password for your account <strong className="text-white">{email}</strong>.
                </p>
              </div>

              {pageState === 'error' && errorMsg && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (pageState === 'error') setPageState('idle');
                      }}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (pageState === 'error') setPageState('idle');
                      }}
                      placeholder="Re-enter password"
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pageState === 'loading'}
                  className="w-full bg-primary hover:bg-primary-accent text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-glow disabled:opacity-60"
                >
                  {pageState === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Forgot Password Request Form */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <Mail size={24} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Forgot Password?</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter your email address and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              {pageState === 'error' && errorMsg && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (pageState === 'error') setPageState('idle');
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={pageState === 'loading'}
                  className="w-full bg-primary hover:bg-primary-accent text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pageState === 'loading' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft size={15} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-dark flex items-center justify-center text-white"><Loader2 className="animate-spin" size={32} /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
