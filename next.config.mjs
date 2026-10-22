/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // These are already NEXT_PUBLIC_ so they're exposed to the browser automatically.
  // Listing them here makes them available in Edge runtime too.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL:           process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
