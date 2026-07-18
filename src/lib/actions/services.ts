'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'

export async function addService(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const icon_name = formData.get('icon_name') as string
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

  await adminSupabase.from('services').insert([{ title, slug, description, icon_name, features, sort_order: 0, is_active: true }])
  revalidatePath('/dashboard/services')
  revalidatePath('/')
  revalidatePath('/services')
}

export async function updateService(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const icon_name = formData.get('icon_name') as string
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

  await adminSupabase.from('services').update({ title, slug, description, icon_name, features }).eq('id', id)
  revalidatePath('/dashboard/services')
  revalidatePath('/')
  revalidatePath('/services')
}

export async function deleteService(id: string) {
  await adminSupabase.from('services').delete().eq('id', id)
  revalidatePath('/dashboard/services')
  revalidatePath('/')
  revalidatePath('/services')
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  await adminSupabase.from('services').update({ is_active: !isActive }).eq('id', id)
  revalidatePath('/dashboard/services')
  revalidatePath('/')
  revalidatePath('/services')
}
