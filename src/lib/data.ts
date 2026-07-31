import { supabase } from './supabase/client'
import type { Service, Route, FleetVehicle, BlogPost } from './supabase/types'

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) console.error(error)
  return data as Service[] || []
}

export async function getRoutes() {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) console.error(error)
  return data as Route[] || []
}

export async function getRouteBySlug(slug: string) {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) console.error(error)
  return data as Route || null
}

export async function getFleet() {
  const { data, error } = await supabase
    .from('fleet')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) console.error(error)
  return data as FleetVehicle[] || []
}

export async function getPublishedPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) console.error(error)
  return data as BlogPost[] || []
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) console.error(error)
  return data as BlogPost || null
}

export async function submitInquiry(inquiry: {
  service_type: 'individual' | 'corporate'
  name: string
  phone: string
  pickup_location: string
  dropoff_location: string | null
  date: string | null
  time: string | null
  company_name: string | null
  employee_count: number | null
  work_timings: string | null
}) {
  const { data, error } = await supabase
    .from('inquiries')
    .insert([inquiry])
    .select()
  if (error) console.error(error)
  return data
}
