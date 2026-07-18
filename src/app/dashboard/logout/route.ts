import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/dashboard/login', request.url))
  response.cookies.delete('dammas_session')
  return response
}
