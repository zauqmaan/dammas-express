import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await adminSupabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data)
}
