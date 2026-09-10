'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'

const BUCKET = 'images'

async function ensurePublicBucket() {
  const { data: buckets } = await adminSupabase.storage.listBuckets()
  const bucket = buckets?.find((b) => b.name === BUCKET)

  if (!bucket) {
    await adminSupabase.storage.createBucket(BUCKET, { public: true })
  } else if (!bucket.public) {
    await adminSupabase.storage.updateBucket(BUCKET, { public: true })
  }
}

export async function uploadImage(file: File): Promise<string | null> {
  // The editor calls this straight from the browser when an image is added to
  // post content, so the login check has to live here too — not only in the
  // actions that wrap it.
  await requireSession()

  await ensurePublicBucket()

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error } = await adminSupabase.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = adminSupabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
