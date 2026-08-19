---
name: command-user-guide
description: >-
  Activated when the user types /command-user-guide (or shortcuts /user-guide, /guide, /auto-user-guide).
  Verifies the running dev server, plans and captures real UI screenshots using Playwright,
  and generates/updates docs/user-guides/<slug>.md with non-technical language and actionable tips.
triggers:
  - "/command-user-guide"
  - "/user-guide"
  - "/guide"
  - "/auto-user-guide"
  - "create user guide"
  - "write user guide"
  - "user documentation"
---

# Command: User Guide Generator Workflow (/command-user-guide)

This command skill automates the creation and maintenance of end-user documentation with real application screenshots in compliance with [user-guide-with-screenshots](../user-guide-with-screenshots/SKILL.md).

---

## Core Principles (User-First)

1. **Non-Technical Language**: Avoid developer jargon (e.g., _API, DTO, Endpoint, Database, State, Component, Payload_). Explain features plainly as if talking to an everyday user (e.g., use "popup window" instead of "modal").
2. **100% Real Screenshots**: Capture images directly from the running web application (`localhost:5173`). Never use fabricated mockups or placeholders.
3. **Visual Clarity**: 1 user action = 1 clear screenshot + 1–2 concise explanatory sentences.
4. **File Locations**:
   - Document: `docs/user-guides/<slug>.md`
   - Images: `docs/user-guides/images/<slug>/` or `docs/user-guides/assets/<slug>/`

---

## 5-Step Execution Workflow

### Step 1: Identify Feature & Scope

1. Determine the `<slug>` of the target feature from command arguments (e.g. `/command-user-guide card-creation`) or recent UI changes in `apps/web/src/features/<feature>/`.
2. Identify key screens, popups, and the main user flow (Happy path: navigate to page -> click action -> fill inputs -> confirm & save).

### Step 2: Verify Running Application

1. Check if the Web Dev Server is running at `http://localhost:5173`.
2. If not running, start the dev server (`pnpm --filter web dev`).

### Step 3: Plan & Capture Screenshots

1. Create a temporary screenshot plan (e.g., `.agents/skills/user-guide-with-screenshots/scripts/<slug>-plan.json`).
2. Run the automated Playwright capture script:
   ```bash
   node .agents/skills/user-guide-with-screenshots/scripts/capture-screenshots.mjs .agents/skills/user-guide-with-screenshots/scripts/<slug>-plan.json
   ```
   _(Or use the browser tool to capture screenshots for each step into `docs/user-guides/images/<slug>/`)_.

### Step 4: Author User Guide Document

Create or update `docs/user-guides/<slug>.md` following the standard template:

```markdown
# 📖 User Guide: [Feature Name]

> **Audience:** WordStreak Learners  
> **Last Updated:** [Current Date]

---

## 🎯 Overview

[2-3 plain-language sentences describing how this feature helps learners]

---

## 🚀 Step-by-Step Instructions

### Step 1: [Step Title, e.g., Open Deck Details]

![Open Deck Details](./images/<slug>/step-01.png)

- [Action instruction 1]
- [Action instruction 2]

### Step 2: [Step Title, e.g., Fill in Word Details]

![Fill in Word Details](./images/<slug>/step-02.png)

- [Action instruction]

---

## 💡 Tips & Shortcuts

- **Tip 1:** ...
- **Tip 2:** ...

---

## ❓ Frequently Asked Questions (FAQ)

- **Q:** [Common Question]  
  **A:** [Direct, plain explanation]
```

### Step 5: Update User Guides Index

Add or update the link in `docs/user-guides/README.md` if an index exists. Report completion with the file path to the user.
