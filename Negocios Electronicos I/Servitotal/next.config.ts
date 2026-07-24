import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🟢 Comprime automáticamente todas las respuestas (Gzip/Brotli)
  compress: true,
  
  // 🟢 Optimización de producción
  swcMinify: true,

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;