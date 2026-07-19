# --- Build stage: install deps + compile the app ---
# Node 24 chosen to match the distroless runtime family (distroless publishes
# nodejs22/nodejs24, not nodejs26); the native-module ABI must match across stages.
# Base image pinned by digest for reproducible, tamper-resistant builds (node:24-bookworm-slim).
FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS build
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
# Prepare the writable data dir here (owned by the distroless nonroot uid 65532)
# because the runtime image has no shell to chown it later.
RUN mkdir -p /app/data && chown -R 65532:65532 /app/data

# --- Runtime stage: distroless Node 24 (no shell, no apt, no npm/perl/tar) ---
# Distroless drops the entire OS package layer — no package manager, no shell, no
# perl/npm/tar — so the CVE surface of those is eliminated by construction rather
# than purged. Pinned by digest; :nonroot runs as uid 65532.
FROM gcr.io/distroless/nodejs24-debian12:nonroot@sha256:14d42e2511532589a7c7e01a753667a74fcc96266e137e8125006b87b0c32d0a AS runtime
# Distroless lags the Node runtime (ships 24.14.0). Overlay the patched Node binary
# from the build base (24.18.0), which clears the Node-runtime CVEs fixed in
# 24.14.1/24.17.0. Its only dynamic deps (libstdc++/libm/libgcc_s/libc) are already
# present in distroless-debian12, so the drop-in is safe.
COPY --from=build /usr/local/bin/node /nodejs/bin/node
ENV NODE_ENV=production
WORKDIR /app
# Copy only what the standalone server needs: the self-contained server bundle,
# the static assets, and public/. Ownership set to the nonroot uid.
COPY --from=build --chown=65532:65532 /app/public ./public
COPY --from=build --chown=65532:65532 /app/.next/standalone ./
COPY --from=build --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=build --chown=65532:65532 /app/data ./data
# Saved scenarios live here; mount a volume to persist them across restarts.
VOLUME ["/app/data"]
EXPOSE 3000
# The distroless nodejs image's ENTRYPOINT is already ["node"], so CMD is just the
# script. Runs as the built-in nonroot user (uid 65532).
CMD ["server.js"]
