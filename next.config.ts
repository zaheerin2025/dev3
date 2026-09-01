import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Do NOT hide TypeScript errors during builds — catch them early.
  typescript: {
    ignoreBuildErrors: false,
  },
  // Remove "X-Powered-By: Next.js" header — no need to advertise the stack.
  poweredByHeader: false,
  // Security headers — defense-in-depth alongside middleware.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
