/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'octo-ops.vercel.app',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'octo-ops-backend.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },
};


module.exports = nextConfig;
