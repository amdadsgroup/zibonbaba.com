'use strict';
'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Store, 
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { DateRange, OrderItem, VendorItem, CustomerItem, ProductItem } from '../types';

interface ReportsModuleProps {
  orders?: OrderItem[];
  vendors?: VendorItem[];
  customers?: CustomerItem[];
  products?: ProductItem[];
}

export function ReportsModule({
  orders = [],
  vendors = [],
  customers = [],
  products = []
}: ReportsModuleProps) {
  const [reportType, setReportType] = useState<'sales' | 'vendors' | 'products' | 'customers'>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [isExporting, setIsExporting] = useState(false);

  // Calculations
  const totalSalesVolume = orders.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalCommission = totalSalesVolume * 0.08; // 8% avg rate
  const vendorPayouts = totalSalesVolume - totalCommission;
  const avgOrderValue = orders.length > 0 ? totalSalesVolume / orders.length : 0;

  const handleExportCSV = () => {
    setIsExporting(true);
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === 'sales') {
      csvContent += "Order ID,Customer,Store,Amount,Status,Date\n";
      orders.forEach(o => {
        csvContent += `"${o.id}","${o.customerName}","${o.storeName}",${o.total},"${o.status}","${o.createdAt}"\n`;
      });
    } else if (reportType === 'vendors') {
      csvContent += "Store Name,Owner,Revenue,Orders Count,Rating,Status\n";
      vendors.forEach(v => {
        csvContent += `"${v.storeName}","${v.ownerName}",${v.revenue},${v.ordersCount},${v.rating},"${v.status}"\n`;
      });
    } else if (reportType === 'products') {
      csvContent += "SKU,Product Name,Vendor,Price,Stock,Sales,Status\n";
      products.forEach(p => {
        csvContent += `"${p.sku}","${p.name}","${p.vendorName}",${p.price},${p.stock},${p.salesCount},"${p.status}"\n`;
      });
    } else {
      csvContent += "Customer Name,Email,Phone,Orders Count,Total Spent,Status\n";
      customers.forEach(c => {
        csvContent += `"${c.name}","${c.email}","${c.phone}",${c.ordersCount},${c.totalSpent},"${c.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zibonbaba_${reportType}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#FFC107]" /> Reports & Business Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit-grade performance metrics, settlement sheets, and CSV exports for Zibonbaba.com
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Statement
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFC107] hover:bg-[#FFB800] text-slate-900 font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> {isExporting ? 'Generating...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setReportType('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            reportType === 'sales'
              ? 'bg-[#FFC107] text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Sales & Revenue Report
        </button>
        <button
          onClick={() => setReportType('vendors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            reportType === 'vendors'
              ? 'bg-[#FFC107] text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Store className="w-4 h-4" /> Vendor Settlement Report
        </button>
        <button
          onClick={() => setReportType('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            reportType === 'products'
              ? 'bg-[#FFC107] text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Product Inventory Velocity
        </button>
        <button
          onClick={() => setReportType('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            reportType === 'customers'
              ? 'bg-[#FFC107] text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Customer Lifetime Value (CLV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Merchandise Value (GMV)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ৳{totalSalesVolume.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14.2% from last cycle
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Marketplace Net Commission</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            ৳{totalCommission.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Platform retained revenue</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Disbursed to Vendors</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ৳{vendorPayouts.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Payable after commissions</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average Basket Size</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ৳{Math.round(avgOrderValue).toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Based on {orders.length} total orders</span>
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm">
            {reportType === 'sales' && 'Sales Transaction Breakdown'}
            {reportType === 'vendors' && 'Merchant Earnings & Balances'}
            {reportType === 'products' && 'Product Sales & Stock Turnover'}
            {reportType === 'customers' && 'Customer Retention & Spend'}
          </h3>
          <span className="text-xs text-slate-400">
            {reportType === 'sales' && `${orders.length} records`}
            {reportType === 'vendors' && `${vendors.length} records`}
            {reportType === 'products' && `${products.length} records`}
            {reportType === 'customers' && `${customers.length} records`}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {reportType === 'sales' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 15).map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-medium">{o.id.slice(0, 8)}...</td>
                    <td className="py-2.5 px-4 font-semibold">{o.customerName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{o.storeName}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">৳{o.total?.toLocaleString()}</td>
                    <td className="py-2.5 px-4">{o.paymentMethod}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'vendors' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Store Name</th>
                  <th className="py-3 px-4">Proprietor</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Orders Fulfilled</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.slice(0, 15).map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{v.storeName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{v.ownerName}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">৳{v.revenue?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{v.ordersCount}</td>
                    <td className="py-2.5 px-4 text-amber-500 font-bold">{v.rating || 5.0} ★</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'products' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Inventory</th>
                  <th className="py-3 px-4 text-right">Sales Units</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 15).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{p.sku}</td>
                    <td className="py-2.5 px-4 text-slate-600">{p.vendorName}</td>
                    <td className="py-2.5 px-4 text-right font-bold">৳{p.price?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{p.stock} units</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-600">{p.salesCount || 0}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'customers' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Lifetime Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.slice(0, 15).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{c.ordersCount}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">৳{c.totalSpent?.toLocaleString()}</td>
                    <td className="py-2.5 px-4 font-medium text-emerald-600">৳{c.walletBalance || 0}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

