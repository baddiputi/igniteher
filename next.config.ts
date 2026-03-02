import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable static generation for all pages - all pages are dynamic (auth-dependent)
  output: 'standalone',
};

export default nextConfig;
