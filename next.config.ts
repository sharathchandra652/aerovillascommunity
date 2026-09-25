import type { NextConfig } from "next";

// `npm run build:offline` sets OFFLINE=1 to export the whole site as static
// files in out/, which the offline launcher (offline/) serves locally.
const nextConfig: NextConfig = {
  ...(process.env.OFFLINE ? { output: "export" as const } : {}),
};

export default nextConfig;
