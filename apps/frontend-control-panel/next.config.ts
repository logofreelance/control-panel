import type { NextConfig } from "next";

// Trigger deployment 1

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Disable client-side router cache for testing true performance
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },

  // Rewrites: proxy /api/* ke backend (URL tersembunyi dari browser)
  // Priority: BACKEND_INTERNAL_URL (server-only) → NEXT_PUBLIC_API_URL (build-time) → localhost
  async rewrites() {
    const apiUrl = process.env.BACKEND_INTERNAL_URL
        || process.env.NEXT_PUBLIC_API_URL
        || 'http://localhost:3001';

    console.log(`[NEXT_CONFIG] API Rewrite destination: ${apiUrl}`);

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      }
    ];
  },
};

export default nextConfig;

