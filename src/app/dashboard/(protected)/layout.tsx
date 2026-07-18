import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'
import SidebarNav from './_components/sidebar-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('dammas_session')?.value

  if (!token || !verifySession(token)) {
    redirect('/dashboard/login')
  }

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex-shrink-0 p-6 flex flex-col">
        <div>
          <span className="text-emerald-500 font-bold text-lg">DAMMAS</span>
          <p className="text-gray-600 text-xs mt-0.5">Admin Panel</p>
        </div>

        <SidebarNav />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
