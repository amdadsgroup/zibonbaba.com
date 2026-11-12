'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlatformSync, RealtimeSyncEvent } from '@/hooks/usePlatformSync';
import { Bell, CheckCircle2, AlertCircle, Sparkles, X, RefreshCw } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const SyncContext = createContext<{ isConnected: boolean }>({ isConnected: false });

export const useSync = () => useContext(SyncContext);

export function PlatformSyncProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, lastEvent } = usePlatformSync();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev.slice(-4), { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleOrderSync = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeSyncEvent>;
      const data = customEvent.detail?.data;
      if (data && data.orderCode && data.newStatus) {
        const type = data.newStatus === 'DELIVERED' ? 'success' : data.newStatus === 'CANCELLED' ? 'warning' : 'info';
        addToast(
          `Order #${data.orderCode} Updated`,
          `Status transitioned from ${data.previousStatus} to ${data.newStatus}`,
          type
        );
      }
    };

    const handleProductSync = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeSyncEvent>;
      const data = customEvent.detail?.data;
      if (data && data.name) {
        addToast(
          'Catalog Synchronized',
          `Product "${data.name}" was updated in real time.`,
          'info'
        );
      }
    };

    window.addEventListener('zibonbaba:order-sync', handleOrderSync);
    window.addEventListener('zibonbaba:product-sync', handleProductSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleOrderSync);
      window.removeEventListener('zibonbaba:product-sync', handleProductSync);
    };
  }, []);

  return (
    <SyncContext.Provider value={{ isConnected }}>
      {children}

      {/* Floating Real-Time Synchronization Toast Stack */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900/95 border border-emerald-500/30 text-white rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-semibold text-slate-100 flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[10px] text-emerald-400 font-normal">Real-time sync</span>
              </div>
              <p className="text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </SyncContext.Provider>
  );
}
