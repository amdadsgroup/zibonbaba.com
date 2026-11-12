'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Notification, NotificationPreference } from '@/store/useStore';
import {
  Bell, Mail, Phone, Shield, ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon, Info, Clock, Archive,
  Check, Filter, Search, SlidersHorizontal, ToggleLeft, ToggleRight, Sparkles, Send, BrainCircuit, Play, Settings,
  ArrowLeft, RefreshCw, Layers, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationCenterPage() {
  const router = useRouter();
  const {
    isLoggedIn,
    role,
    token,
    notifications,
    unreadCount,
    preferences,
    rules,
    wsConnected,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    acknowledgeNotification,
    archiveNotification,
    fetchPreferences,
    updatePreferences,
    fetchRules,
    saveRule,
    triggerAiAlert,
    initNotificationWebSocket
  } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical' | 'preferences' | 'rules' | 'ai'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterModule, setFilterModule] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local Toast alert state
  const [activeToast, setActiveToast] = useState<any | null>(null);

  // AI sandbox form state
  const [aiTargetUser, setAiTargetUser] = useState<string>('');
  const [aiTitle, setAiTitle] = useState<string>('Inventory depletion alert');
  const [aiBody, setAiBody] = useState<string>('Stock levels for item HP-PRO-WHT have fallen to 8 units. Reorder recommended.');
  const [aiPriority, setAiPriority] = useState<string>('HIGH');
  const [aiModule, setAiModule] = useState<string>('ERP');

  // Rule creation state
  const [newRuleEvent, setNewRuleEvent] = useState<string>('ORDER_DELIVERED');
  const [newRuleRoles, setNewRuleRoles] = useState<string>('CUSTOMER,VENDOR_ADMIN');
  const [newRuleChannels, setNewRuleChannels] = useState<string>('In-App,Email');
  const [newRuleActive, setNewRuleActive] = useState<boolean>(true);

  // Fetch initial user profile for ID reference
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    if (isLoggedIn && token) {
      // Decode user profile to get ID
      try {
        const storedUser = localStorage.getItem('zibonbaba_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          setCurrentUserId(u.id || '');
          setAiTargetUser(u.id || ''); // default target self
          
          // Connect WebSocket client
          const disconnect = initNotificationWebSocket(u.id);
          return () => disconnect();
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isLoggedIn, token, initNotificationWebSocket]);

  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      Promise.all([
        fetchNotifications(),
        fetchPreferences(),
        fetchRules()
      ]).finally(() => setLoading(false));
    }
  }, [isLoggedIn, fetchNotifications, fetchPreferences, fetchRules]);

  // Toast listener hook
  useEffect(() => {
    const handleToast = (e: any) => {
      const notif = e.detail;
      setActiveToast(notif);
      // Auto dismiss
      setTimeout(() => {
        setActiveToast(null);
      }, 5000);
    };

    window.addEventListener('zibonbaba-notification-toast', handleToast);
    return () => window.removeEventListener('zibonbaba-notification-toast', handleToast);
  }, []);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Bell className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Authentication Required</h1>
          <p className="text-xs text-slate-400 mb-6">Please log in to customize and view your notification center alerts.</p>
          <Link href="/login" className="bg-[#FFC107] text-slate-950 font-black text-xs px-6 py-3 rounded-2xl block w-full">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  // Filter list
  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = !filterPriority || n.priority === filterPriority;
    const matchesModule = !filterModule || n.module === filterModule;
    
    if (activeTab === 'unread') return matchesSearch && matchesPriority && matchesModule && !n.isRead;
    if (activeTab === 'critical') return matchesSearch && matchesPriority && matchesModule && n.priority === 'CRITICAL';
    return matchesSearch && matchesPriority && matchesModule;
  });

  const getPriorityIcon = (p: string) => {
    if (p === 'CRITICAL') return <AlertOctagon className="w-4 h-4 text-red-500" />;
    if (p === 'HIGH') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (p === 'MEDIUM') return <Info className="w-4 h-4 text-blue-400" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const getPriorityClass = (n: any) => {
    if (n.priority === 'CRITICAL') {
      return n.isAcknowledged 
        ? 'border-red-950 bg-red-950/20' 
        : 'border-red-550/40 bg-gradient-to-r from-red-950/40 to-slate-900/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
    }
    if (n.priority === 'HIGH') return 'border-amber-500/10 bg-amber-500/[0.02]';
    return 'border-white/5 bg-white/[0.01]';
  };

  const handlePreferenceChange = (key: keyof NotificationPreference, val: boolean) => {
    if (preferences) {
      updatePreferences({ ...preferences, [key]: val });
    }
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actionPayload = {
      roles: newRuleRoles.split(',').map(r => r.trim().toUpperCase()),
      channels: newRuleChannels.split(',').map(c => c.trim())
    };
    saveRule({
      triggerEvent: newRuleEvent,
      actionPayload,
      isActive: newRuleActive
    }).then(() => {
      alert('Automation rule saved successfully!');
    });
  };

  const handleTriggerAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAiAlert(aiTargetUser, aiTitle, aiBody, aiPriority, aiModule).then(() => {
      alert('AI predictive alert dispatched over WebSocket.');
    });
  };

  const allowedRuleRoles = ['admin', 'superadmin'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Real-time floating Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl animate-slide-up backdrop-blur-xl">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#FFC107]/10 border border-[#FFC107]/20 text-[#FFC107] rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-swing" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-[#FFC107] uppercase tracking-wider block">{activeToast.module} Alert</span>
              <h4 className="text-xs font-black text-white truncate mt-0.5">{activeToast.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{activeToast.body}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-slate-500 hover:text-white self-start">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-white/5 flex flex-col z-10 shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#FFC107] flex items-center justify-center text-slate-950 font-black text-xs">ZB</span>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white">Notification <span className="text-[#FFC107]">Hub</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} title={wsConnected ? 'Connected to WebSocket' : 'Disconnected'} />
            <span className="text-[9px] font-black text-slate-500 uppercase">{wsConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          <button onClick={() => setActiveTab('all')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'all' ? 'bg-[#FFC107]/20 border-[#FFC107]/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
          }`}>
            <Bell className="w-4 h-4" />
            <span>All Alerts</span>
          </button>

          <button onClick={() => setActiveTab('unread')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'unread' ? 'bg-[#FFC107]/20 border-[#FFC107]/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
          }`}>
            <Layers className="w-4 h-4" />
            <span>Unread Alerts</span>
            {unreadCount > 0 && (
              <span className="bg-[#FFC107] text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full ml-auto">
                {unreadCount}
              </span>
            )}
          </button>

          <button onClick={() => setActiveTab('critical')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'critical' ? 'bg-red-500/20 border-red-500/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
          }`}>
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Critical Queue</span>
          </button>

          <button onClick={() => setActiveTab('preferences')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'preferences' ? 'bg-[#FFC107]/20 border-[#FFC107]/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
          }`}>
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </button>

          {allowedRuleRoles.includes(role) && (
            <>
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-3.5 pt-4 pb-1">Enterprise Admin</div>
              <button onClick={() => setActiveTab('rules')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'rules' ? 'bg-emerald-500/20 border-emerald-500/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
              }`}>
                <ToggleLeft className="w-4 h-4 text-emerald-400" />
                <span>Automation Rules</span>
              </button>

              <button onClick={() => setActiveTab('ai')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === 'ai' ? 'bg-indigo-500/20 border-indigo-500/30 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
              }`}>
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                <span>AI Prediction Sandbox</span>
              </button>
            </>
          )}
        </nav>

        {/* Back Link */}
        <div className="p-4 border-t border-white/5 bg-slate-950/40">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[#FFC107]/10 hover:text-[#FFC107] text-slate-350 text-xs font-bold py-2.5 rounded-xl transition-all border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-8">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FFC107]" />
              Ecosystem Notification Hub
            </h1>
            <p className="text-xs text-slate-400 mt-1">Centralized, real-time message stream and channel settings across Zibonbaba.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchNotifications().finally(() => setLoading(false));
              }}
              className="bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="bg-[#FFC107]/10 hover:bg-[#FFC107]/20 border border-[#FFC107]/20 text-[#FFC107] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
            >
              Mark all Read
            </button>
          </div>
        </header>

        {/* ALERTS TAB VIEWS */}
        {(activeTab === 'all' || activeTab === 'unread' || activeTab === 'critical') && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search alerts (e.g. order, refund, withdrawal)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#FFC107] transition-colors"
                />
              </div>

              <div className="flex gap-3 w-full md:w-auto self-stretch md:self-auto">
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="bg-slate-900 border border-white/5 text-xs text-slate-350 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="">All Priorities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="INFO">Informational</option>
                </select>

                <select
                  value={filterModule}
                  onChange={e => setFilterModule(e.target.value)}
                  className="bg-slate-900 border border-white/5 text-xs text-slate-350 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="">All Modules</option>
                  <option value="MARKETPLACE">Marketplace</option>
                  <option value="ERP">ERP</option>
                  <option value="CRM">CRM</option>
                  <option value="HRM">HRM</option>
                  <option value="FINANCE">Finance</option>
                  <option value="WALLET">Wallet</option>
                  <option value="SECURITY">Security</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl text-slate-500 text-xs">
                  No notifications matching selected filters.
                </div>
              ) : (
                filteredNotifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ${getPriorityClass(n)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{getPriorityIcon(n.priority)}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-white">{n.title}</h4>
                          <span className="text-[8px] font-black bg-white/5 border border-white/5 text-slate-450 px-1.5 py-0.25 rounded uppercase">
                            {n.module}
                          </span>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC107] animate-pulse" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.body}</p>
                        <div className="flex items-center gap-3 text-[9px] text-slate-500 mt-2 font-mono">
                          <span>Sent via: {n.channels}</span>
                          <span>·</span>
                          <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-stretch md:self-auto border-t border-white/5 md:border-t-0 pt-3 md:pt-0">
                      {n.priority === 'CRITICAL' && !n.isAcknowledged && (
                        <button
                          onClick={() => acknowledgeNotification(n.id)}
                          className="flex-1 bg-red-650 hover:bg-red-700 text-white text-[9.5px] font-black px-4 py-2 rounded-xl transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="flex-1 border border-white/5 hover:bg-white/5 text-slate-300 text-[9.5px] font-bold px-3 py-2 rounded-xl transition-colors"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => archiveNotification(n.id)}
                        className="p-2 border border-white/5 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && preferences && (
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl max-w-xl space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#FFC107]" />
              Notification Channels Preferences
            </h3>
            
            <div className="space-y-4 text-xs font-bold">
              {[
                { key: 'pushEnabled' as const, label: 'Browser Push Notifications', desc: 'Real-time toast popups on the screen', icon: Bell },
                { key: 'emailEnabled' as const, label: 'Email Notifications', desc: 'Summary and transaction receipts via email', icon: Mail },
                { key: 'smsEnabled' as const, label: 'SMS Notifications', desc: 'Important verification alerts to mobile', icon: Phone },
                { key: 'whatsappEnabled' as const, label: 'WhatsApp Alerts', desc: 'Dispatch and order confirmation messages', icon: Phone },
                { key: 'telegramEnabled' as const, label: 'Telegram Notifications', desc: 'Optional bot summaries and logs', icon: Shield },
                { key: 'marketingMuted' as const, label: 'Mute Marketing Broadcasts', desc: 'Suppress promotional flash deals and updates', icon: SlidersHorizontal }
              ].map(item => (
                <div key={item.key} className="flex justify-between items-center p-3.5 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-white">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceChange(item.key, !preferences[item.key])}
                    className="text-slate-400 hover:text-white"
                  >
                    {preferences[item.key] ? (
                      <ToggleRight className="w-8 h-8 text-[#FFC107]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUTOMATION RULES TAB */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Rules list */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-3">Active Triggers Automation Rules</h3>
              <div className="space-y-3">
                {rules.length === 0 ? (
                  <p className="text-center text-slate-500 text-xs py-8">No automation rules created.</p>
                ) : (
                  rules.map(rule => {
                    let action = { roles: [], channels: [] };
                    try {
                      action = JSON.parse(rule.actionPayload);
                    } catch (_) {}
                    return (
                      <div key={rule.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/20 px-1.5 py-0.25 rounded">{rule.triggerEvent}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            Notify roles: <span className="text-slate-200 font-bold">{action.roles?.join(', ')}</span> 
                            {' '}via channels: <span className="text-slate-200 font-bold">{action.channels?.join(', ')}</span>
                          </p>
                        </div>
                        <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border ${
                          rule.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500'
                        }`}>
                          {rule.isActive ? 'ACTIVE' : 'MUTED'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Create Rule Form */}
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4 h-fit">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-3">Configure Rule Node</h3>
              <form onSubmit={handleSaveRuleSubmit} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Trigger Event</label>
                  <select
                    value={newRuleEvent}
                    onChange={e => setNewRuleEvent(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white"
                  >
                    <option value="ORDER_DELIVERED">ORDER_DELIVERED</option>
                    <option value="REFUND_APPROVED">REFUND_APPROVED</option>
                    <option value="WITHDRAWAL_REQUESTED">WITHDRAWAL_REQUESTED</option>
                    <option value="DELIVERY_ASSIGNED">DELIVERY_ASSIGNED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Target Roles (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={newRuleRoles}
                    onChange={e => setNewRuleRoles(e.target.value)}
                    placeholder="CUSTOMER, VENDOR_ADMIN"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Target Channels (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={newRuleChannels}
                    onChange={e => setNewRuleChannels(e.target.value)}
                    placeholder="In-App, Email, SMS"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white font-semibold"
                  />
                </div>
                <div className="flex items-center justify-between p-1">
                  <span className="text-slate-400">Rule Active Status</span>
                  <button
                    type="button"
                    onClick={() => setNewRuleActive(!newRuleActive)}
                    className="text-slate-400"
                  >
                    {newRuleActive ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-500" />
                    )}
                  </button>
                </div>
                <button type="submit" className="w-full bg-emerald-500 text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Save Rule Node
                </button>
              </form>
            </div>
          </div>
        )}

        {/* AI PREDICTION SANDBOX */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* AI smart forecast info */}
            <div className="bg-[#1F2937]/35 border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Intelligent Dispatch Sandbox
                </span>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  Zibonbaba's AI engine automatically monitors catalog inventory, reseller quota completions, customer engagement patterns, and payment logs. Use this form to simulate prediction notifications.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10.5px]">
                    <span className="text-indigo-400 font-bold">Smart Timing</span>: Messages are queued and delivered during active hours to maximize read-rates.
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10.5px]">
                    <span className="text-indigo-400 font-bold">Predictive Risk Alerts</span>: Triggers automatically on low stock depletion or customer churn probabilities.
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4 mt-6 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Model: zibonbaba-notify-v1</span>
                <span>Inference: 45ms</span>
              </div>
            </div>

            {/* AI trigger form */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-3">Simulate AI Inference Trigger</h3>
              <form onSubmit={handleTriggerAiSubmit} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Target User ID (e.g. self)</label>
                  <input
                    type="text"
                    required
                    value={aiTargetUser}
                    onChange={e => setAiTargetUser(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Alert Title</label>
                  <input
                    type="text"
                    required
                    value={aiTitle}
                    onChange={e => setAiTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Alert Description Body</label>
                  <textarea
                    rows={3}
                    required
                    value={aiBody}
                    onChange={e => setAiBody(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Priority</label>
                    <select
                      value={aiPriority}
                      onChange={e => setAiPriority(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white"
                    >
                      <option value="INFO">INFO</option>
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Module</label>
                    <select
                      value={aiModule}
                      onChange={e => setAiModule(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2.5 text-white"
                    >
                      <option value="MARKETPLACE">Marketplace</option>
                      <option value="ERP">ERP</option>
                      <option value="CRM">CRM</option>
                      <option value="HRM">HRM</option>
                      <option value="FINANCE">Finance</option>
                      <option value="WALLET">Wallet</option>
                      <option value="SECURITY">Security</option>
                      <option value="SUPPORT">Support</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-500 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-indigo-500/10 hover:shadow-lg">
                  <Play className="w-4 h-4 fill-current" />
                  Trigger Inference Event
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
