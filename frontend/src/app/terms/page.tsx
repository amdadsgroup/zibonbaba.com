import React from 'react';
import Link from 'next/link';
import { Scale, ArrowLeft, CheckCircle2, AlertTriangle, FileText, Building } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Zibonbaba.com',
  description: 'Terms and conditions governing users, sellers, resellers, and delivery partners on the Zibonbaba marketplace.',
  alternates: {
    canonical: 'https://zibonbaba.com/terms'
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Terms of Service</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <Scale className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Contractual Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Effective Date: September 2026 • Governing Digital Commerce Operations in Bangladesh
          </p>
        </div>

        {/* Terms Sections */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering an account, purchasing items, or operating a seller/reseller store on <strong>Zibonbaba.com</strong> (a property of AMDADS GROUP), you agree to be bound by these Terms of Service, along with our <Link href="/privacy-policy" className="text-amber-600 font-semibold underline">Privacy Policy</Link> and <Link href="/return-policy" className="text-amber-600 font-semibold underline">Return & Refund Policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. User Accounts & Security
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Users must provide accurate, verified legal names, phone numbers, and addresses.</li>
              <li>You are strictly responsible for maintaining the confidentiality of your session tokens and password.</li>
              <li>Accounts that exhibit repeated brute-force login attempts or fraudulent activity will be locked automatically for 15 minutes by our defense engine.</li>
              <li>Creating multiple duplicate accounts to exploit promotional discount vouchers is strictly prohibited and subject to immediate suspension.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Marketplace Ecosystem & Multi-Vendor Relationship
            </h2>
            <p>
              Zibonbaba operates as an online marketplace platform connecting third-party sellers, resellers, and independent delivery couriers with buyers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Independent Merchants</strong> are legally responsible for the genuine quality, warranty honors, and accurate specifications of their listed SKUs.</li>
              <li><strong>Resellers</strong> operate as marketing affiliates establishing independent client relationships, utilizing Zibonbaba’s centralized logistics and stock pool.</li>
              <li><strong>Delivery Couriers</strong> are authorized fulfillment agents tasked with safe transit, Cash-on-Delivery (COD) reconciliation, and OTP handover verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              4. Orders, Pricing & Payment
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>All prices are displayed in Bangladeshi Taka (BDT / ৳) and are inclusive of standard local taxes unless specified otherwise.</li>
              <li>In the event of an inadvertent technical mispricing, Zibonbaba reserves the right to cancel the order and issue an immediate 100% refund.</li>
              <li>Cash on Delivery (COD) orders require genuine intent and phone verification; repeated deliberate rejections at doorstep may result in COD restriction.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              5. Intellectual Property & Prohibited Activities
            </h2>
            <p className="text-xs text-slate-600">
              Counterfeit items, unauthorized replica merchandise, narcotics, hazardous chemicals, and pirated software are strictly prohibited. Violating vendor stores will be immediately shut down, their ledger balances frozen, and reported to relevant statutory authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              6. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be interpreted and governed in accordance with the laws of the People&apos;s Republic of Bangladesh. Any dispute arising out of or in connection with this agreement shall be submitted to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
