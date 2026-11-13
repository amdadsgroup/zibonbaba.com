'use strict';
'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Save, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface PermissionMatrix {
  [role: string]: {
    [moduleKey: string]: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
  };
}

const DEFAULT_PERMISSIONS: PermissionMatrix = {
  SUPER_ADMIN: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    vendors: { view: true, create: true, edit: true, delete: true },
    products: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: true },
    finance: { view: true, create: true, edit: true, delete: true },
    marketing: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
  },
  OPERATION_ADMIN: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    vendors: { view: true, create: true, edit: true, delete: false },
    products: { view: true, create: true, edit: true, delete: true },
    orders: { view: true, create: true, edit: true, delete: false },
    finance: { view: true, create: false, edit: false, delete: false },
    marketing: { view: true, create: true, edit: true, delete: false },
    users: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  FINANCE_ADMIN: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: false, edit: true, delete: false },
    finance: { view: true, create: true, edit: true, delete: false },
    marketing: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  CATALOG_MANAGER: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: true, edit: true, delete: true },
    orders: { view: false, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    marketing: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
  SUPPORT_AGENT: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    vendors: { view: true, create: false, edit: false, delete: false },
    products: { view: true, create: false, edit: false, delete: false },
    orders: { view: true, create: false, edit: true, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    marketing: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
  },
};

const MODULES_LIST = [
  { key: 'dashboard', label: 'Executive Dashboard & KPIs', desc: 'View high-level revenue and business health metrics' },
  { key: 'vendors', label: 'Vendors & Store Management', desc: 'Approve KYC, modify commission rates, suspend stores' },
  { key: 'products', label: 'Products & Moderation Queue', desc: 'Review, approve, reject, or purge catalog items' },
  { key: 'orders', label: 'Orders & Fulfillment Operations', desc: 'Track deliveries, update status, process customer refunds' },
  { key: 'finance', label: 'Commission, Payouts & Ledgers', desc: 'Manage settlement accounts, transaction ledger, payouts' },
  { key: 'marketing', label: 'Campaigns, Coupons & Banners', desc: 'Create promotional events and storefront banners' },
  { key: 'users', label: 'Staff Accounts & RBAC Control', desc: 'Add admins, adjust role privileges, audit activities' },
  { key: 'settings', label: 'Platform & Global Settings', desc: 'Payment gateways, SSLCommerz, bKash, system keys' },
];

export function RBACModule() {
  const [selectedRole, setSelectedRole] = useState<string>('OPERATION_ADMIN');
  const [matrix, setMatrix] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS);
  const [isSaved, setIsSaved] = useState(false);

  const togglePermission = (role: string, moduleKey: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    if (role === 'SUPER_ADMIN') return; // Super admin privileges are immutable

    setMatrix(prev => {
      const rolePerms = prev[role] || {};
      const modulePerms = rolePerms[moduleKey] || { view: false, create: false, edit: false, delete: false };

      return {
        ...prev,
        [role]: {
          ...rolePerms,
          [moduleKey]: {
            ...modulePerms,
            [action]: !modulePerms[action]
          }
        }
      };
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setMatrix(DEFAULT_PERMISSIONS);
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FFC107]" /> Roles & Permissions (RBAC)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define granular read/write/delete capabilities across all Zibonbaba admin subsystems.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none"
          >
            <Save className="w-4 h-4" /> Save Policy
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Role-Based Access Control matrix successfully applied and synchronized across active sessions.</span>
        </div>
      )}

      {/* Role Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'SUPER_ADMIN', name: 'Super Admin', lock: true },
          { key: 'OPERATION_ADMIN', name: 'Operation Admin' },
          { key: 'FINANCE_ADMIN', name: 'Finance Lead' },
          { key: 'CATALOG_MANAGER', name: 'Catalog Manager' },
          { key: 'SUPPORT_AGENT', name: 'Customer Support' },
        ].map((role) => (
          <button
            key={role.key}
            onClick={() => setSelectedRole(role.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedRole === role.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {role.lock && <Lock className="w-3 h-3 text-[#FFC107]" />}
            {role.name}
          </button>
        ))}
      </div>

      {/* Role Summary Banner */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            Managing: {selectedRole.replace('_', ' ')}
            {selectedRole === 'SUPER_ADMIN' && (
              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-md">
                UNRESTRICTED
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {selectedRole === 'SUPER_ADMIN' 
              ? 'Super Administrators retain complete uninhibited access to all systems, settings, and staff accounts. This role cannot be restricted.'
              : `Customize operations permitted for users granted the ${selectedRole} designation.`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-xs text-slate-400">Total Modules: 8</span>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-1/3">Subsystem / Module</th>
              <th className="py-3.5 px-4 text-center">View / Read</th>
              <th className="py-3.5 px-4 text-center">Create / Submit</th>
              <th className="py-3.5 px-4 text-center">Edit / Moderate</th>
              <th className="py-3.5 px-4 text-center">Delete / Revoke</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {MODULES_LIST.map((mod) => {
              const currentRolePerms = matrix[selectedRole]?.[mod.key] || {
                view: false,
                create: false,
                edit: false,
                delete: false
              };
              const isLocked = selectedRole === 'SUPER_ADMIN';

              return (
                <tr key={mod.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900 text-xs">{mod.label}</p>
                    <p className="text-[11px] text-slate-400">{mod.desc}</p>
                  </td>

                  {/* View */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => togglePermission(selectedRole, mod.key, 'view')}
                      className={`p-1.5 rounded-md transition-colors ${
                        isLocked ? 'cursor-not-allowed opacity-80' : 'hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {currentRolePerms.view ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </button>
                  </td>

                  {/* Create */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => togglePermission(selectedRole, mod.key, 'create')}
                      className={`p-1.5 rounded-md transition-colors ${
                        isLocked ? 'cursor-not-allowed opacity-80' : 'hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {currentRolePerms.create ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </button>
                  </td>

                  {/* Edit */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => togglePermission(selectedRole, mod.key, 'edit')}
                      className={`p-1.5 rounded-md transition-colors ${
                        isLocked ? 'cursor-not-allowed opacity-80' : 'hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {currentRolePerms.edit ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => togglePermission(selectedRole, mod.key, 'delete')}
                      className={`p-1.5 rounded-md transition-colors ${
                        isLocked ? 'cursor-not-allowed opacity-80' : 'hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {currentRolePerms.delete ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

