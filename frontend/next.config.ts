import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@supabase/supabase-js',
      'clsx',
      'tailwind-merge'
    ],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'zibonbaba.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'ikocqacatdvhrameqeox.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          }
        ]
      }
    ];
  },
  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: '/api/seller/:path*',
        destination: `${backendUrl}/api/seller/:path*`
      },
      {
        source: '/api/accounts/:path*',
        destination: `${backendUrl}/api/accounts/:path*`
      },
      {
        source: '/api/accounts',
        destination: `${backendUrl}/api/accounts`
      },
      {
        source: '/api/roles/:path*',
        destination: `${backendUrl}/api/roles/:path*`
      },
      {
        source: '/api/roles',
        destination: `${backendUrl}/api/roles`
      },
      {
        source: '/api/permissions',
        destination: `${backendUrl}/api/permissions`
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`
      },
      {
        source: '/api/verification/:path*',
        destination: `${backendUrl}/api/verification/:path*`
      },
      {
        source: '/api/notifications/:path*',
        destination: `${backendUrl}/api/notifications/:path*`
      },
      {
        source: '/api/notifications',
        destination: `${backendUrl}/api/notifications`
      },
      {
        source: '/api/ai/:path*',
        destination: `${backendUrl}/api/ai/:path*`
      }
    ];
  }
};

export default nextConfig;
