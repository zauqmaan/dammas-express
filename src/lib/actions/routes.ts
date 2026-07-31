'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'
import type { RouteFaq } from '@/lib/supabase/types'

// The dashboard sends the FAQ builder rows as a JSON string; bad JSON should
// never block the rest of the save.
function parseFaq(raw: FormDataEntryValue | null): RouteFaq[] {
  let parsedFaq: RouteFaq[] = []
  try {
    parsedFaq = JSON.parse(raw as string)
  } catch (e) {
    parsedFaq = []
  }
  return Array.isArray(parsedFaq) ? parsedFaq : []
}

function buildSlug(from_location: string) {
  return from_location.trim().toLowerCase().replace(/\s+/g, '-') + '-to-al-quoz'
}

export async function addRoute(formData: FormData) {
  await requireSession()

  const from_location = formData.get('from_location') as string
  const to_location = formData.get('to_location') as string
  const duration = formData.get('duration') as string
  const price_one_way = formData.get('price_one_way') as string
  const price_return = formData.get('price_return') as string
  const content = formData.get('content') as string
  const pickup_zones = formData.get('pickup_zones') as string
  const dropoff_zones = formData.get('dropoff_zones') as string
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const parsedFaq = parseFaq(formData.get('faq'))
  const slug = buildSlug(from_location)

  await adminSupabase.from('routes').insert([{
    from_location,
    to_location,
    duration,
    price_one_way,
    price_return,
    slug,
    content,
    pickup_zones,
    dropoff_zones,
    faq: parsedFaq,
    meta_title,
    meta_description,
    sort_order: 0,
    is_active: true,
  }])
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
  revalidatePath(`/routes/${slug}`)
}

export async function updateRoute(id: string, formData: FormData) {
  await requireSession()

  const from_location = formData.get('from_location') as string
  const to_location = formData.get('to_location') as string
  const duration = formData.get('duration') as string
  const price_one_way = formData.get('price_one_way') as string
  const price_return = formData.get('price_return') as string
  const content = formData.get('content') as string
  const pickup_zones = formData.get('pickup_zones') as string
  const dropoff_zones = formData.get('dropoff_zones') as string
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const parsedFaq = parseFaq(formData.get('faq'))

  await adminSupabase.from('routes').update({
    from_location,
    to_location,
    duration,
    price_one_way,
    price_return,
    content,
    pickup_zones,
    dropoff_zones,
    faq: parsedFaq,
    meta_title,
    meta_description,
  }).eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
  revalidatePath(`/routes/${buildSlug(from_location)}`)
}

export async function deleteRoute(id: string) {
  await requireSession()
  await adminSupabase.from('routes').delete().eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}

export async function toggleRouteStatus(id: string, isActive: boolean) {
  await requireSession()
  await adminSupabase.from('routes').update({ is_active: !isActive }).eq('id', id)
  revalidatePath('/dashboard/routes')
  revalidatePath('/')
  revalidatePath('/routes')
}
