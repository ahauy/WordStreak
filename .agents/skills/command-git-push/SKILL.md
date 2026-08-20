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

### Step 1: Check Git Status & Strict Domain-To-Branch Routing

1. Run `git status` and `CURRENT_BRANCH=$(git branch --show-current)`.
2. If the working tree is clean with no changes, notify the user and exit.
3. **Automated Domain & Scope Classification**:
   Every changed file is strictly mapped to its legitimate target branch domain:
   - **Global Governance, Agent Rules & Skill References** (`.agents/**`, `GEMINI.md`, `.specify/templates/**`, `package.json`, root configs):
     - **Target Domain**: `chore/governance-<slug>` or `chore/agent-skills` (or `main` if merged).
     - **STRICT PROHIBITION**: NEVER commit global governance or agent configs into domain feature branches (e.g. `feat/card-management`, `feat/auth-*`, `feat/deck-*`).
   - **Feature-Specific Code & Documents** (`apps/web/src/features/<domain>/**`, `apps/api/src/modules/<domain>/**`, `specs/<slug>/**`, `docs/features/<slug>/**`, `docs/user-guides/<slug>.md`):
     - **Target Domain**: `feat/<domain>-<feature-slug>` (e.g. `feat/card-management`, `feat/deck-crud-management`). All specs and user guides for a feature live together on the feature branch.
   - **Global Architecture, Roadmaps & Product References** (`docs/architecture/**`, `docs/algorithms/**`, `docs/PRODUCT_BACKLOG_ROADMAP.md`, `README.md`, `vocabulary-app-feature-ideas*.md`):
     - **When modified alongside a feature**: Commit on that feature's branch (`feat/<slug>`).
     - **When updated independently (standalone roadmap/architecture update)**: `docs/<topic-slug>` (e.g. `docs/update-roadmap`, `docs/sm2-algorithm-reference`).
   - **Shared Libraries & Packages** (`packages/shared-types/**`):
     - Belongs to the feature branch that introduced/modified the DTOs, or `chore/shared-types` if standalone.

4. **Strict Branch Compatibility & Auto-Routing Gate**:
   - **Case A: Perfect Match**: Changed files belong exclusively to `CURRENT_BRANCH`'s domain $\rightarrow$ Proceed to Step 2.
   - **Case B: Domain Mismatch (Cross-Contamination Prevention)**:
     - If changed files do NOT belong to `CURRENT_BRANCH` (e.g., modifying `GEMINI.md` while on `feat/card-management`):
       > 📢 **Domain-Branch Mismatch Detected:** Modified files belong to `[Governance/Config]` but active branch is `[feat/card-management]`.
       > 🛡️ **Auto-Branch Routing:** Isolating changes into target branch `chore/<topic>` (or creating new dedicated branch) to protect `feat/card-management` from contamination.
     - **Auto-Routing Steps**:
       1. Stash changes: `git stash push -m "domain-routing-stash"`.
       2. Check out / create legitimate target branch (e.g. `git checkout -b chore/<topic>`).
       3. Pop/restore files: `git stash pop` (or `git checkout stash@{0} -- <files>`).
       4. Execute Modular Commits (Step 3) and Smart Push (Step 4) on the target branch.
       5. Return to `CURRENT_BRANCH`.
   - **Case C: Multi-Scope (Multiple Domains Modified Simultaneously)**:
     - Group files by domain target branch.
     - Process each group sequentially onto its own branch, keeping every feature branch 100% clean.

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
