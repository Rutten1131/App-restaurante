import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "/app/menu",
        permanent: true,
      },
      {
        source: "/resena",
        destination: "/fidelizacion",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
