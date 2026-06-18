import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /** Allow trusted LAN clients to load dev HMR assets (development only). */
  allowedDevOrigins: ["192.168.68.112"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
