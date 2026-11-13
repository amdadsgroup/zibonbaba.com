'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './admin-sidebar';
import AdminTopNav from './admin-topnav';
import AdminGlobalSearch from './admin-global-search';
import { AdminModule, DateRange } from './types';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  adminUser?: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  pendingApprovalsCount?: number;
  pendingOrdersCount?: number;
}

export default function AdminLayout({
  children,
  activeModule,
  onSelectModule,
  dateRange,
  onDateRangeChange,
  adminUser,
  onLogout,
  pendingApprovalsCount = 0,
  pendingOrdersCount = 0
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Close mobile drawer on module navigation
  const handleSelectModule = (mod: AdminModule) => {
    onSelectModule(mod);
    setIsMobileOpen(false);
  };

  // Determine Greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateRangeOptions: Array<{ id: DateRange; label: string }> = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'custom', label: 'Custom' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-800 flex overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          pendingApprovalsCount={pendingApprovalsCount}
          pendingOrdersCount={pendingOrdersCount}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AdminSidebar
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          isCollapsed={false}
          onToggleCollapse={() => setIsMobileOpen(false)}
          pendingApprovalsCount={pendingApprovalsCount}
          pendingOrdersCount={pendingOrdersCount}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation */}
        <AdminTopNav
          onToggleSidebar={() => setIsMobileOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={handleSelectModule}
          adminUser={adminUser}
          onLogout={onLogout}
          notificationsCount={pendingApprovalsCount + (pendingOrdersCount > 0 ? 1 : 0)}
        />

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {/* Header Banner for Top Overview */}
          {activeModule === 'dashboard' && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  <span>{getGreeting()}, {adminUser?.name?.split(' ')[0] || 'Admin'}</span>
                  <span className="inline-block animate-wave">👋</span>
                </h1>
                <p className="text-xs md:text-sm text-neutral-500 font-medium mt-0.5">
                  Here&apos;s what&apos;s happening across Zibonbaba today.
                </p>
              </div>

              {/* Date Range Selector Pills */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-x-auto max-w-full">
                <Calendar size={14} className="text-neutral-400 ml-2 shrink-0 hidden sm:block" />
                {dateRangeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onDateRangeChange(opt.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                      dateRange === opt.id
                        ? 'bg-[#FFC107] text-neutral-900 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Module Dynamic Content */}
          <div className="min-w-0">{children}</div>
        </main>
      </div>

      {/* Global Command Palette / Search */}
      <AdminGlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleSelectModule}
      />
    </div>
  );
}

