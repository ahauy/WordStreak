# AGENT and CONTRIBUTING Principles

This reference establishes standards for agent instruction policies (`AGENTS.md`, `GEMINI.md`, `.cursorrules`) and contributor guidelines (`CONTRIBUTING.md`).

---

## 1. Canonical vs. Alias Rule Policy

To prevent rule drift across multiple AI coding assistants (Antigravity, Cursor, Copilot, Claude Code, Codex):

1. **Single Source of Truth (SSOT)**:
   - Treat `AGENTS.md` (or `.agents/AGENTS.md`) as the canonical repository instruction file.
   - For tooling that expects specific files (e.g. Cursor reading `.cursorrules` or `.cursor/rules/`), use alias pointers or symlinks rather than copying text.
2. **DRY (Don't Repeat Yourself)**:
   - Never copy-paste paragraphs of rules across multiple files. Keep the core rules in canonical files and reference them.

---

## 2. 3 Behavior Boundaries for AI Agents

Every agent policy document must categorize behavioral constraints into three unambiguous levels:

| Boundary        | Description                                   | WordStreak Examples                                                                                   |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **`Always`**    | Non-negotiable rules that run every time      | Read mandatory skill before coding, follow TDD, maintain zero critical bugs, validate DTO boundaries  |
| **`Ask First`** | Actions requiring explicit human confirmation | Adding third-party packages, altering DB schema in production, changing core game mechanics           |
| **`Never`**     | Hard prohibitions                             | Hardcoding secrets/tokens, committing directly to `main`, bypassing test suites, ignoring lint errors |

---

## 3. Concrete & Deterministic Instructions

- **Real Commands**: Use actual project commands (e.g., `pnpm --filter web dev`, `pnpm --filter api test`).
- **Exact File Paths**: Specify unambiguous paths (e.g., `docs/features/<feature-slug>/README.md`).
- **Context Boundaries**: Keep instructions concise (< 800 lines) so AI context windows are not saturated by repetitive boilerplate.
