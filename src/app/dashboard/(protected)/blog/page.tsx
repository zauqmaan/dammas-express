'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react'
import ReactSimpleWysiwyg from 'react-simple-wysiwyg'
import type { BlogPost } from '@/lib/supabase/types'
import { addPost, updatePost, deletePost, togglePublished } from '@/lib/actions/blog'
import { formatDate } from '@/lib/format'

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  image_url: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function fetchPosts() {
    setLoading(true)
    const res = await fetch('/api/blog')
    const data = await res.json()
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  function openAddModal() {
    setEditingPost(null)
    setForm(emptyForm)
    setContent('')
    setImageFile(null)
    setShowModal(true)
  }

  function openEditModal(post: BlogPost) {
    setEditingPost(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      image_url: post.image_url ?? '',
    })
    setContent(post.content)
    setImageFile(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingPost(null)
    setForm(emptyForm)
    setContent('')
    setImageFile(null)
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: editingPost ? prev.slug : slugify(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    formData.set('title', form.title)
    formData.set('slug', form.slug)
    formData.set('excerpt', form.excerpt)
    formData.set('content', content)
    formData.set('category', form.category)
    formData.set('image_url', form.image_url)
    if (imageFile) {
      formData.set('image', imageFile)
    }

    if (editingPost) {
      await updatePost(editingPost.id, formData)
    } else {
      await addPost(formData)
    }

    setSaving(false)
    closeModal()
    fetchPosts()
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return
    await deletePost(id)
    fetchPosts()
  }

  async function handleTogglePublished(id: string, isPublished: boolean) {
    await togglePublished(id, isPublished)
    fetchPosts()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Blog Posts</h1>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Post
        </button>
      </div>

      <div className="mt-6 bg-[#0F172A] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Title</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Image</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Category</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Date</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  Loading posts...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                  No blog posts yet. Click &quot;Add Post&quot; to create one.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-white/5 last:border-0">
                  <td className="px-6 py-4 text-sm text-white font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-sm">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-10 h-10 rounded-lg object-cover border border-white/5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                        <FileText size={16} className="text-gray-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-400 text-xs bg-white/5 px-2 py-0.5 rounded">{post.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleTogglePublished(post.id, post.is_published)}
                      className={
                        post.is_published
                          ? 'bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full'
                          : 'bg-gray-500/10 text-gray-500 text-xs px-2.5 py-0.5 rounded-full'
                      }
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(post.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(post)}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
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
          <div className="bg-[#0F172A] border border-white/5 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-white font-semibold">{editingPost ? 'Edit Post' : 'Add Post'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Title</label>
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
                <label className="block text-gray-400 text-sm mb-1.5">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  required
                  placeholder="e.g., Guides, News"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  required
                  rows={2}
                  placeholder="Short summary shown on the blog listing page"
                  className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Content</label>
                <div className="bg-[#030712] border border-white/5 rounded-lg overflow-hidden">
                  <ReactSimpleWysiwyg
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full min-h-[250px] p-4 text-sm text-gray-300 bg-transparent focus:outline-none [&_.wysiwyg-editor]:bg-transparent [&_.wysiwyg-toolbar]:bg-white/5 [&_.wysiwyg-toolbar]:border-b [&_.wysiwyg-toolbar]:border-white/5"
                  />
                </div>
                <p className="text-gray-600 text-xs">Select text to see formatting options (Bold, Italic, Lists, etc.)</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Cover Image</label>
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
