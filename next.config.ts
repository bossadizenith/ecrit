import type { NextConfig } from "next";

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
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
