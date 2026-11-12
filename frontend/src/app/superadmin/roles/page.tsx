'use client';

import React, { useState } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Key,
  Shield,
  Users,
  CheckCircle,
  Plus,
  Save,
  ShoppingBag,
  Package,
  FileText,
  DollarSign,
  Lock,
  X,
  UserCheck,
} from 'lucide-react';

interface PermissionItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PermissionCategory {
  moduleName: string;
  icon: React.ElementType;
  items: PermissionItem[];
}

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color: string;
  matrix: PermissionCategory[];
}

const DEFAULT_CATEGORIES: PermissionCategory[] = [
  {
    moduleName: 'User & Identity Management',
    icon: Users,
    items: [
      { id: 'users.view', label: 'View User Profiles', enabled: true },
      { id: 'users.create', label: 'Create New Accounts', enabled: true },
      { id: 'users.edit', label: 'Modify User Role/Details', enabled: true },
      { id: 'users.delete', label: 'Delete & Suspend Accounts', enabled: true },
    ],
  },
  {
    moduleName: 'Marketplace & Products',
    icon: ShoppingBag,
    items: [
      { id: 'catalog.view', label: 'View Product Catalog', enabled: true },
      { id: 'catalog.create', label: 'List New Products', enabled: true },
      { id: 'catalog.approve', label: 'Approve Vendor Listings', enabled: true },
      { id: 'catalog.delete', label: 'Remove Product Items', enabled: true },
    ],
  },
  {
    moduleName: 'Order Processing & Tracking',
    icon: FileText,
    items: [
      { id: 'orders.view', label: 'View Customer Orders', enabled: true },
      { id: 'orders.process', label: 'Dispatch & Ship Orders', enabled: true },
      { id: 'orders.cancel', label: 'Cancel Customer Orders', enabled: true },
      { id: 'orders.refund', label: 'Issue Order Refunds', enabled: true },
    ],
  },
  {
    moduleName: 'Multi-Warehouse & Inventory',
    icon: Package,
    items: [
      { id: 'inventory.view', label: 'View Warehouse Stock', enabled: true },
      { id: 'inventory.transfer', label: 'Transfer Stock Across Branches', enabled: true },
      { id: 'inventory.adjust', label: 'Adjust Audit Quantities', enabled: true },
    ],
  },
  {
    moduleName: 'Finance, ERP & Payouts',
    icon: DollarSign,
    items: [
      { id: 'finance.view', label: 'View Financial Ledger', enabled: true },
      { id: 'finance.payout', label: 'Approve Merchant Withdrawals', enabled: true },
      { id: 'finance.export', label: 'Export Tax & Accounting Logs', enabled: true },
    ],
  },
  {
    moduleName: 'System Security & Firewall',
    icon: Lock,
    items: [
      { id: 'security.logs', label: 'View System Audit Logs', enabled: true },
      { id: 'security.sessions', label: 'Revoke Active Sessions', enabled: true },
      { id: 'security.blacklist', label: 'Manage IP Blacklist', enabled: true },
    ],
  },
];

const INITIAL_ROLES: RoleConfig[] = [
  { id: 'SUPER_ADMIN', name: 'Super Admin', description: 'Unrestricted full platform control across all system modules', isSystem: true, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'ADMIN', name: 'Platform Admin', description: 'Platform operations, vendor approvals and moderation', isSystem: true, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'MANAGER', name: 'Operations Manager', description: 'Operations oversight, support escalation and fulfillment', isSystem: true, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'ACCOUNTANT', name: 'Chief Accountant', description: 'Financial ledger, merchant payouts and tax compliance', isSystem: true, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'CUSTOMER_SUPPORT', name: 'Support Agent', description: 'Customer tickets, order tracking assistance', isSystem: true, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'MARKETING', name: 'Marketing Manager', description: 'Banners, promotions, campaigns and SEO', isSystem: true, color: 'bg-lime-500/20 text-lime-400 border-lime-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'WAREHOUSE_MANAGER', name: 'Warehouse Supervisor', description: 'Stock replenishment, transfers and barcode POS', isSystem: true, color: 'bg-teal-500/20 text-teal-400 border-teal-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'DELIVERY_MANAGER', name: 'Delivery Manager', description: 'Rider dispatch, route tracking and logistics', isSystem: true, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'VENDOR_ADMIN', name: 'Vendor Admin', description: 'Store products, inventory, orders and branch POS', isSystem: true, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'VENDOR_STAFF', name: 'Vendor Staff', description: 'Store cashier and inventory stock updating', isSystem: true, color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'RESELLER', name: 'Reseller Agent', description: 'Affiliate product links and sales commissions', isSystem: true, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', matrix: DEFAULT_CATEGORIES },
  { id: 'DELIVERY_MAN', name: 'Courier / Rider', description: 'Order delivery updates and OTP confirmation', isSystem: true, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', matrix: DEFAULT_CATEGORIES },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleConfig[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('SUPER_ADMIN');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Role Modal
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (catIdx: number, itemIdx: number) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === selectedRoleId) {
          const newMatrix = JSON.parse(JSON.stringify(role.matrix));
          newMatrix[catIdx].items[itemIdx].enabled = !newMatrix[catIdx].items[itemIdx].enabled;
          return { ...role, matrix: newMatrix };
        }
        return role;
      })
    );
  };

  const handleToggleGroup = (catIdx: number, enable: boolean) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === selectedRoleId) {
          const newMatrix = JSON.parse(JSON.stringify(role.matrix));
          newMatrix[catIdx].items.forEach((item: any) => (item.enabled = enable));
          return { ...role, matrix: newMatrix };
        }
        return role;
      })
    );
  };

  const handleSaveMatrix = () => {
    showToast(`Permission matrix for role "${activeRole.name}" saved successfully!`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const roleId = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
    const newRoleObj: RoleConfig = {
      id: roleId,
      name: newRoleName,
      description: newRoleDesc || 'Custom RBAC Role',
      isSystem: false,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      matrix: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
    };
    setRoles((prev) => [...prev, newRoleObj]);
    setSelectedRoleId(roleId);
    showToast(`Custom Role "${newRoleName}" created successfully!`);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  return (
    <SuperAdminLayout
      activeNav="roles"
      title="Role-Based Access Control (RBAC) & Permission Matrix"
      subtitle="Configure Granular Granular Module Permissions Across All 14 System Roles"
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

      {/* ── Top Bar Controls ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Configure System Roles</h2>
          <p className="text-xs text-slate-400">Select a role below to customize its authorization matrix</p>
        </div>
        <button
          onClick={() => setShowAddRoleModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      {/* ── Horizontal Role Selector Pills ── */}
      <div className="flex gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto scrollbar-none">
        {roles.map((r) => {
          const isSelected = r.id === selectedRoleId;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{r.name}</span>
              {r.isSystem && (
                <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full font-black ${
                  isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'
                }`}>
                  System
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Selected Role Detail Banner & Save Button ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white">{activeRole.name}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black border ${activeRole.color}`}>
              {activeRole.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{activeRole.description}</p>
        </div>

        <button
          onClick={handleSaveMatrix}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Save size={16} /> Save Permission Matrix
        </button>
      </div>

      {/* ── Permission Matrix Categories ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {activeRole.matrix.map((category, catIdx) => {
          const Icon = category.icon;
          const allEnabled = category.items.every((i) => i.enabled);

          return (
            <div key={category.moduleName} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-amber-400" />
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">{category.moduleName}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleGroup(catIdx, !allEnabled)}
                    className="text-[10px] font-black text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {allEnabled ? 'Disable All' : 'Enable All'}
                  </button>
                </div>

                <div className="space-y-3">
                  {category.items.map((perm, itemIdx) => (
                    <label key={perm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors">
                      <span className="text-xs font-bold text-slate-300">{perm.label}</span>
                      <input
                        type="checkbox"
                        checked={perm.enabled}
                        onChange={() => handleTogglePermission(catIdx, itemIdx)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create Role Modal ── */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Create Custom RBAC Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Role Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Auditor"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the access scope for this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
