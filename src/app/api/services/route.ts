import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'

// Without this the handler is evaluated once at build time and the dashboard
// list never reflects changes in production. See src/app/api/blog/route.ts.
export const dynamic = 'force-dynamic'

export async function GET() {
  const { data } = assertOk(
    await adminSupabase.from('services').select('*').order('sort_order', { ascending: true }),
    'Load services'
  )
  return NextResponse.json(data ?? [])
}
