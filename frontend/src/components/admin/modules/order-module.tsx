'use client';

import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  DollarSign,
  User,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { OrderItem } from '../types';

interface OrderModuleProps {
  orders: OrderItem[];
  isLoading: boolean;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onRefresh: () => void;
}

export default function OrderModule({
  orders,
  isLoading,
  onUpdateStatus,
  onRefresh
}: OrderModuleProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !search.trim() ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.storeName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedOrder.id, newStatus);
      setSelectedOrder({ ...selectedOrder, status: newStatus as any });
    } finally {
      setIsUpdating(false);
    }
  };

  const statusConfigs: Record<string, { label: string; color: string; step: number }> = {
    PENDING: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', step: 1 },
    CONFIRMED: { label: 'Confirmed', color: 'bg-blue-50 text-blue-700 border-blue-200', step: 2 },
    PROCESSING: { label: 'Processing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', step: 3 },
    PACKED: { label: 'Packed', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', step: 4 },
    SHIPPED: { label: 'Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200', step: 5 },
    DELIVERED: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 6 },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-200', step: 0 },
    RETURNED: { label: 'Returned', color: 'bg-neutral-100 text-neutral-600 border-neutral-300', step: 0 },
    REFUNDED: { label: 'Refunded', color: 'bg-orange-50 text-orange-700 border-orange-200', step: 0 }
  };

  const timelineSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            Order Lifecycle Management
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Monitor nationwide customer orders, payment status, store assignments, and delivery fulfillment.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, email, or store..."
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-400 font-medium text-neutral-800 placeholder:text-neutral-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-neutral-100 rounded-xl text-xs font-bold text-neutral-600 shrink-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'hover:text-neutral-900'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Order ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Vendor / Store</th>
                <th className="py-3.5 px-4 font-semibold text-center">Items</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Payment</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const cfg = statusConfigs[o.status] || {
                    label: o.status,
                    color: 'bg-neutral-100 text-neutral-700'
                  };

                  return (
                    <tr key={o.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-neutral-900">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-800">{o.customerName}</div>
                        <div className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                          {o.customerEmail}
                        </div>
                      </td>

                      {/* Store */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-700">{o.storeName}</span>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 text-center font-bold text-neutral-800">
                        {o.itemsCount}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-black text-neutral-900">
                        ৳{o.total.toLocaleString()}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {o.paymentMethod || 'COD'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Header */}
            <div>
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-neutral-900 text-base">
                      Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        statusConfigs[selectedOrder.status]?.color
                      }`}
                    >
                      {statusConfigs[selectedOrder.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Visual Order Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                    Delivery Fulfillment Progress
                  </h4>
                  <div className="flex items-center justify-between relative px-2 py-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    {timelineSteps.map((step, idx) => {
                      const currentStepNum = statusConfigs[selectedOrder.status]?.step || 1;
                      const isComplete = idx + 1 <= currentStepNum;

                      return (
                        <div key={step.key} className="flex flex-col items-center z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              isComplete
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <span className="text-[10px] font-bold text-neutral-600 mt-1">
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-xl">
                  <label className="text-[11px] font-bold text-neutral-800 uppercase block mb-1.5">
                    Transition Order Status
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-800 outline-none focus:border-amber-400"
                    >
                      <option value="PENDING">PENDING (Awaiting confirmation)</option>
                      <option value="CONFIRMED">CONFIRMED (Ready for packing)</option>
                      <option value="PROCESSING">PROCESSING (Merchant preparing goods)</option>
                      <option value="SHIPPED">SHIPPED (Handed to courier rider)</option>
                      <option value="DELIVERED">DELIVERED (Customer received goods)</option>
                      <option value="CANCELLED">CANCELLED (Order aborted)</option>
                    </select>
                    {isUpdating && <span className="text-xs text-amber-700 font-bold">Updating...</span>}
                  </div>
                </div>

                {/* Customer & Shipping Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                      Customer
                    </span>
                    <div className="font-bold text-neutral-900">{selectedOrder.customerName}</div>
                    <div className="text-[11px] text-neutral-500">{selectedOrder.customerEmail}</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-1">
                      {selectedOrder.customerPhone || '01700-000000'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                      Fulfillment Store
                    </span>
                    <div className="font-bold text-neutral-900">{selectedOrder.storeName}</div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-1">
                      Payment: {selectedOrder.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Delivery Address
                  </span>
                  <p className="font-semibold text-neutral-800">
                    {selectedOrder.shippingAddress || 'Gulshan-2, Dhaka-1212, Bangladesh'}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">৳{(selectedOrder.total - 60).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Shipping Courier Fee</span>
                    <span className="font-semibold">৳60</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-900 font-black text-sm pt-2 border-t border-neutral-100">
                    <span>Total Amount Charged</span>
                    <span>৳{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Close Drawer
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-[#FFC107] text-xs font-bold shadow-xs hover:bg-black"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

