import { NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/auth'
import { getPublishedPostSummaries } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

// Read-only feed of published blog history for the n8n AI content agent.
// Must re-run per request, see src/app/api/blog/route.ts.
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET(request: Request) {
  const auth = verifyApiKey(request)
  if (auth === 'not_configured') {
    return NextResponse.json({ error: 'Not configured.' }, { status: 503, headers: NO_STORE })
  }
  if (auth !== 'ok') {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401, headers: NO_STORE })
  }

  try {
    const summaries = await getPublishedPostSummaries()
    const posts = summaries.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      url: absoluteUrl(`/blog/${post.slug}`),
      category: post.category,
      // No tags column exists yet; kept in the shape so n8n sees a stable schema.
      tags: [] as string[],
      excerpt: post.excerpt,
      // No published_at column; created_at is the closest available date.
      published_at: post.created_at,
      updated_at: post.updated_at,
      status: 'published' as const,
    }))
    return NextResponse.json({ count: posts.length, posts }, { headers: NO_STORE })
  } catch (err) {
    console.error('[n8n] Load blog posts failed:', err)
    return NextResponse.json({ error: 'Failed to load posts.' }, { status: 500, headers: NO_STORE })
  }
}
