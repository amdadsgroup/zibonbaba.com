'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  Shield,
  LogOut,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings
} from 'lucide-react';
import { AdminModule } from './types';
import Link from 'next/link';

interface AdminTopNavProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onNavigate: (module: AdminModule) => void;
  adminUser?: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  notificationsCount?: number;
}

export default function AdminTopNav({
  onToggleSidebar,
  onOpenSearch,
  onNavigate,
  adminUser = { name: 'Zibonbaba Admin', email: 'admin@zibonbaba.com', role: 'SUPER_ADMIN' },
  onLogout,
  notificationsCount = 3
}: AdminTopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: 'New Vendor Application',
      desc: 'Tech Baba Electronics submitted KYC documents for approval',
      time: '10m ago',
      type: 'warning',
      module: 'vendors' as AdminModule
    },
    {
      id: 2,
      title: 'Order Surge Alert',
      desc: '15 new orders confirmed in the last hour',
      time: '25m ago',
      type: 'info',
      module: 'orders' as AdminModule
    },
    {
      id: 3,
      title: 'Product Pending Review',
      desc: 'Botanical Vitamin C Cream submitted for catalog verification',
      time: '1h ago',
      type: 'warning',
      module: 'product-approval' as AdminModule
    }
  ];

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Sidebar Toggle + Global Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar Input / Trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-500 transition-all text-left shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search size={16} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
            <span className="truncate">Search vendors, orders, products...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-neutral-400 bg-white px-2 py-0.5 rounded border border-neutral-200 shrink-0">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Quick Action, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFC107] hover:bg-[#FFB800] text-neutral-900 font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown size={14} className="text-neutral-700" />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-30 animate-fade-in text-xs font-semibold text-neutral-700">
              <button
                onClick={() => {
                  onNavigate('products');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between"
              >
                <span>Add Product</span>
                <span className="text-[10px] text-neutral-400 font-mono">P</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('categories');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between"
              >
                <span>Add Category</span>
                <span className="text-[10px] text-neutral-400 font-mono">C</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('campaigns');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between"
              >
                <span>New Campaign</span>
                <span className="text-[10px] text-neutral-400 font-mono">M</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('admin-users');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between"
              >
                <span>Invite Admin</span>
                <span className="text-[10px] text-neutral-400 font-mono">U</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Marketplace Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-semibold transition-colors border border-transparent"
          title="Visit Public Marketplace in new tab"
        >
          <ExternalLink size={14} />
          <span>Live Store</span>
        </Link>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 relative transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            {notificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden z-30 animate-fade-in">
              <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between">
                <span className="font-bold text-xs text-neutral-900">Notifications</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {notificationsCount} New
                </span>
              </div>
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {sampleNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNavigate(n.module);
                      setNotificationsOpen(false);
                    }}
                    className="p-3 hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-neutral-800 truncate">{n.title}</span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                        <Clock size={10} /> {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2">{n.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  onNavigate('notifications');
                  setNotificationsOpen(false);
                }}
                className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 text-center font-bold text-[11px] text-neutral-600 border-t border-neutral-100 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-[#FFC107] font-black text-xs flex items-center justify-center shadow-xs">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-neutral-800 truncate max-w-[120px]">
                {adminUser.name}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono truncate">
                {adminUser.role.replace('_', ' ')}
              </span>
            </div>
            <ChevronDown size={14} className="text-neutral-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-30 animate-fade-in text-xs font-semibold text-neutral-700">
              <div className="px-3.5 py-2.5 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900 truncate">{adminUser.name}</p>
                <p className="text-[11px] text-neutral-400 font-mono truncate">{adminUser.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setProfileOpen(false);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700"
                >
                  <Settings size={15} className="text-neutral-400" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('security');
                    setProfileOpen(false);
                  }}
                  className="w-full px-3.5 py-2 hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700"
                >
                  <Shield size={15} className="text-neutral-400" />
                  <span>Security & Sessions</span>
                </button>
              </div>

              <div className="pt-1 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 hover:bg-red-50 flex items-center gap-2.5 text-red-600 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

