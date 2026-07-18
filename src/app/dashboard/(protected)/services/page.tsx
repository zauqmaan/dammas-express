'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Service } from '@/lib/supabase/types'
import { addService, updateService, deleteService, toggleServiceStatus } from '@/lib/actions/services'

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  icon_name: '',
  features: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function fetchServices() {
    setLoading(true)
    const res = await fetch('/api/services')
    const data = await res.json()
    setServices(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  function openAddModal() {
    setEditingService(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(service: Service) {
    setEditingService(service)
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      icon_name: service.icon_name,
      features: service.features.join(', '),
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingService(null)
    setForm(emptyForm)
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editingService ? prev.slug : slugify(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    formData.set('title', form.title)
    formData.set('slug', form.slug)
    formData.set('description', form.description)
    formData.set('icon_name', form.icon_name)
    formData.set('features', form.features)

    if (editingService) {
      await updateService(editingService.id, formData)
    } else {
      await addService(formData)
    }

    setSaving(false)
    closeModal()
    fetchServices()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return
    await deleteService(id)
    fetchServices()
  }

  async function handleToggleStatus(id: string, isActive: boolean) {
    await toggleServiceStatus(id, isActive)
    fetchServices()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Services</h1>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      <div className="mt-6 bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Title</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Slug</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Icon</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading services...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No services yet. Click &quot;Add Service&quot; to create one.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-sm text-white font-medium">{service.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{service.slug}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-400 text-xs bg-white/5 px-2 py-0.5 rounded">{service.icon_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleStatus(service.id, service.is_active)}
                      className={
                        service.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full'
                          : 'bg-gray-500/10 text-gray-500 text-xs px-2.5 py-0.5 rounded-full'
                      }
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
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
              <h2 className="text-white font-semibold">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Service Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Icon Name (Lucide)</label>
                <input
                  type="text"
                  value={form.icon_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon_name: e.target.value }))}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
                <p className="text-gray-600 text-xs mt-1">e.g., Car, Plane, Building2</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Features (comma separated)</label>
                <input
                  type="text"
                  value={form.features}
                  onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))}
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
                <p className="text-gray-600 text-xs mt-1">e.g., On-demand booking, Fixed pricing, AC vehicles</p>
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
