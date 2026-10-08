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
};

export default nextConfig;
