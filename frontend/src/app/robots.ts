import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zibonbaba.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/product/',
          '/store/',
          '/privacy-policy',
          '/terms',
          '/return-policy',
          '/delivery-policy',
          '/payment-policy',
          '/cancellation-policy',
          '/seller-agreement',
          '/contact',
          '/tracking'
        ],
        disallow: [
          '/admin/',
          '/superadmin/',
          '/seller/',
          '/reseller/',
          '/delivery/',
          '/staff/',
          '/api/',
          '/account/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
