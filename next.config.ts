import type { NextConfig } from "next";

// Every page reads live data at request time, so allergen results are never stale.
const nextConfig: NextConfig = {};

export default nextConfig;
