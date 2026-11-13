'use strict';
'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Smartphone, 
  Laptop, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  Activity,
  Trash2
} from 'lucide-react';
import { SecuritySessionItem } from '../types';

interface SecurityModuleProps {
  sessions?: SecuritySessionItem[];
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeAllOther?: () => Promise<void>;
}

const SAMPLE_SESSIONS: SecuritySessionItem[] = [
  {
    id: 'ses_01',
    userEmail: 'admin@zibonbaba.com',
    role: 'SUPER_ADMIN',
    ipAddress: '103.145.24.12',
    device: 'Windows 11 · Chrome 130',
    loginTime: new Date().toISOString(),
    location: 'Dhaka, Bangladesh',
    status: 'ACTIVE'
  },
  {
    id: 'ses_02',
    userEmail: 'finance@zibonbaba.com',
    role: 'FINANCE_ADMIN',
    ipAddress: '103.48.26.90',
    device: 'macOS Sonoma · Safari 17',
    loginTime: new Date(Date.now() - 10800000).toISOString(),
    location: 'Chittagong, Bangladesh',
    status: 'ACTIVE'
  },
  {
    id: 'ses_03',
    userEmail: 'moderator@zibonbaba.com',
    role: 'CATALOG_MANAGER',
    ipAddress: '118.179.88.4',
    device: 'Ubuntu Linux · Firefox 128',
    loginTime: new Date(Date.now() - 43200000).toISOString(),
    location: 'Sylhet, Bangladesh',
    status: 'ACTIVE'
  }
];

const RECENT_BLOCKED_ATTEMPTS = [
  {
    ip: '185.220.101.5',
    target: 'admin@zibonbaba.com',
    attempts: 8,
    lastSeen: '12 minutes ago',
    location: 'Tor Exit Node / Frankfurt',
    reason: 'Exceeded maximum failed password limit'
  },
  {
    ip: '45.154.255.89',
    target: 'root@zibonbaba.com',
    attempts: 14,
    lastSeen: '1 hour ago',
    location: 'Seychelles',
    reason: 'Credential stuffing attack pattern'
  }
];

export function SecurityModule({
  sessions = SAMPLE_SESSIONS,
  onRevokeSession,
  onRevokeAllOther
}: SecurityModuleProps) {
  const [activeSessions, setActiveSessions] = useState<SecuritySessionItem[]>(
    sessions.length > 0 ? sessions : SAMPLE_SESSIONS
  );
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const handleRevoke = async (id: string) => {
    if (confirm('Revoke this active administrative session immediately? The user will be logged out.')) {
      if (onRevokeSession) {
        await onRevokeSession(id);
      }
      setActiveSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleRevokeAll = async () => {
    if (confirm('Terminate all active sessions except your current session?')) {
      if (onRevokeAllOther) {
        await onRevokeAllOther();
      }
      setActiveSessions(prev => prev.slice(0, 1)); // keep current
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-[#FFC107]" /> Security & Session Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor administrative access, active devices, and brute force perimeter defense for Zibonbaba.com
          </p>
        </div>
        <button
          onClick={handleRevokeAll}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none"
        >
          <LogOut className="w-4 h-4" /> Revoke All Other Sessions
        </button>
      </div>

      {/* Security Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Admin Sessions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeSessions.length}</p>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All TLS 1.3 Encrypted
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Perimeter Firewall</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">ACTIVE</p>
          <span className="text-xs text-slate-400 mt-1 block">Sliding-window IP rate limiting</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Failed Logins (24h)</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">22</p>
          <span className="text-xs text-slate-400 mt-1 block">100% intercepted & blocked</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">2FA Compliance</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">MANDATORY</p>
          <span className="text-xs text-slate-400 mt-1 block">Hardware / TOTP Authenticator</span>
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> Active Authenticated Sessions
          </h3>
          <span className="text-xs text-slate-400">Live WebSockets synchronized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Admin Account</th>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">Location & IP</th>
                <th className="py-3 px-4">Signed In At</th>
                <th className="py-3 px-4 text-right">Revoke Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSessions.map((session, index) => (
                <tr key={session.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      {session.userEmail}
                      {index === 0 && (
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{session.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Laptop className="w-3.5 h-3.5 text-slate-400" />
                      {session.device}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {session.location} ({session.ipAddress})
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(session.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {index !== 0 ? (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                      >
                        Terminate
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">Self</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked Threats & Brute Force Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-red-50/50 flex items-center justify-between">
          <h3 className="font-bold text-red-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> Suspicious Login Attempts & IP Blacklist
          </h3>
          <span className="text-xs text-red-700 font-medium">Automatic 24-hour quarantine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Blocked IP</th>
                <th className="py-3 px-4">Targeted Username</th>
                <th className="py-3 px-4">Failed Hits</th>
                <th className="py-3 px-4">Geo Origin</th>
                <th className="py-3 px-4">Mitigation Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_BLOCKED_ATTEMPTS.map((block) => (
                <tr key={block.ip} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-red-700">{block.ip}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{block.target}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{block.attempts} strikes</td>
                  <td className="py-3 px-4 text-slate-600">{block.location}</td>
                  <td className="py-3 px-4 text-slate-500 italic">{block.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

