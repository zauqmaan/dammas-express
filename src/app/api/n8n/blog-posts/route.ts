import { NextResponse } from 'next/server'
import { verifyApiKey } from '@/lib/auth'
import { getPublishedPostSummaries } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'
import { adminSupabase } from '@/lib/supabase/admin'

// GET: read-only feed of published blog history for the n8n AI content agent.
// POST: lets the agent create a new post as an unpublished draft for review.
// Must re-run per request, see src/app/api/blog/route.ts.
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Same shape the dashboard's slugify() produces: lowercase words joined by
// single hyphens.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const REQUIRED_FIELDS = ['title', 'slug', 'excerpt', 'category', 'content'] as const
const OPTIONAL_STRING_FIELDS = [
  'seo_title',
  'meta_description',
  'primary_keyword',
  'image_url',
] as const

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE })
}

function authFailure(request: Request) {
  const auth = verifyApiKey(request)
  if (auth === 'not_configured') return json({ error: 'Not configured.' }, 503)
  if (auth !== 'ok') return json({ error: 'Not authorised.' }, 401)
  return null
}

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

export async function POST(request: Request) {
  const denied = authFailure(request)
  if (denied) return denied

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400)
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Request body must be a JSON object.' }, 400)
  }
  const input = body as Record<string, unknown>

  const errors: Record<string, string> = {}
  const values: Record<string, string> = {}

  for (const field of REQUIRED_FIELDS) {
    const value = input[field]
    if (typeof value !== 'string' || !value.trim()) {
      errors[field] = 'Required, must be a non-empty string.'
    } else {
      values[field] = field === 'content' ? value : value.trim()
    }
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    const value = input[field]
    if (value === undefined || value === null) continue
    if (typeof value !== 'string') errors[field] = 'Must be a string.'
    else if (value.trim()) values[field] = value.trim()
  }

  const rawKeywords = input.secondary_keywords
  let secondaryKeywords: string[] = []
  if (rawKeywords !== undefined && rawKeywords !== null) {
    if (!Array.isArray(rawKeywords) || rawKeywords.some((k) => typeof k !== 'string')) {
      errors.secondary_keywords = 'Must be an array of strings.'
    } else {
      secondaryKeywords = (rawKeywords as string[]).map((k) => k.trim()).filter(Boolean)
    }
  }

  if (values.slug && !SLUG_PATTERN.test(values.slug)) {
    errors.slug = 'Must be lowercase letters and numbers separated by single hyphens.'
  }

  if (values.image_url) {
    let protocol = ''
    try {
      protocol = new URL(values.image_url).protocol
    } catch {}
    if (protocol !== 'http:' && protocol !== 'https:') {
      errors.image_url = 'Must be an absolute http(s) URL.'
    }
  }

  if (Object.keys(errors).length > 0) {
    return json({ error: 'Validation failed.', fields: errors }, 422)
  }

  try {
    // Check every post, drafts included: the public page looks posts up by slug,
    // so two rows sharing one would make one of them unreachable.
    const existing = await adminSupabase
      .from('blog_posts')
      .select('id')
      .eq('slug', values.slug)
      .limit(1)
    if (existing.error) throw existing.error
    if ((existing.data ?? []).length > 0) {
      return json({ error: 'A post with this slug already exists.', slug: values.slug }, 409)
    }

    // Always a draft, like the dashboard's addPost: publishing stays a manual
    // step in the dashboard. Only existing blog_posts columns are written.
    const { data, error } = await adminSupabase
      .from('blog_posts')
      .insert([
        {
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt,
          content: values.content,
          category: values.category,
          image_url: values.image_url ?? null,
          is_published: false,
        },
      ])
      .select('id, title, slug, excerpt, category, image_url, is_published, created_at, updated_at')
      .single()

    if (error) {
      // 23505 = unique_violation, in case a unique index on slug catches a
      // concurrent insert the check above missed.
      if (error.code === '23505') {
        return json({ error: 'A post with this slug already exists.', slug: values.slug }, 409)
      }
      throw error
    }

    return json(
      {
        post: {
          ...data,
          status: 'draft' as const,
          url: absoluteUrl(`/blog/${data.slug}`),
        },
        // blog_posts has no SEO columns, so these are echoed back for n8n's
        // records but are not saved.
        seo_not_stored: {
          seo_title: values.seo_title ?? null,
          meta_description: values.meta_description ?? null,
          primary_keyword: values.primary_keyword ?? null,
          secondary_keywords: secondaryKeywords,
        },
      },
      201
    )
  } catch (err) {
    // Full error to the server log only; the client gets a generic message.
    console.error('[n8n] Create blog post failed:', err)
    return json({ error: 'Failed to create post.' }, 500)
  }
}
