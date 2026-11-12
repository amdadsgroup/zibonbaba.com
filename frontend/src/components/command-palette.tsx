'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Wallet,
  Users,
  Settings,
  HelpCircle,
  Plus,
  ArrowRight,
  Command,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { role } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close on Esc
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const getDashboardPath = () => {
    if (['admin', 'superadmin'].includes(role)) return '/admin';
    if (['vendor', 'seller'].includes(role)) return '/seller';
    if (role === 'reseller') return '/reseller';
    if (role === 'deliveryman') return '/delivery';
    return '/account';
  };

  const actions = [
    {
      id: 'dash',
      title: 'Go to Dashboard Overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G D',
      perform: () => router.push(getDashboardPath())
    },
    {
      id: 'products',
      title: 'View Catalog & Inventory',
      category: 'Navigation',
      icon: ShoppingBag,
      shortcut: 'G P',
      perform: () => router.push('/seller')
    },
    {
      id: 'orders',
      title: 'View Active Orders & Processing',
      category: 'Navigation',
      icon: CreditCard,
      shortcut: 'G O',
      perform: () => router.push(getDashboardPath())
    },
    {
      id: 'wallet',
      title: 'Store Wallet & Payout Ledger',
      category: 'Navigation',
      icon: Wallet,
      shortcut: 'G W',
      perform: () => router.push('/seller')
    },
    {
      id: 'staff',
      title: 'Manage Staff Members & Roles',
      category: 'Management',
      icon: Users,
      perform: () => router.push('/seller/staff')
    },
    {
      id: 'add-product',
      title: 'Upload New Product SKU',
      category: 'Quick Actions',
      icon: Plus,
      perform: () => {
        router.push('/seller');
      }
    },
    {
      id: 'ai-insights',
      title: 'Ask AI Copilot for Sales Forecast',
      category: 'AI Copilot',
      icon: Sparkles,
      perform: () => {
        router.push(getDashboardPath());
      }
    }
  ];

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action: typeof actions[0]) => {
    action.perform();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-modal overflow-hidden animate-in-scale">
        {/* Header Search Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search products, or jump to route... (Cmd + K)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/50 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Options List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">
              No command or navigation target found matching &quot;{query}&quot;
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{action.title}</p>
                      <p className="text-[10px] text-slate-500">{action.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {action.shortcut && (
                      <span className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
                        {action.shortcut}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-400">↑↓</kbd>{' '}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-400">↵</kbd>{' '}
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-400">Esc</kbd>{' '}
              Close
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-400/80">
            <Zap className="w-3 h-3" />
            <span>Zibonbaba Enterprise Core</span>
          </div>
        </div>
      </div>
    </div>
  );
}
