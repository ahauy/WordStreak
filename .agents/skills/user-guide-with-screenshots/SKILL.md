---
name: user-guide-with-screenshots
description: >
  Creates or updates a user-facing guide (non-technical language, real
  screenshots) for a WordStreak feature that was just built or modified.
  Use whenever: (1) a feature / user story ships, (2) any UI screen is
  changed (layout, flow, added/removed fields), (3) the user asks for
  "user guide", "end-user docs", "how-to guide", or "instructions for
  feature X" — even without the exact phrase "user guide".
  This document is SEPARATE from the technical README — never edit the
  technical README; always create/update a dedicated end-user file.
triggers:
  - "create user guide"
  - "update user guide"
  - "write user documentation"
  - "end-user docs"
  - "user-facing guide"
  - "feature is done, document it"
  - "user guide with screenshots"
  - "how-to guide"
  - "instructions for"
  - "done, now document"
  - "screenshot docs"
---

# Skill: User Guide with Real Screenshots

## When to Activate

- A feature / user story has just been completed and is ready to ship
- A UI screen was edited (layout changed, flow updated, fields added/removed)
- The user says "write user guide", "create docs for this feature", "done, document it", "instructions for X"
- `implementation-orchestrator` or `speckit-implement` finishes a UI slice
- **Definition of Done check**: any UI feature cannot be closed without this guide

## Core Principles

1.  **Readers are non-technical.** Avoid words like API, DTO, endpoint, component,
    transaction, payload. Use plain language — write as if explaining to a friend
    who is not a developer. Replace "modal" with "popup window", etc.
2.  **Screenshots must be 100% real** — captured from the running app via Playwright/Browser. Never use mockups or imagined layouts.
3.  **Visual Annotations & Highlights (BẮT BUỘC CHỈ DẪN VIỀN ĐỎ TRÊN ẢNH)**:
    - Mọi bước chụp màn hình **bắt buộc phải làm nổi bật bằng viền đỏ rực rỡ** (`outline: 3.5px solid #EF4444; box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.3)`) quanh nút bấm hoặc form cần thao tác để người dùng dễ quan sát nhất.
    - Đính kèm huy hiệu số thứ tự tròn màu đỏ (**①, ②, ③**) có số trắng đậm ngay góc trên bên trái của vùng khoanh đỏ.
    - Trong bài viết, từng gạch đầu dòng hướng dẫn phải tham chiếu trực tiếp đến số khoanh đỏ tương ứng (ví dụ: `① Bấm nút...`, `② Nhập...`).
4.  **One action = one annotated screenshot + 1–2 sentences.** Do not write a long paragraph and then drop a screenshot at the end.
5.  **Always kept separate** from the technical README. Output file goes to
    `docs/user-guides/<slug>.md`, images to `docs/user-guides/images/<slug>/`.

---

## 5-Step Process

### Step 1 — Identify the scope of changes

Read the technical feature README / description (or run `git diff` if no
description exists) to determine: the user-friendly name of the feature,
which screens/routes are involved, and the main actions a user can take.

### Step 2 — List the steps that need screenshots (the flow)

List the user actions in order, e.g.:
open page → click button X → fill form → see result → click save.
Each action maps to one screenshot. Prioritize the happy path (normal usage).
Add one extra screenshot for any important edge-case state (e.g. duplicate
warning) only if the user needs to know about it.

### Step 3 — Run the app & capture real screenshots

- Make sure the dev server is running (`pnpm dev`, `npm run dev`, etc.).
- If Playwright is not yet installed: `pnpm add -D playwright --filter web && pnpm --filter web exec playwright install chromium`.
- Write a JSON capture plan (see `scripts/screenshot-plan.example.json` in this
  skill folder as a reference — each step from Step 2 becomes one entry in `steps`).
- Run: `node .agents/skills/user-guide-with-screenshots/scripts/capture-screenshots.mjs <path-to-plan.json>`
- The script opens each screen, performs the actions (click / fill / hover),
  and saves images to the `outDir` declared in the plan.
- Review the captured images — if a screenshot shows the wrong state (e.g. the
  form is empty instead of filled), fix the `actions` in the plan and re-run.

### Step 4 — Write the guide

Use `templates/user-guide-template.md` (in this skill folder) as the base.
For each step from Step 2, embed the corresponding screenshot using a relative
path, followed by 1–2 sentences in plain language (e.g. "Click here to…",
"The screen will show…"). Add a "Tips" section and "FAQ" section if relevant.

### Step 5 — Updating when the feature is refined later

If `docs/user-guides/<slug>.md` already exists: read it first, update only
the steps and images that actually changed (do not rewrite from scratch),
overwrite old images with the same filename, and prepend one note at the top
of the file:
`> Updated <date>: <short description of what changed>`.

---

## Reference Files

Located at `.agents/skills/user-guide-with-screenshots/`:

- `scripts/capture-screenshots.mjs` — Playwright script; reads a JSON plan and captures screenshots.
- `scripts/screenshot-plan.example.json` — example plan file based on the "Create flashcard" feature.
- `templates/user-guide-template.md` — blank guide template.
- `templates/user-guide-example-card-creation.md` — filled example showing the expected tone and level of detail.

---

## How This Skill Gets Triggered

Tools like Antigravity match skills by description and trigger keywords. Two
reliable ways to ensure this skill runs consistently:

1. After finishing a feature, type: _"Done, now create/update the user guide
   using the user-guide-with-screenshots skill."_
2. The `AGENTS.md` **User Guide Gate** rule already enforces this: every UI
   feature is considered incomplete until this guide exists. Most agent tools
   read that rule at the start of each task and will invoke this skill
   automatically at the end of any UI implementation.
