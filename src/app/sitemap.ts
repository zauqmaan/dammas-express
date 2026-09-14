import { MetadataRoute } from 'next'
import { getPublishedPosts, getRoutes } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Both lists are independent — fetch them together rather than in series.
  const [posts, routes] = await Promise.all([getPublishedPosts(), getRoutes()])

  const now = new Date()

  const blogRoutes = posts.map(post => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // The per-route detail pages are the most commercially targeted URLs on the
  // site and were previously missing from the sitemap entirely. `routes` has no
  // updated_at column, so they all report the current build time.
  const routeDetailRoutes = routes
    .filter(route => route.slug)
    .map(route => ({
      url: absoluteUrl(`/routes/${route.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/services'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/routes'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/booking'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/contact'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/portfolio'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/blog'), changeFrequency: 'weekly', priority: 0.8 },
  ].map(entry => ({ ...entry, lastModified: now }))

  return [...staticRoutes, ...routeDetailRoutes, ...blogRoutes]
}
