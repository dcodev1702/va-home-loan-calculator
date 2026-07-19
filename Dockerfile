# --- Build stage: install deps + compile the app ---
# Base image pinned by digest for reproducible, tamper-resistant builds (node:26-bookworm-slim).
FROM node:26-bookworm-slim@sha256:2d49d876e96237d76de412761cf05dbfe5aee325cc4406a4d41d5824c5bb8beb AS build
# better-sqlite3 is a native module; it needs a C/C++ toolchain to compile.
# The toolchain lives ONLY in this stage — it never reaches the runtime image.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Produces .next/standalone (self-contained server + traced node_modules) and
# .next/static. `output: 'standalone'` in next.config.ts drives this.
RUN npm run build

# --- Runtime stage: minimal image that just runs the traced standalone server ---
FROM node:26-bookworm-slim@sha256:2d49d876e96237d76de412761cf05dbfe5aee325cc4406a4d41d5824c5bb8beb AS runtime
# Apply outstanding OS security patches on top of the pinned base, then remove
# perl (flagged Essential by Debian but unused by the Node standalone runtime —
# nothing installed depends on it) to eliminate the perl CVE surface, and strip
# apt metadata so the layer stays small and no package manager cache ships.
RUN apt-get update && apt-get upgrade -y \
    && dpkg --purge --force-remove-essential perl-base \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app
# Copy only what `next start` (standalone) needs: the self-contained server,
# the static assets, and public/. This omits the full node_modules and source.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
RUN mkdir -p /app/data && chown -R node:node /app/data
# Saved scenarios live here; mount a volume to persist them across restarts.
VOLUME ["/app/data"]
EXPOSE 3000
USER node
# Standalone emits server.js at the app root; run it directly (no npm needed).
CMD ["node", "server.js"]
