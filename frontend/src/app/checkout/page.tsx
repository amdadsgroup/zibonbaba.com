'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { CheckCircle, Truck, ShoppingBag, CreditCard, ShieldCheck, ArrowLeft, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, checkout, isLoggedIn, username, userEmail, token } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
    // Preload user profile if logged in
    if (isLoggedIn) {
      setFullName(username || '');
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      if (activeToken) {
        fetch('/api/me/addresses', {
          headers: { Authorization: `Bearer ${activeToken}` }
        })
          .then(r => r.json())
          .then(data => {
            if (data.addresses && data.addresses.length > 0) {
              const primary = data.addresses[0];
              setAddress(primary.addressLine1 || '');
              if (primary.phone) setPhone(primary.phone);
              if (primary.city) setCity(primary.city);
              if (primary.fullName) setFullName(primary.fullName);
            }
          })
          .catch(() => {});
      }
    }
  }, [isLoggedIn, username, token]);

  const validCart = (cart || []).filter(item => item && item.product && typeof item.product.price === 'number');
  const subtotal = validCart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);
  const tax = subtotal * 0.05;
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 60.00) : 0;
  const total = subtotal + tax + shipping;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError('Please fill in your complete shipping address and phone number.');
      return;
    }

    if (!isLoggedIn) {
      setError('Please sign in or create an account to place orders securely.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullShippingDetails = `${fullName ? fullName + ' - ' : ''}${address}, ${city} (Phone: ${phone})`;
      const order = await checkout(fullShippingDetails, paymentMethod);
      if (order) {
        setCreatedOrder(order);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Loading Secure Checkout...</p>
      </div>
    );
  }

  // If order is completed, show success screen
  if (createdOrder) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-lg">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-xs text-slate-500">Thank you for shopping on Zibonbaba. Your order has been registered.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xl text-left space-y-3">
          <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5 font-bold">
            <span className="text-slate-400">Order ID:</span>
            <span className="font-mono text-amber-600 font-extrabold">{createdOrder.id || 'ZB-ORD-' + Date.now().toString().slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5 font-bold">
            <span className="text-slate-400">Date:</span>
            <span className="text-slate-700">{createdOrder.date || new Date().toISOString().split('T')[0]}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5 font-bold">
            <span className="text-slate-400">Payment:</span>
            <span className="text-slate-700 uppercase">{createdOrder.paymentMethod || paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-1">
            <span>Total Paid:</span>
            <span className="text-base text-slate-900 font-extrabold">৳{(createdOrder.total || total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <Link
            href={`/tracking?orderId=${createdOrder.id || ''}`}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
          >
            <Truck className="w-4 h-4" />
            Track Live Shipment
          </Link>
          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-slide-up space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-1">Provide delivery coordinates and choose payment gateway.</p>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Guest Authentication Banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-900">Sign in for Instant Checkout & Escrow Protection</p>
              <p className="text-[11px] text-amber-700">Access your saved addresses, track deliveries, and claim customer rewards.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all whitespace-nowrap shadow-sm"
          >
            Sign In / Register
          </Link>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3.5 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {validCart.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your shopping cart is empty</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">Explore the marketplace catalog to add verified products before checking out.</p>
          <Link
            href="/"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
                Delivery Coordinates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +880 1700-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address / House & Road *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 14, Road 5, Block C, Banani"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">District / City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
                  >
                    {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Gazipur', 'Narayanganj', 'Comilla'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    disabled
                    value="Bangladesh"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-500 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
                Payment Method & Gateway
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, Amex', badge: 'Instant' },
                  { id: 'MOBILE', label: 'MFS (bKash/Nagad)', desc: 'Mobile Financial Services', badge: 'Popular' },
                  { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when courier arrives', badge: 'Standard' }
                ].map((pay) => (
                  <label
                    key={pay.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between min-h-[95px] transition-all relative ${
                      paymentMethod === pay.id
                        ? 'border-amber-500 bg-amber-500/5 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pay.id}
                      checked={paymentMethod === pay.id}
                      onChange={() => setPaymentMethod(pay.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{pay.label}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${paymentMethod === pay.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                        {pay.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2">{pay.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Review Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[10px] font-extrabold text-slate-400">({validCart.length} SKUs)</span>
              </h2>

              <div className="max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-50">
                {validCart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start gap-2 pt-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-800 font-bold truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">৳{item.product.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-slate-900 shrink-0">
                      ৳{(item.product.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-medium">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">৳{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax (5% VAT)</span>
                  <span className="font-bold text-slate-800">৳{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Courier Delivery Fee</span>
                  <span className="font-bold text-slate-800">
                    {shipping === 0 ? <span className="text-emerald-600 uppercase font-black text-[10px]">FREE</span> : `৳${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-100 pt-3">
                  <span>Grand Total</span>
                  <span className="text-base text-slate-950 font-extrabold">৳{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 disabled:opacity-60 text-slate-950 text-xs font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-4 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-950 stroke-[3px]" />
                    <span>Place Order (৳{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400 mt-2">
                🔒 Protected by 256-Bit SSL Encryption & Escrow Safeguard
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
