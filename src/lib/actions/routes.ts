'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'

export async function addRoute(formData: FormData) {
  const from_location = formData.get('from_location') as string
  const to_location = formData.get('to_location') as string
  const duration = formData.get('duration') as string
  const price_one_way = formData.get('price_one_way') as string
  const price_return = formData.get('price_return') as string
  await adminSupabase.from('routes').insert([{ from_location, to_location, duration, price_one_way, price_return, sort_order: 0, is_active: true }])
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}

export async function updateRoute(id: string, formData: FormData) {
  const from_location = formData.get('from_location') as string
  const to_location = formData.get('to_location') as string
  const duration = formData.get('duration') as string
  const price_one_way = formData.get('price_one_way') as string
  const price_return = formData.get('price_return') as string
  await adminSupabase.from('routes').update({ from_location, to_location, duration, price_one_way, price_return }).eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}

export async function deleteRoute(id: string) {
  await adminSupabase.from('routes').delete().eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}

export async function toggleRouteStatus(id: string, isActive: boolean) {
  await adminSupabase.from('routes').update({ is_active: !isActive }).eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}
