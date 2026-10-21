import type { NextConfig } from "next";

// Every page reads live data at request time, so allergen results are never stale.
const nextConfig: NextConfig = {
  images: {
    // Only our bundled dish photos and uploaded dish photos may be optimised.
    localPatterns: [
      { pathname: "/dishes/**", search: "" },
      { pathname: "/api/dishes/**", search: "" },
    ],
  },
  experimental: {
    // Dish photos are compressed in the browser to well under this.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
