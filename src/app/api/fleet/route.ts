import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'

// Without this the handler is evaluated once at build time and the dashboard
// fleet list never reflects changes in production.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Dashboard-only. Reads with the service role key, so it returns every fleet
  // vehicle, inactive ones included. Public pages read active vehicles through
  // getFleet() in src/lib/data.ts, so nothing public depends on this route.
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const { data } = assertOk(
    await adminSupabase.from('fleet').select('*').order('sort_order', { ascending: true }),
    'Load fleet'
  )
  return NextResponse.json(data ?? [])
}
