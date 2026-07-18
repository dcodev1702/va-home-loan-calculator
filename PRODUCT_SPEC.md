# Sentinel VA — Product & Engineering Specification

## Goal
Build a private, no-auth VA home-loan decision workspace that combines loan-payment estimation, household budget, VA residual-income screening, debt-to-income context, and an accelerated-payoff analysis. Results are educational estimates only, never lending, tax, legal, or eligibility determinations.

## Source-design synthesis
The supplied references establish a dense calculation workspace: a summary strip first, then numbered calculation panels. The reference includes loan and full-payment inputs; repeatable household income and budget rows; childcare; state/household-size residual context; DTI; and summary charts. The redesigned product preserves this information architecture while replacing the light spreadsheet aesthetic with an original dark, high-contrast Microsoft-accented interface.

## Primary users and decisions
- A prospective VA borrower deciding whether a payment fits both their budget and VA-style residual-income lens.
- A homeowner deciding how recurring or one-time extra principal changes payoff date and interest cost.
- The primary decisions are: monthly affordability, residual-income gap/surplus, debt burden, and accelerated-payoff tradeoffs.

## Surface and UX direction
This is a **Monitor** surface with a secondary **Configure** surface: glanceable financial status comes first, with a deliberate input workspace below. It must not use a marketing hero or equal-weight feature cards.

Visual direction: near-black, slate, and deep navy surfaces; Microsoft blue as the primary interactive accent; cyan and green reserved for informative/positive data; amber/red reserved for cautions/negative status. Typography uses IBM Plex Sans for a measured, technical financial-console character and IBM Plex Mono for financial figures. A subtle electric-blue radial glow, thin cyan graph lines, and restrained transition motion make the interface neon/smooth without visual noise. Controls remain high contrast and retain visible keyboard focus.

## Functional scope
### Loan & payment
- Purchase price, down payment, interest rate, term (15/20/30 years), annual property tax, annual home insurance, monthly HOA, square footage.
- VA funding-fee configuration: exemption and first/subsequent use. Funding fee is financed into the loan and changes the P&I payment.
- Calculate base loan, funding fee, total financed loan, P&I, escrow/HOA, and total monthly payment.

### Household income
- Repeatable income sources: label, type (monthly salary, annual salary, hourly), amount, hours/week for hourly, tax-free flag.
- Estimate net income using a deliberately simplified effective federal/FICA and state tax assumption. Tax-free sources are not reduced for this estimate; tax-free income receives a 25% qualifying-income gross-up for DTI only.

### Budget, childcare, residual and DTI
- Repeatable monthly budget rows with a credit-report checkbox.
- Childcare expenses, state, and household size inputs.
- VA-style utilities/maintenance estimate of $0.14 per square foot/month, configurable only in code for now.
- Regional residual-income threshold lookup is presented as a simplified planning heuristic; it is not an official underwriting decision.
- Front-end and back-end DTI using qualifying gross income.

### Extra principal / payoff strategy
- Extra monthly principal and optional annual lump-sum principal inputs.
- Baseline and accelerated amortization schedules.
- Total interest saved, time saved, payoff dates/months, and annual interest savings (baseline interest minus accelerated interest).
- A comparison graph for remaining loan balance and cumulative interest paid over time, plus an annual savings table.

### Persistence
- SQLite stores named scenarios as complete JSON input snapshots and calculated result snapshots. A scenario can be saved via a server route and restored by selecting it.
- No authentication or multi-user access is included.

## Architecture
- Next.js App Router + TypeScript.
- Client-side calculator and interactive visualizations in `components/LoanCalculator.tsx`; pure financial logic in `lib/calculations.ts` for predictable tests.
- SQLite using `better-sqlite3`, initialized through a small repository module. Route handler at `/api/scenarios` supports `GET` and `POST`.
- CSS modules/global CSS and `DESIGN.md` are the source of visual tokens. No charting library: SVG paths avoid unnecessary dependencies and keep the graph readable.

## Calculation notes / limitations
- Dollars are calculated internally in cents for schedule precision; presentation rounds to whole dollars/cents. Extra payments are applied after each scheduled payment; annual lump sums are applied in month 12, 24, etc.
- Funding-fee rates used: exempt 0%; first use under 5% down 2.15%, first use 5–9.99% 1.5%, first use 10%+ 1.25%; subsequent use under 5% 3.3%, subsequent use 5–9.99% 1.5%, subsequent use 10%+ 1.25%.
- This is a planning model. Users must confirm current funding-fee rules, residual requirements, taxes, rates, and underwriting treatment with a qualified lender or VA resources.

## Acceptance criteria
- Input changes update all summary metrics, schedule outputs, graph, and annual savings table immediately.
- Adding/removing income and budget rows works without calculation errors.
- Extra payment strategies reduce payoff time/interest when positive; zero extras exactly match the baseline schedule.
- Save scenario persists to SQLite, returns a scenario id, and listed scenarios reload after a refresh.
- Unit tests cover payment math, funding-fee selection, baseline-vs-zero-extra equivalence, and positive interest savings.
- `npm test`, `npm run lint`, and `npm run build` pass.
- Browser QA verifies the desktop dashboard and narrow mobile layout, core buttons, save action, and graph rendering.
