import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Server, UserCheck, Bell, Mail, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Zibonbaba.com',
  description: 'Learn how Zibonbaba.com collects, uses, protects, and handles your personal information across our marketplace and services.',
  alternates: {
    canonical: 'https://zibonbaba.com/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Legal & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Last Updated: September 2026 • Compliant with Bangladesh Digital Security Act & Consumer Protection Guidelines
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-10 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Overview & Scope
            </h2>
            <p>
              Welcome to <strong>Zibonbaba.com</strong> (operated under AMDADS GROUP). We respect your privacy and are committed to safeguarding your personal data. This policy details our practices regarding information collection, storage, encryption, processing, and disclosure when you visit our website, use our mobile application, or engage with our vendor and reseller partner portals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Information We Collect
            </h2>
            <p>We collect essential data required to provide seamless commerce experiences:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                  <UserCheck className="w-4 h-4" /> Personal & Account Data
                </h3>
                <p className="text-xs text-slate-600">
                  Full name, email address, verified phone number, delivery addresses, date of birth, and encrypted password credentials.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                  <Lock className="w-4 h-4" /> Financial & Transactional
                </h3>
                <p className="text-xs text-slate-600">
                  Order histories, invoices, MFS payment identifiers (bKash/Nagad), Cash-on-Delivery collections, and wallet payout records. Full card data is never stored on our servers and is processed exclusively via PCI-DSS certified gateways (SSLCommerz).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                  <Server className="w-4 h-4" /> Technical & Device Telemetry
                </h3>
                <p className="text-xs text-slate-600">
                  IP addresses, browser signatures, operating system specifications, session tokens, and security audit logs to thwart fraudulent attempts.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-600">
                  <Eye className="w-4 h-4" /> KYC & Regulatory Records
                </h3>
                <p className="text-xs text-slate-600">
                  National ID (NID), Trade License, and driving license copies submitted by verified Merchants, Resellers, and Delivery fleet couriers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Purpose of Processing
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Processing customer orders, dispatching shipments, and calculating exact delivery fees.</li>
              <li>Enforcing real-time synchronization between buyers, merchant warehouses, and delivery couriers.</li>
              <li>Detecting fraudulent card usage, bot account registration, and brute-force logins.</li>
              <li>Sending transactional receipts, password reset links, OTP codes, and critical service notifications.</li>
              <li>Calculating accurate platform commissions, reseller profit margins, and courier payouts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              4. Data Sharing & Third Parties
            </h2>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal data. Information is only shared strictly on a need-to-know basis with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li><strong>Merchant Stores</strong>: Receive shipping name, destination address, and contact numbers exclusively to prepare and dispatch physical parcels.</li>
              <li><strong>Delivery Couriers</strong>: Receive delivery address and recipient phone number to fulfill doorstep delivery and verify OTP handovers.</li>
              <li><strong>Payment Gateways (SSLCommerz, bKash)</strong>: Securely handle encrypted transaction payloads for payment settlement.</li>
              <li><strong>Law Enforcement</strong>: Only when formally mandated by official judicial warrants under the Laws of Bangladesh.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              5. Data Retention & Your Rights
            </h2>
            <p>
              You maintain the right to inspect, update, or request deactivation of your account by visiting <Link href="/account/profile" className="text-amber-600 font-semibold underline">Account Profile</Link> or contacting our Data Protection Officer at <a href="mailto:privacy@zibonbaba.com" className="text-amber-600 font-semibold underline">privacy@zibonbaba.com</a>. Transactional tax and invoice histories are retained as mandated by National Board of Revenue (NBR) regulations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
