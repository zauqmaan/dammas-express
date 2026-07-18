import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await adminSupabase.from('routes').select('*').order('sort_order', { ascending: true })
  return NextResponse.json(data)
}
