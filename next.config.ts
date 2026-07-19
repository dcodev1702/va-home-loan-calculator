import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.10.84"],
  // Emit a self-contained server bundle (.next/standalone) so the runtime image
  // ships only the traced files instead of the full node_modules tree.
  output: "standalone",
  // better-sqlite3 is a native module; ensure its compiled .node binary and
  // package files are traced into the standalone output (file-tracing can miss
  // native binaries otherwise).
  outputFileTracingIncludes: {
    "/**": ["./node_modules/better-sqlite3/build/Release/*.node"],
  },
};

export default nextConfig;
