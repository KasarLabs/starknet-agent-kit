import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ["pbs.twimg.com", "kasar.io", "github.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*",
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
