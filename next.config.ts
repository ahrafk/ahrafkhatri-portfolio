import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["simple-icons", "lucide-react"],
    // Puts the stylesheet in the HTML instead of a render-blocking <link>: a first-visit LCP win. Trade-offs: every
    // page view re-downloads the CSS (home page measured at about 28 KB more gzipped HTML, 75 KB against 46 KB, and no
    // separate CSS caching), and the flag is experimental (docs: the `inlineCss` page under next.config.js options).
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
