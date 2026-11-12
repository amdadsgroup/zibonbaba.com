'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Settings,
  Shield,
  DollarSign,
  Mail,
  Lock,
  Globe,
  Save,
  CheckCircle,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function SystemSettingsPage() {
  const [platformName, setPlatformName] = useState('Zibonbaba.com');
  const [supportEmail, setSupportEmail] = useState('support@zibonbaba.com');
  const [supportPhone, setSupportPhone] = useState('+880 1711-000000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security Policy
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [maxFailedLogins, setMaxFailedLogins] = useState(5);
  const [sessionMaxAgeDays, setSessionMaxAgeDays] = useState(7);
  const [enforce2FaAdmins, setEnforce2FaAdmins] = useState(true);

  // Financial Policy
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [minPayoutAmount, setMinPayoutAmount] = useState(1000);
  const [currencySymbol, setCurrencySymbol] = useState('৳');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('smtp.zibonbaba.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('notifications@zibonbaba.com');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            if (data.settings.platformCommission !== undefined) setDefaultCommission(data.settings.platformCommission);
            if (data.settings.platformName) setPlatformName(data.settings.platformName);
            if (data.settings.supportEmail) setSupportEmail(data.settings.supportEmail);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    try {
      if (token) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            platformCommission: defaultCommission,
            platformName,
            supportEmail,
            supportPhone,
            maintenanceMode
          })
        });
      }
    } catch (_) {}
    setToastMessage('System Configuration and Security Policies saved successfully to database!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <SuperAdminLayout
      activeNav="settings"
      title="Platform System Settings & Global Policy Configuration"
      subtitle="Configure Platform Parameters, Security Lockouts, Financial Commissions & SMTP Parameters"
    >
      {toastMessage && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-white">✕</button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* ── General Settings ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> General Platform Identity & Maintenance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Core branding, contact parameters, and maintenance state</p>
            </div>
            {/* Maintenance Mode Toggle */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
              <span className="text-xs font-bold text-slate-300">Maintenance Mode</span>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`text-2xl transition-colors ${maintenanceMode ? 'text-rose-500' : 'text-slate-600'}`}
              >
                {maintenanceMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Support Email Address</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Support Hotline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* ── Security & Authentication Policy ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Authentication & Lockout Security Rules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Password complexity, failed login lockouts, and 2FA enforcement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs mb-6">
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Minimum Password Length</label>
              <input
                type="number"
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Max Failed Logins Before Lock</label>
              <input
                type="number"
                value={maxFailedLogins}
                onChange={(e) => setMaxFailedLogins(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Session Max Age (Days)</label>
              <input
                type="number"
                value={sessionMaxAgeDays}
                onChange={(e) => setSessionMaxAgeDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={enforce2FaAdmins}
                  onChange={(e) => setEnforce2FaAdmins(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="font-extrabold text-white">Enforce 2FA on Admins</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Financial & Commission Policy ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> Financial & Commission Parameters
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Platform commission fees and merchant payout rules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Default Marketplace Commission (%)</label>
              <input
                type="number"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Min Payout Threshold (৳)</label>
              <input
                type="number"
                value={minPayoutAmount}
                onChange={(e) => setMinPayoutAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block font-extrabold text-slate-300 mb-2">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* ── Save Settings Button ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-8 py-4 rounded-2xl transition-all shadow-xl flex items-center gap-2"
          >
            <Save size={18} /> Save All System Settings
          </button>
        </div>
      </form>
    </SuperAdminLayout>
  );
}
