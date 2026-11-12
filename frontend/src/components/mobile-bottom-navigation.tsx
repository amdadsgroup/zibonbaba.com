'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Home, Grid, ShoppingCart, Package, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileBottomNavigation() {
  const { mobileTab, setMobileTab, cart, orders, language, role } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;

  interface TabItem {
    id: 'home' | 'categories' | 'cart' | 'orders' | 'account';
    labelEn: string;
    labelBn: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'home', labelEn: 'Home', labelBn: 'হোম', icon: Home },
    { id: 'categories', labelEn: 'Categories', labelBn: 'ক্যাটাগরি', icon: Grid },
    { id: 'cart', labelEn: 'Cart', labelBn: 'কার্ট', icon: ShoppingCart, badge: cartCount, badgeColor: 'bg-primary-accent text-neutral-dark' },
    { id: 'orders', labelEn: 'Orders', labelBn: 'অর্ডার', icon: Package, badge: activeOrdersCount, badgeColor: 'bg-error text-white' },
    { id: 'account', labelEn: 'Account', labelBn: 'অ্যাকাউন্ট', icon: User }
  ];

  const handleTabClick = (tabId: 'home' | 'categories' | 'cart' | 'orders' | 'account') => {
    if (tabId === 'account') {
      const normalizedRole = (role || '').toUpperCase();
      if (normalizedRole === 'DELIVERY_MAN' || normalizedRole === 'DELIVERYMAN' || normalizedRole === 'COURIER') {
        router.push('/delivery');
        return;
      }
    }
    setMobileTab(tabId);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const getIsActive = (tabId: string) => {
    if (pathname === '/') {
      return mobileTab === tabId;
    }
    if (tabId === 'cart' && pathname === '/cart') return true;
    if (tabId === 'account' && (pathname === '/customer' || pathname === '/login' || pathname === '/register' || pathname === '/account')) return true;
    if (tabId === 'orders' && pathname === '/tracking') return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-light/70 h-16 flex items-center justify-around px-2 shadow-megamenu pb-safe md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = getIsActive(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className="flex flex-col items-center justify-center w-14 h-full relative cursor-pointer select-none active:scale-95 transition-transform"
          >
            {/* Icon Wrapper */}
            <div className={`p-1 rounded-full transition-all duration-200 ${isActive ? 'text-primary-dark scale-110' : 'text-neutral-muted hover:text-neutral-dark'}`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <span className={`text-[9px] mt-0.5 font-bold transition-colors ${isActive ? 'text-primary-dark' : 'text-neutral-muted'}`}>
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </span>

            {/* Badges */}
            {tab.badge && tab.badge > 0 ? (
              <span className={`absolute top-1.5 right-2 text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            ) : null}

            {/* Active Indicator Bar */}
            {isActive && (
              <span className="absolute bottom-1 w-5 h-0.75 bg-primary-dark rounded-full"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
