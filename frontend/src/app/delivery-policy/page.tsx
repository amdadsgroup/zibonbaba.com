import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft, MapPin, Clock, ShieldCheck, DollarSign } from 'lucide-react';

export const metadata = {
  title: 'Delivery & Shipping Policy — Zibonbaba.com',
  description: 'Nationwide delivery coverage across 64 districts in Bangladesh, shipping timelines, fees, and tracking guidelines.',
  alternates: {
    canonical: 'https://zibonbaba.com/delivery-policy'
  }
};

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Delivery Policy</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <Truck className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Nationwide Logistics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Delivery & Shipping Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Coverage Across All 64 Districts • Zibonbaba Express Fleet
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Delivery Timelines & Charges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-600">
                  <MapPin className="w-4 h-4" /> Inside Dhaka Metro
                </h3>
                <p className="text-xs text-slate-600">
                  Standard Delivery: <strong>24 to 48 Hours</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Shipping Charge: <strong>৳60.00</strong> (Free shipping on eligible carts over ৳2,000)
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-600">
                  <Truck className="w-4 h-4" /> Outside Dhaka (All 64 Districts)
                </h3>
                <p className="text-xs text-slate-600">
                  Standard Nationwide: <strong>3 to 5 Business Days</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Shipping Charge: <strong>৳120.00</strong> flat rate
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. OTP Delivery Verification
            </h2>
            <p className="text-xs text-slate-600">
              For security, high-value and electronic consignments are protected by a one-time password (OTP) sent to your registered mobile phone. You must verify this OTP with the Zibonbaba Delivery courier prior to accepting the package.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Live Order Tracking
            </h2>
            <p className="text-xs text-slate-600">
              You can track your package 24/7 at any stage of transit using our <Link href="/tracking" className="text-amber-600 font-semibold underline">Real-Time Dispatch Tracker</Link> by entering your order reference number.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
