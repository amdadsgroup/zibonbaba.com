'use strict';
'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Key, 
  Lock, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  ShieldAlert 
} from 'lucide-react';
import { AdminUserItem } from '../types';

interface AdminUsersModuleProps {
  adminUsers: AdminUserItem[];
  onAddUser?: (user: Partial<AdminUserItem>) => Promise<void>;
  onUpdateStatus?: (id: string, status: 'ACTIVE' | 'DISABLED') => Promise<void>;
  onDeleteUser?: (id: string) => Promise<void>;
}

export function AdminUsersModule({
  adminUsers = [],
  onAddUser,
  onUpdateStatus,
  onDeleteUser
}: AdminUsersModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('OPERATION_ADMIN');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      setIsSubmitting(true);
      if (onAddUser) {
        await onAddUser({
          name,
          email,
          phone,
          role,
          status: 'ACTIVE'
        });
      }
      setIsInviteModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (err) {
      console.error('Failed to create admin user', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'SUPER_ADMIN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <ShieldAlert className="w-3 h-3 text-purple-600" /> Super Admin
        </span>;
      case 'ADMIN':
      case 'OPERATION_ADMIN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          <ShieldCheck className="w-3 h-3 text-amber-600" /> Operation Admin
        </span>;
      case 'FINANCE_ADMIN':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Finance Lead
        </span>;
      case 'CATALOG_MANAGER':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Catalog Manager
        </span>;
      case 'SUPPORT_AGENT':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
          Support Agent
        </span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          {roleStr}
        </span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#FFC107]" /> Admin Users & Staff
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage executive accounts, regional managers, and staff permissions for Zibonbaba.com
          </p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 font-semibold text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FFC107]/50 active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Add Admin User
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Administrators</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{adminUsers.length}</p>
          <span className="text-xs text-emerald-600 font-medium">Full governance roster</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Staff</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {adminUsers.filter(u => u.status === 'ACTIVE').length}
          </p>
          <span className="text-xs text-slate-400">Authorized for portal access</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Super Admins</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {adminUsers.filter(u => u.role === 'SUPER_ADMIN').length}
          </p>
          <span className="text-xs text-slate-400">Root-level privileges</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">2FA Compliance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">100%</p>
          <span className="text-xs text-slate-400">Strict enterprise enforcement</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search admins by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="OPERATION_ADMIN">Operation Admin</option>
              <option value="FINANCE_ADMIN">Finance Lead</option>
              <option value="CATALOG_MANAGER">Catalog Manager</option>
              <option value="SUPPORT_AGENT">Support Agent</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Role & Scope</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No admin accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-[#FFC107] text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {user.email}</span>
                        {user.phone && (
                          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {user.phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <XCircle className="w-3.5 h-3.5" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            if (onUpdateStatus) {
                              onUpdateStatus(user.id, user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE');
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
                          title={user.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                        >
                          {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                        {user.role !== 'SUPER_ADMIN' && onDeleteUser && (
                          <button
                            onClick={() => {
                              if (confirm(`Revoke administrator access for ${user.name}?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FFC107]" /> Add Administrator
              </h3>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuz Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@zibonbaba.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+880 1700-000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
                >
                  <option value="OPERATION_ADMIN">Operation Admin</option>
                  <option value="FINANCE_ADMIN">Finance Lead</option>
                  <option value="CATALOG_MANAGER">Catalog Manager</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Role permissions can be fine-tuned under the Roles & RBAC module.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

