import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutClient from '@/components/layout-client';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Zibonbaba.com - Premium Multi-Vendor E-Commerce & SaaS ERP',
  description: 'Enterprise business management solution combining online multi-vendor retail market, barcode scanning POS, warehouse inventory syncing, CRM logs, and AI forecasting.',
  keywords: 'Zibonbaba, E-commerce, SaaS, POS system, Enterprise, Inventory management, CRM, Multi-vendor marketplace, Bangladesh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zibonbaba" />
      </head>
      <body className={`flex flex-col min-h-screen bg-neutral-light ${inter.className}`}>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
