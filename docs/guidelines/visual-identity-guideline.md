# Visual Identity Guideline — RO LATAM Calculator

> Adapted from the Instanceiro visual identity spec (`d:/rag/instance-tracker/docs/superpowers/specs/2026-03-23-visual-identity-design.md`).
> Goal: apply the same design language across all RO LATAM community tools.

## Design Direction

**Minimalist/functional with personality.** No heavy RPG theming. Clean, distinctive, and functional.

## Color System

### Design Tokens (semantic, theme-agnostic)

| Token | Role | Dark Mode | Light Mode |
|-------|------|-----------|------------|
| `--bg` | Page background | `#0a0a0f` Obsidian | `#f8f7f5` Cream |
| `--surface` | Cards, panels | `#141420` Onyx | `#ffffff` White |
| `--border` | Dividers, card borders | `#1e1e2e` Charcoal | `#e5e2dc` Sand |
| `--primary` | Accent, CTA | `#C87941` Copper | `#a0612e` Copper-dark |
| `--primary-secondary` | Secondary accent | `#E8A665` Amber | `#c4863e` Amber-dark |
| `--text-primary` | Headings, body text | `#e8e8f0` Snow | `#1a1a1a` Ink |
| `--text-secondary` | Metadata, labels | `#7a7a8e` Slate | `#706b65` Stone |
| `--status-available` | Positive/success | `#4a9a5a` Jade | `#2e8a3e` Jade-dark |
| `--status-available-text` | Badge text (positive) | `#6abf7a` | `#1e6a2e` |
| `--status-soon` | Warning | `#d4a843` Gold | `#b8922e` Gold-dark |
| `--status-soon-text` | Badge text (warning) | `#f0c060` | `#8a6e1a` |
| `--status-error` | Error, danger | `#c44040` Ember | `#b83030` Ember-dark |
| `--status-error-text` | Badge text (error) | `#f07070` | `#8a2020` |

### Hover/Focus

| Element | Dark Hover | Light Hover |
|---------|-----------|-------------|
| Primary button bg | `#b56a35` | `#8a5020` |
| Card background | `#181830` | shadow deepens |
| Card border | `#3a3a4a` | shadow `0 3px 10px #0000000f` |
| Focus ring | `2px solid #E8A665` offset 2px | `2px solid #c4863e` offset 2px |
| Disabled button bg | `#3a3a4a` | `#e5e2dc` |
| Disabled button text | `#5a5a6e` | `#b5b0a8` |

### Light Mode Principles

- **Warm, not cold** — off-white background (`#f8f7f5`), warm gray borders. No blue-gray.
- **Copper darkened** — `#a0612e` for WCAG AA contrast on light backgrounds.
- **Shadows replace borders** — `box-shadow: 0 1px 3px #0000000a` for depth.
- **Status colors darken slightly** for readability on white.

## Typography

### Font: Outfit (Google Fonts)

Geometric sans-serif with soft corners. Modern without being cold.

| Level | Weight | Size | Letter-spacing | Usage |
|-------|--------|------|---------------|-------|
| H1 | 700 | 32px | -1px | Page titles |
| H2 | 600 | 22px | 0 | Section headings |
| Body | 400 | 14px | 0 | Descriptions, metadata |
| Nav | 500 | 13px | 0 | Navigation links |
| Label | 600 | 11px | 1.5px (uppercase) | Status labels, badges |
| Button | 600 | 13px | 0 | CTA and action buttons |

## Iconography

### Style: Duotone

Outlined icons (1.5px stroke) with translucent fill in the primary color.

| Theme | Fill Opacity | Stroke Color |
|-------|-------------|--------------|
| Dark | 15% | `#C87941` |
| Light | 10% | `#a0612e` |

## Component Patterns

### Cards / Panels

- Background: `--surface`
- Border: 1px solid `--border`
- Hover: background shifts (dark) or shadow deepens (light)
- Light mode adds `box-shadow: 0 1px 3px #0000000a`

### Buttons

- **Primary:** `--primary` bg, inverted text, `--radius-md` radius
- **Secondary/Ghost:** transparent bg, `--border` border, `--text-primary` text
- **Disabled:** muted bg and text
- All buttons: Outfit 600, 13px, 8px 20px padding

## Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small tags |
| `--radius-md` | 8px | Cards, buttons, inputs |
| `--radius-lg` | 12px | Panels, modals, large containers |

## Implementation Notes

- Use CSS custom properties for all color tokens
- Theme switching via class on `<html>` or `<body>`
- Default to dark mode, respect `prefers-color-scheme`
- Light mode `--text-secondary` passes WCAG AA at ~4.6:1 on `#f8f7f5`

## Applicability to RO LATAM Calculator

The calculator currently uses PrimeNG themes (vela-green). This guideline can be applied progressively:

1. **Immediate (promo banner):** Already using `var(--surface-card)`, `var(--surface-border)`, `var(--border-radius)`, `var(--primary-color)` from PrimeNG — these align with the guideline's token approach.
2. **Future (full rebrand):** Create a custom PrimeNG theme mapping these tokens to PrimeNG CSS variables. The Claudinhos theme attempt (`docs/plans/2026-03-04-claudinhos-theme-design.md`) is a precedent — same approach, different palette.
3. **Font migration:** Outfit can replace the default PrimeNG font via `@import` + CSS override. Low risk.
