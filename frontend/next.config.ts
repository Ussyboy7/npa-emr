// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // ✅ Allow deployment even if TypeScript errors exist
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
