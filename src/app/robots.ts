import { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /api/ is crawler guidance only — the dashboard endpoints under it are
        // protected by requireSession(), not by this file. '/dashboard' without
        // a trailing slash also covers the bare /dashboard path.
        disallow: ['/dashboard', '/api/'],
      },
    ],
    // Built from SITE_URL so this can never drift from the host used in the
    // sitemap, the canonical tags and the JSON-LD. The canonical host is www
    // (the apex redirects to it); see DEFAULT_SITE_URL in src/lib/seo.ts.
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
