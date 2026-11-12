'use client';

import { useState } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  BoxSelect,
  ArrowRight,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

const stats = [
  { label: 'Total SKUs', value: '3', icon: BoxSelect, color: 'bg-purple-50 text-purple-600' },
  { label: 'Items In Stock', value: '90', icon: Package, color: 'bg-green-50 text-green-600' },
  { label: 'Low Stock Alerts', value: '1', icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  { label: 'Transfers Pending', value: '2', icon: ArrowRightLeft, color: 'bg-yellow-50 text-yellow-600' },
];

const inventory = [
  { sku: 'SKU-001', product: 'Wireless Headphones', warehouse: 'Dhaka Central', branch: 'Gulshan', qty: 45, reorder: 10, status: 'OK' },
  { sku: 'SKU-002', product: 'USB-C Hub 7-Port', warehouse: 'Chittagong WH', branch: 'Agrabad', qty: 8, reorder: 15, status: 'Low' },
  { sku: 'SKU-003', product: 'Mechanical Keyboard', warehouse: 'Dhaka Central', branch: 'Banani', qty: 37, reorder: 5, status: 'OK' },
];

const receivingLog = [
  { date: '2026-07-13', supplier: 'TechWorld Suppliers', sku: 'SKU-001', qty: 20 },
  { date: '2026-07-12', supplier: 'GadgetZone BD', sku: 'SKU-003', qty: 15 },
  { date: '2026-07-11', supplier: 'TechWorld Suppliers', sku: 'SKU-002', qty: 30 },
  { date: '2026-07-09', supplier: 'PC Hub BD', sku: 'SKU-001', qty: 10 },
  { date: '2026-07-07', supplier: 'GadgetZone BD', sku: 'SKU-003', qty: 25 },
];

const lowStockItems = inventory.filter(i => i.status === 'Low');

const warehouses = ['Dhaka Central', 'Chittagong WH', 'Sylhet Branch', 'Khulna Hub'];
const skus = inventory.map(i => i.sku + ' — ' + i.product);

export default function WarehouseDashboard() {
  const [transfer, setTransfer] = useState({ from: '', to: '', sku: '', qty: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTransfer({ from: '', to: '', sku: '', qty: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Warehouse Operations</h1>
        <p className="text-gray-500 mt-1">Monitor inventory, transfers, and stock levels.</p>
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

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} /> Low Stock Alerts
          </h2>
          <div className="space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="bg-white rounded-xl p-3 border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-600 mr-2">{item.sku}</span>
                  <span className="text-sm font-medium text-gray-800">{item.product}</span>
                  <span className="text-xs text-gray-500 ml-2">— {item.warehouse} / {item.branch}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{item.qty} units</p>
                  <p className="text-xs text-gray-500">Reorder at: {item.reorder}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Inventory Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-[#FFC107]" /> Inventory Table
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['SKU', 'Product', 'Warehouse', 'Branch', 'Qty', 'Reorder Pt.', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-gray-500 font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.sku} className={`border-b border-gray-50 hover:bg-yellow-50/40 transition ${item.status === 'Low' ? 'bg-red-50/40' : ''}`}>
                    <td className="py-3 px-2 font-mono text-xs font-bold text-gray-600">{item.sku}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">{item.product}</td>
                    <td className="py-3 px-2 text-gray-600">{item.warehouse}</td>
                    <td className="py-3 px-2 text-gray-600">{item.branch}</td>
                    <td className="py-3 px-2 font-bold text-gray-800">{item.qty}</td>
                    <td className="py-3 px-2 text-gray-500">{item.reorder}</td>
                    <td className="py-3 px-2">
                      {item.status === 'OK' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 size={11} /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          <XCircle size={11} /> Low
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Transfer Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-[#FFC107]" /> Stock Transfer
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">From (Warehouse/Branch)</label>
              <select
                value={transfer.from}
                onChange={(e) => setTransfer({ ...transfer, from: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              >
                <option value="">Select source</option>
                {warehouses.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div className="flex justify-center">
              <ArrowRight size={18} className="text-yellow-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">To (Warehouse/Branch)</label>
              <select
                value={transfer.to}
                onChange={(e) => setTransfer({ ...transfer, to: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              >
                <option value="">Select destination</option>
                {warehouses.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">SKU</label>
              <select
                value={transfer.sku}
                onChange={(e) => setTransfer({ ...transfer, sku: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              >
                <option value="">Select SKU</option>
                {skus.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={transfer.qty}
                onChange={(e) => setTransfer({ ...transfer, qty: e.target.value })}
                placeholder="Enter quantity"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${submitted ? 'bg-green-500 text-white' : 'bg-[#FFC107] text-gray-900 hover:bg-yellow-400'}`}
            >
              {submitted ? '✓ Transfer Submitted!' : 'Submit Transfer'}
            </button>
          </form>
        </div>
      </div>

      {/* Receiving Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Truck size={18} className="text-[#FFC107]" /> Recent Receiving Log
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Supplier', 'SKU', 'Qty Received', 'Status'].map((h) => (
                  <th key={h} className="text-left py-2.5 px-3 text-gray-500 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {receivingLog.map((log, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-yellow-50/30 transition">
                  <td className="py-3 px-3 text-gray-600">{log.date}</td>
                  <td className="py-3 px-3 font-medium text-gray-800">{log.supplier}</td>
                  <td className="py-3 px-3 font-mono text-xs font-bold text-gray-600">{log.sku}</td>
                  <td className="py-3 px-3 font-bold text-gray-800">{log.qty} units</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                      <Clock size={11} /> Received
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
