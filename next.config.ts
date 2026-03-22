import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  serverExternalPackages: ['z-ai-web-dev-sdk'],
  // Disable Turbopack for cPanel compatibility
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
