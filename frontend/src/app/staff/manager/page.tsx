'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ShoppingCart,
  Package,
  HeadphonesIcon,
  Truck,
  Warehouse,
  FileBarChart2,
  UserPlus,
  UserCog,
  Circle,
} from 'lucide-react';

const stats = [
  { label: 'Active Departments', value: '5', icon: LayoutDashboard, color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Staff Count', value: '24', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Approvals', value: '3', icon: ClipboardCheck, color: 'bg-orange-50 text-orange-600' },
  { label: 'Open Tasks', value: '12', icon: ListTodo, color: 'bg-green-50 text-green-600' },
];

const departments = [
  { name: 'Sales', icon: ShoppingCart, staff: 6, status: 'active', color: 'bg-blue-100 text-blue-700' },
  { name: 'Inventory', icon: Package, staff: 4, status: 'active', color: 'bg-purple-100 text-purple-700' },
  { name: 'Support', icon: HeadphonesIcon, staff: 5, status: 'active', color: 'bg-green-100 text-green-700' },
  { name: 'Delivery', icon: Truck, staff: 7, status: 'active', color: 'bg-orange-100 text-orange-700' },
  { name: 'Warehouse', icon: Warehouse, staff: 2, status: 'maintenance', color: 'bg-red-100 text-red-700' },
];

const tasks = [
  { id: 1, title: 'Review Q3 inventory report', assignee: 'Rafi Ahmed', due: '2026-07-16', priority: 'High', status: 'In Progress' },
  { id: 2, title: 'Onboard new delivery staff', assignee: 'Nadia Islam', due: '2026-07-17', priority: 'Medium', status: 'Pending' },
  { id: 3, title: 'Update vendor agreements', assignee: 'Kamal Hossain', due: '2026-07-18', priority: 'High', status: 'Pending' },
  { id: 4, title: 'Monthly payroll verification', assignee: 'Sara Begum', due: '2026-07-20', priority: 'Critical', status: 'Pending' },
  { id: 5, title: 'Customer complaint audit', assignee: 'Tariq Mia', due: '2026-07-22', priority: 'Low', status: 'Done' },
];

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const statusColors: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-gray-100 text-gray-600',
  Done: 'bg-green-100 text-green-700',
};

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter(t => t.status.toLowerCase().replace(' ', '-') === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Operations Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Manager. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
            <FileBarChart2 size={16} /> View Reports
          </button>
          <button className="flex items-center gap-2 bg-[#FFC107] text-gray-900 font-semibold px-4 py-2 rounded-xl shadow hover:bg-yellow-400 transition">
            <UserPlus size={16} /> Assign Task
          </button>
          <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-700 transition">
            <UserCog size={16} /> Manage Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Cards */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-[#FFC107]" /> Departments
            </h2>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-yellow-50 transition group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dept.color}`}>
                      <dept.icon size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{dept.name}</p>
                      <p className="text-xs text-gray-500">{dept.staff} staff members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${dept.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      <Circle size={6} fill="currentColor" />
                      {dept.status === 'active' ? 'Active' : 'Maintenance'}
                    </span>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-yellow-500 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ListTodo size={18} className="text-[#FFC107]" /> Task List
              </h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['all', 'pending', 'in-progress', 'done'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${activeTab === tab ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/30 transition">
                  <div className="flex items-center gap-3">
                    {task.status === 'Done' ? (
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    ) : task.status === 'In Progress' ? (
                      <Clock size={18} className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`font-medium text-sm ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
                      <p className="text-xs text-gray-500">Assignee: {task.assignee} · Due: {task.due}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>{task.status}</span>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-center text-gray-400 py-8">No tasks found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
