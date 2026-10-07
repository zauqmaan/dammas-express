import { MetadataRoute } from 'next'
import { getPublishedPosts, getRoutes } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

// This file sits outside the (marketing) route group, so it does not inherit
// that layout's revalidate and would otherwise be generated once at build —
// posts published later would be missing until the next deploy. Regenerate at
// most once an hour instead.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Both lists are independent — fetch them together rather than in series.
  const [posts, routes] = await Promise.all([getPublishedPosts(), getRoutes()])

  // lastModified is set only where a real modification date exists. Static and
  // route pages used to report the build time, which changed on every deploy
  // whether or not the page did; a lastmod that is not consistently accurate
  // teaches Google to ignore lastmod for the whole sitemap, including the real
  // blog dates below. Omitting it is valid and honest.
  const blogRoutes = posts.map(post => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // The per-route detail pages are the most commercially targeted URLs on the
  // site. `routes` has no updated_at column, so they carry no lastModified.
  const routeDetailRoutes = routes
    .filter(route => route.slug)
    .map(route => ({
      url: absoluteUrl(`/routes/${route.slug}`),
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
  ]

  return [...staticRoutes, ...routeDetailRoutes, ...blogRoutes]
}
