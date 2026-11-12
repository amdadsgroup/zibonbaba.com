'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  ShieldCheck,
  Zap,
  RefreshCw,
  Server,
  Lock,
  MessageSquare,
  CreditCard,
  Users,
  ShoppingBag,
  Store,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminSystemHealthPage() {
  const router = useRouter();
  const { token, isLoggedIn, role } = useStore();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/system-health', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.status === 401 || res.status === 403) {
        setError('Admin authorization required. Please login with an administrator account.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to fetch diagnostic data.');
      } else {
        setData(json);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching system health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header / Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/admin" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
              </Link>
              <span>/</span>
              <span className="text-amber-400 font-medium">System Diagnostics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <Activity className="w-7 h-7 text-emerald-400 animate-pulse" />
              Platform Diagnostics & Health Auditor
            </h1>
            <p className="text-xs text-slate-400">
              Real-time telemetry, database latency, security compliance, and operational queues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastChecked && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                Last checked: {lastChecked}
              </span>
            )}
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Run Health Audit
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Diagnostic Access Restriction</strong>
              <p>{error}</p>
              <Link href="/admin/login" className="underline font-bold hover:text-white mt-1 inline-block">
                Go to Admin Sign In &rarr;
              </Link>
            </div>
          </div>
        )}

        {loading && !data && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Querying PostgreSQL, security layers & services...</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              data.status === 'HEALTHY'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : data.status === 'WARNING'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  data.status === 'HEALTHY'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : data.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {data.status === 'HEALTHY' ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">System Status: {data.status}</h2>
                  <p className="text-xs opacity-80">
                    Host: {data.diagnostics?.environment?.toUpperCase()} • Node: {data.diagnostics?.nodeVersion} • Memory: {data.diagnostics?.memoryUsageMb} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Database Latency</span>
                  <span className="text-base font-black text-white">{data.latency?.databaseMs} ms</span>
                </div>
              </div>
            </div>

            {/* Warnings Alert Box if any */}
            {data.warnings && data.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Recommended Operational Actions ({data.warnings.length})
                </span>
                <ul className="list-disc pl-5 space-y-1 text-xs text-amber-200/90">
                  {data.warnings.map((w: string, idx: number) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grid 1: Subsystem Integrations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Database Engine</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">PostgreSQL 17</span>
                  <span className="text-xs text-emerald-400 font-medium">Supabase Cloud Active</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Transaction Pooler (6543)
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Payment Gateways</span>
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">SSLCommerz & bKash</span>
                  <span className={`text-xs font-medium ${data.integrations?.paymentGateway === 'LIVE_PRODUCTION' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data.integrations?.paymentGateway}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  COD + MFS Tokenized Direct
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">SMS Dispatch</span>
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">Greenweb BD / Twilio</span>
                  <span className={`text-xs font-medium ${data.integrations?.sms === 'CONFIGURED' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {data.integrations?.sms}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Order Alerts & OTP Delivery
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Security Engine</span>
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">Sliding-Window Limiter</span>
                  <span className="text-xs text-emerald-400 font-medium">Active (10 req/min)</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Brute Force 5-Attempt Lockout
                </div>
              </div>
            </div>

            {/* Grid 2: Operational Data Metrics */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-400" />
                Marketplace Telemetry & Queue Diagnostics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Total Users Registered</span>
                  <span className="text-xl font-bold text-white mt-1 block">{data.operationsAudit?.totalUsers}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Total Orders Recorded</span>
                  <span className="text-xl font-bold text-white mt-1 block">{data.operationsAudit?.totalOrders}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Catalog Published SKUs</span>
                  <span className="text-xl font-bold text-white mt-1 block">{data.operationsAudit?.totalProducts}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Verified Stores</span>
                  <span className="text-xl font-bold text-white mt-1 block">{data.operationsAudit?.totalStores}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Unassigned Dispatch Orders</span>
                  <span className={`text-xl font-bold mt-1 block ${data.operationsAudit?.unassignedOrders > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {data.operationsAudit?.unassignedOrders}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Pending KYC Reviews</span>
                  <span className={`text-xl font-bold mt-1 block ${data.operationsAudit?.pendingKYC > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {data.operationsAudit?.pendingKYC}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Pending Withdrawals</span>
                  <span className={`text-xl font-bold mt-1 block ${data.operationsAudit?.pendingWithdrawals > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {data.operationsAudit?.pendingWithdrawals}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 block">Failed Logins (24h)</span>
                  <span className="text-xl font-bold text-slate-300 mt-1 block">
                    {data.securityAudit?.recentFailedLogins24h}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
