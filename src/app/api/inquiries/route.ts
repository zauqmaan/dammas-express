import { NextResponse } from 'next/server'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'

// Without this the handler is evaluated once at build time, so new customer
// enquiries would never appear in the dashboard in production.
// See src/app/api/blog/route.ts.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Unlike the blog/fleet/routes/services routes, this one returns customer
  // contact details: name, phone, pickup and drop-off. The dashboard page that
  // calls it sits behind the layout's session check, but the route itself is
  // just a public URL — without this check anyone could read every inquiry by
  // requesting /api/inquiries directly.
  try {
    await requireSession()
  } catch {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const { data } = assertOk(
    await adminSupabase.from('inquiries').select('*').order('created_at', { ascending: false }),
    'Load inquiries'
  )
  return NextResponse.json(data ?? [])
}
