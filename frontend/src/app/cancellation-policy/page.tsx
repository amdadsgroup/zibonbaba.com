import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft, Clock, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Cancellation Policy — Zibonbaba.com',
  description: 'Guidelines on order cancellations, timeframes, and fee waivers on Zibonbaba.',
  alternates: {
    canonical: 'https://zibonbaba.com/cancellation-policy'
  }
};

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Cancellation Policy</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <XCircle className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Order Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Order Cancellation Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Hassle-Free Cancellation Windows Before Dispatch
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. When Can You Cancel an Order?
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
              <li>
                <strong>During PENDING or CONFIRMED Status</strong>: You can cancel your order directly from your customer dashboard with zero cancellation penalty.
              </li>
              <li>
                <strong>During PROCESSING Status</strong>: Once the merchant warehouse begins packing your order, cancellation may be requested through customer support.
              </li>
              <li>
                <strong>Once DISPATCHED or SHIPPED</strong>: An order that has been handed over to a courier fleet cannot be cancelled in transit. You may however initiate a return upon delivery in accordance with our <Link href="/return-policy" className="text-amber-600 font-semibold underline">Return Policy</Link>.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Prepaid Order Refund on Cancellation
            </h2>
            <p className="text-xs text-slate-600">
              If an order paid online via bKash or card is cancelled prior to shipment, your refund will be automatically triggered within 24 hours. For instant reuse, funds can be credited immediately to your <Link href="/account/wallet" className="text-amber-600 font-semibold underline">Zibonbaba Wallet</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
