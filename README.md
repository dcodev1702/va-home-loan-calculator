# Sentinel VA — Home Loan Calculator

A private, local-first VA home-loan planning workspace built with Next.js, TypeScript, and SQLite.

> **Planning tool only.** Sentinel VA is not a lender, VA eligibility decision, tax opinion, legal advice, or underwriting system. Confirm rates, VA funding-fee rules, residual-income requirements, and qualification details with a qualified lender and official VA resources.

## Highlights

- Calculates VA-style loan payment components: principal and interest, property taxes, insurance, HOA, and financed VA funding fees.
- Supports repeatable household income sources, including monthly, annual, hourly, and tax-free income for a planning-level DTI gross-up.
- Tracks household budget items, lender-visible liabilities, childcare, residual-income context, and front-/back-end DTI.
- Compares a baseline amortization schedule with extra monthly principal and annual lump-sum payoff strategies.
- Shows total interest saved, time saved, payoff horizon, remaining-balance graph, and year-over-year interest savings.
- Saves named calculation scenarios locally through a SQLite-backed API. No authentication is required.

## Screenshots

### Financial overview and affordability mix

![Sentinel VA dashboard overview with payment metrics and affordability pie charts](docs/screenshots/dashboard-overview.png)

### Loan setup and household income

![Sentinel VA loan payment and household income workspace](docs/screenshots/loan-income.png)

### Budget, liabilities, residual income, and DTI

![Sentinel VA monthly budget and residual-income workspace](docs/screenshots/affordability.png)

### Extra-principal payoff strategy

![Sentinel VA payoff workspace with neon scenario actions, balance chart, and annual savings table](docs/screenshots/payoff-analysis.png)

## Tech stack

- Next.js App Router
- React + TypeScript
- SQLite via `better-sqlite3`
- SVG balance-comparison visualization
- Vitest calculation tests

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Run as a portable app

To hand this to someone else to run on their own machine — from source or via Docker — see [RUNNING.md](RUNNING.md). One-command source launch:

```bash
./run.sh
```

## Run from Docker Hub

A prebuilt image is published at [`digitalkali/sentinel-va`](https://hub.docker.com/r/digitalkali/sentinel-va). No cloning or Node.js required — just Docker:

```bash
mkdir -p data && docker run -d --user 1000:1000 --security-opt no-new-privileges:true --cap-drop ALL -p 3000:3000 -v "$(pwd)/data:/app/data" digitalkali/sentinel-va:latest
```

Open http://localhost:3000. The `-v` mount persists saved scenarios in `./data/` on the host between runs, while `--user`, `--security-opt`, and `--cap-drop` keep the app running with the same non-root hardening used by the compose file. Use `:latest` to always pull the newest build (the app and image are updated frequently).

## Share temporarily with Cloudflare Tunnel

For a short-lived public demo, run Sentinel VA locally or from Docker and confirm http://localhost:3000 opens on the host. Then start a quick Cloudflare Tunnel in a second terminal:

```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflare prints a temporary `https://...trycloudflare.com` URL that can be sent to someone else. The link stays available while the app/container, the host machine, and the `cloudflared` command are all still running. Stop sharing by pressing `Ctrl+C` in the tunnel terminal.

Treat the generated URL as public: anyone with the link can reach the app unless you add authentication in front of it. Avoid sharing personal saved scenarios or sensitive financial data through a temporary tunnel.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

## Local data

Saved scenarios are stored in `data/sentinel-va.db` on the machine running the app. The `data/` directory is intentionally ignored by Git so personal financial scenarios are not committed.

## Project documents

- `PRODUCT_SPEC.md` — feature and engineering specification.
- `DESIGN.md` — visual-system tokens and UX rules.

## Operational resources

- [Cloudflare Tunnel quick tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) - install `cloudflared` and create temporary `trycloudflare.com` URLs for local apps.

## Learning resources

Use these independent resources to understand VA loans, mortgage costs, and home-buying decisions:

- [VA home loan programs](https://www.va.gov/housing-assistance/home-loans/)
- [VA funding fees and closing costs](https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/)
- [VA loan limits](https://www.va.gov/housing-assistance/home-loans/loan-limits/)
- [Consumer Financial Protection Bureau: Owning a Home](https://www.consumerfinance.gov/owning-a-home/)
- [CFPB mortgage calculator](https://www.consumerfinance.gov/owning-a-home/explore-rates/)
- [Fannie Mae HomeView® homeownership course](https://www.fanniemae.com/education)
