# Changelog

All notable changes to Sentinel VA are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses semantic-versioning intent.

## [0.6.2] - 2026-07-19

### Security
- Removed the bundled `npm`/`npx` from the runtime image as part of the standard container-hardening purge. The standalone server runs as `node server.js` and needs no package manager at runtime; removing npm also removes its vendored `undici`, clearing the undici advisories (CVE-2026-48959, CVE-2026-48962, CVE-2026-12151) that were only reachable through npm's own dependencies. Perl removal (0.6.1) and OS security patching remain part of the same hardening step. Verified via image build, Node 26 boot, HTTP + database write/read/delete + storage round-trip, and a vulnerability rescan confirming the undici and perl findings are gone.

## [0.6.1] - 2026-07-19

### Security
- Removed `perl-base` from the runtime image to eliminate the perl CVE surface. Perl is flagged Essential by Debian but is unused by the Node standalone runtime (nothing installed depends on it), so it is purged after the OS security patch step. Verified the image still builds, boots on Node 26, and passes the HTTP + database write/read/delete + storage-status round-trip with perl absent. (The remaining `libpcre2-8-0` is the unrelated PCRE regex library, not perl.)

## [0.6.0] - 2026-07-19

### Changed
- Upgraded the Docker base image from `node:22-bookworm-slim` to `node:26-bookworm-slim` (digest-pinned in both build and runtime stages), per the Dependabot base-image update. The `better-sqlite3` native module recompiles cleanly against the Node 26 ABI and the standalone server runs on Node 26; validated with a full image build plus HTTP, database write/read/delete, and storage-status round-trip.

## [0.5.9] - 2026-07-19

### Added
- Added `ARCHITECTURE.md`, a comprehensive architecture and design reference covering the system topology, calculation engine, persistence and storage-cap design, API surface, UI component model, design system, build/runtime/deployment, operational procedures, and the security model.

### Changed
- Renamed the sweet-spot comparison table's fifth column header from "Total interest" to "Total interest paid" for clarity.

## [0.5.8] - 2026-07-19

### Added
- Enforced a 1 GB cap on the local SQLite data volume (`/app/data`): scenario saves are refused once the on-disk footprint reaches the limit (HTTP 507), preventing the mounted volume from growing unbounded. The limit is overridable via the `STORAGE_LIMIT_BYTES` environment variable.
- Added a red banner with yellow text that appears when the database is full, informing the user the 1 GB limit has been reached and to delete saved scenarios to free space. The `/api/scenarios` endpoint now reports storage status so the banner surfaces on load and after a rejected save.

## [0.5.7] - 2026-07-19

### Changed
- Sweet-spot comparison chart lines now carry the same neon drop-shadow glow as the payoff chart above, with each tier glowing in its own hue (driven by `currentColor`) so the value-based palette stays intact.

## [0.5.6] - 2026-07-19

### Added
- Sweet-spot comparison table now includes a "Total / mo" column showing the full monthly out-of-pocket (total housing payment plus the tier's extra principal) for each acceleration tier.
- Added a +$1,500/mo acceleration tier to the sweet-spot comparison (baseline / +$1,000 / +$1,500 / +$2,000 / +$2,500 / your current plan).

### Changed
- Sweet-spot tier colors are now value-based (each extra-payment amount owns a fixed hue) instead of position-based, so the palette stays stable as tiers or the current plan change: +$1,500 is pink and +$2,500 is neon green, with baseline amber, +$1,000 cyan, and +$2,000 purple retained.

## [0.5.5] - 2026-07-19

### Changed
- Switched the Next.js build to standalone output (`output: 'standalone'`) and slimmed the Docker runtime stage to copy only the traced server bundle, `.next/static`, and `public/` — cutting the image from ~995MB to ~404MB. The `better-sqlite3` native binary is explicitly traced via `outputFileTracingIncludes` and the container now starts with `node server.js` instead of `npm start`.
- Runtime image now applies outstanding OS security patches (`apt-get upgrade`) on top of the digest-pinned base, while the C/C++ build toolchain remains confined to the build stage only.

## [0.5.4] - 2026-07-19

### Added
- Added a Dependabot configuration (`.github/dependabot.yml`) that watches the digest-pinned `node:22-bookworm-slim` base image and opens a PR when the upstream tag resolves to a new digest, so base-image updates are reviewed and CI-gated rather than pulled blindly.

### Changed
- Pinned the Docker base image (`node:22-bookworm-slim`) by digest in both build and runtime stages for reproducible, tamper-resistant builds.
- Pruned devDependencies from the runtime image via `npm prune --omit=dev` after the build, shrinking the shipped image while keeping the compiled `better-sqlite3` native module intact.

## [0.5.3] - 2026-07-19

### Added
- Documented how to share a local or Docker-hosted Sentinel VA instance temporarily with Cloudflare Tunnel, including the quick tunnel command, public-link caveats, and the official Cloudflare quick tunnel resource.

## [0.5.2] - 2026-07-19

### Security
- Hardened Docker runtime defaults so rebuilt images and Compose launches run the app as the non-root `node` user, drop all Linux capabilities, and enable `no-new-privileges`, while keeping the persisted `/app/data` volume writable.
- Updated the Docker Hub run instructions to include the same non-root and capability-dropping flags used by the Compose setup.

## [0.5.1] - 2026-07-19

### Changed
- Sweet-spot comparison chart now uses the same linear calendar-year axis as the payoff chart above it, so payoff timing is readable in years directly on the graph.
- Trimmed the comparison tiers to the meaningful set: baseline, +$1,000, +$2,000, and +$2,500 (removed the +$250 and +$500 rungs), plus your current plan.

## [0.5.0] - 2026-07-19

### Added
- Sweet-spot comparison in the Acceleration Lab: a collapsible panel that overlays the same loan across several extra-monthly-principal tiers (baseline, +$250, +$500, +$1,000, +$2,000, and your current plan) as distinct-colored balance lines, plus a table of payoff time, time saved, total interest, and interest saved per tier — with your current plan highlighted. Backed by a new `payoffLadder` calculation helper and unit tests.

## [0.4.0] - 2026-07-19

### Added
- Portable run options so anyone can run Sentinel VA locally: a `run.sh` one-command source launcher (Node 20+, no Docker), a multi-stage `Dockerfile` + `docker-compose.yml` that compile the native SQLite module in-image and persist scenarios via a `data/` volume, and a `RUNNING.md` guide covering both paths.
- Published a prebuilt image to Docker Hub ([`digitalkali/sentinel-va`](https://hub.docker.com/r/digitalkali/sentinel-va)) and documented the pull-and-run one-liner in the README and RUNNING guide.

## [0.3.6] - 2026-07-19

### Changed
- Refactored the monolithic `LoanCalculator` into focused modules: shared `formatting` helpers and `types`, plus dedicated `NumberField`, `Metric`, `PieChart`, and `BalanceChart` components under `components/`, leaving `LoanCalculator.tsx` as a slim state-and-layout orchestrator. No behavior change.

## [0.3.5] - 2026-07-19

### Changed
- Brightened and thickened the payoff comparison chart lines (rounded caps/joins, a subtle glow, and matching legend dots) for sharper baseline-vs-accelerated readability.
- Refreshed all four README screenshots to match the current UI.

### Added
- Exhaustive unit coverage for the VA funding-fee rate chart (first vs. subsequent use across every down-payment tier, boundary values, and the financed-fee path), documented against the official VA table effective 2023-04-07.

## [0.3.4] - 2026-07-18

### Added
- Hovering a donut slice (or its legend row) now spotlights that segment and shows its percentage and label in the chart center.

## [0.3.3] - 2026-07-18

### Changed
- Refined the affordability charts into glossy donut charts with a center total, soft depth, hover emphasis, and a cleaner glowing legend (same color scheme).

## [0.3.2] - 2026-07-18

### Changed
- Applied the same glossy, semi-transparent treatment to the top "Save scenario" pill for a consistent look.

## [0.3.1] - 2026-07-18

### Changed
- Made the Load, Rename, and Delete scenario pills glossy and semi-transparent with translucent tinted gradients and inset highlights.

## [0.3.0] - 2026-07-18

### Changed
- Restyled Save, Load, Rename, and Delete controls as glossy neon pills with blue, yellow, and red action colors.
- Published the GitHub repository as a public project.

## [0.2.9] - 2026-07-18

### Fixed
- Deferred restoration of browser-local calculator data until after hydration to eliminate React hydration warnings while preserving saved inputs.

## [0.2.8] - 2026-07-18

### Changed
- Restyled scenario actions as smooth neon pills: Load/Save blue, Rename yellow, and Delete red.
- Replaced README imagery with four complete, section-focused screenshots and added VA-loan and homeownership learning resources.

## [0.2.7] - 2026-07-18

### Changed
- Moved the compact saved-scenario selector above the payoff graph and constrained its width for better payoff-workflow context.

## [0.2.6] - 2026-07-18

### Changed
- Reworked saved-scenario management into a compact selector with contextual Load, Rename, and Delete actions.

## [0.2.5] - 2026-07-18

### Added
- Rename and delete controls for saved local scenarios, backed by SQLite PATCH and DELETE operations.

## [0.2.4] - 2026-07-18

### Changed
- Added flexible DTI status thresholds: green through 41.0%, yellow from 41.1% through 46.0%, and red from 46.1% onward.

## [0.2.3] - 2026-07-18

### Changed
- Simplified the payoff-chart time axis from quarterly to semiannual ticks: year start, six-month mark, then the following year start.

## [0.2.2] - 2026-07-18

### Fixed
- Made the one-year-label-per-four-quarter-ticks invariant explicit in the payoff timeline data and regression tests.

## [0.2.1] - 2026-07-18

### Fixed
- Simplified the payoff-chart axis to one quarter tick per quarter, with the calendar year shown only below each year's first tick.

## [0.2.0] - 2026-07-18

### Added
- A complete U.S. state selector plus the District of Columbia, with VA-style regional residual-income mapping.
- Two live affordability pie charts with visible percentages and hoverable per-slice dollar/percentage details.
- Quarter-based payoff timeline data beginning in 2026, including Q1–Q4 labels.
- A custom scenario-name field for meaningful SQLite-backed saved scenarios.
- Screenshot-backed README documentation for the main planning, affordability, and payoff-analysis views.
- Local input persistence so calculator values survive refreshes.

### Changed
- Recolored the payoff comparison chart: yellow for the baseline balance and green for the extra-principal balance.
- Configured local Next.js development origins for localhost, 127.0.0.1, and the local network address.

### Fixed
- Prevented calculator inputs from reverting to initial defaults after refreshes.

## [0.1.0] - 2026-07-18

### Added
- Initial private local-first VA home-loan planning application.
- Loan payment, VA funding-fee, household-income, budget, liability, childcare, residual-income, and DTI planning calculations.
- Baseline versus extra-principal amortization comparison with total and year-over-year interest-savings analysis.
- SQLite-backed saved scenarios without authentication.
- Dark Microsoft-blue/cyan financial dashboard, product specification, and design-system specification.
- Unit tests for loan calculation behavior.
