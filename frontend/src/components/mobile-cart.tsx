'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingBag, Trash2, ArrowRight, Percent } from 'lucide-react';
import Link from 'next/link';

export default function MobileCart() {
  const { cart, removeFromCart, updateCartQty, setMobileTab } = useStore();

  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

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

  if (cart.length === 0) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-140px)] animate-fade-in md:hidden">
        <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center text-neutral-muted mb-4 shadow-inner">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-black text-neutral-dark">Your cart is empty</h3>
        <p className="text-[10px] text-neutral-muted mt-1 max-w-[200px] leading-relaxed">
          Add verified products from the marketplace catalog to start checkout.
        </p>
        <button
          onClick={() => setMobileTab('home')}
          className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-6 py-2.5 rounded-md mt-6 shadow-sm active:scale-95 transition-transform"
        >
          Shop Products
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light pb-24 overflow-y-auto px-4 py-4 animate-slide-up md:hidden">
      <div className="flex items-center justify-between border-b border-neutral-light/75 pb-2 mb-4">
        <h2 className="text-xs font-black text-neutral-dark uppercase tracking-wider">Shopping Basket</h2>
        <span className="text-[9px] font-bold bg-neutral-dark text-white px-2 py-0.5 rounded-full">
          {cart.length} SKUs
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="bg-white p-3 rounded-lg border border-neutral-light/70 shadow-sm flex items-center gap-3"
          >
            {/* Image */}
            <Link 
              href={`/product/${item.product.id}`}
              className="w-14 h-14 rounded overflow-hidden bg-neutral-light border border-neutral-light shrink-0"
            >
              <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
            </Link>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <h4 className="text-[10px] font-bold text-neutral-dark line-clamp-1 leading-tight">{item.product.name}</h4>
              <p className="text-[8px] text-neutral-muted truncate mt-0.5">{item.product.vendor}</p>
              <span className="text-xs font-black text-primary-dark mt-1.5 block">৳{item.product.price.toFixed(2)}</span>
            </div>

            {/* Quantity control / Delete */}
            <div className="flex flex-col items-end gap-2.5">
              <button
                type="button"
                onClick={() => removeFromCart(item.product.id)}
                className="p-1 hover:bg-error/5 text-error rounded active:scale-90 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center border border-neutral-light bg-neutral-light rounded overflow-hidden h-6">
                <button
                  type="button"
                  onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                  className="px-2 font-bold text-xs hover:bg-neutral-muted/20 active:bg-neutral-muted/40 h-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="px-2.5 text-[10px] font-extrabold text-neutral-dark">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                  className="px-2 font-bold text-xs hover:bg-neutral-muted/20 active:bg-neutral-muted/40 h-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promos */}
      <div className="bg-white p-4 rounded-lg border border-neutral-light/70 shadow-sm mt-4 space-y-2">
        <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-primary-accent" />
          Apply Coupon Code
        </h3>
        {couponMsg && (
          <span className={`text-[8px] font-bold block ${discountPercent > 0 ? 'text-success' : 'text-error'}`}>
            {couponMsg}
          </span>
        )}
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. SAVE10"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="flex-grow bg-neutral-light border border-neutral-light rounded p-2 text-[10px] text-neutral-dark outline-none focus:border-primary font-bold"
          />
          <button
            type="submit"
            className="bg-neutral-dark hover:bg-neutral-dark/90 text-white text-[10px] font-bold px-4 rounded active:scale-95 transition-transform"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Bill summary */}
      <div className="bg-white p-4 rounded-lg border border-neutral-light/70 shadow-sm mt-4 space-y-2.5 text-[10px] font-semibold text-neutral-body">
        <h3 className="text-[10px] font-black text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-1.5 mb-2.5">
          Bill Details
        </h3>
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-extrabold text-neutral-dark">৳{subtotal.toFixed(2)}</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between text-success">
            <span>Coupon Discount ({discountPercent}%)</span>
            <span className="font-bold">-৳{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Estimated Tax (5%)</span>
          <span className="font-extrabold text-neutral-dark">৳{tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-extrabold text-neutral-dark">৳{shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-light pt-2.5 text-xs text-neutral-dark font-black">
          <span>Total To Pay</span>
          <span>৳{grandTotal.toFixed(2)}</span>
        </div>

        {/* Proceed to checkout */}
        <Link
          href="/checkout"
          className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-3 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md mt-6 active:scale-95"
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
