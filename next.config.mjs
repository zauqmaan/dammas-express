/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Image uploads (cover images and the infographics dropped into post/route
    // content) travel to Supabase through a Server Action, and the default
    // request cap for those is 1 MB — small enough to reject ordinary photos.
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // One year, deliberately WITHOUT includeSubDomains or preload.
          // The apex already serves HTTPS, so a long max-age is safe there.
          // includeSubDomains would force HTTPS on every current and future
          // subdomain (staging, mail, anything on the domain) and cannot be
          // undone for a year once a browser has cached it; preload is worse
          // still, since removal from the browser preload list takes months.
          // Neither adds much for a single-host marketing site.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
          // Stops browsers second-guessing a declared Content-Type. No downside.
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
