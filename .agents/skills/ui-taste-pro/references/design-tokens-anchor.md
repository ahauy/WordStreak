# Design Anchor (DESIGN.md)

The point of this file is to stop every new screen from re-deciding the visual language from scratch. Once real decisions are made (usually on the first screen or two of a project), write them down here so later work — by this AI or a future session — stays consistent instead of drifting.

## When to create it

As soon as color, type, and spacing choices are made for real (not placeholder) UI — typically after the first screen is approved, not before anything exists. Don't invent tokens speculatively before any real UI has been built; extract them from what was actually decided.

## When to use an existing one instead

If the project already has a `DESIGN.md`, or the user points at a specific existing aesthetic to match (a brand, a reference site, a design-token file from elsewhere), treat that as the source of truth and don't overwrite it with new defaults. Update it only when the user explicitly changes direction — append/adjust rather than regenerate from scratch, so the file keeps functioning as a stable reference.

## Template

```markdown
# Design System — <project name>

## Palette
- Neutral: <hex/scale — background, surface, border, text>
- Primary accent: <hex>
- Secondary accent (optional): <hex>
- Semantic (optional, only if the domain needs it): success / warning / danger

## Type
- Family: <font(s)>
- Scale: <e.g. 12 / 14 / 16 / 20 / 24 / 32 / 48>
- Weight usage: <e.g. 400 body, 600 headings, 700 emphasis>

## Spacing
- Scale: <e.g. 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64>

## Radius
- <e.g. 6px small elements, 12px cards, 999px pills>

## Shadow
- <e.g. one subtle elevation for cards, one stronger for modals — avoid a shadow on everything>

## Motion
- Duration: <e.g. 150–250ms>
- Easing: <e.g. ease-out for entrances, ease-in for exits>

## Notes
- <anything else worth remembering — a reference brand/site the look is anchored to, things explicitly to avoid, etc.>
```

Keep it short. This is a working reference for consistency, not a full brand book — a page or less is usually enough for most projects.
