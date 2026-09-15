import { createClient } from '@supabase/supabase-js'

// Fail loudly at startup rather than handing createClient an undefined key,
// whose error ("supabaseKey is required") gives no hint about which variable is
// missing. A missing SUPABASE_SERVICE_ROLE_KEY in the Vercel project is the
// usual reason dashboard writes work locally but not in production.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local and to the Vercel project environment variables.')
}
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and to the Vercel project environment variables — without it every dashboard write fails.')
}

// Server-only client using the service_role key, which bypasses RLS.
// Never import this into a 'use client' component — it must only be
// referenced from Server Actions and Route Handlers, or the key leaks
// into the browser bundle.
export const adminSupabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
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

/**
 * Turn a Supabase result into a thrown error.
 *
 * supabase-js resolves with `{ data, error }` instead of rejecting, so
 * `await adminSupabase.from(x).insert(y)` succeeds even when the write failed.
 * Every dashboard action used to do exactly that: a failed insert closed the
 * modal and refreshed the list as if it had worked, which is why a write that
 * failed in production looked like nothing happened at all.
 *
 * Wrap every write so the Server Action rejects and the page can show why.
 */
export function assertOk<T extends { error: { message: string } | null }>(
  result: T,
  action: string
): T {
  if (result.error) {
    // Server-side detail for the Vercel logs...
    console.error(`[supabase] ${action} failed:`, result.error)
    // ...and a message the dashboard can render.
    throw new Error(`${action} failed: ${result.error.message}`)
  }
  return result
}
