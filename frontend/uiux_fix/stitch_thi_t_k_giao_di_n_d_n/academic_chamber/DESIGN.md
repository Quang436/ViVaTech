---
name: Academic Chamber
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#0047bf'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e5fe7'
  on-tertiary-container: '#e6e9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an academic SaaS aesthetic focused on structural clarity, intellectual composure, and sustained concentration. Built for scholarly research, competitive academic arenas, and high-density knowledge synthesis, the interface eliminates decorative telemetry noise and unnecessary visual artifacts in favor of purposeful typography and disciplined whitespace.

The aesthetic fuses modern minimalism with authoritative editorial restraint. It evokes the quiet focus of an archival research reading room translated into a high-performance digital environment:
- **Clarity over ornament:** Layouts maintain generous margins and breathable element grouping, allowing complex research data and competitive statistics to remain immediately legible.
- **Intellectual poise:** Surfaces are crisp, light, and architectural, relying on precise hairline divisions and subtle depth rather than heavy ornamentation.
- **Ergonomic precision:** Visual hierarchy directs attention effortlessly to primary research materials, peer comparisons, and academic milestones without aggressive alert prompts or loud badge clutter.

## Colors

The palette is tuned specifically for prolonged reading, citation parsing, and analytical engagement in a light-mode posture:

- **Primary Accent (`#0f766e` / Deep Scholar Teal):** Used for primary command triggers, active tab indicators, verified scholarly achievements, and foundational brand focal points. Its deep green-blue undertone brings historical academic gravitas without visual fatigue.
- **Secondary Accent (`#0284c7` / Deep Marine Cyan):** Dedicated to secondary interactive triggers, links, live session states, and active data filter pill selections.
- **Tertiary Accent (`#2563eb` / Academic Cobalt):** Reserved for system notices, comparative graph highlights, and computational status signals.
- **Neutral Core (`#0f172a` / Deep Slate):** Anchors headlines, primary text nodes, and heavy structural data points. Subordinate steps use `#1e293b` for section labels, `#334155` for body narratives, and `#64748b` for subtle metadata, timestamps, and citation footers.
- **Surfaces & Borders:** 
  - Canvas Root: `#f8fafc` (Slate 50)
  - Secondary Underlays: `#f1f5f9` (Slate 100)
  - Card & Container Tier: `#ffffff`
  - Structural Structural Borders: `#e2e8f0` (Slate 200)

## Typography

The typographic pairing reflects the bridge between classic scholarly publishing and modern software:

- **Editorial Headings (`Newsreader`):** Infuses titles, section benchmarks, and thesis abstracts with literary authority. The refined serif proportions temper the software's functional nature with institutional prestige.
- **Reading & Narrative (`Manrope`):** Delivers clean geometry and balanced open apertures for comfortable reading of dense research summaries, peer-reviewed annotations, and table content without eyestrain.
- **Labels, Metrics & Meta (`Hanken Grotesk`):** Provides a crisp, technical secondary voice for data columns, metric chips, filter menus, and action labels.

Editorial headings (`display-lg`, `headline-lg`) should always feature subtle optical kerning and use punctuation hanging where supported. Never uppercase the serif display tiers.

## Layout & Spacing

The layout is structured around an airy 12-column responsive fluid grid designed to keep academic dashboards and arena workspaces organized and uncluttered:

- **Desktop (1280px+):** 12-column fluid grid, `margin` of `2.5rem`, `gutter` of `1.5rem`. Reading panes are capped at a maximum width of `760px` to maintain optimal line-length discipline (65–75 characters per line).
- **Tablet (768px – 1279px):** 8-column layout with `gutter` of `1.5rem` and `margin` of `2rem`. Dual sidebar setups collapse into an overlay drawer or clean horizontal tab strip.
- **Mobile (< 768px):** 4-column layout with `margin-mobile` of `1.25rem` and `gutter-mobile` of `1rem`. Secondary panels and leaderboard sidebars collapse sequentially below the primary workspace.

Layout rhythm relies on consistent multiples of 8px (bridged with 4px intervals for small metadata gaps). High density must be achieved through typographic scale and crisp borders rather than cramming UI elements together.

## Elevation & Depth

Depth is established primarily through structural borders and subtle, cool-toned ambient shadows. Surfaces do not rely on aggressive z-plane elevations; the hierarchy remains clean and grounded.

- **Hairline Outlines:** All containers, cards, and modal components utilize a unified `1px` border of `#e2e8f0`. In states of active hover or focus, borders shift intentionally to `#cbd5e1` or the teal accent `#0f766e`.
- **Base Level (Canvas):** Tone `#f8fafc`. Completely non-elevated.
- **Sub-tier / Wells:** Tone `#f1f5f9` with an inset hairline border. Used for filter groups, code blocks, or citation boxes.
- **Layer 1 (Cards & Data Panels):** Background `#ffffff`, border `1px solid #e2e8f0`, accompanied by a subtle ambient shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Layer 2 (Overlays, Dropdowns, Popovers):** Background `#ffffff`, border `1px solid #e2e8f0`, with medium diffuse elevation: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Layer 3 (Modals & Academic Review Viewers):** Backdrop filter `rgba(15, 23, 42, 0.25)` paired with `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system maintains a refined, architectural geometry with disciplined corner radiuses (`roundedness: 1`):

- **Default Elements (Buttons, Inputs, Metric Badges):** `0.25rem` (4px). Provides clean, tailored corners that reflect scholarly seriousness without feeling razor-sharp or brutalist.
- **Containers & Cards (`rounded-lg`):** `0.5rem` (8px). Softens larger surface perimeters while maintaining a structured frame around dense content blocks.
- **Modals & Dialogs (`rounded-xl`):** `0.75rem` (12px). Delivers a calm framing for focused, high-priority tasks and modal viewports.
- **Avatars & Pure Status Pills:** Explicit full circles (`9999px`) are reserved solely for user presence avatars and single-value status indicators.

## Components

### Buttons
- **Primary:** Background `#0f766e`, text `#ffffff`, border `1px solid transparent`. Hover shifts to `#115e59`. Pressed state scales slightly with `transform: scale(0.99)`.
- **Secondary:** Background `#ffffff`, text `#0f172a`, border `1px solid #e2e8f0`. Hover transitions to background `#f8fafc` and border `#cbd5e1`.
- **Ghost:** Background transparent, text `#334155`. Hover transitions to background `#f1f5f9` and text `#0f172a`.
- **Sizing:** Compact padding (`0.5rem 0.875rem` for standard action items) with labels set in `label-lg` or `label-md`.

### Input Fields & Controls
- **Text Inputs:** Background `#ffffff`, border `1px solid #e2e8f0`, text `#0f172a`, placeholder text `#94a3b8`. Height fixed at `40px` with `0.75rem` horizontal padding. Focus ring applies a clean `0 0 0 2px rgba(15, 118, 110, 0.15)` and border `#0f766e`.
- **Checkboxes & Radios:** `16px` dimensional frame, border `1.5px solid #cbd5e1`. Checked state fills `#0f766e` with crisp white checkmark or inner dot.

### Cards & Panels
- **Structure:** Background `#ffffff`, border `1px solid #e2e8f0`, soft ambient shadow (`Layer 1`). Internal padding scales from `space-md` (mobile) to `space-lg` (desktop).
- **Header Separators:** When titles use `Newsreader`, card headers employ a gentle hairline divider (`1px solid #f1f5f9`) to cleanly segment heading context from body data.

### Chips & Status Indicators
- **Minimal Metadata Chips:** Flat background `#f1f5f9`, border `1px solid #e2e8f0`, text `#334155`, font `label-sm`.
- **Arena Rank & State Chips:** Avoid harsh, bright fills. Use muted soft-tints (e.g., `#0f766e` at 10% opacity with `#0f766e` text and border `rgba(15, 118, 110, 0.2)`).

### Lists & Academic Tables
- **Table Rows:** Zebra striping is avoided. Rows use a clean bottom hairline `1px solid #f1f5f9`, hovering smoothly to `#f8fafc`.
- **Headers:** Rendered in `label-md`, uppercase, tracking `0.05em`, color `#64748b`, top and bottom bordered with `#e2e8f0`.

### Arena Performance Modules (Domain Component)
- **Scorecards & Metric Bars:** Progress indicators use narrow, crisp `4px` or `6px` tracks in `#e2e8f0`, filled with `#0f766e` or `#0284c7`. Telemetry numbers pair a `Newsreader` metric value with a `Hanken Grotesk` uppercase unit indicator.