import { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/dashboard/',
      },
    ],
    // Built from SITE_URL so this can never drift from the host used in the
    // sitemap, the canonical tags and the JSON-LD again. It previously pointed
    // at www while every other file used the apex.
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
