import type { NextConfig } from "next";

// Allow self-signed certs from DDEV in local development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  // standalone only for Docker/Kubernetes — Vercel manages its own output format
  output: process.env.VERCEL ? undefined : "standalone",
  async redirects() {
    return [
      {
        source: "/node/:nid",
        destination: "/articles/:nid",
        permanent: false,
      },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "francisco-guardado-book-1.ddev.site",
        port: "33300",
        pathname: "/sites/default/files/**",
      },
      {
        protocol: "https",
        hostname: "dev-francisco-guardado-book-1.pantheonsite.io",
        pathname: "/sites/default/files/**",
      },
      {
        protocol: "https",
        hostname: "live-francisco-guardado-book-1.pantheonsite.io",
        pathname: "/sites/default/files/**",
      },
      {
        protocol: "https",
        hostname: "assets.science.nasa.gov",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "apod.nasa.gov",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
