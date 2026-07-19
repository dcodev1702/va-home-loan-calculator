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
# Runtime hardening / attack-surface reduction. The standalone server runs as
# `node server.js` and needs neither npm nor perl, so we strip both to remove
# their CVE surface (e.g. undici ships only inside npm's own node_modules):
#   1. apply outstanding OS security patches on the pinned base;
#   2. purge perl-base (flagged Essential by Debian but unused — nothing installed
#      depends on it) to clear the perl CVE surface;
#   3. remove the bundled npm/npx (and thus its vendored undici);
#   4. strip apt metadata so no package-manager cache ships.
# NOTE: this is intentional SOP for THIS image — do NOT apt-install packages after
# this step (perl is Essential) and keep the app free of any npm/perl runtime need.
RUN apt-get update && apt-get upgrade -y \
    && dpkg --purge --force-remove-essential perl-base \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
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
