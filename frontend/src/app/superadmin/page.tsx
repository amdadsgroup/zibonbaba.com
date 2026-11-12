'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Users,
  Shield,
  Settings,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  ShoppingBag,
  TrendingUp,
  HeadphonesIcon,
  ChevronRight,
  BarChart2,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX,
} from 'lucide-react';

const INITIAL_STATS = [
  {
    label: 'Total Users & Accounts',
    value: '14 Accounts',
    change: '+14 Active Roles',
    positive: true,
    icon: Users,
    color: 'border-blue-500/30 text-blue-400',
    link: '/superadmin/accounts',
  },
  {
    label: 'System Roles Configured',
    value: '14 Roles',
    change: '32 Permissions Active',
    positive: true,
    icon: Key,
    color: 'border-emerald-500/30 text-emerald-400',
    link: '/superadmin/roles',
  },
  {
    label: 'Security Threats & Alerts',
    value: '3 Threats Blocked',
    change: 'Firewall Active',
    positive: true,
    icon: Shield,
    color: 'border-rose-500/30 text-rose-400',
    link: '/superadmin/security',
  },
  {
    label: 'Platform Revenue (GMV)',
    value: '৳162.9M',
    change: '+19.2% Growth',
    positive: true,
    icon: TrendingUp,
    color: 'border-amber-500/30 text-amber-400',
    link: '/superadmin/reports',
  },
];

interface QuickAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joined: string;
}

const INITIAL_ACCOUNTS: QuickAccount[] = [
  { id: 'acc-1', name: 'Super Admin', email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', status: 'ACTIVE', joined: '2026-01-01' },
  { id: 'acc-2', name: 'Platform Admin', email: 'admin@zibonbaba.com', role: 'ADMIN', status: 'ACTIVE', joined: '2026-01-05' },
  { id: 'acc-3', name: 'Operations Manager', email: 'manager@zibonbaba.com', role: 'MANAGER', status: 'ACTIVE', joined: '2026-02-10' },
  { id: 'acc-4', name: 'Chief Accountant', email: 'accountant@zibonbaba.com', role: 'ACCOUNTANT', status: 'ACTIVE', joined: '2026-02-14' },
  { id: 'acc-5', name: 'Support Lead', email: 'support@zibonbaba.com', role: 'CUSTOMER_SUPPORT', status: 'ACTIVE', joined: '2026-03-01' },
  { id: 'acc-6', name: 'Warehouse Supervisor', email: 'warehouse@zibonbaba.com', role: 'WAREHOUSE_MANAGER', status: 'ACTIVE', joined: '2026-03-12' },
  { id: 'acc-7', name: 'Vendor Owner', email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', status: 'ACTIVE', joined: '2026-04-01' },
];

export default function SuperAdminDashboard() {
  const [accounts, setAccounts] = useState<QuickAccount[]>(INITIAL_ACCOUNTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const newStatus = acc.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast(`Account ${acc.email} status changed to ${newStatus}.`);
          return { ...acc, status: newStatus };
        }
        return acc;
      })
    );
  };

  const handleDeleteAccount = (id: string, email: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    showToast(`Account ${email} has been removed.`);
  };

  return (
    <SuperAdminLayout
      activeNav="dashboard"
      title="Executive Overview Dashboard"
      subtitle="Real-time KPI metrics, System Health Monitor & Quick Admin Controls"
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

      {/* ── KPI Stat Cards (All Clickable) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {INITIAL_STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.link}
              className={`bg-slate-950 p-5 rounded-3xl border ${stat.color} hover:border-amber-500/50 transition-all shadow-xl group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider group-hover:text-amber-400 transition-colors">
                  {stat.label}
                </span>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <div className="flex items-center justify-between mt-2 text-xs font-bold text-emerald-400">
                <span>{stat.change}</span>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Action Hub Bar ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Quick Executive Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/superadmin/accounts?action=create"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs p-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
          >
            <Plus size={16} /> Create User Account
          </Link>
          <Link
            href="/superadmin/roles"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center"
          >
            <Key size={16} className="text-amber-400" /> Manage Permissions
          </Link>
          <Link
            href="/superadmin/security"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center"
          >
            <Lock size={16} className="text-rose-400" /> View Security Audit
          </Link>
          <Link
            href="/superadmin/reports"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center"
          >
            <BarChart2 size={16} className="text-emerald-400" /> Export Reports
          </Link>
        </div>
      </div>

      {/* ── Accounts Management Table Preview ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" /> Core System Accounts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Direct quick status toggling and account management</p>
          </div>
          <Link
            href="/superadmin/accounts"
            className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View All Accounts ({accounts.length}) <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black flex items-center justify-center text-[10px]">
                      {acc.name.charAt(0)}
                    </div>
                    {acc.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">{acc.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black border bg-slate-900 text-amber-400 border-slate-700">
                      {acc.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                      acc.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(acc.id, acc.status)}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50"
                        title="Toggle Active/Suspended status"
                      >
                        {acc.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.email)}
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
