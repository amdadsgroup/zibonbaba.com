'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Trash2,
  Plus,
  RefreshCw,
  Globe,
  Key,
  Smartphone,
  Eye,
  UserX,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ip: string;
  device: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
}

interface ActiveSession {
  id: string;
  user: string;
  email: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  loginTime: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-07-28 18:40:12', user: 'superadmin@zibonbaba.com', action: 'SUPERADMIN_LOGIN_SUCCESS', ip: '103.14.28.91', device: 'Chrome / Windows 11', risk: 'LOW', status: 'ALLOWED' },
  { id: 'log-2', timestamp: '2026-07-28 18:35:01', user: 'unknown_attacker@dark.net', action: 'BRUTE_FORCE_ATTEMPT', ip: '185.220.101.4', device: 'Python Requests Script', risk: 'CRITICAL', status: 'BLOCKED' },
  { id: 'log-3', timestamp: '2026-07-28 18:12:44', user: 'vendor@zibonbaba.com', action: 'PRODUCT_BULK_DELETE', ip: '118.179.45.12', device: 'Firefox / macOS', risk: 'MEDIUM', status: 'ALLOWED' },
  { id: 'log-4', timestamp: '2026-07-28 17:50:20', user: 'customer@zibonbaba.com', action: 'PASSWORD_RESET_REQUEST', ip: '203.112.55.8', device: 'Safari / iPhone 15', risk: 'LOW', status: 'ALLOWED' },
  { id: 'log-5', timestamp: '2026-07-28 17:22:15', user: 'staff@zibonbaba.com', action: 'UNAUTHORIZED_API_ACCESS', ip: '45.15.24.99', device: 'Postman Client', risk: 'HIGH', status: 'FLAGGED' },
  { id: 'log-6', timestamp: '2026-07-28 16:45:00', user: 'accountant@zibonbaba.com', action: 'EXPORT_FINANCE_REPORT', ip: '103.14.28.92', device: 'Edge / Windows 10', risk: 'LOW', status: 'ALLOWED' },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', user: 'Super Admin', email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', ip: '103.14.28.91', location: 'Dhaka, Bangladesh', device: 'Chrome on Windows 11', loginTime: '10 mins ago' },
  { id: 'sess-2', user: 'Vendor Admin', email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', ip: '118.179.45.12', location: 'Chittagong, Bangladesh', device: 'Firefox on macOS', loginTime: '45 mins ago' },
  { id: 'sess-3', user: 'Support Manager', email: 'support@zibonbaba.com', role: 'CUSTOMER_SUPPORT', ip: '203.112.55.8', location: 'Sylhet, Bangladesh', device: 'Safari on iPad', loginTime: '2 hours ago' },
  { id: 'sess-4', user: 'Warehouse Mgr', email: 'warehouse@zibonbaba.com', role: 'WAREHOUSE_MANAGER', ip: '103.14.28.95', location: 'Dhaka, Bangladesh', device: 'Chrome on Android', loginTime: '3 hours ago' },
];

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [blacklistedIps, setBlacklistedIps] = useState<string[]>(['185.220.101.4', '45.15.24.99']);
  const [newIpInput, setNewIpInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
            setLogs(data.logs.map((l: any) => ({
              id: l.id,
              timestamp: new Date(l.createdAt).toLocaleString(),
              user: l.user?.email || 'System / Anonymous',
              action: l.action,
              ip: l.ipAddress || '127.0.0.1',
              device: l.userAgent || 'Web Browser',
              risk: (l.action.includes('FAIL') || l.action.includes('ERROR') || l.action.includes('BLOCK')) ? 'HIGH' : 'LOW',
              status: l.action.includes('BLOCK') ? 'BLOCKED' : 'ALLOWED'
            })));
          }
        })
        .catch(() => {});
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRevokeSession = (sessionId: string, userEmail: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Active login session for ${userEmail} has been revoked.`);
  };

  const handleRevokeAllSessions = () => {
    setSessions([]);
    showToast('All non-admin active sessions have been forcibly terminated.');
  };

  const handleAddBlacklistIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    if (blacklistedIps.includes(newIpInput.trim())) {
      showToast(`IP ${newIpInput} is already blacklisted.`);
      return;
    }
    setBlacklistedIps((prev) => [...prev, newIpInput.trim()]);
    showToast(`IP Address ${newIpInput} added to security blacklist.`);
    setNewIpInput('');
  };

  const handleRemoveBlacklistIp = (ip: string) => {
    setBlacklistedIps((prev) => prev.filter((item) => item !== ip));
    showToast(`IP ${ip} removed from blacklist.`);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    const matchesRisk = riskFilter === 'ALL' || log.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <SuperAdminLayout
      activeNav="security"
      title="Security & System Audit Center"
      subtitle="Real-time Intrusion Logs, Active Session Revocation & IP Blacklist Firewall Controls"
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

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Security Threats Blocked', value: '142', change: '+14 today', color: 'border-rose-500/30 text-rose-400', icon: Shield },
          { label: 'Active User Sessions', value: sessions.length.toString(), change: 'Live tracked', color: 'border-emerald-500/30 text-emerald-400', icon: Smartphone },
          { label: 'Blacklisted IP Addresses', value: blacklistedIps.length.toString(), change: 'Firewall protected', color: 'border-amber-500/30 text-amber-400', icon: Globe },
          { label: '2FA Compliance Rate', value: '98.5%', change: 'Mandatory on Admin', color: 'border-blue-500/30 text-blue-400', icon: Key },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-slate-950 p-5 rounded-3xl border ${stat.color} shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{stat.label}</span>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">{stat.change}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* ── Active Sessions Section (2 Cols) ── */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Active User Login Sessions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage live user tokens and terminate suspicious sessions</p>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={handleRevokeAllSessions}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <UserX size={14} /> Revoke All Sessions
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No active user sessions found.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">{sess.user}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                        {sess.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{sess.email} · {sess.device}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">IP: {sess.ip} ({sess.location}) · {sess.loginTime}</p>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(sess.id, sess.email)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto shrink-0"
                  >
                    Revoke Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── IP Blacklist Firewall (1 Col) ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <div className="pb-4 border-b border-slate-800 mb-5">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" /> IP Firewall Blacklist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Block malicous IPs from accessing Zibonbaba</p>
          </div>

          <form onSubmit={handleAddBlacklistIp} className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="e.g. 185.220.101.5"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 shrink-0"
            >
              <Plus size={14} /> Add IP
            </button>
          </form>

          <div className="flex-1 space-y-2 max-h-64 overflow-y-auto scrollbar-none">
            {blacklistedIps.map((ip) => (
              <div key={ip} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="font-mono font-bold text-white">{ip}</span>
                </div>
                <button
                  onClick={() => handleRemoveBlacklistIp(ip)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove from blacklist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Audit Logs Table ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" /> Live Security Audit Logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit trail of authentication and platform operations</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white">
              <Search size={14} className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Filter logs by user or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-xs placeholder:text-slate-500"
              />
            </div>
            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">IP Address & Device</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-white">{log.user}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400 text-[11px]">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="font-mono text-slate-200 block">{log.ip}</span>
                    <span className="text-[10px] text-slate-500 block">{log.device}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      log.risk === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      log.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      log.risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {log.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      log.status === 'ALLOWED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      log.status === 'BLOCKED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
