import React from 'react';
import Link from 'next/link';
import { Store, ArrowLeft, ShieldCheck, DollarSign, FileCheck } from 'lucide-react';

export const metadata = {
  title: 'Merchant & Seller Agreement — Zibonbaba.com',
  description: 'Operating guidelines, commission schedules, KYC requirements, and payout terms for marketplace sellers on Zibonbaba.',
  alternates: {
    canonical: 'https://zibonbaba.com/seller-agreement'
  }
};

export default function SellerAgreementPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
          </Link>
          <span>/</span>
          <span className="text-slate-900">Seller Agreement</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center gap-3 text-amber-500 mb-3">
            <Store className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Vendor Relations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Seller & Merchant Agreement
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Standards of Merchant Operation • Commission Schedules & Payout Guarantees
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Merchant Obligations & Genuine Products
            </h2>
            <p className="text-xs text-slate-600">
              Sellers on Zibonbaba must be verified registered entities possessing a valid Trade License and National Identification (NID). Every product listed must be 100% genuine with verifiable warranty honor. Counterfeiting results in immediate account forfeiture, legal referral, and ledger freezing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Commission & Settlement Cycles
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Marketplace commissions range between 3% to 8% based on the product category.</li>
              <li>Order earnings are deposited into the Seller Wallet upon order status reaching <strong>DELIVERED</strong>.</li>
              <li>Withdrawals to merchant bank accounts or MFS are processed on a regular weekly settlement schedule upon reaching the minimum withdrawal threshold of ৳1,000.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Order Fulfillment SLA
            </h2>
            <p className="text-xs text-slate-600">
              Vendors must mark orders as <strong>READY_FOR_DELIVERY</strong> within 24 hours of confirmation. Failure to fulfill orders leads to penalty marks against seller store rankings and potential temporary catalog de-indexing.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/seller/register"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Apply to Become a Verified Seller
            </Link>
            <Link
              href="/seller/login"
              className="text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Already Registered? Login to Seller Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
