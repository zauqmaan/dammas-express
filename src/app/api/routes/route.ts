import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'

// Without this the handler is evaluated once at build time and the dashboard
// routes list never reflects changes in production.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Dashboard-only. Reads with the service role key, so it returns every route,
  // inactive ones included. Public pages read active routes through getRoutes()
  // and getRouteBySlug() in src/lib/data.ts, so nothing public depends on this.
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const { data } = assertOk(
    await adminSupabase.from('routes').select('*').order('sort_order', { ascending: true }),
    'Load routes'
  )
  return NextResponse.json(data ?? [])
}
