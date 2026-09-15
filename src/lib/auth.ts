import { cookies } from 'next/headers'
import { createHash, createHmac, timingSafeEqual } from 'crypto'
import { SessionExpiredError } from '@/lib/actions/result'

/**
 * The dashboard password.
 *
 * Set DASHBOARD_PASSWORD in Vercel (and .env.local) — the literal below is the
 * original value and it is in the git history, so treat it as public and change
 * it. It stays as a fallback only so an unconfigured deployment keeps working.
 */
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'Dammas@2025'

/**
 * Key the session signature is derived from.
 *
 * Falls back to the Supabase service role key rather than to a literal: that
 * key is already required for the app to boot (see src/lib/supabase/admin.ts)
 * and is already a secret, so there is no new environment variable to forget
 * when deploying. Set DASHBOARD_SESSION_SECRET to decouple the two — rotating
 * either one just logs everyone out.
 */
const SESSION_SECRET =
  process.env.DASHBOARD_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SESSION_SECRET) {
  throw new Error(
    'No session secret available. Set DASHBOARD_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) in .env.local and in the Vercel project environment variables.'
  )
}

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000

export async function verifyPassword(password: string): Promise<boolean> {
  // Compare digests rather than the strings: timingSafeEqual needs both sides
  // to be the same length, and hashing first makes them so without leaking the
  // password's length through the length check.
  const given = createHash('sha256').update(String(password ?? '')).digest()
  const expected = createHash('sha256').update(DASHBOARD_PASSWORD).digest()
  return timingSafeEqual(given, expected)
}

function sign(payload: string): string {
  return createHmac('sha256', SESSION_SECRET as string).update(payload).digest('base64url')
}

/**
 * Create a signed session token, `<payload>.<signature>`.
 *
 * The signature is the point. The previous token was base64 of `{"exp":...}`
 * and nothing more, so anyone could mint a valid one by base64-encoding a
 * future timestamp — no password needed. Every dashboard write is gated on this
 * check, so that was a full authentication bypass.
 */
export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_MS })
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function verifySession(token: string): boolean {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  // Check the signature before parsing anything, so unsigned input is never
  // handed to JSON.parse.
  const given = Buffer.from(signature)
  const expected = Buffer.from(sign(payload))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return false
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

// Call at the top of every dashboard Server Action so writes are actually
// gated on login, not just the page render.
export async function requireSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('dammas_session')?.value

  if (!token || !verifySession(token)) {
    throw new SessionExpiredError()
  }
}
