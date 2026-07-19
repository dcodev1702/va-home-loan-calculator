# Running Sentinel VA on your machine

Sentinel VA is a Next.js server app with a local SQLite database (saved scenarios).
It is **not** a static site, and it uses `better-sqlite3` — a native module that is
compiled for the specific operating system and Node.js version it runs on. That means
you can't just copy a folder with `node_modules` between different machines; the deps
must be installed (compiled) on the target machine, or run inside a container.

Pick whichever path fits the person you're handing it to.

---

## Option A — From source (no Docker)

Best for developers or anyone comfortable installing Node.js.

**Requirements:** Node.js 20 or newer (https://nodejs.org).

```bash
# 1. Get the code
git clone https://github.com/dcodev1702/va-home-loan-calculator.git
cd va-home-loan-calculator/sentinel-va   # adjust if your layout differs

# 2. One command to install, build, and start
./run.sh
```

Then open http://localhost:3000. Use `PORT=4000 ./run.sh` to change the port.
Stop with Ctrl+C. Saved scenarios persist in `./data/sentinel-va.db`.

Prefer the raw npm commands? They're all `run.sh` does:

```bash
npm ci        # or: npm install
npm run build
npm run start # add: -- --port 4000  to change the port
```

---

## Option B — Docker (most portable)

Best when the recipient has Docker and you want a turnkey, machine-independent bundle.
Docker compiles the native SQLite module inside the image, so there's nothing to
install on the host but Docker itself.

**Requirements:** Docker (https://docs.docker.com/get-docker/).

### B1 — Pull the prebuilt image from Docker Hub (easiest)

No cloning required. The image is published at
[`digitalkali/sentinel-va`](https://hub.docker.com/r/digitalkali/sentinel-va):

```bash
docker run -p 3000:3000 -v "$(pwd)/data:/app/data" digitalkali/sentinel-va:latest
```

Open http://localhost:3000. Pin a release with `:0.4.0` instead of `:latest`.

### B2 — Build the image yourself from source

```bash
# From the sentinel-va/ directory:
docker compose up --build
```

Open http://localhost:3000. Saved scenarios persist in `./data/` on the host
(mounted as a volume), so they survive `docker compose down` and restarts.

Plain Docker without Compose works too:

```bash
docker build -t sentinel-va .
docker run -p 3000:3000 -v "$(pwd)/data:/app/data" sentinel-va
```

---

## Notes

- **Data location:** all saved scenarios live in `data/sentinel-va.db`. Back up or
  delete that file to reset. It is git-ignored so personal financial data is never
  committed.
- **First launch is slow:** the initial `npm ci` compiles `better-sqlite3` and
  `npm run build` compiles the app. Subsequent starts are fast.
- **No accounts, no cloud:** everything runs locally on the machine that starts it.
