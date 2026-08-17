---
version: alpha-3
name: WordStreak-cosmos-analysis
description: >
  A modern, atmospheric cosmos interface that merges photographic restraint with
  celestial study depth. Starry night canvas (#060e1a) alternates deep glass tiles,
  framed by Outfit display headlines with tight tracking, Plus Jakarta Sans body
  for high-precision phonetics and vocabulary readability, and a warm amber
  (#F5A623) streak flame accent. Translucent liquid-glass surfaces and subtle
  starlight glows replace heavy chrome so the learning experience can speak.

colors:
  primary: "#F5A623"
  primary-focus: "#FFB940"
  primary-on-dark: "#F5A623"
  primary-muted: "rgba(245, 166, 35, 0.12)"
  accent-emerald: "#30d158"
  ink: "#ffffff"
  body: "#ffffff"
  body-on-dark: "#ffffff"
  body-muted: "#94a3b8"
  muted-foreground-strong: "#cbd5e1"
  ink-muted-80: "#cbd5e1"
  ink-muted-48: "#64748b"
  divider-soft: "rgba(255, 255, 255, 0.08)"
  hairline: "rgba(255, 255, 255, 0.1)"
  canvas: "#060e1a"
  canvas-parchment: "#0b1526"
  surface-pearl: "#0f1d35"
  surface-tile-1: "#0b1526"
  surface-tile-2: "#0f1d35"
  surface-tile-3: "#07101e"
  surface-black: "#030810"
  surface-chip-translucent: "rgba(255, 255, 255, 0.06)"
  glass-bg: "rgba(255, 255, 255, 0.03)"
  glass-border: "rgba(255, 255, 255, 0.08)"
  glass-highlight: "rgba(255, 255, 255, 0.35)"
  on-primary: "#060e1a"
  on-dark: "#ffffff"

typography:
  hero-display:
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 76px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -0.03em
  display-lg:
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: -0.025em
  display-md:
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em
  lead:
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  lead-airy:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  tagline:
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.19
    letterSpacing: 0.01em
  body-strong:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -0.01em
  dense-link:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 2.2
    letterSpacing: 0
  caption:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  caption-strong:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.29
    letterSpacing: 0
  button-large:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.0
  button-utility:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  fine-print:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  micro-legal:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0
  nav-link:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.0
    letterSpacing: 0

rounded:
  none: 0px
  xs: 6px
  sm: 10px
  md: 14px
  lg: 20px
  xl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

effects:
  liquid-glass:
    background: "rgba(255, 255, 255, 0.03)"
    backgroundBlendMode: luminosity
    backdropFilter: "blur(16px) saturate(180%)"
    border: "1px solid rgba(255, 255, 255, 0.08)"
    pseudoBorderGradient: "linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.35) 100%)"
  fade-rise:
    keyframes: "from { opacity: 0; translateY: 24px } to { opacity: 1; translateY: 0 }"
    duration: 0.8s
    easing: "cubic-bezier(0.16, 1, 0.3, 1)"
  continuous-marquee:
    keyframes: "from { translateX(0) } to { translateX(-50%) }"
    duration: 35s
    easing: linear

components:
  button-primary:
    background: "{colors.primary}"
    hoverBackground: "{colors.primary-focus}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-large}"
    rounded: "{rounded.pill}"
    padding: 14px 32px
  button-primary-glass:
    background: "{colors.primary-muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.button-large}"
    rounded: "{rounded.pill}"
    padding: 16px 56px
    effect: "{effects.liquid-glass}"
    hoverScale: 1.03
    activeScale: 0.95
  button-ghost:
    background: transparent
    textColor: "{colors.muted-foreground}"
    typography: "{typography.button-utility}"
    rounded: "{rounded.pill}"
    padding: 14px 28px
    hoverTextColor: "{colors.foreground}"
  navbar:
    background: transparent
    backgroundScrolled: "rgba(6, 14, 26, 0.85)"
    backdropFilter: "blur(20px) saturate(180%)"
    height: auto
    padding: 20px 32px
  feature-card:
    background: "rgba(11, 21, 38, 0.55)"
    border: "1px solid rgba(255, 255, 255, 0.08)"
    rounded: "{rounded.lg}"
    padding: 32px 28px
    hoverBorderColor: "{colors.glass-border-hover}"
    hoverTranslateY: -4px
  footer:
    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
    padding: 64px
    textColor: "{colors.muted-foreground}"
---

## Overview

WordStreak's visual system is a masterclass in **calm, focused night-sky learning framed by translucent liquid glass and starlight accents**. The interface rests on a deep cosmos canvas (`#060e1a`) with living starfields, centered on high-clarity **Outfit** headlines, an active recall tagline, and a signature **Warm Amber** (`#F5A623`) streak flame accent. UI chrome recedes so the vocabulary learning experience takes center stage.

Density is balanced for high study focus. Each section breathes naturally with generous vertical spacing, clean glassmorphic tile cards (`backdrop-blur-2xl`), and smooth, continuous micro-motion (infinite marquee, live GitHub-style activity matrix). Elevation appears through translucent glass layers and glowing amber starlight reflections.

**Key Characteristics:**

- **Cosmos Midnight Canvas (`#060e1a`)**: A calm evening study background that reduces eye strain and evokes the stillness of focused night learning.
- **Warm Amber Accent (`{colors.primary}` — #F5A623)**: The energetic "streak flame" identity that carries active CTA buttons, habit streaks, XP points, and milestone highlights.
- **Learner-Centric Typography Pairing**: **Outfit** for motivating, geometric display headings + **Plus Jakarta Sans** for maximum phonetic IPA, definition, and reading clarity.
- **Translucent Liquid Glass Surfaces**: Cards and auth containers float on frosted glass (`bg-white/[0.03]`, `border-white/10`, `backdrop-blur-2xl`).
- **Continuous Living Motion**: Infinite smooth marquee cards (`35s linear infinite`), live activity heatmaps with progressive day completion, and real-time word mastery tickers.

## Colors

### Brand & Accent

- **Streak Flame Amber** (`{colors.primary}` — #F5A623): The primary interactive color. Used on primary buttons, streak counters, daily targets, and active focus highlights.
- **Radiant Amber Hover** (`{colors.primary-focus}` — #FFB940): A brighter starlight amber for hover states and glowing focus rings.
- **Glass Tint Amber** (`{colors.primary-muted}` — rgba(245, 166, 35, 0.12)): Used for translucent button fills and subtle pill backgrounds.
- **Success Emerald** (`{colors.accent-emerald}` — #30d158): Used for streak freeze active states, mastered vocabulary badges, and completed daily targets.

### Surfaces & Canvas

- **Deep Cosmos Canvas** (`{colors.canvas}` — #060e1a): The master background across landing and auth views.
- **Deep Void** (`{colors.surface-black}` — #030810): Sunken input fields, matrix backgrounds, and deep space contrast layers.
- **Cosmos Tile 1** (`{colors.surface-tile-1}` — #0b1526): The primary tile surface for feature cards and auth containers.
- **Cosmos Tile 2** (`{colors.surface-tile-2}` — #0f1d35): Elevated interactive cards and hover states.
- **Cosmos Tile 3** (`{colors.surface-tile-3}` — #07101e): Darker container wells.
- **Liquid Glass Surface** (`{colors.glass-bg}` — rgba(255, 255, 255, 0.03)): Translucent frosted backdrop fill with `backdrop-filter: blur(16px)`.

### Text & Hairlines

- **Primary Ink** (`{colors.ink}` / `{colors.body}` — #ffffff): High-contrast pure white for headings, word terms, and active input text.
- **Muted Slate** (`{colors.body-muted}` — #94a3b8): Secondary copy, pronunciation guides, and descriptions.
- **Sub-headline Slate** (`{colors.muted-foreground-strong}` — #cbd5e1): Subcopy on hero and CTA sections.
- **Hairline Border** (`{colors.hairline}` — rgba(255, 255, 255, 0.08)): 1px frosted borders on utility cards, inputs, and dividers.

### Brand Atmosphere

Atmospheric depth is supplied by **starry night cosmos layers**: 120+ twinkling stars, soft midnight blue and amber nebulae glows, and subtle shooting stars, creating an immersive study atmosphere.

## Typography

### Font Family

- **Display**: `'Outfit', -apple-system, BlinkMacSystemFont, sans-serif` — Modern geometric display face with friendly rounded curves, high energy, and motivating clarity for headings and streak milestones.
- **Body / Vocabulary**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` — Premium readability face with open counters and distinct letterforms optimized for IPA phonetics, definitions, and interface labels.

### Hierarchy

| Token                         | Size | Weight | Line Height | Letter Spacing | Use                                                                |
| ----------------------------- | ---- | ------ | ----------- | -------------- | ------------------------------------------------------------------ |
| `{typography.hero-display}`   | 76px | 800    | 1.08        | -0.03em        | Hero display headline; high-impact learner motivation              |
| `{typography.display-lg}`     | 52px | 700    | 1.12        | -0.025em       | Section headers ("Engineered for fast, effortless retention")      |
| `{typography.display-md}`     | 36px | 700    | 1.15        | -0.02em        | Modal/card headers, auth titles ("Welcome Back", "Create Account") |
| `{typography.lead}`           | 24px | 600    | 1.20        | 0              | Feature card titles, step headings                                 |
| `{typography.lead-airy}`      | 20px | 400    | 1.50        | 0              | Long-form editorial reading                                        |
| `{typography.tagline}`        | 21px | 700    | 1.19        | 0.01em         | Brand subtitles, category tags                                     |
| `{typography.body-strong}`    | 16px | 600    | 1.30        | -0.01em        | Inline strong emphasis, card labels                                |
| `{typography.body}`           | 16px | 400    | 1.50        | -0.01em        | Default vocabulary definitions, explanations                       |
| `{typography.dense-link}`     | 15px | 400    | 2.20        | 0              | Footer link stacks                                                 |
| `{typography.caption}`        | 14px | 400    | 1.43        | 0              | Secondary helper text, pronunciation subtext                       |
| `{typography.caption-strong}` | 14px | 600    | 1.29        | 0              | Emphasized badge captions, button labels                           |
| `{typography.button-large}`   | 16px | 700    | 1.00        | 0              | Primary CTA buttons                                                |
| `{typography.button-utility}` | 14px | 500    | 1.29        | 0              | Utility buttons, secondary actions                                 |
| `{typography.fine-print}`     | 12px | 400    | 1.33        | 0              | Fine print, time stamps, copyright                                 |
| `{typography.nav-link}`       | 14px | 500    | 1.00        | 0              | Navigation menu items                                              |

### Principles

- **Clarity first for learners**: Headings in Outfit 700/800 give instant motivation; body in Plus Jakarta Sans 400/600 ensures IPA phonetics (`/ˌser.ənˈdɪp.ə.ti/`) are crisp and unmistakable.
- **Warm Amber highlights**: Key punchy words in headings use animated shimmer gradients or amber accents (`#F5A623`).
- **Comfortable leading**: Body text runs at line-height 1.5 for effortless reading pace during study.

## Layout

### Spacing System

- **Base unit:** 8px. Structural spacing snaps to 8/12/16/24/32/48/80px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section vertical padding:** 80–112px on desktop, 48–64px on mobile.

### Grid & Container

- **Max content width:** ~1280px (7xl) on landing page sections; ~1152px (6xl) on Auth containers.
- **Gutter:** 24–32px between cards in grids.

## Elevation & Depth

| Level             | Treatment                                                                                         | Use                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Deep Canvas       | Flat `#060e1a` + StarrySky                                                                        | Base canvas for all views                              |
| Liquid Glass Tile | `rgba(11, 21, 38, 0.75)` + `backdrop-filter: blur(20px)` + 1px border `rgba(255, 255, 255, 0.08)` | Feature cards, Auth form container, Flashcard showcase |
| Starlight Glow    | `box-shadow: 0 0 30px rgba(245, 166, 35, 0.35)`                                                   | Active streak badges, primary buttons, step numbers    |

## Shapes

### Border Radius Scale

| Token            | Value  | Use                                                             |
| ---------------- | ------ | --------------------------------------------------------------- |
| `{rounded.none}` | 0px    | Full-bleed video sections                                       |
| `{rounded.xs}`   | 6px    | Heatmap cells, micro tags                                       |
| `{rounded.sm}`   | 10px   | Small badges, time chips                                        |
| `{rounded.md}`   | 14px   | Input fields, audio control buttons                             |
| `{rounded.lg}`   | 20px   | Feature cards, stat cards                                       |
| `{rounded.xl}`   | 24px   | Large interactive cards, step containers                        |
| `{rounded.2xl}`  | 32px   | Master Auth card containers                                     |
| `{rounded.pill}` | 9999px | Primary CTA buttons, rotating feature badges, streak indicators |

## Components

### Top Navigation

- **`navbar`**: Pinned navigation. Transparent at top, transitions to frosted glass (`rgba(6, 14, 26, 0.85)` + `backdrop-filter: blur(20px)` + bottom border `rgba(255, 255, 255, 0.08)`) on scroll. Logo in Outfit 700 with Amber Sparkle badge.

### Buttons

- **`button-primary`**: Warm Amber (`#F5A623` hover `#FFB940`), text `#060e1a` in Plus Jakarta Sans 700, rounded full-pill, active scale `transform: scale(0.95)`.
- **`button-secondary`**: Frosted glass fill (`bg-white/[0.06]`), white text, 1px border `rgba(255, 255, 255, 0.1)`.
- **`button-ghost`**: Transparent fill, muted text hovering to white.

### Feature Showcase & Dynamic Marquee

- **`marquee-track`**: Continuous 60fps horizontal sliding marquee (`@keyframes continuous-marquee 35s linear infinite`), with edge gradient masks and hover pause.
- **`streak-dashboard`**: Interactive 24-week × 7-day contribution matrix with progressive day completion animation, active streak flame, and real-time word mastery ticker.

### Inputs & Forms

- **`input-field`**: Dark glass well (`bg-white/[0.04]`), text white, placeholder `rgba(255, 255, 255, 0.3)`, border `rgba(255, 255, 255, 0.1)` upgrading to Amber focus ring (`focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20`).
- **`auth-card`**: Liquid-glass container with `backdrop-blur-2xl`, rounded `3xl`, centered split layout.

## Do's and Don'ts

### Do

- Use `{colors.primary}` (Warm Amber #F5A623) for active actions, streak flames, XP rewards, and primary focus highlights.
- Set headings in Outfit 700/800 with tight tracking, and body/phonetics in Plus Jakarta Sans.
- Keep the dark starry night cosmos atmosphere consistent across both Landing and Auth pages.
- Use `transform: scale(0.95)` for button active press micro-interactions.
- Maintain liquid-glass borders (`rgba(255, 255, 255, 0.08)`) on all elevated dark cards.

### Don't

- Don't use flat opaque grey boxes; always use translucent frosted glass with backdrop blur.
- Don't introduce high-contrast harsh colors that clash with the cosmos theme.
- Don't crowd phonetic IPA characters; always provide adequate tracking and leading.

## Responsive Behavior

- **Touch targets**: Minimum 44 × 44px on mobile.
- **Breakpoints**: 1280px (desktop), 1024px (tablet landscape), 768px (tablet portrait/mobile menu switch), 640px (phone single column).
