/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
    unoptimized: true // This will bypass Next.js image optimization and use Cloudflare's optimization
  },
}

module.exports = nextConfig 