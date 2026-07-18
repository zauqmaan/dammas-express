import { Wrench, MapPin, Truck, FileText } from 'lucide-react'

const stats = [
  { label: 'Services', count: 4, icon: Wrench, color: 'text-emerald-500' },
  { label: 'Routes', count: 5, icon: MapPin, color: 'text-emerald-500' },
  { label: 'Fleet', count: 3, icon: Truck, color: 'text-emerald-500' },
  { label: 'Blog Posts', count: 3, icon: FileText, color: 'text-amber-500' },
]

export default function DashboardOverviewPage() {
  return (
    <div>
      <h1 className="text-white text-2xl font-bold">Dashboard Overview</h1>
      <p className="text-gray-400 mt-1">Welcome back. Here&apos;s a quick summary.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {stats.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="bg-[#0F172A] border border-white/5 rounded-xl p-6">
            <Icon className={color} size={24} />
            <p className="text-gray-400 text-sm mt-4">{label}</p>
            <p className="text-white text-2xl font-bold mt-1">{count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
