'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'
import { uploadImage } from '@/lib/actions/upload'

export async function addFleetVehicle(formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const price_range = formData.get('price_range') as string
  const passengers = formData.get('passengers') as string
  const luggage = formData.get('luggage') as string
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

  const file = formData.get('image') as File | null
  let image_url: string | null = null
  if (file && file.size > 0) {
    image_url = await uploadImage(file)
  }

  await adminSupabase.from('fleet').insert([{ name, type, description, price_range, passengers, luggage, features, image_url, sort_order: 0, is_active: true }])
  revalidatePath('/dashboard/fleet')
  revalidatePath('/')
  revalidatePath('/portfolio')
}

export async function updateFleetVehicle(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const price_range = formData.get('price_range') as string
  const passengers = formData.get('passengers') as string
  const luggage = formData.get('luggage') as string
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : []

  const file = formData.get('image') as File | null
  const existing_image_url = (formData.get('image_url') as string) || null
  let image_url = existing_image_url
  if (file && file.size > 0) {
    image_url = await uploadImage(file)
  }

  await adminSupabase.from('fleet').update({ name, type, description, price_range, passengers, luggage, features, image_url }).eq('id', id)
  revalidatePath('/dashboard/fleet')
  revalidatePath('/')
  revalidatePath('/portfolio')
}

export async function deleteFleetVehicle(id: string) {
  await adminSupabase.from('fleet').delete().eq('id', id)
  revalidatePath('/dashboard/fleet')
  revalidatePath('/')
  revalidatePath('/portfolio')
}

export async function toggleFleetStatus(id: string, isActive: boolean) {
  await adminSupabase.from('fleet').update({ is_active: !isActive }).eq('id', id)
  revalidatePath('/dashboard/fleet')
  revalidatePath('/')
  revalidatePath('/portfolio')
}
