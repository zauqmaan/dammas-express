'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  MapPin,
  Truck,
  FileText,
  MessageSquare,
  LogOut,
} from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/services', label: 'Services', icon: Wrench },
  { href: '/dashboard/routes', label: 'Routes', icon: MapPin },
  { href: '/dashboard/fleet', label: 'Fleet', icon: Truck },
  { href: '/dashboard/blog', label: 'Blog Posts', icon: FileText },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <nav className="mt-10 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <Link
          href="/dashboard/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-red-400 hover:text-red-300 hover:bg-white/5"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </>
  )
}
