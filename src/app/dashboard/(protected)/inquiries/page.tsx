'use client'

import { useEffect, useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import type { Inquiry } from '@/lib/supabase/types'
import { markInquiryRead, deleteInquiry } from '@/lib/actions/inquiries'
import { formatDate } from '@/lib/format'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchInquiries() {
    setLoading(true)
    const res = await fetch('/api/inquiries')
    const data = await res.json()
    setInquiries(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  async function handleMarkRead(id: string) {
    await markInquiryRead(id)
    fetchInquiries()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return
    await deleteInquiry(id)
    fetchInquiries()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Inquiries</h1>
      </div>

      <div className="mt-6 bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Type</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Phone</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Pickup</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Drop-off</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Time</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading inquiries...
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No inquiries yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className={`border-b border-white/5 last:border-0 ${inquiry.is_read ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 text-sm">
                    {inquiry.service_type === 'corporate' ? (
                      <span className="bg-amber-500/10 text-amber-400 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">🏢 Corporate</span>
                    ) : (
                      <span className="bg-white/5 text-gray-400 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">👤 Individual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">
                    <div className="flex items-center gap-2">
                      {!inquiry.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                      {inquiry.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{inquiry.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{inquiry.pickup_location ?? '—'}</td>
                  {inquiry.service_type === 'corporate' ? (
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-400">
                      <span className="text-white">{inquiry.company_name ?? '—'}</span>
                      {inquiry.employee_count !== null && <span> · {inquiry.employee_count} staff</span>}
                      {inquiry.work_timings && <span> · ⏰ {inquiry.work_timings}</span>}
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-400">{inquiry.dropoff_location ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{inquiry.date ? formatDate(inquiry.date) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{inquiry.time ?? '—'}</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm">
                    {inquiry.is_read ? (
                      <span className="bg-gray-500/10 text-gray-500 text-xs px-2.5 py-0.5 rounded-full">Read</span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full">New</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {!inquiry.is_read && (
                        <button
                          onClick={() => handleMarkRead(inquiry.id)}
                          className="text-gray-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
