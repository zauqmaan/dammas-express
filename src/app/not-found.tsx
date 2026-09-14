import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BUSINESS } from '@/lib/seo'

// This file sits at the app root, outside the (marketing) route group, so it
// cannot inherit that group's layout — Header and Footer are imported directly
// instead. Next serves it with a real 404 status; only the template is ours.
export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
}

const HELPFUL_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Routes & Pricing', href: '/routes' },
  { label: 'Services', href: '/services' },
  { label: 'Book a Ride', href: '/booking' },
  { label: 'Contact', href: '/contact' },
]

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="min-h-[70vh] bg-[#030712] flex items-center justify-center px-4 pt-32 pb-20">
        <div className="text-center max-w-xl">
          <p className="text-emerald-500 font-bold text-8xl">404</p>
          <h1 className="text-white text-2xl font-bold mt-4">Page Not Found</h1>
          <p className="text-gray-500 mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <nav aria-label="Helpful links" className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {HELPFUL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <a
              href={`tel:${BUSINESS.phone}`}
              className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Phone size={18} />
              {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
