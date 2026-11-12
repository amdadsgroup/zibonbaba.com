'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Truck, Check, Package, MapPin, Compass, Search } from 'lucide-react';

function TrackingPageContent() {
  const { orders } = useStore();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [trackId, setTrackId] = useState(initialOrderId);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const runTrackingSearch = async (id: string) => {
    if (!id) return;
    const cleanId = id.trim();
    const order = orders.find((o) => o.id.toLowerCase() === cleanId.toLowerCase());
    if (order) {
      setActiveOrder(order);
      setSearchError('');
      return;
    }

    try {
      const res = await fetch(`/api/orders`);
      if (res.ok) {
        const data = await res.json();
        const found = data.orders?.find((o: any) => o.id.toLowerCase() === cleanId.toLowerCase());
        if (found) {
          setActiveOrder(found);
          setSearchError('');
          return;
        }
      }
    } catch (_) {}

    // Fallback if not found
    setActiveOrder({
      id: cleanId.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      total: 183.00,
      status: 'PROCESSING',
      source: 'ONLINE',
      shippingAddress: 'Gulshan 2, Road 45, Dhaka',
    });
    setSearchError('Note: Order ID not found in recent logged-in records. Displaying dispatch roadmap.');
  };

  useEffect(() => {
    if (initialOrderId) {
      runTrackingSearch(initialOrderId);
    }
  }, [initialOrderId, orders]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTrackingSearch(trackId);
  };

  // Status mapping to indices
  const statusLevels = ['PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED'];
  const activeIndex = activeOrder ? statusLevels.indexOf(activeOrder.status) : 0;

  return (
    <div className="space-y-10">
      {/* Tracker Lookup Input */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4">
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Enter Order / POS ID (e.g. ORD-982104)"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full bg-neutral-light border border-neutral-light rounded p-2.5 text-xs text-neutral-dark outline-none focus:border-primary font-mono font-bold"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-5 rounded flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-neutral-muted text-center font-semibold">
          💡 Pro-tip: Copy any order code from your customer orders list to track it.
        </p>
      </div>

      {searchError && (
        <div className="max-w-xl mx-auto bg-warning/15 border border-warning text-warning text-xs p-3 rounded text-center font-semibold">
          {searchError}
        </div>
      )}

      {/* Milestone roadmap */}
      {activeOrder && (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg border border-neutral-light shadow-card space-y-8 animate-slide-up">
          {/* Summary Metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-light pb-4 text-xs font-semibold">
            <div>
              <span className="text-neutral-muted">Active Code:</span>{' '}
              <span className="font-mono font-bold text-primary-dark">{activeOrder.id}</span>
            </div>
            <div>
              <span className="text-neutral-muted">Courier:</span>{' '}
              <span className="text-neutral-dark">Zibonbaba Express (ZE-8120)</span>
            </div>
            <div>
              <span className="text-neutral-muted">Est. Arrival:</span>{' '}
              <span className="text-success">2-3 Business Days</span>
            </div>
          </div>

          {/* Visual Timelines */}
          <div className="relative flex justify-between items-center w-full">
            {/* Progress bar line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-light -translate-y-1/2 -z-10"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${(activeIndex / (statusLevels.length - 1)) * 100}%` }}
            ></div>

            {/* Steps */}
            {statusLevels.map((lvl, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;
              return (
                <div key={lvl} className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-primary border-primary text-neutral-dark'
                        : isActive
                        ? 'bg-white border-primary-accent text-primary-dark scale-110 shadow-glow animate-pulse'
                        : 'bg-neutral-light border-neutral-light text-neutral-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 font-bold" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-primary-dark font-extrabold' : 'text-neutral-muted'
                    }`}
                  >
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detail card */}
          <div className="bg-neutral-light/50 p-5 rounded-md border border-neutral-light text-xs space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-accent" />
              <div>
                <h4 className="font-bold text-neutral-dark">Delivery Address</h4>
                <p className="text-neutral-body text-[11px] mt-0.5">{activeOrder.shippingAddress || 'Customer shipping coordinate index #12, Dhaka'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-neutral-light/50 pt-2.5">
              <Compass className="w-4 h-4 text-success" />
              <div>
                <h4 className="font-bold text-neutral-dark">Live Transit Logs</h4>
                <p className="text-neutral-body text-[11px] mt-0.5">Package checked out from Warehouse Hub A and handed to Zibonbaba Delivery courier.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-10">
      <div className="border-b border-neutral-light pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-neutral-dark flex items-center justify-center gap-2">
          <Truck className="w-8 h-8 text-primary-accent" />
          Order Dispatch Tracker
        </h1>
        <p className="text-xs text-neutral-muted mt-1">Audit shipment dispatches, couriers, and live warehouse handshakes.</p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs text-neutral-muted mt-3">Loading tracking systems...</p>
        </div>
      }>
        <TrackingPageContent />
      </Suspense>
    </div>
  );
}
