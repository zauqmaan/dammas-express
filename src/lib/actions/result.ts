/**
 * How dashboard Server Actions report failure.
 *
 * They return a result instead of throwing, because Next.js strips the message
 * off any error thrown out of a Server Action in a *production* build and
 * replaces it with a generic string plus a digest. So the reason a write failed
 * never reached the browser: every failure read "An error occurred in the
 * Server Components render...", and an expired login was indistinguishable from
 * a rejected insert. Only `next dev` showed the real message, which is why this
 * looked fine locally and was useless on Vercel.
 *
 * A returned object is ordinary serialized data, so it crosses the boundary
 * intact.
 */

export type ActionFailure = {
  ok: false
  message: string
  /**
   * A flag rather than matching on the message text, so the client can redirect
   * to the login page and the wording stays free to change.
   */
  sessionExpired: boolean
}

export type ActionResult = { ok: true } | ActionFailure

/** Thrown by requireSession so runAction can tag the failure it produces. */
export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please log in again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

/**
 * Run a Server Action body and turn a thrown error into a failure result.
 *
 * The whole error still goes to the server log (where the Vercel dashboard can
 * show it); only the message travels to the client.
 */
export async function runAction(body: () => Promise<void>): Promise<ActionResult> {
  try {
    await body()
    return { ok: true }
  } catch (err) {
    console.error('[action] failed:', err)
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Something went wrong.',
      sessionExpired: err instanceof SessionExpiredError,
    }
  }
}
