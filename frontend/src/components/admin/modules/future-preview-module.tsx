'use strict';
'use client';

import React from 'react';
import { 
  Boxes, 
  Cpu, 
  Store, 
  Layers, 
  Users2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export function FuturePreviewModule() {
  const futureModules = [
    {
      id: 'pos',
      title: 'Cloud POS (Point of Sale)',
      category: 'Omnichannel Retail',
      icon: <Store className="w-6 h-6 text-amber-500" />,
      tag: 'Phase 2 · Q1 2027',
      description: 'Unified in-store counter POS connecting physical retail checkout, barcode scanner, receipt thermal printers, and real-time inventory deduction with Zibonbaba.com central catalog.',
      features: [
        'Hardware barcode scanner & thermal printer support',
        'Split cash, card, and bKash in-person payments',
        'Offline checkout mode with automatic sync',
        'Staff cashier shift reconciliation'
      ]
    },
    {
      id: 'erp',
      title: 'Enterprise ERP Suite',
      category: 'Operations & Accounting',
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      tag: 'Phase 2 · Q2 2027',
      description: 'Full-scale enterprise ledger covering general ledger accounting, automated tax/VAT compliance for Bangladesh NBR, automated vendor invoicing, and multi-currency operations.',
      features: [
        'Automated NBR Mushak-6.3 VAT invoicing',
        'General ledger double-entry bookkeeping',
        'Vendor payable / receivable automated reconciliations',
        'P&L and balance sheet real-time forecasting'
      ]
    },
    {
      id: 'crm',
      title: 'Enterprise CRM & Helpdesk',
      category: 'Customer Intelligence',
      icon: <Users2 className="w-6 h-6 text-emerald-500" />,
      tag: 'Phase 2 · Q2 2027',
      description: 'Omnichannel customer relationship system aggregating live chat, WhatsApp Business API, IVR phone support, and lifetime customer segmentation.',
      features: [
        'Integrated WhatsApp & SMS automated ticketing',
        'VIP customer tier segmentation & proactive outreach',
        'Abandoned cart dynamic recovery workflows',
        'Agent performance metrics & SLA escalation'
      ]
    },
    {
      id: 'warehouse',
      title: 'Warehouse & Branch Logistics (WMS)',
      category: 'Supply Chain & Fulfillment',
      icon: <Boxes className="w-6 h-6 text-purple-500" />,
      tag: 'Phase 2 · Q3 2027',
      description: 'Multi-hub fulfillment center routing, intelligent bin allocation, automated pick-pack-ship barcodes, and Pathao / RedX / Paperfly 3PL carrier integration.',
      features: [
        'Multi-city fulfillment center routing',
        'Zone, aisle, and shelf bin location tracking',
        'Batch wave picking & packaging automation',
        'Automated consignment manifest dispatch'
      ]
    },
    {
      id: 'ai',
      title: 'Zibonbaba AI Engine',
      category: 'Predictive Intelligence',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      tag: 'Phase 2 · Q3 2027',
      description: 'Custom Gemini-powered machine learning models optimizing dynamic pricing, predictive inventory stockouts, automated catalog enrichment, and visual search.',
      features: [
        'Predictive stockout alert & replenishment planner',
        'Dynamic competitive pricing optimization',
        'Automated product description & SEO generation',
        'Visual similarity search & smart recommendations'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC107]/20 text-slate-900 border border-[#FFC107]/40">
            ENTERPRISE ROADMAP
          </span>
          <span className="text-xs text-slate-400">Architectural Readiness Preview</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[#FFC107]" /> Future Enterprise Subsystems (Phase 2)
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Zibonbaba.com Phase 1 database schema and API contracts are architectured from day one to connect natively to these upcoming enterprise capabilities without rewriting core modules.
        </p>
      </div>

      {/* Grid of Future Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {futureModules.map((mod) => (
          <div 
            key={mod.id} 
            className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {mod.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">{mod.category}</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {mod.tag}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {mod.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Planned Capabilities</p>
                {mod.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FFC107]" /> Schema Pre-Integrated
              </span>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Read Specification <ArrowRight className="w-3.5 h-3.5 text-[#FFC107]" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

