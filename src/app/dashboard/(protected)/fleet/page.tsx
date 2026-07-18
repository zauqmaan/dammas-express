'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { FleetVehicle } from '@/lib/supabase/types'
import { addFleetVehicle, updateFleetVehicle, deleteFleetVehicle, toggleFleetStatus } from '@/lib/actions/fleet'

const emptyForm = {
  name: '',
  type: '',
  description: '',
  price_range: '',
  passengers: '',
  luggage: '',
  features: '',
  image_url: '',
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function fetchFleet() {
    setLoading(true)
    const res = await fetch('/api/fleet')
    const data = await res.json()
    setVehicles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFleet()
  }, [])

  function openAddModal() {
    setEditingVehicle(null)
    setForm(emptyForm)
    setImageFile(null)
    setShowModal(true)
  }

  function openEditModal(vehicle: FleetVehicle) {
    setEditingVehicle(vehicle)
    setForm({
      name: vehicle.name,
      type: vehicle.type,
      description: vehicle.description,
      price_range: vehicle.price_range,
      passengers: vehicle.passengers,
      luggage: vehicle.luggage,
      features: vehicle.features.join(', '),
      image_url: vehicle.image_url ?? '',
    })
    setImageFile(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingVehicle(null)
    setForm(emptyForm)
    setImageFile(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    formData.set('name', form.name)
    formData.set('type', form.type)
    formData.set('description', form.description)
    formData.set('price_range', form.price_range)
    formData.set('passengers', form.passengers)
    formData.set('luggage', form.luggage)
    formData.set('features', form.features)
    formData.set('image_url', form.image_url)
    if (imageFile) {
      formData.set('image', imageFile)
    }

    if (editingVehicle) {
      await updateFleetVehicle(editingVehicle.id, formData)
    } else {
      await addFleetVehicle(formData)
    }

    setSaving(false)
    closeModal()
    fetchFleet()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    await deleteFleetVehicle(id)
    fetchFleet()
  }

  async function handleToggleStatus(id: string, isActive: boolean) {
    await toggleFleetStatus(id, isActive)
    fetchFleet()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Fleet</h1>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

      <div className="mt-6 bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Type</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Price Range</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Passengers</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading fleet...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No vehicles yet. Click &quot;Add Vehicle&quot; to create one.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-sm text-white font-medium">{vehicle.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-400 text-xs bg-white/5 px-2 py-0.5 rounded">{vehicle.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{vehicle.price_range}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{vehicle.passengers}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleToggleStatus(vehicle.id, vehicle.is_active)}
                      className={
                        vehicle.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full'
                          : 'bg-gray-500/10 text-gray-500 text-xs px-2.5 py-0.5 rounded-full'
                      }
                    >
                      {vehicle.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
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
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Vehicle Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Type</label>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  required
                  placeholder="e.g., VAN, MINI BUS"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
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
                <label className="block text-gray-400 text-sm mb-1.5">Price Range</label>
                <input
                  type="text"
                  value={form.price_range}
                  onChange={(e) => setForm((prev) => ({ ...prev, price_range: e.target.value }))}
                  required
                  placeholder="e.g., AED 150 - 300"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Passengers</label>
                <input
                  type="text"
                  value={form.passengers}
                  onChange={(e) => setForm((prev) => ({ ...prev, passengers: e.target.value }))}
                  required
                  placeholder="e.g., Up to 7"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Luggage</label>
                <input
                  type="text"
                  value={form.luggage}
                  onChange={(e) => setForm((prev) => ({ ...prev, luggage: e.target.value }))}
                  required
                  placeholder="e.g., 4 large bags"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Features (comma separated)</label>
                <input
                  type="text"
                  value={form.features}
                  onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))}
                  placeholder="e.g., Leather seats, AC, WiFi"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Vehicle Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full bg-[#030712] text-gray-400 text-sm rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
                />
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="mt-3 h-24 w-full object-cover rounded-lg border border-white/5"
                  />
                ) : form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Current"
                    className="mt-3 h-24 w-full object-cover rounded-lg border border-white/5"
                  />
                ) : null}
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
