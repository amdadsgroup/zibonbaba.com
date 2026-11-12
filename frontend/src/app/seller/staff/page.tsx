'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Mail,
  Briefcase,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

const allPermissions = [
  'view:products',
  'edit:products',
  'view:orders',
  'manage:orders',
  'view:inventory',
  'manage:inventory',
  'view:reports',
];

const jobTitles = ['Store Manager', 'Inventory Staff', 'Sales Staff', 'Support Agent'];

const initialStaff = [
  {
    id: 1,
    name: 'Zara Khan',
    title: 'Inventory Staff',
    email: 'zara.khan@store.com',
    permissions: ['view:inventory', 'manage:inventory', 'view:products'],
    active: true,
  },
];

export default function SellerStaffPage() {
  const [staff, setStaff] = useState<any[]>(initialStaff);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    title: '',
    permissions: [] as string[],
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/seller/staff', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
            setStaff(data.staff.map((s: any) => ({
              id: s.id,
              name: s.user?.profile?.fullName || s.user?.email || 'Staff Member',
              title: s.jobTitle || 'Staff',
              email: s.user?.email || 'staff@store.com',
              permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions) : (s.permissions || []),
              active: s.isActive ?? true
            })));
          }
        })
        .catch(() => {});
    }
  }, []);

  const togglePermission = (perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleStaffActive = async (id: any) => {
    const target = staff.find(s => s.id === id);
    const newActive = !target?.active;
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: newActive } : s));

    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        await fetch(`/api/seller/staff/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isActive: newActive })
        });
      } catch (_) {}
    }
  };

  const removeStaff = async (id: any) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        await fetch(`/api/seller/staff/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (_) {}
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        await fetch('/api/seller/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: form.email,
            fullName: form.name,
            jobTitle: form.title,
            permissions: form.permissions
          })
        });
      } catch (_) {}
    }

    const newStaff = {
      id: Date.now(),
      name: form.name,
      title: form.title,
      email: form.email,
      permissions: form.permissions,
      active: true,
    };
    setStaff(prev => [...prev, newStaff]);
    setForm({ name: '', email: '', title: '', permissions: [] });
    setFormSent(true);
    setTimeout(() => { setFormSent(false); setShowInviteForm(false); }, 2000);
  };

  const stats = [
    { label: 'Total Staff', value: staff.length.toString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active', value: staff.filter(s => s.active).length.toString(), icon: UserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Roles', value: '3', icon: Briefcase, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Store Staff</h1>
          <p className="text-gray-500 mt-1">Manage your store team and their permissions.</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-5 py-2.5 rounded-xl shadow hover:bg-yellow-400 transition"
        >
          <UserPlus size={16} /> Invite Staff Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Available Roles Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <Shield size={20} className="text-yellow-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-yellow-800">Available Roles</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {jobTitles.map(r => (
              <span key={r} className="text-xs bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full font-medium border border-yellow-200">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg shadow">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.title}</p>
                </div>
              </div>
              {/* Status Toggle */}
              <button
                onClick={() => toggleStaffActive(member.id)}
                className={`relative w-11 h-6 rounded-full transition-colors ${member.active ? 'bg-green-500' : 'bg-gray-300'}`}
                title={member.active ? 'Deactivate' : 'Activate'}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${member.active ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Mail size={14} />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(member.permissions) ? member.permissions : []).map((p: string) => (
                  <span key={p} className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition">
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => removeStaff(member.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-100 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No staff members yet. Invite someone to get started.</p>
          </div>
        )}
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowInviteForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <UserPlus size={20} className="text-[#FFC107]" /> Invite Staff Member
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Job Title</label>
                <div className="relative">
                  <select
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 appearance-none"
                    required
                  >
                    <option value="">Select a job title</option>
                    {jobTitles.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {allPermissions.map((perm) => {
                    const checked = form.permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-xl border transition ${checked ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                      >
                        <div
                          onClick={() => togglePermission(perm)}
                          className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition ${checked ? 'bg-[#FFC107] border-yellow-500' : 'border-gray-300'}`}
                        >
                          {checked && <Check size={11} className="text-white font-bold" />}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-semibold transition text-sm ${formSent ? 'bg-green-500 text-white' : 'bg-[#FFC107] text-gray-900 hover:bg-yellow-400'}`}
              >
                {formSent ? '✓ Invitation Sent!' : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
