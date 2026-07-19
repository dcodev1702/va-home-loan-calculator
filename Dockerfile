# --- Build stage: install deps + compile the app ---
# Base image pinned by digest for reproducible, tamper-resistant builds (node:22-bookworm-slim).
FROM node:22-bookworm-slim@sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3 AS build
# better-sqlite3 is a native module; it needs a C/C++ toolchain to compile.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Drop devDependencies from node_modules so the runtime stage carries only what
# `next start` needs (keeps the compiled better-sqlite3 native module intact).
RUN npm prune --omit=dev

# --- Runtime stage: slim image that just runs the built app ---
FROM node:22-bookworm-slim@sha256:6c74791e557ce11fc957704f6d4fe134a7bc8d6f5ca4403205b2966bd488f6b3 AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Bring over the whole built app (node_modules includes the compiled better-sqlite3).
COPY --from=build /app ./
RUN mkdir -p /app/data && chown -R node:node /app/data
# Saved scenarios live here; mount a volume to persist them across restarts.
VOLUME ["/app/data"]
EXPOSE 3000
USER node
CMD ["npm", "run", "start"]
