import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowLeft, ShieldCheck, DollarSign, Lock } from 'lucide-react';

export const metadata = {
  title: 'Payment Policy — Zibonbaba.com',
  description: 'Accepted payment methods, Cash on Delivery rules, SSLCommerz, bKash, and transaction security on Zibonbaba.',
  alternates: {
    canonical: 'https://zibonbaba.com/payment-policy'
  }
};

export default function PaymentPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Payment Policy</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <CreditCard className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Financial Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Payment Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Secure Gateway Processing • PCI-DSS Certified SSLCommerz & MFS
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Accepted Payment Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-600">
                  <DollarSign className="w-4 h-4" /> Cash on Delivery (COD)
                </h3>
                <p className="text-xs text-slate-600">
                  Pay cash directly to the courier upon physical inspection and handover at your doorstep.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-600">
                  <CreditCard className="w-4 h-4" /> Mobile Financial Services
                </h3>
                <p className="text-xs text-slate-600">
                  Direct tokenized checkout via bKash, Nagad, Rocket, and Upay with zero surcharge.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-600">
                  <Lock className="w-4 h-4" /> Credit / Debit Cards
                </h3>
                <p className="text-xs text-slate-600">
                  Visa, Mastercard, American Express, UnionPay processed with 3D-Secure 2FA OTP verification.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Transaction Security & Data Encryption
            </h2>
            <p className="text-xs text-slate-600">
              All online card payments are encrypted with TLS 1.3 encryption and routed directly to bank aggregators. Zibonbaba.com does <strong>not</strong> store card numbers or CVV codes on its servers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
