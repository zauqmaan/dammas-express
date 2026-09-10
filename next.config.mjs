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
};

export default nextConfig;
