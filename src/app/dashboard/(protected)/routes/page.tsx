'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown } from 'lucide-react'
import type { Route } from '@/lib/supabase/types'
import RichTextEditor from '@/components/dashboard/RichTextEditor'
import { addRoute, updateRoute, deleteRoute, toggleRouteStatus } from '@/lib/actions/routes'

type FaqRow = { q: string; a: string }

const emptyForm = {
  from_location: '',
  to_location: '',
  duration: '',
  price_one_way: '',
  price_return: '',
  content: '',
  pickup_zones: '',
  dropoff_zones: '',
  meta_title: '',
  meta_description: '',
}

const inputClass =
  'w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [faqs, setFaqs] = useState<FaqRow[]>([])
  const [showSeo, setShowSeo] = useState(false)
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
    setFaqs([])
    setShowSeo(false)
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
      content: route.content ?? '',
      pickup_zones: route.pickup_zones ?? '',
      dropoff_zones: route.dropoff_zones ?? '',
      meta_title: route.meta_title ?? '',
      meta_description: route.meta_description ?? '',
    })
    // Stored as { question, answer }; the builder edits { q, a }.
    setFaqs((route.faq ?? []).map((item) => ({ q: item.question, a: item.answer })))
    setShowSeo(false)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingRoute(null)
    setForm(emptyForm)
    setFaqs([])
    setShowSeo(false)
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { q: '', a: '' }])
  }

  function updateFaq(index: number, key: keyof FaqRow, value: string) {
    setFaqs((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index))
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
    formData.set('content', form.content)
    formData.set('pickup_zones', form.pickup_zones)
    formData.set('dropoff_zones', form.dropoff_zones)
    formData.set('meta_title', form.meta_title)
    formData.set('meta_description', form.meta_description)
    formData.append(
      'faq',
      JSON.stringify(
        faqs
          .filter((item) => item.q.trim() !== '' || item.a.trim() !== '')
          .map((item) => ({ question: item.q, answer: item.a }))
      )
    )

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
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">{editingRoute ? 'Edit Route' : 'Add Route'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">From Location</label>
                  <input
                    type="text"
                    value={form.from_location}
                    onChange={(e) => setForm((prev) => ({ ...prev, from_location: e.target.value }))}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">To Location</label>
                  <input
                    type="text"
                    value={form.to_location}
                    onChange={(e) => setForm((prev) => ({ ...prev, to_location: e.target.value }))}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                  required
                  placeholder="e.g., 45 min"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">One Way Price</label>
                  <input
                    type="text"
                    value={form.price_one_way}
                    onChange={(e) => setForm((prev) => ({ ...prev, price_one_way: e.target.value }))}
                    required
                    placeholder="e.g., AED 120"
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Route Details &amp; SEO Content</label>
                <RichTextEditor
                  content={form.content}
                  onChange={(content) => setForm((prev) => ({ ...prev, content }))}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Pickup Zones</label>
                <textarea
                  value={form.pickup_zones}
                  onChange={(e) => setForm((prev) => ({ ...prev, pickup_zones: e.target.value }))}
                  rows={2}
                  placeholder="e.g., Rigga Metro Station, Union Metro Station, Salah Al Din (comma separated)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Drop-off Zones</label>
                <textarea
                  value={form.dropoff_zones}
                  onChange={(e) => setForm((prev) => ({ ...prev, dropoff_zones: e.target.value }))}
                  rows={2}
                  placeholder="e.g., Al Quoz Industrial Area 1, 2, 3, Al Quoz Residential Areas (comma separated)"
                  className={inputClass}
                />
              </div>

              {/* FAQ builder */}
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-sm font-semibold">Frequently Asked Questions</h3>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    Add FAQ
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <p className="text-gray-600 text-xs mt-3">
                    No FAQs yet. These render on the route page for search visibility.
                  </p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {faqs.map((item, index) => (
                      <div key={index} className="bg-[#030712] border border-white/5 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            FAQ {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFaq(index)}
                            className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.q}
                          onChange={(e) => updateFaq(index, 'q', e.target.value)}
                          placeholder="Question"
                          className="w-full bg-[#0F172A] border border-white/5 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <textarea
                          value={item.a}
                          onChange={(e) => updateFaq(index, 'a', e.target.value)}
                          rows={2}
                          placeholder="Answer"
                          className="w-full bg-[#0F172A] border border-white/5 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced SEO */}
              <div className="border-t border-white/5 pt-5">
                <button
                  type="button"
                  onClick={() => setShowSeo((prev) => !prev)}
                  className="w-full flex items-center justify-between text-white text-sm font-semibold hover:text-emerald-400 transition-colors"
                >
                  Advanced SEO
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showSeo ? 'rotate-180' : ''}`}
                  />
                </button>

                {showSeo && (
                  <div className="space-y-5 mt-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1.5">Meta Title</label>
                      <input
                        type="text"
                        value={form.meta_title}
                        onChange={(e) => setForm((prev) => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="Monthly Car Lift from [Location] to Al Quoz | Dammas Express"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1.5">Meta Description</label>
                      <textarea
                        value={form.meta_description}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, meta_description: e.target.value }))
                        }
                        rows={2}
                        placeholder="Affordable daily and monthly car lift from..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
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
