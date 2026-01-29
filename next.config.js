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
    ],
  },
};


module.exports = nextConfig;
