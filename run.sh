#!/usr/bin/env bash
# Portable launcher for Sentinel VA — runs the app from source on any machine
# with Node.js 20+ installed. No Docker required.
#
#   ./run.sh          # install (first run), build, and start on http://localhost:3000
#   PORT=3000 ./run.sh  # explicitly set the port (3000 is the default)
#
# Saved scenarios persist in ./data/sentinel-va.db next to this script.
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js 20+ is required. Install it from https://nodejs.org" >&2
  exit 1
fi

major="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$major" -lt 20 ]; then
  echo "Error: Node.js 20+ required (found $(node -v))." >&2
  exit 1
fi

# Install dependencies on first run (or after they change).
if [ ! -d node_modules ]; then
  echo "Installing dependencies (compiles the native SQLite module)…"
  npm ci || npm install
fi

# Build once; rebuild only when there is no prior production build.
if [ ! -d .next/BUILD_ID ] && [ ! -f .next/BUILD_ID ]; then
  echo "Building the production app…"
  npm run build
fi

echo "Starting Sentinel VA on http://localhost:${PORT:-3000} (Ctrl+C to stop)…"
exec npm run start -- --port "${PORT:-3000}"
