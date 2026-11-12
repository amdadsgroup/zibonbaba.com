'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const validCart = (cart || []).filter(item => item && item.product && typeof item.product.price === 'number');
  const subtotal = validCart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const tax = subtotal * 0.05;
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 60.00) : 0;
  const grandTotal = subtotal - discountAmount + tax + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'SAVE10') {
      setDiscountPercent(10);
      setCouponMsg('Coupon applied: 10% discount deducted!');
    } else {
      setCouponMsg('Invalid coupon code. Try "SAVE10".');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-8">
      <div className="border-b border-neutral-light pb-6">
        <h1 className="text-3xl font-extrabold text-neutral-dark flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-primary-accent" />
          Shopping Cart
        </h1>
        <p className="text-xs text-neutral-muted mt-1">Review your items before proceeding to secure payment checkouts.</p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white border border-neutral-light rounded-lg shadow-card">
          <ShoppingBag className="w-12 h-12 text-neutral-muted mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-neutral-dark">Your shopping cart is empty</h3>
          <p className="text-xs text-neutral-muted mt-1">Explore our catalog to add verified products.</p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-6 py-2.5 rounded-md mt-6 transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white p-4 rounded-lg border border-neutral-light shadow-card flex items-center justify-between gap-4"
              >
                <div className="w-16 h-16 rounded overflow-hidden bg-neutral-light shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xs font-bold text-neutral-dark line-clamp-1">{item.product.name}</h3>
                  <p className="text-[10px] text-neutral-muted mt-0.5">SKU: {item.product.sku} | Vendor: {item.product.vendor}</p>
                  <p className="text-xs font-extrabold text-primary-dark mt-1">৳{item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-neutral-light rounded bg-neutral-light overflow-hidden">
                    <button
                      onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-muted/20"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-neutral-dark">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-neutral-muted/20"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 hover:bg-error/5 text-error rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary panel */}
          <div className="space-y-6">
            {/* Billing totals */}
            <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4">
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
                Order Summary
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-body">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-body">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold">৳{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-body">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">৳{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-dark font-extrabold text-sm border-t border-neutral-light pt-2.5">
                  <span>Total</span>
                  <span>৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Link */}
              <Link
                href="/checkout"
                className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md mt-6 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Coupon codes card */}
            <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-3">
              <h3 className="text-xs font-bold text-neutral-dark uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-4 h-4 text-primary-accent" />
                Promo Coupon Code
              </h3>
              {couponMsg && (
                <p className={`text-[10px] font-bold ${discountPercent > 0 ? 'text-success' : 'text-error'}`}>
                  {couponMsg}
                </p>
              )}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-neutral-dark hover:bg-neutral-dark/95 text-white text-xs font-bold px-4 rounded transition-colors"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
