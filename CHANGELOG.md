# Changelog

All notable changes to Sentinel VA are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project uses semantic-versioning intent.

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
