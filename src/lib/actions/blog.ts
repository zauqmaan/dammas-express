'use server'

import { revalidatePath } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'
import { uploadImage } from '@/lib/actions/upload'

export async function addPost(formData: FormData) {
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

  await adminSupabase.from('blog_posts').insert([{ title, slug, excerpt, content, category, image_url, is_published: false }])
  revalidatePath('/dashboard/blog')
  revalidatePath('/')
  revalidatePath('/blog')
}

export async function updatePost(id: string, formData: FormData) {
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

  await adminSupabase.from('blog_posts').update({ title, slug, excerpt, content, category, image_url }).eq('id', id)
  revalidatePath('/dashboard/blog')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}

export async function deletePost(id: string) {
  await adminSupabase.from('blog_posts').delete().eq('id', id)
  revalidatePath('/dashboard/blog')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}

export async function togglePublished(id: string, isPublished: boolean) {
  await adminSupabase.from('blog_posts').update({ is_published: !isPublished }).eq('id', id)
  revalidatePath('/dashboard/blog')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}
