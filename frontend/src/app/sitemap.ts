import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

  // 1. Static Core Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/product`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${baseUrl}/tracking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/delivery-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/payment-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${baseUrl}/cancellation-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4
    },
    {
      url: `${baseUrl}/seller-agreement`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];

  try {
    // 2. Dynamic Product Pages from Database
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, updatedAt: true },
      take: 1000
    });

    const productRoutes: MetadataRoute.Sitemap = products.map((prod) => ({
      url: `${baseUrl}/product/${prod.id}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    }));

    // 3. Dynamic Verified Stores
    const stores = await prisma.store.findMany({
      where: { isApproved: true },
      select: { id: true, createdAt: true },
      take: 500
    });

    const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
      url: `${baseUrl}/store/${store.id}`,
      lastModified: store.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7
    }));

    return [...staticRoutes, ...productRoutes, ...storeRoutes];
  } catch (err) {
    console.error('Dynamic Sitemap Generation Fallback:', err);
    return staticRoutes;
  }
}
