import type { NextConfig } from "next";

// `npm run build:offline` sets OFFLINE=1 to export the whole site as static
// files in out/, which the offline launcher (offline/) serves locally.
const nextConfig: NextConfig = {
  // separate build folder so packaging never disturbs a running `next start`
  ...(process.env.OFFLINE ? { output: "export" as const, distDir: ".next-offline" } : {}),
};

export default nextConfig;
