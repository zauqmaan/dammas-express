export interface Service {
  id: string
  title: string
  slug: string
  description: string
  icon_name: string
  features: string[]
  sort_order: number
  is_active: boolean
}

export interface Route {
  id: string
  from_location: string
  to_location: string
  duration: string
  price_one_way: string
  price_return: string
  sort_order: number
  is_active: boolean
}

export interface FleetVehicle {
  id: string
  name: string
  type: string
  description: string
  price_range: string
  passengers: string
  luggage: string
  features: string[]
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  image_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  service_type: 'individual' | 'corporate'
  name: string
  phone: string
  pickup_location: string | null
  dropoff_location: string | null
  date: string | null
  time: string | null
  company_name: string | null
  employee_count: number | null
  work_timings: string | null
  is_read: boolean
  created_at: string
}
