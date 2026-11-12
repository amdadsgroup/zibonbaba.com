'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Check, Save, ShieldCheck, Smartphone, Mail, MessageSquare } from 'lucide-react';

export default function DeliveryNotificationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Channels
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  // Triggers
  const [newAssignment, setNewAssignment] = useState(true);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState(true);
  const [deliveryReminder, setDeliveryReminder] = useState(true);
  const [earningsAlert, setEarningsAlert] = useState(true);
  const [withdrawalUpdate, setWithdrawalUpdate] = useState(true);
  const [accountSecurity, setAccountSecurity] = useState(true);
  const [promotions, setPromotions] = useState(false);

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

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch('/api/delivery/notifications/preferences', {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok && data.preferences) {
          const ch = data.preferences.channels || {};
          const tr = data.preferences.triggers || {};

          setInAppEnabled(ch.inApp ?? true);
          setPushEnabled(ch.push ?? true);
          setSmsEnabled(ch.sms ?? true);
          setEmailEnabled(ch.email ?? true);
          setWhatsappEnabled(ch.whatsapp ?? false);

          setNewAssignment(tr.newAssignment ?? true);
          setOrderStatusUpdate(tr.orderStatusUpdate ?? true);
          setDeliveryReminder(tr.deliveryReminder ?? true);
          setEarningsAlert(tr.earningsAlert ?? true);
          setWithdrawalUpdate(tr.withdrawalUpdate ?? true);
          setAccountSecurity(tr.accountSecurity ?? true);
          setPromotions(tr.promotions ?? false);
        }
      } catch (_) {} finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/delivery/notifications/preferences', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          channels: {
            inApp: inAppEnabled,
            push: pushEnabled,
            sms: smsEnabled,
            email: emailEnabled,
            whatsapp: whatsappEnabled
          },
          triggers: {
            newAssignment,
            orderStatusUpdate,
            deliveryReminder,
            earningsAlert,
            withdrawalUpdate,
            accountSecurity,
            promotions
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save notification preferences.');

      setSuccessMsg('Notification preferences updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400">Loading Notification Preferences...</p>
      </div>
    );
  }

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
              <h1 className="text-base sm:text-lg font-black text-white">Notification Preferences</h1>
              <p className="text-[11px] text-gray-400">Control delivery alerts, reminders, and delivery channels</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Notification Channels */}
          <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
              <Smartphone size={16} /> Delivery Alert Channels
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">In-App Notifications</span>
                  <span className="text-[11px] text-gray-400">Receive alerts in your rider dashboard and bell menu</span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Push Notifications (Mobile / Browser)</span>
                  <span className="text-[11px] text-gray-400">Instant vibration and sound alert on new parcel assignments</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">SMS Notifications</span>
                  <span className="text-[11px] text-gray-400">Important dispatch, payout, and security codes via text message</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Email Receipts & Statements</span>
                  <span className="text-[11px] text-gray-400">Weekly earnings summaries and official account notices</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>
            </div>
          </section>

          {/* Section 2: Delivery Triggers */}
          <section className="bg-gray-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
              <Bell size={16} /> Operational Alert Triggers
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">New Delivery Task Assigned</span>
                  <span className="text-[11px] text-gray-400">Immediate alert when hub dispatches a new order to your queue</span>
                </div>
                <input
                  type="checkbox"
                  checked={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Order Status Updates & Cancellations</span>
                  <span className="text-[11px] text-gray-400">Notifies if customer changes address or cancels before pickup</span>
                </div>
                <input
                  type="checkbox"
                  checked={orderStatusUpdate}
                  onChange={(e) => setOrderStatusUpdate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Delivery Reminders & Routing Notes</span>
                  <span className="text-[11px] text-gray-400">Alerts for pending pickups near your current location</span>
                </div>
                <input
                  type="checkbox"
                  checked={deliveryReminder}
                  onChange={(e) => setDeliveryReminder(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Earnings & Delivery Fee Settlement</span>
                  <span className="text-[11px] text-gray-400">Receive instant notification when completed delivery fee is credited</span>
                </div>
                <input
                  type="checkbox"
                  checked={earningsAlert}
                  onChange={(e) => setEarningsAlert(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Withdrawal Status & Payouts</span>
                  <span className="text-[11px] text-gray-400">bKash/Nagad transfer confirmation and transaction reference numbers</span>
                </div>
                <input
                  type="checkbox"
                  checked={withdrawalUpdate}
                  onChange={(e) => setWithdrawalUpdate(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer">
                <div>
                  <span className="font-bold text-white block">Promotions & Driver Bonus Missions</span>
                  <span className="text-[11px] text-gray-400">Peak hour surge bonuses and rainy day incentive announcements</span>
                </div>
                <input
                  type="checkbox"
                  checked={promotions}
                  onChange={(e) => setPromotions(e.target.checked)}
                  className="w-4 h-4 rounded text-primary border-white/20 bg-gray-800 focus:ring-primary"
                />
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-primary text-black font-black text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Notification Preferences'}
          </button>
        </form>
      </main>
    </div>
  );
}
