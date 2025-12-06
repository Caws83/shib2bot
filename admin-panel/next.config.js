/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/:path*`,
      },
      {
        source: '/mini-api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/mini-api/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

