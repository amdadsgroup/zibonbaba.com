'use strict';
'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Radio, 
  Users, 
  Store, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Mail, 
  Smartphone 
} from 'lucide-react';

interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL' | 'CUSTOMERS' | 'VENDORS';
  channel: 'IN_APP' | 'EMAIL' | 'SMS';
  sentAt: string;
  sentBy: string;
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
  recipientCount: number;
}

const SAMPLE_BROADCASTS: NotificationBroadcast[] = [
  {
    id: 'notif_1',
    title: 'Eid Mega Sale 2026 Scheduled',
    message: 'Vendors are invited to enroll their highest discounting SKUs for the upcoming Eid festival campaign.',
    targetAudience: 'VENDORS',
    channel: 'IN_APP',
    sentAt: new Date().toISOString(),
    sentBy: 'admin@zibonbaba.com',
    status: 'SENT',
    recipientCount: 48
  },
  {
    id: 'notif_2',
    title: 'Platform Maintenance Notice: 03:00 AM - 04:00 AM',
    message: 'Scheduled database indexing and gateway enhancements. Checkout will pause for 10 minutes.',
    targetAudience: 'ALL',
    channel: 'IN_APP',
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    sentBy: 'operations@zibonbaba.com',
    status: 'SENT',
    recipientCount: 1250
  },
  {
    id: 'notif_3',
    title: 'Cash on Delivery (COD) Threshold Update',
    message: 'COD is now supported for cart values up to ৳20,000 nationwide with OTP confirmation.',
    targetAudience: 'CUSTOMERS',
    channel: 'EMAIL',
    sentAt: new Date(Date.now() - 172800000).toISOString(),
    sentBy: 'marketing@zibonbaba.com',
    status: 'SENT',
    recipientCount: 890
  }
];

export function NotificationModule() {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>(SAMPLE_BROADCASTS);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'CUSTOMERS' | 'VENDORS'>('ALL');
  const [channel, setChannel] = useState<'IN_APP' | 'EMAIL' | 'SMS'>('IN_APP');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newBroadcast: NotificationBroadcast = {
        id: `notif_${Date.now()}`,
        title,
        message,
        targetAudience,
        channel,
        sentAt: new Date().toISOString(),
        sentBy: 'admin@zibonbaba.com',
        status: 'SENT',
        recipientCount: targetAudience === 'ALL' ? 1420 : targetAudience === 'VENDORS' ? 52 : 1368
      };

      setBroadcasts([newBroadcast, ...broadcasts]);
      setIsComposeOpen(false);
      setTitle('');
      setMessage('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#FFC107]" /> Announcements & Notifications Center
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Broadcast platform announcements, critical policy changes, and in-app alerts across Zibonbaba
          </p>
        </div>
        <button
          onClick={() => setIsComposeOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none"
        >
          <Send className="w-4 h-4" /> Send Announcement
        </button>
      </div>

      {/* Broadcast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FFC107] flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Broadcasts Sent</p>
            <p className="text-xl font-bold text-slate-900">{broadcasts.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Customer Reach</p>
            <p className="text-xl font-bold text-slate-900">1,368 recipients</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Merchant Engagement</p>
            <p className="text-xl font-bold text-slate-900">100% active shops</p>
          </div>
        </div>
      </div>

      {/* Recent Dispatches List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Dispatched Announcements Feed</h3>
          <span className="text-xs text-slate-400">Live archive</span>
        </div>

        <div className="divide-y divide-slate-100">
          {broadcasts.map((b) => (
            <div key={b.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    b.targetAudience === 'VENDORS' 
                      ? 'bg-amber-100 text-amber-900' 
                      : b.targetAudience === 'CUSTOMERS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {b.targetAudience}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    {b.channel === 'IN_APP' && <MessageSquare className="w-3 h-3" />}
                    {b.channel === 'EMAIL' && <Mail className="w-3 h-3" />}
                    {b.channel === 'SMS' && <Smartphone className="w-3 h-3" />}
                    {b.channel}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(b.sentAt).toLocaleDateString()}
                  </span>
                  <span>{b.recipientCount} delivered</span>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-sm mb-1">{b.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{b.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#FFC107]" /> Broadcast New Announcement
              </h3>
              <button 
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleBroadcast} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'ALL', label: 'All Users' },
                    { key: 'CUSTOMERS', label: 'Customers' },
                    { key: 'VENDORS', label: 'Merchants' },
                  ].map(aud => (
                    <button
                      key={aud.key}
                      type="button"
                      onClick={() => setTargetAudience(aud.key as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        targetAudience === aud.key
                          ? 'border-[#FFC107] bg-[#FFC107]/10 text-slate-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'IN_APP', label: 'In-App Alert' },
                    { key: 'EMAIL', label: 'Email Digest' },
                    { key: 'SMS', label: 'SMS Priority' },
                  ].map(ch => (
                    <button
                      key={ch.key}
                      type="button"
                      onClick={() => setChannel(ch.key as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        channel === ch.key
                          ? 'border-[#FFC107] bg-[#FFC107]/10 text-slate-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Announcement Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled Flash Sale Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write message details for the selected audience..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

