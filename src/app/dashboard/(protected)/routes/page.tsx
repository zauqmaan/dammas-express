'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Route } from '@/lib/supabase/types'
import { addRoute, updateRoute, deleteRoute, toggleRouteStatus } from '@/lib/actions/routes'

const emptyForm = {
  from_location: '',
  to_location: '',
  duration: '',
  price_one_way: '',
  price_return: '',
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function fetchRoutes() {
    setLoading(true)
    const res = await fetch('/api/routes')
    const data = await res.json()
    setRoutes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  function openAddModal() {
    setEditingRoute(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(route: Route) {
    setEditingRoute(route)
    setForm({
      from_location: route.from_location,
      to_location: route.to_location,
      duration: route.duration,
      price_one_way: route.price_one_way,
      price_return: route.price_return,
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingRoute(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    formData.set('from_location', form.from_location)
    formData.set('to_location', form.to_location)
    formData.set('duration', form.duration)
    formData.set('price_one_way', form.price_one_way)
    formData.set('price_return', form.price_return)

    if (editingRoute) {
      await updateRoute(editingRoute.id, formData)
    } else {
      await addRoute(formData)
    }

    setSaving(false)
    closeModal()
    fetchRoutes()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this route?')) return
    await deleteRoute(id)
    fetchRoutes()
  }

  async function handleToggleStatus(id: string, isActive: boolean) {
    await toggleRouteStatus(id, isActive)
    fetchRoutes()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Routes</h1>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Route
        </button>
      </div>

      <div className="mt-6 bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">From</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">To</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Duration</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">One Way</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Return</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading routes...
                </td>
              </tr>
            ) : routes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No routes yet. Click &quot;Add Route&quot; to create one.
                </td>
              </tr>
            ) : (
              routes.map((route) => (
                <tr key={route.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-sm text-white font-medium">{route.from_location}</td>
                  <td className="px-6 py-4 text-sm text-white font-medium">{route.to_location}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{route.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{route.price_one_way}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{route.price_return}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleStatus(route.id, route.is_active)}
                      className={
                        route.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full'
                          : 'bg-gray-500/10 text-gray-500 text-xs px-2.5 py-0.5 rounded-full'
                      }
                    >
                      {route.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(route)}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">{editingRoute ? 'Edit Route' : 'Add Route'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">From Location</label>
                <input
                  type="text"
                  value={form.from_location}
                  onChange={(e) => setForm((prev) => ({ ...prev, from_location: e.target.value }))}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">To Location</label>
                <input
                  type="text"
                  value={form.to_location}
                  onChange={(e) => setForm((prev) => ({ ...prev, to_location: e.target.value }))}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                  required
                  placeholder="e.g., 45 min"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">One Way Price</label>
                <input
                  type="text"
                  value={form.price_one_way}
                  onChange={(e) => setForm((prev) => ({ ...prev, price_one_way: e.target.value }))}
                  required
                  placeholder="e.g., AED 120"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Return Price</label>
                <input
                  type="text"
                  value={form.price_return}
                  onChange={(e) => setForm((prev) => ({ ...prev, price_return: e.target.value }))}
                  required
                  placeholder="e.g., AED 220"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-white/5 hover:bg-white/10 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
