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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com'),
  title: {
    default: 'Zibonbaba.com - Premium Multi-Vendor E-Commerce & SaaS ERP',
    template: '%s | Zibonbaba.com'
  },
  description: 'Enterprise business management solution combining online multi-vendor retail market, barcode scanning POS, warehouse inventory syncing, CRM logs, and AI forecasting in Bangladesh.',
  keywords: 'Zibonbaba, E-commerce, SaaS, POS system, Enterprise, Inventory management, CRM, Multi-vendor marketplace, Bangladesh, Online shopping Dhaka',
  authors: [{ name: 'Zibonbaba Team' }],
  creator: 'Zibonbaba.com',
  publisher: 'Zibonbaba.com',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Zibonbaba.com - Premium Multi-Vendor E-Commerce & SaaS ERP',
    description: 'Enterprise business management solution combining online multi-vendor retail market, barcode scanning POS, warehouse inventory syncing, and delivery network across Bangladesh.',
    url: 'https://zibonbaba.com',
    siteName: 'Zibonbaba.com',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Zibonbaba Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zibonbaba.com - Premium Multi-Vendor E-Commerce & SaaS ERP',
    description: 'Enterprise business management solution combining online multi-vendor retail market, barcode scanning POS, warehouse inventory syncing, and delivery network across Bangladesh.',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
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
