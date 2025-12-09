import type { NextConfig } from "next";
import { siteConfig } from "@/lib/site";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/gh",
        destination: siteConfig.links.github,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
