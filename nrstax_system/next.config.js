/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    turbopack: {
      // Point this to your project root (usually '..') 
      // if your Next.js app is in a sub-folder
      root: '..', 
    },
  },
}

module.exports = nextConfig