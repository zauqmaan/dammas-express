'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'
import { runAction, type ActionResult } from '@/lib/actions/result'
import type { RouteFaq } from '@/lib/supabase/types'

// The dashboard sends the FAQ builder rows as a JSON string; bad JSON should
// never block the rest of the save.
function parseFaq(raw: FormDataEntryValue | null): RouteFaq[] {
  let parsedFaq: RouteFaq[] = []
  try {
    parsedFaq = JSON.parse(raw as string)
  } catch {
    parsedFaq = []
  }
  return Array.isArray(parsedFaq) ? parsedFaq : []
}

function buildSlug(from_location: string) {
  return from_location.trim().toLowerCase().replace(/\s+/g, '-') + '-to-al-quoz'
}

/**
 * The slug currently stored for a route.
 *
 * Needed before an update or a delete: the detail page lives at
 * /routes/<slug>, so revalidating only the new slug leaves the old URL serving
 * a stale (or deleted) page from the cache.
 */
async function currentSlug(id: string): Promise<string | null> {
  const { data } = assertOk(
    await adminSupabase.from('routes').select('slug').eq('id', id).single(),
    'Load route'
  )
  return data?.slug ?? null
}

export async function addRoute(formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
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

    assertOk(
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
      }]),
      'Add route'
    )
    revalidatePath('/dashboard/routes')
    revalidatePath('/')
    revalidatePath('/routes')
    revalidatePath(`/routes/${slug}`)
  })
}

export async function updateRoute(id: string, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
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

    // The slug is derived from from_location, so editing that has to move the
    // stored slug too. Previously it did not: the row kept its original slug
    // while the revalidate below targeted a freshly-derived one, so the page
    // that actually existed was never refreshed and the URL being revalidated
    // did not exist at all.
    const previousSlug = await currentSlug(id)
    const slug = buildSlug(from_location)

    assertOk(
      await adminSupabase.from('routes').update({
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
      }).eq('id', id),
      'Update route'
    )
    revalidatePath('/dashboard/routes')
    revalidatePath('/')
    revalidatePath('/routes')
    revalidatePath(`/routes/${slug}`)
    if (previousSlug && previousSlug !== slug) {
      revalidatePath(`/routes/${previousSlug}`)
    }
  })
}

export async function deleteRoute(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    // Read the slug first — after the delete there is no row to read it from,
    // and without it the detail page keeps being served from the cache.
    const slug = await currentSlug(id)
    assertOk(await adminSupabase.from('routes').delete().eq('id', id), 'Delete route')
    revalidatePath('/dashboard/routes')
    revalidatePath('/')
    revalidatePath('/routes')
    if (slug) revalidatePath(`/routes/${slug}`)
  })
}

export async function toggleRouteStatus(id: string, isActive: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    const slug = await currentSlug(id)
    assertOk(
      await adminSupabase.from('routes').update({ is_active: !isActive }).eq('id', id),
      'Change route status'
    )
    revalidatePath('/dashboard/routes')
    revalidatePath('/')
    revalidatePath('/routes')
    if (slug) revalidatePath(`/routes/${slug}`)
  })
}
