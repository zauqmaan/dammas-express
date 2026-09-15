'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'
import { runAction, type ActionResult } from '@/lib/actions/result'

export async function addService(formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const icon_name = formData.get('icon_name') as string
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

    assertOk(
      await adminSupabase
        .from('services')
        .insert([{ title, slug, description, icon_name, features, sort_order: 0, is_active: true }]),
      'Add service'
    )
    revalidatePath('/dashboard/services')
    revalidatePath('/')
    revalidatePath('/services')
  })
}

export async function updateService(id: string, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const icon_name = formData.get('icon_name') as string
    const featuresRaw = formData.get('features') as string
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

    assertOk(
      await adminSupabase
        .from('services')
        .update({ title, slug, description, icon_name, features })
        .eq('id', id),
      'Update service'
    )
    revalidatePath('/dashboard/services')
    revalidatePath('/')
    revalidatePath('/services')
  })
}

export async function deleteService(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(await adminSupabase.from('services').delete().eq('id', id), 'Delete service')
    revalidatePath('/dashboard/services')
    revalidatePath('/')
    revalidatePath('/services')
  })
}

export async function toggleServiceStatus(id: string, isActive: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(
      await adminSupabase.from('services').update({ is_active: !isActive }).eq('id', id),
      'Change service status'
    )
    revalidatePath('/dashboard/services')
    revalidatePath('/')
    revalidatePath('/services')
  })
}
