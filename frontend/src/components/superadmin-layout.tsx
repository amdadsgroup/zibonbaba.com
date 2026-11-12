'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Users,
  Key,
  Lock,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  Bell,
  Search,
  Activity,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  title?: string;
  subtitle?: string;
}

export default function SuperAdminLayout({
  children,
  activeNav,
  title = 'Super Admin Control Hub',
  subtitle = 'Platform-wide Security, RBAC & Enterprise System Controls',
}: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, role, logout, username } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Login Required</h1>
          <p className="text-xs text-slate-400 mb-6">
            Please log in to your account to access the Super Admin Panel.
          </p>
          <Link
            href="/login"
            className="bg-[#FFC107] text-slate-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center shadow-lg hover:bg-amber-400 transition-colors"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  // Strict role check
  const normalizedRole = (role || '').toLowerCase();
  if (normalizedRole !== 'superadmin' && normalizedRole !== 'super_admin' && normalizedRole !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <Shield size={24} className="text-rose-500" />
          </div>
          <h1 className="text-xl font-black mb-2">Access Denied</h1>
          <p className="text-xs text-slate-400 mb-6">
            Strict Dashboard Isolation is active. You do not have permission to view the Super Admin Hub.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white/5 border border-white/10 text-slate-300 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard, key: 'dashboard' },
    { label: 'Accounts', href: '/superadmin/accounts', icon: Users, key: 'accounts' },
    { label: 'Roles & Permissions', href: '/superadmin/roles', icon: Key, key: 'roles' },
    { label: 'Security Logs', href: '/superadmin/security', icon: Lock, key: 'security' },
    { label: 'Reports', href: '/superadmin/reports', icon: BarChart2, key: 'reports' },
    { label: 'Settings', href: '/superadmin/settings', icon: Settings, key: 'settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* ── Sidebar Navigation ── */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col z-20 shadow-2xl`}
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
          <Link href="/superadmin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg text-slate-950 font-black text-xl">
              Z
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-white font-black text-base tracking-tight leading-none truncate">Zibonbaba</p>
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block mt-0.5">
                  Super Admin
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav ? activeNav === item.key : pathname === item.href || (item.href !== '/superadmin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-bold'
                }`}
                title={item.label}
              >
                <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                {sidebarOpen && <span className="text-xs truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {sidebarOpen ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-xs shrink-0">
                  {username ? username.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white truncate">{username || 'Super Admin'}</p>
                  <span className="text-[9px] text-emerald-400 font-extrabold uppercase">Verified Admin</span>
                </div>
              </div>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-transparent transition-all text-xs font-extrabold"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Region ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        {/* Top Header Bar */}
        <header className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-md backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Toggle Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">{title}</h1>
              <p className="text-[11px] text-slate-400 font-semibold">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5 text-xs text-slate-300 focus-within:border-amber-500/50 w-64 transition-all">
              <Search size={14} className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Quick search accounts, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full text-xs placeholder:text-slate-500 font-medium"
              />
            </div>

            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-3 py-1.5 rounded-2xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All Systems Operational</span>
            </div>

            {/* Back to Site Button */}
            <Link
              href="/customer"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs px-3 py-2 rounded-2xl transition-colors flex items-center gap-1.5"
            >
              <span>Customer View</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  );
}
