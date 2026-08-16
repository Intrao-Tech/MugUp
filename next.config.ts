import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev-tools badge (dev-only; prod never shows it).
  devIndicators: false,
  experimental: {
    serverActions: {
      // The public forms accept a 10 MB attachment; default limit is 1 MB.
      bodySizeLimit: "12mb",
    },
  },
  async redirects() {
    return [
      // Root serves nothing itself: EN is the primary market locale.
      { source: "/", destination: "/en", permanent: true },
      // International qualifications moved under Global Integration (Aug 2026).
      {
        source:
          "/:locale(en|ua)/pathways/british-education/:slug(ielts-preparation|cambridge-english-qualifications|selt-preparation)",
        destination: "/:locale/pathways/global-integration/qualifications/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
