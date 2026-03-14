import type { NextConfig } from "next";

// Trigger deployment 1

const nextConfig: NextConfig = {
  transpilePackages: ["@cp/ui"],

  // Disable client-side router cache for testing true performance
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },

  // Rewrites for API proxy - uses env variable for production
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/backend-system/:path*",
        destination: `${apiUrl}/backend-system/:path*`,
      },
    ];
  },
};

export default nextConfig;

