import { Wrench, MapPin, Truck, FileText, MessageSquare } from 'lucide-react'
import { adminSupabase } from '@/lib/supabase/admin'

// These counts were hardcoded (Services 4, Routes 5, Fleet 3, Blog 3) and went
// stale the moment anything was added. force-dynamic keeps them live rather
// than frozen at build time.
export const dynamic = 'force-dynamic'

/**
 * Row count for a table. `head: true` asks Supabase for the count only, so no
 * rows travel over the wire.
 *
 * Returns null on failure so one broken table shows a dash instead of taking
 * the whole overview down.
 */
async function countRows(table: string): Promise<number | null> {
  const { count, error } = await adminSupabase
    .from(table)
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error(`[supabase] Count for "${table}" failed:`, error)
    return null
  }
  return count ?? 0
}

export default async function DashboardOverviewPage() {
  const [services, routes, fleet, posts, inquiries] = await Promise.all([
    countRows('services'),
    countRows('routes'),
    countRows('fleet'),
    countRows('blog_posts'),
    countRows('inquiries'),
  ])

  const stats = [
    { label: 'Services', count: services, icon: Wrench, color: 'text-emerald-500' },
    { label: 'Routes', count: routes, icon: MapPin, color: 'text-emerald-500' },
    { label: 'Fleet', count: fleet, icon: Truck, color: 'text-emerald-500' },
    { label: 'Blog Posts', count: posts, icon: FileText, color: 'text-amber-500' },
    { label: 'Inquiries', count: inquiries, icon: MessageSquare, color: 'text-amber-500' },
  ]

  return (
    <div>
      <h1 className="text-white text-2xl font-bold">Dashboard Overview</h1>
      <p className="text-gray-400 mt-1">Welcome back. Here&apos;s a quick summary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-8">
        {stats.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <Icon className={color} size={24} />
            <p className="text-gray-400 text-sm mt-4">{label}</p>
            <p className="text-white text-2xl font-bold mt-1">
              {count === null ? '—' : count}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
