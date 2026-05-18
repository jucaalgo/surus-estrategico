import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.tbauctions.com' },
      { protocol: 'https', hostname: 'files.netbid.com' },
      { protocol: 'https', hostname: '**.surplex.com' },
      { protocol: 'https', hostname: '**.troostwijkauctions.com' },
      { protocol: 'https', hostname: '**.maynards.com' },
      { protocol: 'https', hostname: '**.industrial-auctions.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig;