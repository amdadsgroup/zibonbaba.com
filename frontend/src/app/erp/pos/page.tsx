'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Search, Trash2, Printer, CheckCircle } from 'lucide-react';

export default function PosRegisterPage() {
  const {
    products,
    posCart,
    addToPosCart,
    removeFromPosCart,
    updatePosCartQty,
    posDiscountPercent,
    setPosDiscount,
    posPaymentMethod,
    setPosPaymentMethod,
    posCheckout,
    clearPosCart,
    crmCustomers,
  } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [activeBranch, setActiveBranch] = useState('Dhanmondi Branch');
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Filter state
  const [selectedCat, setSelectedCat] = useState('All');
  const [posSearch, setPosSearch] = useState('');

  const catalogProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const matched = products.find((p) => p.sku.toUpperCase() === barcodeInput.trim().toUpperCase());
    if (matched) {
      addToPosCart(matched);
      setBarcodeInput('');
    } else {
      alert(`SKU "${barcodeInput}" not found in local database schema.`);
    }
  };

  const handlePosCheckoutSubmit = () => {
    if (posCart.length === 0) {
      alert('Cart is empty.');
      return;
    }
    const order = posCheckout(activeBranch, selectedCustomerId || undefined);
    if (order) {
      setReceiptOrder(order);
      setShowReceiptModal(true);
    }
  };

  // Computations
  const subtotal = posCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = subtotal * (posDiscountPercent / 100);
  const tax = subtotal * 0.08;
  const total = subtotal - discount + tax;

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-8">
      {/* POS Top Header */}
      <div className="border-b border-neutral-light pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-dark">POS Cashier Terminal</h1>
          <p className="text-xs text-neutral-muted mt-1">
            Active Terminal: Dhanmondi Terminal #1 | Connected to Main Warehouse Sync
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={activeBranch}
            onChange={(e) => setActiveBranch(e.target.value)}
            className="bg-white border border-neutral-light rounded p-2 text-xs font-bold text-neutral-dark outline-none focus:border-primary"
          >
            <option value="Dhanmondi Branch">Dhanmondi Branch</option>
            <option value="Agrabad Outlet">Agrabad Outlet</option>
            <option value="Sylhet Branch">Sylhet Branch</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode scanner simulator & Catalog Search */}
          <div className="bg-white p-4 rounded-lg border border-neutral-light shadow-card grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Barcode simulator */}
            <form onSubmit={handleBarcodeSubmit} className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-muted uppercase">Barcode SKU Scan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Scan or type SKU (e.g. HP-PRO-WHT)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark font-mono font-bold outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-neutral-dark hover:bg-neutral-dark/95 text-white text-xs font-bold px-4 rounded transition-colors"
                >
                  Scan
                </button>
              </div>
            </form>

            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-muted uppercase">Product Name Lookup</label>
              <div className="flex items-center bg-neutral-light border border-neutral-light rounded p-2 text-xs">
                <Search className="w-4 h-4 text-neutral-muted mr-2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="bg-transparent w-full outline-none text-neutral-dark"
                />
              </div>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Electronics', 'Home & Kitchen', 'Apparel'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs px-4 py-2 rounded-md font-bold transition-colors whitespace-nowrap ${
                  selectedCat === cat ? 'bg-primary text-neutral-dark shadow-sm' : 'bg-white border border-neutral-light hover:bg-neutral-light text-neutral-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {catalogProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToPosCart(p)}
                className="bg-white p-4 rounded-lg border border-neutral-light hover:border-primary transition-all text-left flex flex-col justify-between min-h-[140px] shadow-card group"
              >
                <div>
                  <span className="block text-[8px] font-mono text-neutral-muted font-bold mb-1">{p.sku}</span>
                  <h4 className="text-xs font-bold text-neutral-dark line-clamp-2 group-hover:text-primary-dark transition-colors">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-4 flex items-center justify-between w-full border-t border-neutral-light pt-2">
                  <span className="text-xs font-extrabold text-neutral-dark">৳{p.price.toFixed(2)}</span>
                  <span className={`text-[9px] font-bold ${p.stock <= 5 ? 'text-error' : 'text-success'}`}>
                    Stock: {p.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: POS Cart Checkout */}
        <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card flex flex-col justify-between min-h-[500px] h-fit">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-2">
              POS Items Queue
            </h2>

            {/* Customer Link dropdown */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-muted uppercase">Linked CRM Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-neutral-light border border-neutral-light rounded p-2 text-xs text-neutral-dark font-semibold outline-none focus:border-primary"
              >
                <option value="">Walk-in Guest Checkout</option>
                {crmCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} ({c.status} - Spent: ৳{c.totalSpent})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Queue */}
            {posCart.length === 0 ? (
              <div className="text-center py-16 text-neutral-muted text-xs space-y-1">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-neutral-light" />
                <p>Register queue is empty.</p>
                <p className="text-[10px]">Click catalog items to add.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {posCart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="w-2/3">
                      <h4 className="font-bold text-neutral-dark line-clamp-1">{item.product.name}</h4>
                      <span className="text-[9px] text-neutral-muted font-mono">{item.product.sku}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Qty edit */}
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updatePosCartQty(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-10 bg-neutral-light border border-neutral-light text-center rounded p-1 text-xs font-bold"
                      />
                      <button
                        onClick={() => removeFromPosCart(item.product.id)}
                        className="text-error hover:bg-error/5 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Computations & Pay Controls */}
          <div className="space-y-4 pt-4 border-t border-neutral-light mt-6">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-body">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>

              {/* Discount selection */}
              <div className="flex justify-between items-center text-neutral-body">
                <span>POS Discount (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={posDiscountPercent}
                  onChange={(e) => setPosDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-14 bg-neutral-light border border-neutral-light text-center rounded p-1 text-xs font-bold"
                />
              </div>

              <div className="flex justify-between text-neutral-body">
                <span>Branch Tax (8%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-dark font-extrabold text-sm border-t border-neutral-light pt-2">
                <span>Grand Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment method selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'CARD', 'MOBILE'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPosPaymentMethod(method)}
                  className={`text-[10px] font-bold py-2 rounded transition-colors ${
                    posPaymentMethod === method ? 'bg-neutral-dark text-white' : 'bg-neutral-light hover:bg-neutral-light text-neutral-dark border border-neutral-light'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePosCheckoutSubmit}
              disabled={posCart.length === 0}
              className="w-full bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-extrabold py-3.5 rounded-md flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:bg-neutral-light disabled:text-neutral-muted disabled:shadow-none cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Process Checkout & Print
            </button>
          </div>
        </div>
      </div>

      {/* POS Receipt Dialog Modal */}
      {showReceiptModal && receiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-lg border border-neutral-light shadow-modal space-y-6 animate-slide-up">
            <div className="text-center space-y-1">
              <CheckCircle className="w-8 h-8 text-success mx-auto" />
              <h2 className="text-base font-extrabold text-neutral-dark">Transaction Printed</h2>
              <p className="text-[10px] text-neutral-muted">Zibonbaba Cloud POS Terminal v1.1</p>
            </div>

            {/* Simulated Tape Receipt */}
            <div className="bg-neutral-light p-4 rounded font-mono text-[10px] text-neutral-dark space-y-3 leading-relaxed border border-dashed border-neutral-muted/50">
              <div className="text-center border-b border-neutral-muted/30 pb-2">
                <p className="font-bold uppercase">Zibonbaba.com Marketplace</p>
                <p>Branch: {receiptOrder.branchName}</p>
                <p>Terminal #1 | Cashier ID: Sarah</p>
                <p>Date: {receiptOrder.date}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold border-b border-neutral-muted/20 pb-1">
                  <span>Item SKU</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
                {receiptOrder.items.map((item: any) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.sku}</span>
                    <span>x{item.quantity}</span>
                    <span>৳{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-muted/30 pt-2 space-y-1 text-right">
                <p>Subtotal: ৳{subtotal.toFixed(2)}</p>
                {discount > 0 && <p className="text-success">Discount ({posDiscountPercent}%): -${discount.toFixed(2)}</p>}
                <p>Tax (8%): ৳{tax.toFixed(2)}</p>
                <p className="font-bold border-t border-neutral-muted/20 pt-1 text-sm">
                  Grand Total: ৳{receiptOrder.total.toFixed(2)}
                </p>
                <p className="text-[9px] text-neutral-muted mt-1">Payment Method: {posPaymentMethod}</p>
              </div>

              <div className="text-center border-t border-neutral-muted/30 pt-2 text-[9px] text-neutral-muted">
                <p>Customer: {receiptOrder.customerName}</p>
                <p className="font-bold mt-1">THANK YOU FOR YOUR PATRONAGE</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  alert('Command sent to virtual thermal printer. Receipt spooling...');
                }}
                className="border border-neutral-dark text-neutral-dark text-xs font-bold py-2 rounded transition-colors"
              >
                Print Hard Copy
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptOrder(null);
                  clearPosCart();
                }}
                className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2 rounded transition-colors cursor-pointer"
              >
                Start New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
