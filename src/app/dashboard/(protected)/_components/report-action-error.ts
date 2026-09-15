'use client'

import type { ActionResult } from '@/lib/actions/result'

/**
 * Shared call-and-report wrapper for dashboard Server Actions.
 *
 * The actions return an ActionResult rather than throwing (see
 * src/lib/actions/result.ts for why), so the failure arrives as a returned
 * value. The try/catch is only for a transport failure, where the action never
 * returned anything at all — a dropped connection, or the deployment being
 * replaced mid-request.
 *
 * Returns whether the action succeeded, so call sites read:
 *
 *   if (await runDashboardAction(() => deletePost(id))) fetchPosts()
 */
export async function runDashboardAction(
  call: () => Promise<ActionResult>
): Promise<boolean> {
  let result: ActionResult

  try {
    result = await call()
  } catch (err) {
    console.error('[dashboard] action did not complete:', err)
    alert('Could not reach the server. Please check your connection and try again.')
    return false
  }

  if (result.ok) return true

  alert(result.message)

  // The dashboard cookie expires after 24 hours. Without this an expired login
  // looks like a save that silently failed, and every retry fails the same way.
  if (result.sessionExpired) {
    window.location.href = '/dashboard/login'
  }

  return false
}
