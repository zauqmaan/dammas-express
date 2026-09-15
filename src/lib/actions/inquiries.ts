'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'
import { runAction, type ActionResult } from '@/lib/actions/result'

export async function markInquiryRead(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(
      await adminSupabase.from('inquiries').update({ is_read: true }).eq('id', id),
      'Mark inquiry read'
    )
    revalidatePath('/dashboard/inquiries')
  })
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(await adminSupabase.from('inquiries').delete().eq('id', id), 'Delete inquiry')
    revalidatePath('/dashboard/inquiries')
  })
}
