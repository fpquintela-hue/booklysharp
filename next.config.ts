import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', '@libsql/client'],
  transpilePackages: ['react-big-calendar'],
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
