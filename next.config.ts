import type { NextConfig } from "next";

// Allow self-signed certs from DDEV in local development
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
