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

### Step 1: Check Git Status & Multi-Scope Detection

1. Run `git status` and `CURRENT_BRANCH=$(git branch --show-current)`.
2. If the working tree is clean with no changes, notify the user and exit.
3. **Automated Scope & Domain Analysis**:
   - Categorize every changed file by its domain/scope (e.g., `auth`, `decks`, `cards`, `study`, `agents`, `docs`, `config`).
   - Compare detected scopes against `CURRENT_BRANCH`.
4. **Multi-Scope Routing**:
   - **Single Scope**: If all files align with `CURRENT_BRANCH`, proceed normally to Step 2.
   - **Multiple Scopes (Cross-Domain Changes)**:
     - Alert the user:
       > 📢 **Multi-Scope Changes Detected:** Modified files belong to multiple distinct domains. Auto-splitting changes across respective branches.
     - Group files by target branch (e.g., `Group 1 -> CURRENT_BRANCH`, `Group 2 -> feat/deck-crud-management`, `Group 3 -> feat/auth-ui-redesign`).
     - Execute **Automated Multi-Branch Processing**:
       1. Stage and commit Group 1 on `CURRENT_BRANCH`, then push.
       2. For each subsequent Group:
          - Stash remaining unstaged files (`git stash push -m "multi-scope-stash"`).
          - Checkout/create the target branch (`git checkout <target-branch>`).
          - Restore corresponding files (`git checkout stash@{0} -- <files_for_this_scope>`).
          - Execute Modular Commits (Step 3) and Smart Push (Step 4).
       3. Switch back to the original `CURRENT_BRANCH`.
       4. Report summary for all processed branches in Step 5.

### Step 2: Pre-Commit User Guide Gate (UI Changes Only - 100% Mandatory Real Screenshots)

1. Check changed files: Do any changes touch user-facing screens in `apps/web/`?
2. If UI changes exist:
   - **Verification 1 (File Existence)**: Check if `docs/user-guides/<slug>.md` exists.
   - **Verification 2 (100% Real Screenshots Check)**:
     - Scan `docs/user-guides/<slug>.md` for embedded screenshot links (e.g. `![...](./images/<slug>/...)`).
     - Verify that the image files physically exist on disk in `docs/user-guides/images/<slug>/` or `docs/user-guides/assets/<slug>/`.
     - Verify images are **100% real high-resolution screenshots with visual highlights/callouts** captured via Playwright/browser, NOT placeholders or mockups.
   - **Strict Gate Enforcement**:
     - If the user guide is missing, empty, text-only without images, or the image files do not exist:
       > ⚠️ **User Guide Gate BLOCKED:** UI changes detected without a verified screenshot-backed user guide in `docs/user-guides/<slug>.md`.
       > 👉 **Action Required:** Run `/command-user-guide <slug>` to capture real screenshots with visual highlights before committing/pushing.
     - **AI MUST STOP IMMEDIATELY** and notify the user. NEVER auto-create a text-only guide or bypass this gate silently!

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

### Step 4: Smart Push & Auto Conflict Resolution

1. Retrieve current branch name: `CURRENT_BRANCH=$(git branch --show-current)`.
2. **Main Branch Protection**:
   - Direct push to `main` is restricted. If currently on `main`, checkout a feature branch (`feat/<slug>`, `chore/<slug>`) before committing/pushing.
3. **Execute Push & Handle Non-Fast-Forward**:
   - Attempt push: `git push origin <CURRENT_BRANCH>` (or `git push -u origin <CURRENT_BRANCH>`).
   - If rejected due to remote updates (`[rejected - non-fast-forward]`):
     1. Run `git fetch origin <CURRENT_BRANCH>`.
     2. Rebase onto remote branch: `git rebase origin/<CURRENT_BRANCH>`.
4. **Automatic Semantic Conflict Resolution**:
   - If a merge/rebase conflict occurs (`<<<<<<<`, `=======`, `>>>>>>>`):
     1. Identify conflicted files: `git diff --name-only --diff-filter=U`.
     2. **Semantic Resolution**: Intelligently merge both sets of changes, preserving domain logic, typing contracts, and updated code.
     3. Remove all conflict markers.
     4. **Verification Gate**: Run test suite (`pnpm test`) and typecheck to verify resolution integrity.
     5. Stage resolved files: `git add <resolved-files>`.
     6. Complete rebase: `git rebase --continue`.
     7. Retry `git push origin <CURRENT_BRANCH>`.
   - _Safety Fallback_: If conflict logic has irreconcilable domain ambiguity, run `git rebase --abort` and present the exact conflicting sections for user decision.

### Step 5: Report Results & Generate English PR Brief

1. Display a summary table of created commits and remote push status.
2. Provide a ready-to-copy **Pull Request Title & Description in English** inside a markdown code block so the user can immediately paste it into GitHub:
   - **PR Title**: `<type>(<scope>): <concise description>`
   - **PR Body Format**:
     ```markdown
     ## What & Why

     [Brief description of motivation and what this PR accomplishes]

     ## Key Changes

     - **[Layer/Scope]**: [Bullet points of specific changes]

     ## Verification

     - [ ] Automated tests passed (unit/integration/e2e)
     - [ ] Manual verification completed
     - [ ] User Guide verified/updated (if UI changes)
     ```
