import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="text-center">
        <p className="text-emerald-500 font-bold text-8xl">404</p>
        <h1 className="text-white text-2xl font-bold mt-4">Page Not Found</h1>
        <p className="text-gray-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
