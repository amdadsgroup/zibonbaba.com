'use client';

import { useState } from 'react';
import {
  Ticket,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  UserCheck,
  Eye,
  Zap,
} from 'lucide-react';

const stats = [
  { label: 'Open Tickets', value: '14', icon: Ticket, color: 'bg-red-50 text-red-600' },
  { label: 'In Progress', value: '8', icon: Activity, color: 'bg-blue-50 text-blue-600' },
  { label: 'Resolved Today', value: '23', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
  { label: 'Avg Response Time', value: '2.4h', icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
];

const tickets = [
  { id: 'TK-1001', customer: 'Rahim Uddin', subject: 'Order not received after 7 days', category: 'Delivery', priority: 'Urgent', status: 'Open', age: '2d' },
  { id: 'TK-1002', customer: 'Fatema Khanam', subject: 'Wrong item delivered', category: 'Product', priority: 'Urgent', status: 'Open', age: '1d' },
  { id: 'TK-1003', customer: 'Sabbir Khan', subject: 'Payment deducted but order failed', category: 'Payment', priority: 'Urgent', status: 'In Progress', age: '4h' },
  { id: 'TK-1004', customer: 'Parveen Akter', subject: 'Refund not processed', category: 'Refund', priority: 'High', status: 'Open', age: '3d' },
  { id: 'TK-1005', customer: 'Mamun Hossain', subject: 'Product quality issue', category: 'Product', priority: 'Medium', status: 'In Progress', age: '5h' },
  { id: 'TK-1006', customer: 'Riya Dey', subject: 'Coupon code not working', category: 'Promotion', priority: 'Low', status: 'Resolved', age: '1d' },
  { id: 'TK-1007', customer: 'Jahir Rahman', subject: 'Account login issues', category: 'Account', priority: 'Medium', status: 'Open', age: '6h' },
  { id: 'TK-1008', customer: 'Shirin Akter', subject: 'Tracking page broken', category: 'Technical', priority: 'High', status: 'In Progress', age: '2h' },
];

const urgentTickets = tickets.filter(t => t.priority === 'Urgent');

const priorityColors: Record<string, string> = {
  Urgent: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const statusColors: Record<string, string> = {
  Open: 'bg-red-50 text-red-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};

export default function SupportDashboard() {
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sent, setSent] = useState(false);

  const filters = ['All', 'Open', 'In Progress', 'Resolved'];
  const filteredTickets = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  const handleSend = () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSent(true);
    setReplyText('');
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Support Center</h1>
        <p className="text-gray-500 mt-1">Manage and resolve customer tickets efficiently.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

      {/* Priority Queue */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <h2 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={18} /> Priority Queue — URGENT Tickets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {urgentTickets.map((t) => (
            <div key={t.id} className="bg-white rounded-xl p-3 border border-red-200 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-red-600">{t.id}</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">URGENT</span>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1">{t.subject}</p>
              <p className="text-xs text-gray-500 mt-1">{t.customer} · {t.age} ago</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">All Tickets</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${filter === f ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {['ID', 'Customer', 'Subject', 'Category', 'Priority', 'Status', 'Age', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr key={t.id} className={`border-b border-gray-50 hover:bg-yellow-50/40 transition ${t.priority === 'Urgent' ? 'bg-red-50/30' : ''}`}>
                    <td className="py-2.5 px-2 font-mono font-bold text-gray-600">{t.id}</td>
                    <td className="py-2.5 px-2 font-medium text-gray-800">{t.customer}</td>
                    <td className="py-2.5 px-2 text-gray-600 max-w-[160px] truncate">{t.subject}</td>
                    <td className="py-2.5 px-2 text-gray-500">{t.category}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${priorityColors[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>{t.status}</span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">{t.age}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex gap-1">
                        <button className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Assign"><UserCheck size={13} /></button>
                        <button className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition" title="Resolve"><CheckCircle2 size={13} /></button>
                        <button className="p-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition" title="View"><Eye size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTickets.length === 0 && <p className="text-center text-gray-400 py-8">No tickets found.</p>}
          </div>
        </div>

        {/* Quick Reply */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-[#FFC107]" /> Quick Reply
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Ticket</label>
              <select
                value={selectedTicket}
                onChange={(e) => setSelectedTicket(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-gray-50"
              >
                <option value="">-- Choose a ticket --</option>
                {tickets.filter(t => t.status !== 'Resolved').map((t) => (
                  <option key={t.id} value={t.id}>{t.id} — {t.customer}</option>
                ))}
              </select>
            </div>
            {selectedTicket && (
              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <p className="text-xs font-semibold text-yellow-700">Selected Ticket</p>
                <p className="text-sm text-gray-700 mt-1">
                  {tickets.find(t => t.id === selectedTicket)?.subject}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reply Message</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                placeholder="Type your reply here..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-gray-50 resize-none"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!selectedTicket || !replyText.trim()}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition ${sent ? 'bg-green-500 text-white' : 'bg-[#FFC107] text-gray-900 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {sent ? <><CheckCircle2 size={16} /> Sent!</> : <><Send size={16} /> Send Reply</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
