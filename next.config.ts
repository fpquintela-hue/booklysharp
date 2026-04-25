import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  transpilePackages: ['react-big-calendar'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  webpack: (config) => {
    if (process.platform === 'win32') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'framer-motion': 'Z:\\node_modules\\framer-motion',
        '@hookform/resolvers/zod': 'Z:\\node_modules\\@hookform\\resolvers\\zod\\dist\\zod.js',
      };
    }
    return config;
  },
};

export default nextConfig;
