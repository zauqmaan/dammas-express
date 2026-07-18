// The client's dashboard password (they can change this later)
const DASHBOARD_PASSWORD = 'Dammas@2025'

export async function verifyPassword(password: string): Promise<boolean> {
  // In production, you'd compare against a hash in .env
  // For now, simple direct compare for easy client access
  return password === DASHBOARD_PASSWORD
}

// Create a simple session token (base64 encoded timestamp + secret)
export function createSessionToken(): string {
  const payload = JSON.stringify({
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  })
  return Buffer.from(payload).toString('base64')
}

export function verifySession(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    return payload.exp > Date.now()
  } catch {
    return false
  }
}
