---
name: command-git-push
description: >-
  Activated when the user types /command-git-push (or shortcuts /push, /ship, /auto-git-push).
  Verifies the Pre-Commit User Guide Gate (for UI changes), splits changes into Modular Commits
  (Spec -> Shared Types -> Backend -> Frontend -> Docs) using Single-Line English Conventional Commits,
  and pushes to the active branch.
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

# Command: Git Commit & Push Workflow (/command-git-push)

This command skill automates git staging, validates quality and user guide gates, creates **Modular Commits** adhering to project conventions, and pushes code to the remote repository.

---

## Execution Workflow

### Step 1: Check Git Status & Current Branch

1. Run `git status` and `git branch --show-current`.
2. If the working tree is clean with no changes, notify the user and exit.
3. Categorize all modified, added, or deleted files.

### Step 2: Pre-Commit User Guide Gate (UI Changes Only)

1. Check changed files: Do any changes touch user-facing screens in `apps/web/`?
2. If UI changes exist but `docs/user-guides/<slug>.md` is missing or stale:
   - Alert the user:
     > ⚠️ **User Guide Gate Check:** UI changes detected without a corresponding or updated `docs/user-guides/<slug>.md`.
   - Recommend running `/command-user-guide` before committing, or confirm with the user to proceed if the change is an internal refactor.

### Step 3: Modular Commits Breakdown

Never combine unrelated layers into a single monolithic commit. Group files and commit sequentially:

1. **Layer 1 - Specifications & BA Documents**:
   - Files: `.specify/**`, `specs/**`, `docs/spec/**`
   - Command: `git add .specify/ specs/ && git commit -m "docs(spec): add specification and test plan for <feature-name>"`

2. **Layer 2 - Shared Types & DTOs**:
   - Files: `packages/shared-types/**`
   - Command: `git add packages/shared-types/ && git commit -m "feat(shared-types): define DTOs and contracts for <feature-name>"`

3. **Layer 3 - Backend API & Services**:
   - Files: `apps/api/**`, `prisma/**`
   - Command: `git add apps/api/ prisma/ && git commit -m "feat(api): implement <feature-name> service and endpoints"`

4. **Layer 4 - Frontend Web UI & Components**:
   - Files: `apps/web/**`
   - Command: `git add apps/web/ && git commit -m "feat(web): implement <feature-name> UI components and views"`

5. **Layer 5 - Technical Docs, User Guides & Roadmap**:
   - Files: `docs/**`, `README.md`, `CHANGELOG.md`
   - Command: `git add docs/ CHANGELOG.md && git commit -m "docs: update feature documentation, user guide, and roadmap"`

6. **Layer 6 - Chores, Configs, Tooling (if any)**:
   - Files: `.agents/**`, `package.json`, `pnpm-lock.yaml`, root configs
   - Command: `git add .agents/ package.json pnpm-lock.yaml && git commit -m "chore: update configs and agent skills"`

> [!IMPORTANT]
> **Single-Line English Commit Rules:**
>
> - All commit messages **MUST be strictly single-line in English**.
> - Conventional Commits standard: `<type>(<scope>): <subject>` (under 72 chars, imperative mood, no trailing period).
> - Do not include newlines `\n` or markdown backticks inside `-m "..."`.

### Step 4: Push to Remote

1. Retrieve current branch name: `CURRENT_BRANCH=$(git branch --show-current)`.
2. Execute push:
   - `git push origin <CURRENT_BRANCH>`
   - (If upstream is not set: `git push -u origin <CURRENT_BRANCH>`).

### Step 5: Report Results

Display a summary table of created commits and remote push status.
