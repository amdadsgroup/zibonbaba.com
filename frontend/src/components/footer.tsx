'use client';

import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, Headphones, Store, Briefcase, Bike, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 mt-auto">
      {/* Top Value / Trust Highlights Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 py-7 px-4 lg:px-8">
          <div className="flex items-center gap-3.5 pb-5 sm:pb-0 sm:pr-5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">Verified merchants & authentic warranties</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 py-5 sm:py-0 sm:px-5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Fast Nationwide Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Express delivery across 64 districts</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 py-5 sm:py-0 sm:px-5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free buyer refund protection</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-5 sm:pt-0 sm:pl-5">
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">24/7 Priority Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">+880 9612-ZIBONBABA helpline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 py-12 px-4 lg:px-8">
        {/* Brand Column */}
        <div className="lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
              Z
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Zibon<span className="text-amber-400">baba</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Bangladesh’s premier unified multi-vendor e-commerce marketplace & ERP ecosystem connecting consumers, merchants, resellers, and courier fleets.
          </p>
          <div className="flex flex-col gap-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Gulshan 2, Dhaka 1212, Bangladesh</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+880 9612-ZIBONBABA</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>support@zibonbaba.com</span>
            </div>
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Customer Care
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li>
              <Link href="/customer/login" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/customer/register" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Create Customer Account
              </Link>
            </li>
            <li>
              <Link href="/tracking" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/account/profile" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Shopping Cart
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Saved Wishlist
              </Link>
            </li>
            <li>
              <Link href="/account/tickets" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Help Center & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Sell on Zibonbaba */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Sell on Zibonbaba
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li>
              <Link href="/seller/register" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                <span>Become a Seller</span>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-400/10 text-amber-400 rounded border border-amber-400/20">Open Store</span>
              </Link>
            </li>
            <li>
              <Link href="/seller/login" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Seller Center Login
              </Link>
            </li>
            <li>
              <Link href="/reseller/login" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Reseller Hub Portal
              </Link>
            </li>
            <li>
              <Link href="/seller/register" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Merchant Guidelines & Policies
              </Link>
            </li>
          </ul>
        </div>

        {/* Delivery Partner */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Delivery Partner
          </h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400">
            <li>
              <Link href="/delivery/login" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                <span>Delivery Man Login</span>
              </Link>
            </li>
            <li>
              <Link href="/delivery/register" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                <span>Join Delivery Fleet</span>
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-800 text-amber-400 rounded border border-amber-400/20">৳120+/drop</span>
              </Link>
            </li>
            <li>
              <Link href="/tracking" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Live Shipment Tracker
              </Link>
            </li>
            <li>
              <Link href="/delivery/login" className="hover:text-amber-400 transition-colors inline-flex items-center gap-1.5">
                Courier Support Desk
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter & Updates */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Stay Connected
          </h4>
          <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
            Subscribe for exclusive discounts, promotional voucher codes, and weekly new arrivals.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to Zibonbaba deals!');
            }}
            className="flex rounded-lg overflow-hidden border border-slate-700/80 bg-slate-900/90 focus-within:border-amber-400/80 transition-colors"
          >
            <input
              type="email"
              placeholder="Your email address..."
              required
              className="bg-transparent text-xs text-white px-3 py-2.5 w-full outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-3.5 py-2.5 shrink-0 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Partner Portals Quick Access Strip */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 py-3.5 px-4 lg:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Business & Logistics Portals:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/delivery/login"
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-400/10 border border-slate-700 hover:border-amber-400/30 text-slate-300 hover:text-amber-400 font-medium transition-all flex items-center gap-1.5 text-xs"
            >
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Delivery Courier</span>
            </Link>
            <Link
              href="/seller/login"
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-400/10 border border-slate-700 hover:border-amber-400/30 text-slate-300 hover:text-amber-400 font-medium transition-all flex items-center gap-1.5 text-xs"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Seller Center</span>
            </Link>
            <Link
              href="/reseller/login"
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-400/10 border border-slate-700 hover:border-amber-400/30 text-slate-300 hover:text-amber-400 font-medium transition-all flex items-center gap-1.5 text-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Reseller Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-slate-950 py-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center md:justify-start">
            <p className="flex items-center gap-1.5">
              © {new Date().getFullYear()} Zibonbaba.com. All Rights Reserved.
            </p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <p className="inline-flex items-center gap-1.5 text-slate-400">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-[11px] font-bold">
                &lt;/&gt;
              </span>
              <span>Built With <strong className="text-white font-semibold tracking-wide hover:text-amber-400 transition-colors">AMDADS GROUP</strong></span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-slate-400 text-xs">
            <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <span className="text-slate-700">•</span>
            <Link href="/return-policy" className="hover:text-amber-400 transition-colors">Return & Refund</Link>
            <span className="text-slate-700">•</span>
            <Link href="/delivery-policy" className="hover:text-amber-400 transition-colors">Delivery Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/payment-policy" className="hover:text-amber-400 transition-colors">Payment Policy</Link>
            <span className="text-slate-700">•</span>
            <Link href="/cancellation-policy" className="hover:text-amber-400 transition-colors">Cancellation</Link>
            <span className="text-slate-700">•</span>
            <Link href="/seller-agreement" className="hover:text-amber-400 transition-colors">Seller Agreement</Link>
            <span className="text-slate-700">•</span>
            <Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
