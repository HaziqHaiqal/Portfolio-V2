import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/service', destination: '/services', permanent: true },
      { source: '/pricing', destination: '/services', permanent: true },
      { source: '/work', destination: '/projects', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tqimyzkovfqzwooqlxez.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
