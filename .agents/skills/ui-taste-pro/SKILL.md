---
name: ui-taste-pro
description: Use this skill whenever building, redesigning, styling, or reviewing any UI or frontend work — pages, screens, components, dashboards, forms, landing pages, marketing sites, or mobile layouts, in any framework or stack. Detects the project's tech stack and UI type automatically, applies stack-agnostic anti-generic-AI design principles (typography, spacing, color, motion, states), and runs a self-audit before calling UI work done. Trigger this any time the user asks to build a page/screen/component, style something, or make an interface "look better," "less AI-generated," "more polished," "more professional," or "not generic" — even if they never say the words "design" or "UI/UX."
---

# UI Taste Pro

A stack-agnostic design-taste layer for AI-generated interfaces. It exists because AI-built UIs tend to converge on the same tells — centered flex everywhere, purple-to-blue gradients, glassmorphism on every card, identical shadows, no real typographic hierarchy — regardless of what framework is underneath. This skill catches that before it ships, without assuming any particular stack or visual style up front.

Because projects vary in stack and in UI type (product app vs. marketing site), the workflow below always starts with detection instead of assuming a default.

## Step 0 — Detect the context

Before writing any UI code, spend a moment figuring out two things:

**1. Stack.** Look for `package.json`, `pubspec.yaml`, `composer.json`, `*.xcodeproj`, `requirements.txt`, or similar. Check for React/Next, Vue/Nuxt, Svelte, Flutter, SwiftUI, Laravel/Blade, or plain HTML/CSS/JS. If nothing is detectable (empty repo, first file being created), ask the user rather than defaulting to one stack silently — a wrong guess here cascades into every following decision.

**2. UI type.** Decide whether this is **product UI** (dashboards, in-app screens, data tables, settings, multi-step flows, anything a logged-in user lives inside) or **marketing UI** (landing pages, pricing pages, portfolios — pages meant to persuade a visitor). Signals: existing routes/nav structure, whether there's auth, whether the copy is "storytelling toward a CTA" vs. "get things done." Mixed projects can have both — treat each page/screen on its own terms rather than picking one mode for the whole project.

This matters because product UI and marketing UI are judged by different standards. A dashboard that "pops" with marketing-style hero energy is exhausting to use daily; a landing page that behaves like a sober dashboard fails to persuade. Once you know the type, read the matching reference:

- Product/app UI → `references/product-ui.md`
- Marketing/landing UI → `references/marketing-ui.md`

Both build on the universal principles below — read this section regardless of type.

## Step 1 — Universal anti-slop principles

These apply no matter the stack or UI type. Most "looks like AI made it" complaints trace back to one of these five being skipped, not to a lack of creativity.

**Typography.** Pick a real type scale (e.g. 12/14/16/20/24/32/48) and use weight + size together to create hierarchy — don't rely on size alone, and don't let every heading be the same weight as the body text with just a size bump. One typeface family is usually enough; a second for a distinct role (e.g. a monospace for numbers/code) can help but isn't required.

**Spacing rhythm.** Commit to a spacing scale (e.g. 4/8/12/16/24/32/48/64) and stick to it instead of eyeballing padding per element. Generous whitespace around a few important things reads as confident; cramped whitespace around many things reads as templated. When in doubt, add more space around the element that matters most, not equal space around everything.

**Color.** One dominant neutral, one primary accent, and at most one secondary accent is usually enough — resist reaching for a rainbow of "semantic" colors unless the domain genuinely needs it (e.g. status dashboards). Avoid defaulting to a purple-to-blue gradient or dark glassmorphism unless the brief actually calls for that specific aesthetic; it's become the single most obvious AI-generated tell. Check contrast in whichever mode (light/dark) the project actually ships, not just the one you're looking at while coding.

**Layout hierarchy.** Visual weight should guide the eye to what matters most first. Centering everything and stacking evenly-sized boxes is the default that makes output look interchangeable with every other AI output — vary size, alignment, and density on purpose based on what's actually most important on that screen.

**Motion.** Subtle and purposeful beats decorative. 150–300ms transitions on state changes (hover, open/close, load) read as polished; bouncy entrance animations on static content read as filler. If motion doesn't communicate a state change or guide attention, cut it.

**The details that separate "prototype" from "shipped":** hover/focus states on every interactive element, real empty states (not a blank div), a loading state, an error state, and cursor-pointer on anything clickable. These are cheap to add and their absence is one of the fastest ways a UI reads as unfinished.

## Step 2 — Lock decisions with a design anchor

The first time you make real visual decisions for a project (color, type scale, spacing scale, radius, shadow style), write them down in a short `DESIGN.md` at the project root instead of re-deciding per screen — see `references/design-tokens-anchor.md` for the template. Every screen after that should read the existing `DESIGN.md` first and stay consistent with it, rather than each new page inventing its own variant of "the" theme.

If the user already has a `DESIGN.md`, or names a specific aesthetic they want to match (a brand, an existing site), treat that as the anchor and work from it — don't override it with the defaults above.

## Step 3 — Self-audit before calling it done

Before handing UI work back, run it against `references/anti-slop-checklist.md`. This is a fast pass, not a rewrite — the point is to catch the handful of tells that are easy to miss mid-build (identical shadows everywhere, all-centered layout, missing hover states, generic 3-column feature grid) before the user has to point them out.

If the environment has an external design-audit tool available (for example an `impeccable`-style CLI/skill), running it as an additional pass after this checklist is a good belt-and-suspenders step — but the checklist alone is enough to catch the majority of issues.

## A note on defaults

This skill deliberately does not hardcode a "default style." Infer the right register from the project's own content, existing code, and the user's brief — a fintech dashboard, a kids' learning app, and a developer tool warrant different typographic and color choices even though the underlying principles (hierarchy, rhythm, restraint) are the same. When a project is genuinely a blank slate with no signal, it's better to ask the user for one or two words of direction (playful vs. serious, dense vs. spacious) than to silently pick a look.
