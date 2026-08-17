# Product / App UI

For dashboards, in-app screens, settings, data tables, multi-step flows — anything a user lives inside repeatedly rather than visits once. The bar here is different from marketing UI: users will see this screen hundreds of times, so restraint and consistency matter more than making a strong first impression.

## Density and hierarchy

Product UI has to show real information, not persuade — so density is a feature, not a flaw, as long as it's organized. Group related fields/controls visually (spacing + subtle dividers or card boundaries) rather than relying only on labels. Primary actions should be visually distinct from secondary/destructive ones (position, weight, or color — not just placement in a row of identical buttons).

## The four states every view needs

Any view that loads data needs to handle, and ideally show during development:
- **Loading** — a skeleton or spinner that roughly matches the eventual layout, not a generic centered spinner on a blank page.
- **Empty** — a real empty state with a short explanation and, where relevant, a next action — not just "No data."
- **Error** — a message that says what happened and what to do next, not a raw error string.
- **Populated** — the normal case, but check it also looks right at edge densities (1 row, 100 rows).

Skipping these is one of the fastest ways a "finished" screen still reads as a prototype.

## Navigation and structure

Keep navigation predictable — users build muscle memory for where things are. Avoid reinventing standard patterns (sidebar nav, top bar, breadcrumbs, tabs) unless there's a real reason; novelty in navigation costs more in product UI than it earns.

## Forms

Label every field (placeholder-as-label is an accessibility and usability miss). Validate inline where practical rather than only on submit. Group related fields; don't present 15 flat inputs in one column. Disabled/loading states on submit buttons prevent double-submits and communicate that something is happening.

## Gamified or engagement-driven UI (streaks, XP, progress, badges)

When a product includes streaks, XP, levels, or similar mechanics: make the current state legible at a glance (today's status, current streak, progress toward the next milestone) without needing the user to do math or dig into a settings page. Celebratory moments (leveling up, completing a streak) deserve more visual energy than routine states — that contrast is what makes the celebration feel earned rather than the whole UI feeling like it's always celebrating something.

## Dark mode (if the project supports it)

Test both modes for real, not just by inverting colors. Glass/translucent cards that read fine in dark mode often lose all border definition in light mode (and vice versa) — check actual contrast in both, not just one.
