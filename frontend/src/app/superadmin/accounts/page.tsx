'use client';

import React, { useState, useMemo } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED';
  joined: string;
}

const INITIAL_ACCOUNTS: UserAccount[] = [
  { id: 'acc-1',  name: 'Super Admin Account',  email: 'superadmin@zibonbaba.com', phone: '01711-000001', role: 'SUPER_ADMIN',        status: 'ACTIVE',    joined: '2026-01-01' },
  { id: 'acc-2',  name: 'Platform Admin',        email: 'admin@zibonbaba.com',      phone: '01711-000002', role: 'ADMIN',              status: 'ACTIVE',    joined: '2026-01-05' },
  { id: 'acc-3',  name: 'Operations Manager',    email: 'manager@zibonbaba.com',    phone: '01711-000003', role: 'MANAGER',            status: 'ACTIVE',    joined: '2026-02-10' },
  { id: 'acc-4',  name: 'Financial Accountant',  email: 'accountant@zibonbaba.com', phone: '01711-000004', role: 'ACCOUNTANT',         status: 'ACTIVE',    joined: '2026-02-14' },
  { id: 'acc-5',  name: 'Support Lead',          email: 'support@zibonbaba.com',    phone: '01711-000005', role: 'CUSTOMER_SUPPORT',   status: 'ACTIVE',    joined: '2026-03-01' },
  { id: 'acc-6',  name: 'Marketing Specialist',  email: 'marketing@zibonbaba.com',  phone: '01711-000006', role: 'MARKETING',          status: 'ACTIVE',    joined: '2026-03-05' },
  { id: 'acc-7',  name: 'Warehouse Manager',     email: 'warehouse@zibonbaba.com',  phone: '01711-000007', role: 'WAREHOUSE_MANAGER',  status: 'ACTIVE',    joined: '2026-03-12' },
  { id: 'acc-8',  name: 'Inventory Manager',     email: 'inventory@zibonbaba.com',  phone: '01711-000008', role: 'INVENTORY_MANAGER',  status: 'ACTIVE',    joined: '2026-03-15' },
  { id: 'acc-9',  name: 'Delivery Manager',      email: 'delivery@zibonbaba.com',   phone: '01711-000009', role: 'DELIVERY_MANAGER',   status: 'ACTIVE',    joined: '2026-03-20' },
  { id: 'acc-10', name: 'Vendor Owner',          email: 'vendor@zibonbaba.com',     phone: '01711-000010', role: 'VENDOR_ADMIN',       status: 'ACTIVE',    joined: '2026-04-01' },
  { id: 'acc-11', name: 'Vendor Staff Member',   email: 'staff@zibonbaba.com',      phone: '01711-000011', role: 'VENDOR_STAFF',       status: 'ACTIVE',    joined: '2026-04-05' },
  { id: 'acc-12', name: 'Standard Customer',     email: 'customer@zibonbaba.com',   phone: '01711-000012', role: 'CUSTOMER',           status: 'ACTIVE',    joined: '2026-04-10' },
  { id: 'acc-13', name: 'Reseller Agent',        email: 'reseller@zibonbaba.com',   phone: '01711-000013', role: 'RESELLER',           status: 'ACTIVE',    joined: '2026-04-15' },
  { id: 'acc-14', name: 'Courier Express Rider', email: 'courier@zibonbaba.com',    phone: '01711-000014', role: 'DELIVERY_MAN',        status: 'ACTIVE',    joined: '2026-04-20' },
];

const ALL_ROLES = [
  'ALL',
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'ACCOUNTANT',
  'CUSTOMER_SUPPORT',
  'MARKETING',
  'WAREHOUSE_MANAGER',
  'INVENTORY_MANAGER',
  'DELIVERY_MANAGER',
  'VENDOR_ADMIN',
  'VENDOR_STAFF',
  'CUSTOMER',
  'RESELLER',
  'DELIVERY_MAN',
];

export default function AccountsManagementPage() {
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAccount, setEditAccount] = useState<UserAccount | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('Password123!');
  const [formRole, setFormRole] = useState('CUSTOMER');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED'>('ACTIVE');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchLiveAccounts = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
      const res = await fetch('/api/admin/users?limit=100', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && data.users && data.users.length > 0) {
        const liveMapped: UserAccount[] = data.users.map((u: any) => ({
          id: u.id,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          status: (u.status || 'ACTIVE') as any,
          joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01'
        }));
        setAccounts(liveMapped);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLiveAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.phone.includes(searchQuery);
      const matchesRole = selectedRole === 'ALL' || acc.role === selectedRole;
      const matchesStatus = selectedStatus === 'ALL' || acc.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, searchQuery, selectedRole, selectedStatus]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccountIds(filteredAccounts.map((a) => a.id));
    } else {
      setSelectedAccountIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkActivate = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    for (const id of selectedAccountIds) {
      try {
        await fetch(`/api/admin/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ status: 'ACTIVE' })
        });
      } catch (_) {}
    }
    setAccounts((prev) =>
      prev.map((a) => (selectedAccountIds.includes(a.id) ? { ...a, status: 'ACTIVE' } : a))
    );
    showToast(`Bulk activated ${selectedAccountIds.length} account(s).`);
    setSelectedAccountIds([]);
  };

  const handleBulkSuspend = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    for (const id of selectedAccountIds) {
      try {
        await fetch(`/api/admin/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
          body: JSON.stringify({ status: 'SUSPENDED' })
        });
      } catch (_) {}
    }
    setAccounts((prev) =>
      prev.map((a) => (selectedAccountIds.includes(a.id) ? { ...a, status: 'SUSPENDED' } : a))
    );
    showToast(`Bulk suspended ${selectedAccountIds.length} account(s).`);
    setSelectedAccountIds([]);
  };

  const handleBulkDelete = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    for (const id of selectedAccountIds) {
      try {
        await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
      } catch (_) {}
    }
    setAccounts((prev) => prev.filter((a) => !selectedAccountIds.includes(a.id)));
    showToast(`Bulk deleted ${selectedAccountIds.length} account(s).`);
    setSelectedAccountIds([]);
  };

  // Create Account Submit
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      showToast('Name and Email are required.');
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          fullName: formName,
          email: formEmail,
          phone: formPhone,
          password: formPassword || 'Password123!',
          role: formRole,
          status: formStatus
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        const created: UserAccount = {
          id: data.user.id,
          name: data.user.name || formName,
          email: data.user.email,
          phone: formPhone || 'N/A',
          role: data.user.role,
          status: data.user.status,
          joined: new Date().toISOString().split('T')[0]
        };
        setAccounts((prev) => [created, ...prev]);
        showToast(`User ${formEmail} created successfully.`);
      } else {
        showToast(data.error || 'Failed to create user.');
      }
    } catch (err) {
      const newAcc: UserAccount = {
        id: `acc-${Date.now()}`,
        name: formName,
        email: formEmail,
        phone: formPhone || '01711-000999',
        role: formRole,
        status: formStatus,
        joined: new Date().toISOString().split('T')[0],
      };
      setAccounts((prev) => [newAcc, ...prev]);
      showToast(`New user account ${formEmail} registered.`);
    }

    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('Password123!');
  };

  // Edit Account Submit
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
      await fetch(`/api/admin/users/${editAccount.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          fullName: editAccount.name,
          phone: editAccount.phone,
          role: editAccount.role,
          status: editAccount.status
        })
      });
    } catch (err) {
      console.error('Update account error:', err);
    }

    setAccounts((prev) =>
      prev.map((a) => (a.id === editAccount.id ? editAccount : a))
    );
    showToast(`Account ${editAccount.email} updated successfully.`);
    setEditAccount(null);
  };

  const handleDeleteOne = async (id: string, email: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
      await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
    } catch (err) {
      console.error('Delete account error:', err);
    }

    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast(`Account ${email} deleted.`);
  };

  return (
    <SuperAdminLayout
      activeNav="accounts"
      title="User Accounts & Identity Management"
      subtitle="Complete CRUD Controls, Multi-Role Administration & Batch Operations"
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

      {/* ── Top Action & Filter Controls Bar ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus-within:border-amber-500/50 w-full md:w-80">
            <Search size={16} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-xs placeholder:text-slate-500 font-semibold"
            />
          </div>

          {/* Filters & Add Account Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none"
            >
              {ALL_ROLES.map((r) => (
                <option key={r} value={r}>Role: {r}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-2xl px-3.5 py-2.5 outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} /> Create User Account
            </button>
          </div>
        </div>

        {/* Bulk Action Bar (when rows are checked) */}
        {selectedAccountIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl">
            <span className="text-xs font-bold text-amber-400">
              {selectedAccountIds.length} account(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkActivate}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
              >
                <UserCheck size={14} /> Bulk Activate
              </button>
              <button
                onClick={handleBulkSuspend}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
              >
                <UserX size={14} /> Bulk Suspend
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Bulk Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Accounts Table ── */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">
                  <input
                    type="checkbox"
                    checked={
                      filteredAccounts.length > 0 &&
                      selectedAccountIds.length === filteredAccounts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 accent-amber-500"
                  />
                </th>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Role Designation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAccounts.map((acc) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <tr key={acc.id} className={`hover:bg-slate-900/60 transition-colors ${isSelected ? 'bg-amber-500/5' : ''}`}>
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(acc.id)}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs shrink-0">
                        {acc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-xs">{acc.name}</p>
                        <span className="text-[10px] text-slate-500 block font-mono">ID: {acc.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-200 block text-[11px]">{acc.email}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{acc.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black border bg-slate-900 text-amber-400 border-slate-700">
                        {acc.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        acc.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        acc.status === 'SUSPENDED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                        acc.status === 'BLOCKED' ? 'bg-red-950 text-red-400 border-red-800' :
                        'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {acc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{acc.joined}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditAccount(acc)}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          title="Edit account details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOne(acc.id, acc.email)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="Delete account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Create New System Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah Al Mamun"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@zibonbaba.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="01711-000000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Role Designation</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    {ALL_ROLES.filter((r) => r !== 'ALL').map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="font-black text-sm uppercase tracking-wider text-white">Edit User Account</h3>
              <button onClick={() => setEditAccount(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editAccount.name}
                  onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editAccount.email}
                  onChange={(e) => setEditAccount({ ...editAccount, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Role Designation</label>
                  <select
                    value={editAccount.role}
                    onChange={(e) => setEditAccount({ ...editAccount, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    {ALL_ROLES.filter((r) => r !== 'ALL').map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={editAccount.status}
                    onChange={(e) => setEditAccount({ ...editAccount, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 outline-none font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditAccount(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
