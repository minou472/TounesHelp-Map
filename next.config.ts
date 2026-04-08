import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Run on port 3001 to avoid conflict with any other Next.js app
  // Start with: npm run dev -- -p 3001
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.FRONTEND_URL || "http://localhost:5173",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
