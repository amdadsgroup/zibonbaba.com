import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'Return & Refund Policy — Zibonbaba.com',
  description: 'Detailed category-specific return criteria, refund timelines, and exchange guidelines on Zibonbaba.com.',
  alternates: {
    canonical: 'https://zibonbaba.com/return-policy'
  }
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Return & Refund Policy</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <RotateCcw className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Buyer Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Return & Refund Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Compliant with Bangladesh Digital Commerce Operational Guidelines 2021
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Return Window by Category
            </h2>
            <p>
              To ensure fairness between shoppers and independent merchants, return eligibility depends on product classification and condition:
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100/80 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Eligible Return Window</th>
                    <th className="p-3">Mandatory Criteria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Electronics & Gadgets</td>
                    <td className="p-3">7 Days from Delivery</td>
                    <td className="p-3">Intact packaging, unpeeled serial number, original warranty cards.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Fashion & Apparel</td>
                    <td className="p-3">7 Days from Delivery</td>
                    <td className="p-3">Unworn, unwashed, with all original tags attached.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Beauty & Personal Care</td>
                    <td className="p-3">Damage on Arrival Only (24 Hours)</td>
                    <td className="p-3">Sealed hygienic packaging must remain unopened.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Perishables & Groceries</td>
                    <td className="p-3">Doorstep Inspection Only</td>
                    <td className="p-3">Must be verified with courier prior to acceptance.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Digital Goods & Software</td>
                    <td className="p-3">Non-Returnable</td>
                    <td className="p-3">Keys and downloadable assets are non-refundable once delivered.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Valid Return Reasons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-2 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Physical defect, dead-on-arrival, or damaged product casing.</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-2 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Wrong item, size, color, or model received compared to order spec.</span>
              </div>
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-2 text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Missing accessories, cables, or components included in listing.</span>
              </div>
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-2 text-rose-900">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Customer change-of-mind for personalized or unsealed hygienic items.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Refund Disbursement Timelines
            </h2>
            <p>
              Once your returned package arrives at our quality inspection hub and is verified:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Zibonbaba Customer Wallet</strong>: Instant refund within <strong>1–2 hours</strong>.</li>
              <li><strong>Mobile Financial Services (bKash, Nagad, Rocket)</strong>: <strong>3 to 5 business days</strong>.</li>
              <li><strong>Credit / Debit Cards (Visa, Mastercard)</strong>: <strong>7 to 10 banking business days</strong> depending on your issuing bank.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              4. How to Request a Return
            </h2>
            <p>
              Log in to your account, visit <Link href="/account/tickets" className="text-amber-600 font-semibold underline">Customer Support & Returns</Link>, select the order, upload unboxing photos, and our team will coordinate a reverse-pickup courier directly to your doorstep.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
