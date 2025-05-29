/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/quotes',
  assetPrefix: '/quotes/',
  images: {
    domains: ['lh3.googleusercontent.com'], // For Google profile images
  },
  // Configure for subfolder deployment
  async redirects() {
    return []
  },
}

module.exports = nextConfig
