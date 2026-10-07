import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'

// A GET handler that touches no request data is statically evaluated at build
// time and then served as a frozen response forever. In `next dev` route
// handlers always re-run, which is why the dashboard list looked correct
// locally but never showed newly added posts in production.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Dashboard-only. Reads with the service role key, so it returns every blog
  // post, unpublished drafts and their full content included. Public pages
  // read published posts through src/lib/data.ts and n8n has its own endpoint
  // (/api/n8n/blog-posts), so nothing public depends on this route.
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const { data } = assertOk(
    await adminSupabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
    'Load posts'
  )
  return NextResponse.json(data ?? [])
}
