# --- Build stage: install deps + compile the app ---
# Base image pinned by digest for reproducible, tamper-resistant builds (node:22-bookworm-slim).
FROM node:22-bookworm-slim@sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3 AS build
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
FROM node:22-bookworm-slim@sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3 AS runtime
# Apply outstanding OS security patches on top of the pinned base, then strip
# apt metadata so the layer stays small and no package manager cache ships.
RUN apt-get update && apt-get upgrade -y \
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
