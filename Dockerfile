# --- Build stage: install deps + compile the app ---
FROM node:22-bookworm-slim AS build
# better-sqlite3 is a native module; it needs a C/C++ toolchain to compile.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage: slim image that just runs the built app ---
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Bring over the whole built app (node_modules includes the compiled better-sqlite3).
COPY --from=build /app ./
# Saved scenarios live here; mount a volume to persist them across restarts.
VOLUME ["/app/data"]
EXPOSE 3000
CMD ["npm", "run", "start"]
