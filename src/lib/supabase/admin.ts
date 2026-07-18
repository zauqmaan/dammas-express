import { createClient } from '@supabase/supabase-js'

// Server-only client using the service_role key, which bypasses RLS.
// Never import this into a 'use client' component — it must only be
// referenced from Server Actions and Route Handlers, or the key leaks
// into the browser bundle.
export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Same reasoning as the public client: without this, Next.js can
      // statically cache these responses at build time (or across
      // requests), so dashboard writes would appear not to take effect.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  }
)
