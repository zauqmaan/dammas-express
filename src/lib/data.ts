import { supabase } from './supabase/client'
import type { Service, Route, FleetVehicle, BlogPost } from './supabase/types'

// The public read functions below THROW on a database error instead of
// returning [] or null. Public pages are ISR-rendered: a render that throws is
// discarded and the last good page keeps being served, whereas a render that
// "succeeds" with empty data gets cached — a brief Supabase outage used to be
// able to cache route pages as 404s, empty route lists, and a sitemap missing
// every route and blog URL.

// PostgREST's code for `.single()` matching no rows — a genuine "not found",
// not a failure.
const NO_ROWS = 'PGRST116'

export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Load services failed: ${error.message}`)
  return (data ?? []) as Service[]
}

export async function getRoutes() {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Load routes failed: ${error.message}`)
  return (data ?? []) as Route[]
}

/** Null when no active route has this slug; throws on a database error. */
export async function getRouteBySlug(slug: string) {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) {
    if (error.code === NO_ROWS) return null
    throw new Error(`Load route "${slug}" failed: ${error.message}`)
  }
  return data as Route
}

export async function getFleet() {
  const { data, error } = await supabase
    .from('fleet')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Load fleet failed: ${error.message}`)
  return (data ?? []) as FleetVehicle[]
}

export async function getPublishedPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Load published posts failed: ${error.message}`)
  return (data ?? []) as BlogPost[]
}

// Metadata-only view of published posts for the n8n content agent. Selects
// explicit columns so the full HTML content and image_url never leave the
// database. Throws rather than returning [] on error: an empty list would read
// to the agent as "nothing published yet".
export async function getPublishedPostSummaries() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, created_at, updated_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Load published post summaries failed: ${error.message}`)
  return (data ?? []) as Pick<
    BlogPost,
    'id' | 'title' | 'slug' | 'excerpt' | 'category' | 'created_at' | 'updated_at'
  >[]
}

/** Null when no published post has this slug; throws on a database error. */
export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) {
    if (error.code === NO_ROWS) return null
    throw new Error(`Load post "${slug}" failed: ${error.message}`)
  }
  return data as BlogPost
}

export async function getRelatedPosts(slug: string, category: string, limit = 3) {
  const posts = await getPublishedPosts()
  const others = posts.filter((post) => post.slug !== slug)
  const sameCategory = others.filter((post) => post.category === category)
  const rest = others.filter((post) => post.category !== category)
  return [...sameCategory, ...rest].slice(0, limit)
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
