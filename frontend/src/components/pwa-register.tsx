'use client';

import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

export default function PWARegister() {
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production/build environments
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Zibonbaba Service Worker registered: ', reg.scope);
          })
          .catch((err) => {
            console.error('Service Worker registration failed: ', err);
          });
      });
    }

    // 2. Listen for BeforeInstallPromptEvent
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store event on window for global trigger
      window.deferredPrompt = e;
      setShowInstallBanner(true);
      
      // Dispatch custom event to notify other components (e.g. settings page)
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;

    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation');
      } else {
        console.log('User dismissed PWA installation');
      }
      window.deferredPrompt = null;
      setShowInstallBanner(false);
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-neutral-dark text-white p-3 flex items-center justify-between border-b border-primary/30 shadow-modal animate-slide-up md:hidden">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center font-extrabold text-neutral-dark text-lg shadow-sm">
          Z
        </div>
        <div>
          <h4 className="text-xs font-bold leading-tight">Install Zibonbaba App</h4>
          <p className="text-[10px] text-neutral-muted mt-0.5 leading-tight">Fast load & Offline access</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowInstallBanner(false)}
          className="text-xs text-neutral-muted px-2.5 py-1.5 hover:text-white"
        >
          Later
        </button>
        <button
          type="button"
          onClick={handleInstallClick}
          className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-extrabold px-4 py-1.5 rounded-md shadow-sm transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
