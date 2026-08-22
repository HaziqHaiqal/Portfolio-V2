import type { MetadataRoute } from 'next';

import { SITE_URL } from '@lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin panel and its auth screen carry no public content.
      disallow: ['/admin', '/admin/', '/login', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
