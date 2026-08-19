# How to install this skill in your AI tool

This skill folder contains:

```
user-guide-with-screenshots/
├── SKILL.md                              ← main skill instructions
├── SETUP.md                              ← this file
├── scripts/
│   ├── capture-screenshots.mjs           ← automated screenshot script (Playwright)
│   └── screenshot-plan.example.json      ← example capture plan file
└── templates/
    ├── user-guide-template.md            ← blank guide template
    └── user-guide-example-card-creation.md  ← filled example — use as a tone reference
```

## 1. Copy the folder into your project

The skill is already placed at `.agents/skills/user-guide-with-screenshots/`.
Antigravity picks it up automatically from this location.

## 2. Point your AI tool at this skill

- **Antigravity**: the skill is auto-discovered from `.agents/skills/`. No extra
  config needed — Antigravity matches it by the `triggers` list in the frontmatter.
- **Cursor**: create `.cursor/rules/user-guide-with-screenshots.mdc` and paste in
  the contents of `SKILL.md`. Set `alwaysApply: false` so it only applies when
  relevant, or `alwaysApply: true` if you want it in every session.
- **Other tools with file access**: tell the AI "read
  `.agents/skills/user-guide-with-screenshots/SKILL.md` and follow it" — since
  the tool can read files, it will open and follow the instructions directly.

## 3. Before using for the first time

- Playwright is already installed in `apps/web` (added via `pnpm add -D playwright --filter web`).
- Open `scripts/screenshot-plan.example.json` and update `baseUrl`, the `url`
  values, and especially the `selector` values to match your actual HTML
  (e.g. change `[data-testid=add-card-modal]` to the correct selector in your
  code). If a component doesn't have a `data-testid` yet, add one — it makes
  selectors stable over time and avoids capturing the wrong element when
  text or class names change.

## 4. Daily usage

After the AI finishes a feature or a UI change, type:

> "Done, now create/update the user guide using the user-guide-with-screenshots skill."

The AI will follow the 5-step process in `SKILL.md`: read the change → list
the steps to illustrate → run the screenshot script → write the guide → save
to `docs/user-guides/<slug>.md`.
