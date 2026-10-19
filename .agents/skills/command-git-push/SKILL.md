---
name: command-git-push
description: >-
  Activated when the user types /command-git-push (or shortcuts /push, /ship, /auto-git-push).
  Executes high-speed, 1-pass compound git commit & push with adaptive logical commit grouping
  (Code vs Docs), non-blocking milestone checks, and instant English PR brief generation.
triggers:
  - "/command-git-push"
  - "/git-push"
  - "/ship"
  - "/push"
  - "/auto-git-push"
  - "commit and push"
  - "push changes"
  - "sync to remote"
---

# Command: High-Speed Git Commit & Push Workflow (/command-git-push)

This command skill provides a fast, token-efficient, 1-pass execution for staging, creating clean Conventional Commits, pushing to the active branch, and generating an English PR brief.

---

## Core Principles (Speed & Token Efficiency)

1. **1-Pass Compound Execution**: Run staging, committing, and remote push in **one single compound shell command** (`git add ... && git commit ... && git push ...`) instead of fragmented multi-turn round trips.
2. **Adaptive 1-to-2 Logical Commits**: Avoid artificial 6-layer micro-commits. Group changes cleanly into at most 2 cohesive commits:
   - **Code & Core Tests**: `feat(<scope>): <concise message>` (or `fix(...)`)
   - **Docs & Specifications**: `docs(<scope>): <concise message>` (or `chore(...)`)
   *(If changes only touch one layer, produce 1 single cohesive commit).*
3. **Active Branch Priority**: Commit directly onto the current working branch (`CURRENT_BRANCH`). Never perform unnecessary stashing or branch hopping unless explicitly requested or when currently on `main`.
4. **Milestone-Level User Guide Gate**: Check for UI changes and surface non-blocking reminders for milestone user guides without halting routine commits.

---

## Execution Workflow (1-to-2 Turns Maximum)

### Step 1: Fast Status & Scope Assessment

Run `git status -s` and `git branch --show-current` to assess changed files:

1. **Clean Tree Check**: If no changes are detected, notify the user and exit immediately.
2. **Main Branch Protection**:
   - Direct push to `main` is restricted.
   - If `CURRENT_BRANCH == "main"`, automatically create or prompt for a feature/chore branch:
     `git checkout -b feat/<slug>` or `chore/<slug>` before proceeding.

---

### Step 2: Adaptive Logical Commit Grouping

Analyze changed files and categorize them into at most **2 logical groups**:

- **Group 1: Feature / Code Layer (`feat` or `fix`)**:
  - Paths: `apps/**`, `packages/**`, `prisma/**`, test files (`*.spec.ts`, `*.test.tsx`).
  - Message: `feat(<domain>): <concise single-line description in English>`
- **Group 2: Docs / Governance / Chore Layer (`docs` or `chore`)**:
  - Paths: `.specify/**`, `docs/**`, `CHANGELOG.md`, `README.md`, `.agents/**`, `GEMINI.md`, root configs.
  - Message: `docs(<domain>): <concise description>` or `chore: update configurations and rules`

> [!IMPORTANT]
> **Single-Line English Commit Rules:**
> - Strictly single-line English Conventional Commits: `<type>(<scope>): <subject>`.
> - Imperative mood, under 72 characters, no trailing period.
> - Never include unescaped newlines `\n` or markdown backticks inside `-m "..."`.

---

### Step 3: High-Speed Compound Execution (Single Tool Call)

Execute staging, committing, and push in a **single compound command** to minimize API round trips:

```bash
CURRENT_BRANCH=$(git branch --show-current)

# If only Group 1 exists:
git add apps/ packages/ && git commit -m "feat(scope): concise description" && git push origin $CURRENT_BRANCH

# If only Group 2 exists:
git add .agents/ docs/ .specify/ GEMINI.md && git commit -m "docs: update specifications and rules" && git push origin $CURRENT_BRANCH

# If both Group 1 and Group 2 exist (Adaptive 2-commit split):
git add apps/ packages/ && git commit -m "feat(scope): concise description" && \
git add .specify/ docs/ .agents/ GEMINI.md CHANGELOG.md && git commit -m "docs: update feature documentation and roadmap" && \
git push origin $CURRENT_BRANCH
```

#### Handling Remote Divergence (Non-Fast-Forward)
If push is rejected due to remote commits, automatically recover within the same turn:
```bash
git pull --rebase origin $CURRENT_BRANCH && git push origin $CURRENT_BRANCH
```

---

### Step 4: Non-Blocking Milestone User Guide Reminder

- If changes touched `apps/web/` screens:
  - Check if `docs/user-guides/<slug>.md` exists.
  - If missing, include a friendly reminder in the summary:
    > 💡 **Milestone Note:** UI changes detected. When completing this Epic/Release milestone, remember to run `/command-user-guide <slug>` to generate end-user docs with real Playwright screenshots.

---

### Step 5: Instant Report & Ready-to-Copy PR Brief

Directly output the push result and ready-to-copy PR Brief in the final response:

```markdown
### 🚀 Git Push Completed Successfully!

- **Branch**: `<CURRENT_BRANCH>`
- **Commits Created**:
  1. `<commit-hash>` — `<commit-message-1>`
  2. `<commit-hash>` — `<commit-message-2>` (if applicable)

---

### 📋 Pull Request Brief (Ready to copy to GitHub)

#### PR Title:
`<type>(<scope>): <concise PR title>`

#### PR Description:
```markdown
## What & Why
[Brief 1-2 sentence description of the motivation and changes]

## Key Changes
- **[Layer/Scope]**: [Key updates]
- **[Docs/Governance]**: [Documentation or configuration updates]

## Verification
- [x] Automated tests passed (`pnpm test && pnpm build`)
- [x] Tested against acceptance criteria
```
```
