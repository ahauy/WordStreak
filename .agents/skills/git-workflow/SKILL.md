---
name: git-workflow
description: >
  MANDATORY when performing any git operation — branching, committing, merging, rebasing,
  or resolving conflicts. Covers branching strategies, commit message conventions,
  merge vs rebase decisions, conflict resolution, and collaborative development workflows.
  MUST be read before creating branches, writing commit messages, or merging code.
metadata:
  origin: ECC
---

# Git Workflow Patterns

Best practices for Git version control, branching strategies, and collaborative development.

## 🚨 Strict Rules for AI / Antigravity (MANDATORY)

1. **Review-Gated Commits (Zero Auto-Commit)**:
   - **NEVER** run `git commit` automatically or silently.
   - **ALWAYS** wait for the user to review all changes and explicitly request a commit (or trigger `/command-git-push`).
   - Present changed/created files clearly with clickable links and summaries for user review before committing.

2. **6-Layer Modular Commits Breakdown**:
   - **DO NOT** lump all changes across multiple layers into one giant commit.
   - **ALWAYS** break down commits into granular, logical parts by domain/layer:
     - **Layer 1 - Specifications & BA Documents**:
       - Files: `.specify/**`, `specs/**`, `docs/spec/**`
       - Command: `git add .specify/ specs/ && git commit -m "docs(spec): add specification and test plan for <feature-name>"`
     - **Layer 2 - Shared Types & DTOs**:
       - Files: `packages/shared-types/**`
       - Command: `git add packages/shared-types/ && git commit -m "feat(shared-types): define DTOs and contracts for <feature-name>"`
     - **Layer 3 - Backend API & Services**:
       - Files: `apps/api/**`, `prisma/**`
       - Command: `git add apps/api/ prisma/ && git commit -m "feat(api): implement <feature-name> service and endpoints"`
     - **Layer 4 - Frontend Web UI & Components**:
       - Files: `apps/web/**`
       - Command: `git add apps/web/ && git commit -m "feat(web): implement <feature-name> UI components and views"`
     - **Layer 5 - Technical Docs, User Guides & Roadmap**:
       - Files: `docs/**`, `README.md`, `CHANGELOG.md`
       - Command: `git add docs/ CHANGELOG.md && git commit -m "docs: update feature documentation, user guide, and roadmap"`
     - **Layer 6 - Chores, Governance, Configs & Tooling**:
       - Files: `.agents/**`, `package.json`, `pnpm-lock.yaml`, root configs
       - Command: `git add .agents/ package.json pnpm-lock.yaml && git commit -m "chore: update configs and agent skills"`

3. **Strictly Single-Line English Commit Messages**:
   - Every commit message **MUST be on strictly a single line** in English.
   - Follow Conventional Commits: `<type>(<scope>): <subject>` (e.g. `feat(cards): implement contextual card creation with 3D preview`).
   - Imperative mood, lowercase scope, no trailing period, maximum 72 characters.
   - Never write multi-line paragraphs or markdown backticks inside the `git commit -m "..."` command string.

4. **Branch Minimization & Reuse Priority (Zero Unnecessary Branches)**:
   - **ALWAYS prioritize existing / active branches** for ongoing feature work, related fixes, design adjustments, refactorings, and documentation updates.
   - **DO NOT spawn new branches needlessly**. Avoid branch clutter and overhead.
   - **ONLY create a new branch as a last resort** when starting a completely distinct, unrelated feature or epic that cannot logically live on the current branch.

5. **Pre-Commit User Guide Gate (UI features only - 100% Mandatory Real Screenshots)**:
   - **BEFORE** proposing any `git commit` for a feature or fix that touches UI screens, verify:
     1. `docs/user-guides/<slug>.md` exists.
     2. It contains **100% real high-resolution screenshots with visual highlights/callouts** (Red `#EF4444` borders & numbered badges) captured via Playwright/browser.
     3. The screenshot image files physically exist on disk in `docs/user-guides/images/<slug>/`.
   - If missing, mocked, or text-only: **STOP IMMEDIATELY**. Run `/command-user-guide <slug>` to capture real screenshots before committing/pushing.

6. **Mandatory English Pull Request Description**:
   - Whenever pushing changes to a remote branch (or completing a commit/push cycle), **ALWAYS** provide a ready-to-copy **Pull Request Title and Description in English** following the PR template (`## What & Why`, `## Key Changes`, `## Verification`, `## Screenshots / Artifacts`).
   - This ensures immediate traceability, clean review handoff, and frictionless PR creation on GitHub.

7. **Pre-Flight Auto-Sync with `origin/main` & Monorepo Drift Refresh**:
   - Before starting new work or resuming a roadmap story on any branch, **ALWAYS** fetch `origin/main` and rebase to keep local history up-to-date.
   - If `pnpm-lock.yaml` changed during rebase: run `pnpm install`.
   - If `prisma/schema.prisma` or migrations changed during rebase: run `pnpm --filter api prisma generate`.

8. **Intelligent Semantic Conflict Resolution with Verification Gate**:
   - When a rebase/merge conflict occurs (`<<<<<<<`, `=======`, `>>>>>>>`):
     1. Automatically parse both sides of the conflict.
     2. Semantically merge the changes, preserving business logic and type safety.
     3. Remove all conflict markers.
     4. **MANDATORY Gate**: Run unit/component tests (`pnpm test`) and typecheck before running `git rebase --continue`.
     5. If business rules are inherently ambiguous or conflicting, abort cleanly with `git rebase --abort` and ask the user.

9. **Multi-Scope Detection & Automatic Branch Isolation**:
   - When unstaged or modified changes span across multiple unrelated domains (e.g. `auth` vs `decks` vs `agents`):
     - **NEVER** lump them all into the current branch.
     - **ALWAYS** notify the user with a scope breakdown table.
     - **Auto-split & isolate workflow**:
       1. Commit matching files for current branch first.
       2. Stash remaining files: `git stash push -m "multi-scope-stash"`.
       3. Checkout target branch: `git checkout <target-branch>`.
       4. Restore files: `git checkout stash@{0} -- <files_for_this_scope>`.
       5. Commit and push on target branch.
       6. Return to original branch.

10. **Strict Domain-to-Branch Mapping & Cross-Contamination Prevention**:
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
    - **Auto-Routing Gate**: If changed files do not match `CURRENT_BRANCH`, AI must alert the domain mismatch, isolate the changes via stash/branch checkout, and keep every feature branch 100% focused on its core domain.

6. **Mandatory English Pull Request Description**:
   - Whenever pushing changes to a remote branch (or completing a commit/push cycle), **ALWAYS** provide a ready-to-copy **Pull Request Title and Description in English** following the PR template (`## What & Why`, `## Key Changes`, `## Verification`, `## Screenshots / Artifacts`).
   - This ensures immediate traceability, clean review handoff, and frictionless PR creation on GitHub.

7. **Pre-Flight Auto-Sync with `origin/main` & Monorepo Drift Refresh**:
   - Before starting new work or resuming a roadmap story on any branch, **ALWAYS** fetch `origin/main` and rebase to keep local history up-to-date.
   - If `pnpm-lock.yaml` changed during rebase: run `pnpm install`.
   - If `prisma/schema.prisma` or migrations changed during rebase: run `pnpm --filter api prisma generate`.

8. **Intelligent Semantic Conflict Resolution with Verification Gate**:
   - When a rebase/merge conflict occurs (`<<<<<<<`, `=======`, `>>>>>>>`):
     1. Automatically parse both sides of the conflict.
     2. Semantically merge the changes, preserving business logic and type safety.
     3. Remove all conflict markers.
     4. **MANDATORY Gate**: Run unit/component tests (`pnpm test`) and typecheck before running `git rebase --continue`.
     5. If business rules are inherently ambiguous or conflicting, abort cleanly with `git rebase --abort` and ask the user.

9. **Multi-Scope Detection & Automatic Branch Isolation**:
   - When unstaged or modified changes span across multiple unrelated domains (e.g. `auth` vs `decks` vs `agents`):
     - **NEVER** lump them all into the current branch.
     - **ALWAYS** notify the user with a scope breakdown table.
     - **Auto-split & isolate**: Commit the files matching the current branch first, then automatically checkout/switch to the relevant target branches to commit and push the remaining files into their respective isolated branches.

## When to Activate

- Setting up Git workflow for a new project
- Deciding on branching strategy (GitFlow, trunk-based, GitHub flow)
- Writing commit messages and PR descriptions
- Resolving merge conflicts
- Managing releases and version tags
- Onboarding new team members to Git practices

## Branching Strategies

### GitHub Flow (Simple, Recommended for Most)

Best for continuous deployment and small-to-medium teams.

```
main (protected, always deployable)
  │
  ├── feature/user-auth      → PR → merge to main
  ├── feature/payment-flow   → PR → merge to main
  └── fix/login-bug          → PR → merge to main
```

**Rules:**

- `main` is always deployable
- Create feature branches from `main`
- Open Pull Request when ready for review
- After approval and CI passes, merge to `main`
- Deploy immediately after merge

### Trunk-Based Development (High-Velocity Teams)

Best for teams with strong CI/CD and feature flags.

```
main (trunk)
  │
  ├── short-lived feature (1-2 days max)
  ├── short-lived feature
  └── short-lived feature
```

**Rules:**

- Everyone commits to `main` or very short-lived branches
- Feature flags hide incomplete work
- CI must pass before merge
- Deploy multiple times per day

### GitFlow (Complex, Release-Cycle Driven)

Best for scheduled releases and enterprise projects.

```
main (production releases)
  │
  └── develop (integration branch)
        │
        ├── feature/user-auth
        ├── feature/payment
        │
        ├── release/1.0.0    → merge to main and develop
        │
        └── hotfix/critical  → merge to main and develop
```

**Rules:**

- `main` contains production-ready code only
- `develop` is the integration branch
- Feature branches from `develop`, merge back to `develop`
- Release branches from `develop`, merge to `main` and `develop`
- Hotfix branches from `main`, merge to both `main` and `develop`

### When to Use Which

| Strategy    | Team Size      | Release Cadence | Best For                           |
| ----------- | -------------- | --------------- | ---------------------------------- |
| GitHub Flow | Any            | Continuous      | SaaS, web apps, startups           |
| Trunk-Based | 5+ experienced | Multiple/day    | High-velocity teams, feature flags |
| GitFlow     | 10+            | Scheduled       | Enterprise, regulated industries   |

## Commit Messages

### Conventional Commits Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Use For                    | Example                                           |
| ---------- | -------------------------- | ------------------------------------------------- |
| `feat`     | New feature                | `feat(auth): add OAuth2 login`                    |
| `fix`      | Bug fix                    | `fix(api): handle null response in user endpoint` |
| `docs`     | Documentation              | `docs(readme): update installation instructions`  |
| `style`    | Formatting, no code change | `style: fix indentation in login component`       |
| `refactor` | Code refactoring           | `refactor(db): extract connection pool to module` |
| `test`     | Adding/updating tests      | `test(auth): add unit tests for token validation` |
| `chore`    | Maintenance tasks          | `chore(deps): update dependencies`                |
| `perf`     | Performance improvement    | `perf(query): add index to users table`           |
| `ci`       | CI/CD changes              | `ci: add PostgreSQL service to test workflow`     |
| `revert`   | Revert previous commit     | `revert: revert "feat(auth): add OAuth2 login"`   |

### Good vs Bad Examples

```
# BAD: Vague, no context
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "WIP"

# GOOD: Clear, specific, explains why
git commit -m "fix(api): retry requests on 503 Service Unavailable

The external API occasionally returns 503 errors during peak hours.
Added exponential backoff retry logic with max 3 attempts.

Closes #123"
```

### Commit Message Template

Create `.gitmessage` in repo root:

```
# <type>(<scope>): <subject>
# # Types: feat, fix, docs, style, refactor, test, chore, perf, ci, revert
# Scope: api, ui, db, auth, etc.
# Subject: imperative mood, no period, max 50 chars
#
# [optional body] - explain why, not what
# [optional footer] - Breaking changes, closes #issue
```

Enable with: `git config commit.template .gitmessage`

## Merge vs Rebase

### Merge (Preserves History)

```bash
# Creates a merge commit
git checkout main
git merge feature/user-auth

# Result:
# *   merge commit
# |\
# | * feature commits
# |/
# * main commits
```

**Use when:**

- Merging feature branches into `main`
- You want to preserve exact history
- Multiple people worked on the branch
- The branch has been pushed and others may have based work on it

### Rebase (Linear History)

```bash
# Rewrites feature commits onto target branch
git checkout feature/user-auth
git rebase main

# Result:
# * feature commits (rewritten)
# * main commits
```

**Use when:**

- Updating your local feature branch with latest `main`
- You want a linear, clean history
- The branch is local-only (not pushed)
- You're the only one working on the branch

### Rebase Workflow

```bash
# Update feature branch with latest main (before PR)
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# Fix any conflicts
# Tests should still pass

# Force push (only if you're the only contributor)
git push --force-with-lease origin feature/user-auth
```

### When NOT to Rebase

```
# NEVER rebase branches that:
- Have been pushed to a shared repository
- Other people have based work on
- Are protected branches (main, develop)
- Are already merged

# Why: Rebase rewrites history, breaking others' work
```

## Pull Request Workflow

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(auth): add SSO support for enterprise users
fix(api): resolve race condition in order processing
docs(api): add OpenAPI specification for v2 endpoints
```

### PR Description Template

```markdown
## What

Brief description of what this PR does.

## Why

Explain the motivation and context.

## How

Key implementation details worth highlighting.

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)

Before/after screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings introduced
- [ ] Tests pass locally
- [ ] Related issues linked

Closes #123
```

### Code Review Checklist

**For Reviewers:**

- [ ] Does the code solve the stated problem?
- [ ] Are there any edge cases not handled?
- [ ] Is the code readable and maintainable?
- [ ] Are there sufficient tests?
- [ ] Are there security concerns?
- [ ] Is the commit history clean (squashed if needed)?

**For Authors:**

- [ ] Self-review completed before requesting review
- [ ] CI passes (tests, lint, typecheck)
- [ ] PR size is reasonable (<500 lines ideal)
- [ ] Related to a single feature/fix
- [ ] Description clearly explains the change

## Conflict Resolution

### Identify Conflicts

```bash
# Check for conflicts before merge
git checkout main
git merge feature/user-auth --no-commit --no-ff

# If conflicts, Git will show:
# CONFLICT (content): Merge conflict in src/auth/login.ts
# Automatic merge failed; fix conflicts and then commit the result.
```

### Resolve Conflicts

```bash
# See conflicted files
git status

# View conflict markers in file
# <<<<<<< HEAD
# content from main
# =======
# content from feature branch
# >>>>>>> feature/user-auth

# Option 1: Manual resolution
# Edit file, remove markers, keep correct content

# Option 2: Use merge tool
git mergetool

# Option 3: Accept one side
git checkout --ours src/auth/login.ts    # Keep main version
git checkout --theirs src/auth/login.ts  # Keep feature version

# After resolving, stage and commit
git add src/auth/login.ts
git commit
```

### Conflict Prevention Strategies

```bash
# 1. Keep feature branches small and short-lived
# 2. Rebase frequently onto main
git checkout feature/user-auth
git fetch origin
git rebase origin/main

# 3. Communicate with team about touching shared files
# 4. Use feature flags instead of long-lived branches
# 5. Review and merge PRs promptly
```

## Branch Management

### Naming Conventions

```
# Feature branches
feature/user-authentication
feature/JIRA-123-payment-integration

# Bug fixes
fix/login-redirect-loop
fix/456-null-pointer-exception

# Hotfixes (production issues)
hotfix/critical-security-patch
hotfix/database-connection-leak

# Releases
release/1.2.0
release/2024-01-hotfix

# Experiments/POCs
experiment/new-caching-strategy
poc/graphql-migration
```

### Branch Cleanup

```bash
# Delete local branches that are merged
git branch --merged main | grep -v "^\*\|main" | xargs -n 1 git branch -d

# Delete remote-tracking references for deleted remote branches
git fetch -p

# Delete local branch
git branch -d feature/user-auth  # Safe delete (only if merged)
git branch -D feature/user-auth  # Force delete

# Delete remote branch
git push origin --delete feature/user-auth
```

### Stash Workflow

```bash
# Save work in progress
git stash push -m "WIP: user authentication"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
```

## Release Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible

Examples:
1.0.0 → 1.0.1 (patch: bug fix)
1.0.1 → 1.1.0 (minor: new feature)
1.1.0 → 2.0.0 (major: breaking change)
```

### Creating Releases

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- Add user authentication
- Implement password reset

Fixes:
- Resolve login redirect issue

Breaking Changes:
- None"

# Push tag to remote
git push origin v1.2.0

# List tags
git tag -l

# Delete tag
git tag -d v1.2.0
git push origin --delete v1.2.0
```

### Changelog Generation

```bash
# Generate changelog from commits
git log v1.1.0..v1.2.0 --oneline --no-merges

# Or use conventional-changelog
npx conventional-changelog -i CHANGELOG.md -s
```

## Git Configuration

### Essential Configs

```bash
# User identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Default branch name
git config --global init.defaultBranch main

# Pull behavior (rebase instead of merge)
git config --global pull.rebase true

# Push behavior (push current branch only)
git config --global push.default current

# Auto-correct typos
git config --global help.autocorrect 1

# Better diff algorithm
git config --global diff.algorithm histogram

# Color output
git config --global color.ui auto
```

### Useful Aliases

```bash
# Add to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --all
    amend = commit --amend --no-edit
    wip = commit -m "WIP"
    undo = reset --soft HEAD~1
    contributors = shortlog -sn
```

### Gitignore Patterns

```gitignore
# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
*.o
*.exe

# Environment files
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Test coverage
coverage/

# Cache
.cache/
*.tsbuildinfo
```

## Common Workflows

### Starting a New Feature

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/user-auth

# 3. Make changes and commit
git add .
git commit -m "feat(auth): implement OAuth2 login"

# 4. Push to remote
git push -u origin feature/user-auth

# 5. Create Pull Request on GitHub/GitLab
```

### Updating a PR with New Changes

```bash
# 1. Make additional changes
git add .
git commit -m "feat(auth): add error handling"

# 2. Push updates
git push origin feature/user-auth
```

### Syncing Fork with Upstream

```bash
# 1. Add upstream remote (once)
git remote add upstream https://github.com/original/repo.git

# 2. Fetch upstream
git fetch upstream

# 3. Merge upstream/main into your main
git checkout main
git merge upstream/main

# 4. Push to your fork
git push origin main
```

### Undoing Mistakes

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Undo last commit pushed to remote
git revert HEAD
git push origin main

# Undo specific file changes
git checkout HEAD -- path/to/file

# Fix last commit message
git commit --amend -m "New message"

# Add forgotten file to last commit
git add forgotten-file
git commit --amend --no-edit
```

## Git Hooks

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run linting
npm run lint || exit 1

# Run tests
npm test || exit 1

# Check for secrets
if git diff --cached | grep -E '(password|api_key|secret)'; then
    echo "Possible secret detected. Commit aborted."
    exit 1
fi
```

### Pre-Push Hook

```bash
#!/bin/bash
# .git/hooks/pre-push

# Run full test suite
npm run test:all || exit 1

# Check for console.log statements
if git diff origin/main | grep -E 'console\.log'; then
    echo "Remove console.log statements before pushing."
    exit 1
fi
```

## Anti-Patterns

```
# BAD: Committing directly to main
git checkout main
git commit -m "fix bug"

# GOOD: Use feature branches and PRs

# BAD: Committing secrets
git add .env  # Contains API keys

# GOOD: Add to .gitignore, use environment variables

# BAD: Giant PRs (1000+ lines)
# GOOD: Break into smaller, focused PRs

# BAD: "Update" commit messages
git commit -m "update"
git commit -m "fix"

# GOOD: Descriptive messages
git commit -m "fix(auth): resolve redirect loop after login"

# BAD: Rewriting public history
git push --force origin main

# GOOD: Use revert for public branches
git revert HEAD

# BAD: Long-lived feature branches (weeks/months)
# GOOD: Keep branches short (days), rebase frequently

# BAD: Committing generated files
git add dist/
git add node_modules/

# GOOD: Add to .gitignore
```

## Quick Reference

| Task             | Command                        |
| ---------------- | ------------------------------ |
| Create branch    | `git checkout -b feature/name` |
| Switch branch    | `git checkout branch-name`     |
| Delete branch    | `git branch -d branch-name`    |
| Merge branch     | `git merge branch-name`        |
| Rebase branch    | `git rebase main`              |
| View history     | `git log --oneline --graph`    |
| View changes     | `git diff`                     |
| Stage changes    | `git add .` or `git add -p`    |
| Commit           | `git commit -m "message"`      |
| Push             | `git push origin branch-name`  |
| Pull             | `git pull origin branch-name`  |
| Stash            | `git stash push -m "message"`  |
| Undo last commit | `git reset --soft HEAD~1`      |
| Revert commit    | `git revert HEAD`              |
