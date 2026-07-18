---
version: alpha
name: Sentinel VA Console
description: Dark, high-clarity financial monitor with Microsoft-blue interactions and restrained neon data accents.
colors:
  canvas: "#080C14"
  surface: "#101827"
  surfaceRaised: "#172235"
  surfaceMuted: "#0C1320"
  border: "#26364D"
  ink: "#F4F8FF"
  muted: "#9BA9BD"
  primary: "#0078D4"
  primaryHover: "#2899F5"
  cyan: "#42D9FF"
  success: "#36D399"
  warning: "#FBBF24"
  danger: "#FB7185"
typography:
  display:
    fontFamily: "IBM Plex Sans"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "IBM Plex Sans"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "IBM Plex Mono"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 8px
  md: 14px
  lg: 20px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primaryHover}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
---

## Overview
Sentinel VA is a monitor-first loan-planning workspace. The user should understand payment, affordability, and accelerated-payoff impact at a glance, then configure the underlying assumptions in clear numbered sections.

## Colors
Use the navy/black scale for depth. Microsoft blue is the only default interaction color. Cyan belongs to live data traces and focus, green to a positive residual/interest outcome, amber to near-threshold attention, and rose to a deficit or failure state. Never use status colors decoratively.

## Typography
IBM Plex Sans handles prose and hierarchy; IBM Plex Mono handles currency, ratios, short technical labels, and table figures. Monetary values should use tabular numerals when supported.

## Layout
Use a 12-column responsive workspace at desktop, reducing to a single column under 860px. Keep an 8px rhythm. Summary cards are dense and concise; configuration cards have generous internal grouping. Inputs and calculated outputs must remain visually distinct.

## Elevation & Depth
Layer surfaces with color and a thin border. Use a faint blue outer glow only on primary interactive or focused elements. Avoid glass blur and excessive shadows.

## Shapes
Panels have 14px corners; interactive controls have 8px corners; badges may be pill-shaped. Avoid oversized rounded rectangles.

## Components
Primary buttons are Microsoft blue. Inputs are deep raised surfaces with an unmistakable blue focus outline. Calculated result rows use a label/value pair and thin separators. Charts draw a cyan accelerated line over a subdued blue baseline, with semantic status colors only in legends/badges.

## Do's and Don'ts
- Do use high contrast, visible focus indicators, clear labels, and motion under 180ms.
- Do show the user how an estimate was produced and label it as non-underwriting guidance.
- Don't present residual income or DTI as an approval decision.
- Don't use gradients as a substitute for visual hierarchy, huge decorative metrics, or generic equal-weight feature grids.
