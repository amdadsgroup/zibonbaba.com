'use client';

import React from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  CheckCircle2,
  FolderTree,
  Tag,
  ShoppingCart,
  Star,
  CreditCard,
  Percent,
  RotateCcw,
  Megaphone,
  Ticket,
  Zap,
  Image as ImageIcon,
  Bell,
  BarChart3,
  UserCheck,
  ShieldAlert,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Building2,
  Box,
  Brain,
  LucideIcon
} from 'lucide-react';
import { AdminModule } from './types';

interface AdminSidebarProps {
  activeModule: AdminModule;
  onSelectModule: (module: AdminModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingApprovalsCount?: number;
  pendingOrdersCount?: number;
}

interface NavItem {
  id: AdminModule;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeColor?: string;
  isFuture?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AdminSidebar({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  pendingApprovalsCount = 0,
  pendingOrdersCount = 0
}: AdminSidebarProps) {
  const navigationGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Marketplace',
      items: [
        { id: 'vendors', label: 'Vendors & Stores', icon: Store },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'products', label: 'Products Catalog', icon: Package },
        {
          id: 'product-approval',
          label: 'Product Approval',
          icon: CheckCircle2,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeColor: 'bg-amber-500 text-black'
        },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'brands', label: 'Brands', icon: Tag },
        {
          id: 'orders',
          label: 'Orders',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-blue-600 text-white'
        },
        { id: 'reviews', label: 'Reviews Moderation', icon: Star }
      ]
    },
    {
      group: 'Commerce',
      items: [
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'commissions', label: 'Commissions', icon: Percent },
        { id: 'refunds', label: 'Refunds & Returns', icon: RotateCcw }
      ]
    },
    {
      group: 'Marketing',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'coupons', label: 'Coupons', icon: Ticket },
        { id: 'flash-sales', label: 'Flash Sales', icon: Zap },
        { id: 'banners', label: 'Hero Banners', icon: ImageIcon }
      ]
    },
    {
      group: 'Communication',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell }
      ]
    },
    {
      group: 'Reports',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      group: 'Administration',
      items: [
        { id: 'admin-users', label: 'Admin Users', icon: UserCheck },
        { id: 'roles', label: 'Roles & RBAC', icon: Layers },
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'security', label: 'Security Center', icon: ShieldAlert }
      ]
    },
    {
      group: 'Settings',
      items: [
        { id: 'settings', label: 'Platform Settings', icon: Sliders }
      ]
    },
    {
      group: 'Phase 2 Preview',
      items: [
        { id: 'future', label: 'POS & ERP Terminal', icon: Building2, isFuture: true },
        { id: 'future', label: 'Warehouse & Inventory', icon: Box, isFuture: true },
        { id: 'future', label: 'AI Commerce Engine', icon: Brain, isFuture: true }
      ]
    }
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } shrink-0`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#FFC107] flex items-center justify-center font-black text-neutral-900 text-lg shadow-sm shrink-0">
            Z
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-neutral-900 truncate">
                Zibonbaba
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600">
                Control Plane
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-200">
        {navigationGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                {grp.group}
              </div>
            )}
            {grp.items.map((item, iIdx) => {
              const isActive = activeModule === item.id;
              const Icon = item.icon;

              if (item.isFuture) {
                return (
                  <div
                    key={iIdx}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 text-xs cursor-not-allowed opacity-60 ${
                      isCollapsed ? 'justify-center' : ''
                    }`}
                    title={`${item.label} (Scheduled for Phase 2)`}
                  >
                    <Icon size={18} className="shrink-0 text-neutral-400" />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 uppercase">
                          Phase 2
                        </span>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={iIdx}
                  onClick={() => onSelectModule(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FFC107]/15 text-neutral-900 font-bold border border-[#FFC107]/30 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-transparent'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-amber-600' : 'text-neutral-500'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Status Footprint */}
      {!isCollapsed && (
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-neutral-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">System Online</span>
            <span className="text-neutral-300 ml-auto font-mono">v1.2.4</span>
          </div>
        </div>
      )}
    </aside>
  );
}

