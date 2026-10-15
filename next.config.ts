import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    // Turbopack optimizations
  },
  async rewrites() {
    const backendTarget = (
      process.env.BACKEND_PROXY_TARGET ||
      "https://koredao-server.onrender.com"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${backendTarget}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${backendTarget}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    // `/helpers` and `/helpers/:id` were linked from the homepage hero, the gig
    // detail page, the handwriting matcher, the assistance directory and the
    // footer, but the routes were never created. The helpers directory and the
    // public helper profile already live under `/assistance`, so consolidate
    // there instead of duplicating two more route trees.
    return [
      { source: "/helpers", destination: "/assistance", permanent: true },
      {
        source: "/helpers/:id",
        destination: "/assistance/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
