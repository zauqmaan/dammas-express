import { MetadataRoute } from 'next'
import { BUSINESS, HOME_DESCRIPTION } from '@/lib/seo'

// Web app manifest, served at /manifest.webmanifest.
//
// `icon.png` is Next's file convention in src/app and is what currently backs
// the <link rel="icon"> tag. Two icon files still need to be added by hand
// because they are binary assets:
//   src/app/favicon.ico    (32x32) — makes /favicon.ico resolve instead of 404
//   src/app/apple-icon.png (180x180) — iOS home-screen icon
// Both are picked up automatically by Next once present.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Car Lift & Staff Transport, Al Quoz Dubai`,
    short_name: BUSINESS.name,
    description: HOME_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#030712',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
