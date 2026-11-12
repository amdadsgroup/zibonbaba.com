'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock,
  Bike, User, MapPin, Phone, Mail, DollarSign, Wallet, History, AlertCircle,
  FileText, Check, Save, Compass, Building, Calendar, Star, RefreshCw
} from 'lucide-react';

export default function AdminDeliveryManDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = typeof routeParams?.id === 'string' ? routeParams.id : Array.isArray(routeParams?.id) ? routeParams.id[0] : '';

  const [loading, setLoading] = useState(true);
  const [riderData, setRiderData] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Admin form edit states
  const [selectedHubId, setSelectedHubId] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedServiceArea, setSelectedServiceArea] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('EXPRESS');
  const [rejectNotes, setRejectNotes] = useState('');
  const [suspendNotes, setSuspendNotes] = useState('');
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

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

  const fetchRider = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/delivery-men/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRiderData(data.deliveryMan);
        const dp = data.deliveryMan.deliveryProfile || {};
        setSelectedHubId(dp.hubId || '');
        setSelectedZone(dp.preferredZone || 'Dhaka Central');
        setSelectedServiceArea(dp.serviceArea || 'Dhaka Metro');
        setSelectedDeliveryType(dp.deliveryType || 'EXPRESS');
      } else {
        setErrorMsg(data.error || 'Failed to fetch rider profile.');
      }
    } catch (_) {
      setErrorMsg('Network error fetching rider.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRider();
  }, [fetchRider]);

  const handleAdminAction = async (payload: any, successText: string) => {
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/admin/delivery-men/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed.');

      setSuccessMsg(successText);
      await fetchRider();
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrative action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading Delivery Partner Fleet Record...</p>
      </div>
    );
  }

  const d = riderData || {};
  const dp = d.deliveryProfile || {};
  const stats = d.stats || {};
  const isSuspended = d.accountStatus === 'SUSPENDED' || d.accountStatus === 'BLOCKED';
  const isApproved = d.accountStatus === 'ACTIVE' || dp.status === 'APPROVED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pb-24 selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Rider Fleet Profile <span className="font-mono text-amber-400 text-xs">{d.deliveryManId}</span>
              </h1>
              <p className="text-[11px] text-slate-400">Administrative Logistics Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRider}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold"
            >
              All Couriers
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Master Action Banner */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center overflow-hidden font-black text-2xl text-amber-400 font-mono">
              {d.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (d.fullName || 'Rider')[0]?.toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{d.fullName}</h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  isSuspended
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : isApproved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {d.accountStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{d.email} • {d.phone}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isApproved && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAdminAction({ accountStatus: 'ACTIVE', verificationStatus: 'APPROVED' }, 'Delivery partner application approved.')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Approve Partner
              </button>
            )}

            {!isApproved && (
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle size={14} /> Reject Application
              </button>
            )}

            {isSuspended ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAdminAction({ accountStatus: 'ACTIVE' }, 'Account reactivated successfully.')}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> Reactivate Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert size={14} /> Suspend Rider
              </button>
            )}
          </div>
        </div>

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Deliveries</span>
            <span className="text-2xl font-black font-mono text-white">{stats.totalDeliveries || 0}</span>
            <span className="text-[10px] text-emerald-400 block">{stats.completionRate || 100}% Completion</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Live Availability</span>
            <span className="text-sm font-black text-amber-400 block">{dp.availabilityStatus || 'OFFLINE'}</span>
            <span className="text-[10px] text-slate-400 font-mono">Status: {dp.isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Wallet Balance</span>
            <span className="text-2xl font-black font-mono text-amber-400">৳{(d.walletBalance || 0).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block">Earnings: ৳{stats.totalEarnings || 0}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cash in Hand (COD)</span>
            <span className="text-2xl font-black font-mono text-white">৳{(stats.cashInHand || 0).toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block">Customer holdings</span>
          </div>
        </div>

        {/* Hub & Territory Dispatch Configuration */}
        <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Building size={16} /> Hub & Territory Dispatch Configuration
            </h3>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAdminAction({
                hubId: selectedHubId || null,
                preferredZone: selectedZone,
                serviceArea: selectedServiceArea,
                deliveryType: selectedDeliveryType
              }, 'Hub & territory dispatch assignments updated.')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} /> Save Assignments
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Stationed Dispatch Hub</label>
              <select
                value={selectedHubId}
                onChange={(e) => setSelectedHubId(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="">No Hub Assigned (Independent)</option>
                {d.availableHubs?.map((h: any) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.code}) — {h.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Assigned Zone</label>
              <input
                type="text"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Service Area</label>
              <input
                type="text"
                value={selectedServiceArea}
                onChange={(e) => setSelectedServiceArea(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Delivery Speed Tier</label>
              <select
                value={selectedDeliveryType}
                onChange={(e) => setSelectedDeliveryType(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              >
                <option value="EXPRESS">Express Priority</option>
                <option value="STANDARD">Standard Logistics</option>
                <option value="SAME_DAY">Same-Day City</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vehicle & Equipment Details */}
        <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-3 border-b border-white/10">
            <Bike size={16} /> Vehicle & Documentation Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Type & Model</span>
              <span className="font-bold text-white mt-1 block">
                {dp.vehicleType || 'MOTORCYCLE'} {dp.vehicleModel ? `• ${dp.vehicleModel}` : ''}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Ownership: {dp.vehicleOwnership || 'OWNED'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Registration Plate</span>
              <span className="font-mono font-bold text-amber-400 mt-1 block">
                {dp.vehicleNumber || 'DHAKA METRO-HA-12-3456'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Color: {dp.vehicleColor || 'Black'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Driving License & NID</span>
              <span className="font-mono text-slate-200 mt-1 block">DL: {dp.drivingLicense || 'DL-8802938192'}</span>
              <span className="font-mono text-slate-400 mt-0.5 block">NID: {dp.nidNumber || '19942691234567890'}</span>
            </div>
          </div>
        </section>

        {/* Audit Logs Timeline */}
        <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 pb-3 border-b border-white/10">
            <History size={16} /> Audit & Activity Trail
          </h3>

          <div className="space-y-2 text-xs">
            {d.auditLogs && d.auditLogs.length > 0 ? (
              d.auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span className="font-mono text-slate-300">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">No security audit logs recorded yet.</div>
            )}
          </div>
        </section>
      </main>

      {/* Suspend Modal */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
              <ShieldAlert size={18} /> Suspend Delivery Partner
            </h3>
            <p className="text-xs text-slate-300">
              The rider will be blocked from receiving or accepting deliveries. Please provide an administrative reason.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Compliance review, traffic safety violation, or pending documentation update."
              value={suspendNotes}
              onChange={(e) => setSuspendNotes(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSuspendModalOpen(false);
                  handleAdminAction({ accountStatus: 'SUSPENDED', suspendedReason: suspendNotes }, 'Rider has been suspended.');
                }}
                disabled={!suspendNotes.trim()}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirm Suspension
              </button>
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
              <XCircle size={18} /> Reject Partner Application
            </h3>
            <p className="text-xs text-slate-300">
              Please enter the reason for rejection (e.g. invalid driving license, illegible NID).
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Driving license expired. Please re-apply with valid document."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  handleAdminAction({ accountStatus: 'REJECTED', rejectReason: rejectNotes }, 'Partner application rejected.');
                }}
                disabled={!rejectNotes.trim()}
                className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirm Rejection
              </button>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/5 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
