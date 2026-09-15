'use client'

/**
 * Fetch one of the dashboard's list endpoints.
 *
 * Each page used to do `setPosts(await res.json())` with no status check, so a
 * 500 — or the 401 /api/inquiries now returns — put an error object into state
 * where an array was expected. `length === 0` was then false and the next
 * render hit "map is not a function": a blank screen rather than a message.
 *
 * Throws on failure; the caller renders the message.
 */
export async function loadList<T>(path: string): Promise<T[]> {
  const res = await fetch(path, { cache: 'no-store' })

  // Nothing on the page will load without a login, so don't just report it.
  if (res.status === 401) {
    window.location.href = '/dashboard/login'
    throw new Error('Your session has expired. Redirecting to the login page…')
  }

  if (!res.ok) {
    throw new Error(`Could not load this list (server returned ${res.status}).`)
  }

  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('The server returned an unexpected response.')
  }

  return data as T[]
}
