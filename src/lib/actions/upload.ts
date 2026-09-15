'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { requireSession } from '@/lib/auth'
import { SessionExpiredError, type ActionFailure } from '@/lib/actions/result'

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

/**
 * Server-side upload. Throws on failure, so the blog and fleet actions can let
 * runAction turn it into a failure result along with everything else.
 *
 * Not for calling from the browser — use uploadImageAction below, or the
 * message is replaced by a digest in production.
 */
export async function uploadImage(file: File): Promise<string> {
  // The editor's wrapper reaches this straight from the browser when an image
  // is added to post content, so the login check has to live here too — not
  // only in the actions that wrap it.
  await requireSession()

  await ensurePublicBucket()

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error } = await adminSupabase.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true })

  // Previously this returned null on failure, so the post saved with no cover
  // image and nothing told you the upload had failed. Throw instead — the
  // caller surfaces it.
  if (error) {
    console.error('[supabase] Image upload failed:', error)
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data } = adminSupabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * The version the rich text editor calls from the browser.
 *
 * Same reason as ActionResult (src/lib/actions/result.ts): a thrown message is
 * stripped in production, so the editor would report "an error occurred" for a
 * file that was too large, a missing bucket and an expired login alike.
 */
export async function uploadImageAction(
  file: File
): Promise<{ ok: true; url: string } | ActionFailure> {
  try {
    return { ok: true, url: await uploadImage(file) }
  } catch (err) {
    console.error('[action] image upload failed:', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Upload failed.',
      sessionExpired: err instanceof SessionExpiredError,
    }
  }
}
