import { NextRequest, NextResponse } from 'next/server'

// POST only. As a GET, the sidebar's <Link> to this route was prefetched in
// production builds, and the prefetch response deleted the session cookie —
// logging the user out right after login, so the next save bounced to /login.
// 303 makes the browser follow up with a GET to the login page.
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/dashboard/login', request.url), 303)
  response.cookies.delete('dammas_session')
  return response
}
