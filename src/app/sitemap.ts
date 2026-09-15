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

  // lastModified is repeated rather than added by a trailing .map(): the
  // annotation would then apply to the map's result instead of to this literal,
  // and without a contextual type TypeScript widens 'weekly' to string, which
  // no longer satisfies the changeFrequency union.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/routes'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/booking'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/portfolio'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  return [...staticRoutes, ...routeDetailRoutes, ...blogRoutes]
}
