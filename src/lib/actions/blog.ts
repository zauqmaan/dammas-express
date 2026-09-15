'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase, assertOk } from '@/lib/supabase/admin'
import { uploadImage } from '@/lib/actions/upload'
import { requireSession } from '@/lib/auth'
import { runAction, type ActionResult } from '@/lib/actions/result'

export async function addPost(formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string

    const file = formData.get('image') as File | null
    let image_url: string | null = null
    if (file && file.size > 0) {
      image_url = await uploadImage(file)
    }

    assertOk(
      await adminSupabase
        .from('blog_posts')
        .insert([{ title, slug, excerpt, content, category, image_url, is_published: false }]),
      'Add post'
    )
    revalidatePath('/dashboard/blog')
    revalidatePath('/')
    revalidatePath('/blog')
  })
}

export async function updatePost(id: string, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string

    const file = formData.get('image') as File | null
    const existing_image_url = (formData.get('image_url') as string) || null
    let image_url = existing_image_url
    if (file && file.size > 0) {
      image_url = await uploadImage(file)
    }

    assertOk(
      await adminSupabase
        .from('blog_posts')
        .update({ title, slug, excerpt, content, category, image_url })
        .eq('id', id),
      'Update post'
    )
    revalidatePath('/dashboard/blog')
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/[slug]', 'page')
  })
}

export async function deletePost(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(await adminSupabase.from('blog_posts').delete().eq('id', id), 'Delete post')
    revalidatePath('/dashboard/blog')
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/[slug]', 'page')
  })
}

export async function togglePublished(id: string, isPublished: boolean): Promise<ActionResult> {
  return runAction(async () => {
    await requireSession()
    assertOk(
      await adminSupabase.from('blog_posts').update({ is_published: !isPublished }).eq('id', id),
      'Change publish status'
    )
    revalidatePath('/dashboard/blog')
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/[slug]', 'page')
  })
}
