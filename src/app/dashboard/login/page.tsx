'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await res.json()

    if (data.success) {
      router.push('/dashboard')
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-white font-bold text-xl text-center">DAMMAS EXPRESS</h1>
        <p className="text-gray-500 text-sm text-center mt-1">Admin Dashboard</p>

        <form onSubmit={handleSubmit} className="mt-8">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter dashboard password"
            className="w-full bg-[#030712] border border-white/5 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
          />
          <div className="text-red-400 text-sm mt-2 min-h-[20px]">{error}</div>
          <button
            type="submit"
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all text-sm"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}
