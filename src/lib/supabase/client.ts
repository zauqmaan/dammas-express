import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      // Next.js patches global fetch to cache Server Component requests by
      // default. Without this, a stale (e.g. empty) response gets cached
      // and keeps getting served even after the underlying data changes.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  }
)
