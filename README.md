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

## Learning resources

Use these independent resources to understand VA loans, mortgage costs, and home-buying decisions:

- [VA home loan programs](https://www.va.gov/housing-assistance/home-loans/)
- [VA funding fees and closing costs](https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/)
- [VA loan limits](https://www.va.gov/housing-assistance/home-loans/loan-limits/)
- [Consumer Financial Protection Bureau: Owning a Home](https://www.consumerfinance.gov/owning-a-home/)
- [CFPB mortgage calculator](https://www.consumerfinance.gov/owning-a-home/explore-rates/)
- [Fannie Mae HomeView® homeownership course](https://www.fanniemae.com/education)
