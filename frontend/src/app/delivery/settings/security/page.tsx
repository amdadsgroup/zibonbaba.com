'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Lock, KeyRound, ShieldCheck, Eye, EyeOff, Smartphone,
  Monitor, LogOut, CheckCircle2, AlertCircle, AlertTriangle
} from 'lucide-react';

export default function DeliverySecuritySettingsPage() {
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active Sessions states
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState('');

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/delivery/security/sessions', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
      }
    } catch (_) {} finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      const res = await fetch('/api/delivery/security/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setPasswordSuccess('Password changed successfully! Your account credentials have been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Error changing password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogoutOthers = async () => {
    if (!confirm('Are you sure you want to terminate all other logged-in sessions? You will stay logged in only on this device.')) {
      return;
    }

    setRevokingOthers(true);
    setSessionSuccess('');

    try {
      const res = await fetch('/api/delivery/security/sessions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'logout-others' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to logout from other devices.');

      setSessionSuccess('Successfully logged out from all other devices.');
      await fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Session revocation failed.');
    } finally {
      setRevokingOthers(false);
    }
  };

  // Password strength checker
  const isLengthOk = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const strengthScore = [isLengthOk, hasUpper, hasLower, hasNumber].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/delivery/profile"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">Security & Active Sessions</h1>
              <p className="text-[11px] text-gray-400">Password management and cross-device session control</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* ================================================================ */}
        {/* 1. CHANGE PASSWORD CARD */}
        {/* ================================================================ */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <KeyRound size={18} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Change Account Password</h3>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">New Strong Password *</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters with letters & numbers"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full ${
                          step <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-rose-500'
                              : strengthScore === 3
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {strengthScore <= 2 ? 'Weak' : strengthScore === 3 ? 'Medium' : 'Strong Password'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3.5 rounded-xl bg-primary text-black font-black text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound size={16} /> {savingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* ================================================================ */}
        {/* 2. ACTIVE SESSIONS & DEVICE AUDIT */}
        {/* ================================================================ */}
        <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Active Login Sessions</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">{sessions.length} Devices</span>
          </div>

          {sessionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{sessionSuccess}</span>
            </div>
          )}

          <div className="space-y-3">
            {loadingSessions ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading active sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No external sessions detected.</div>
            ) : (
              sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    sess.isCurrent
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${sess.isCurrent ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'}`}>
                      {sess.device.includes('Smart') || sess.device.includes('Mobile') ? (
                        <Smartphone size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            This Device
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 block">{sess.browser} • {sess.ipAddress}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono">{sess.lastActive}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogoutOthers}
              disabled={revokingOthers}
              className="w-full py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <LogOut size={16} /> {revokingOthers ? 'Revoking Sessions...' : 'Logout from All Other Devices'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
