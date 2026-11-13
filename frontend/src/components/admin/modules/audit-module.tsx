'use strict';
'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Shield, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Hash, 
  Globe 
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditModuleProps {
  logs?: AuditLogItem[];
}

const SAMPLE_LOGS: AuditLogItem[] = [
  {
    id: 'aud_01',
    timestamp: new Date().toISOString(),
    adminEmail: 'admin@zibonbaba.com',
    action: 'VENDOR_APPROVAL',
    resource: 'Vendor',
    resourceId: 'vnd_dhaka_gadgets',
    ipAddress: '103.145.24.12',
    details: 'Verified national trade license & approved Dhaka Tech Hub'
  },
  {
    id: 'aud_02',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    adminEmail: 'admin@zibonbaba.com',
    action: 'COMMISSION_RATE_UPDATE',
    resource: 'Category',
    resourceId: 'cat_electronics',
    ipAddress: '103.145.24.12',
    details: 'Adjusted base category fee from 6% to 5.5%'
  },
  {
    id: 'aud_03',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    adminEmail: 'moderator@zibonbaba.com',
    action: 'PRODUCT_REJECTION',
    resource: 'Product',
    resourceId: 'prd_refurb_iphone',
    ipAddress: '118.179.88.4',
    details: 'Rejected unverified refurbished iPhone: Missing authentic serial proof'
  },
  {
    id: 'aud_04',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    adminEmail: 'finance@zibonbaba.com',
    action: 'PAYOUT_DISBURSED',
    resource: 'Payout',
    resourceId: 'pay_disb_8912',
    ipAddress: '103.48.26.90',
    details: 'Approved weekly settlement batch: ৳450,000 across 28 merchants'
  },
  {
    id: 'aud_05',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    adminEmail: 'security@zibonbaba.com',
    action: 'POLICY_ENFORCED',
    resource: 'Security',
    resourceId: 'sec_auth_rules',
    ipAddress: '103.145.24.12',
    details: 'Strict IP rate-limiting enforced on merchant auth endpoints'
  }
];

export function AuditModule({ logs = SAMPLE_LOGS }: AuditModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const displayLogs = (logs.length > 0 ? logs : SAMPLE_LOGS).filter(log => {
    const matchesSearch = 
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVAL') || action.includes('DISBURSED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3 text-emerald-600" /> {action}
        </span>
      );
    }
    if (action.includes('REJECTION') || action.includes('REVOKE') || action.includes('DELETE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3 text-red-600" /> {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
        <Shield className="w-3 h-3 text-amber-600" /> {action}
      </span>
    );
  };

  const handleExport = () => {
    let csv = "data:text/csv;charset=utf-8,Timestamp,Admin,Action,Resource,Resource ID,IP Address,Details\n";
    displayLogs.forEach(l => {
      csv += `"${l.timestamp}","${l.adminEmail}","${l.action}","${l.resource}","${l.resourceId || ''}","${l.ipAddress}","${l.details || ''}"\n`;
    });
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zibonbaba_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#FFC107]" /> Immutable Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically sealed timeline of all administrative changes, moderation decisions, and financial operations
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all focus:outline-none"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export Audit Log
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by admin, action, target entity, or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC107] focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Actions</option>
            <option value="VENDOR_APPROVAL">Vendor Approval</option>
            <option value="COMMISSION_RATE_UPDATE">Commission Update</option>
            <option value="PRODUCT_REJECTION">Product Rejection</option>
            <option value="PAYOUT_DISBURSED">Payout Disbursed</option>
            <option value="POLICY_ENFORCED">Policy Enforced</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Admin Principal</th>
                <th className="py-3.5 px-4">Event / Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">IP & Origin</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#FFC107]" />
                      {log.adminEmail}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{log.resource}</span>
                    {log.resourceId && (
                      <span className="ml-1 text-[10px] font-mono text-slate-400">({log.resourceId})</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {log.ipAddress}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                    {log.details || '—'}
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

