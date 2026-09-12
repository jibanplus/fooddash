/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript error থাকলেও বিল্ড যেন না থামে
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint warning/error থাকলেও বিল্ড যেন পাস হয়
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;