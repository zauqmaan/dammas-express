'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'

export async function markInquiryRead(id: string) {
  await adminSupabase.from('inquiries').update({ is_read: true }).eq('id', id)
  revalidatePath('/dashboard/inquiries')
}

export async function deleteInquiry(id: string) {
  await adminSupabase.from('inquiries').delete().eq('id', id)
  revalidatePath('/dashboard/inquiries')
}
