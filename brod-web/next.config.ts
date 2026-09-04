import type { NextConfig } from "next";

const config: NextConfig = {
  // Sadržaj je odvojen od prikaza, pa se sve što se ne mijenja po zahtjevu
  // gradi statički. Entiteti koji dolaze iz CMS-a kasnije prelaze na ISR.
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default config;
