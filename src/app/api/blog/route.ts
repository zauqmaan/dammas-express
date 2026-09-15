import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'

// A GET handler that touches no request data is statically evaluated at build
// time and then served as a frozen response forever. In `next dev` route
// handlers always re-run, which is why the dashboard list looked correct
// locally but never showed newly added posts in production.
export const dynamic = 'force-dynamic'

export async function GET() {
  const { data } = assertOk(
    await adminSupabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
    'Load posts'
  )
  return NextResponse.json(data ?? [])
}
