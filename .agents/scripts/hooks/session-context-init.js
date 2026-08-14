#!/usr/bin/env node
/**
 * PreInvocation Hook - WordStreak Project Context Initializer
 *
 * Runs before the model is called in Antigravity.
 * Injects project context, git status, active tech stack, and mandatory development
 * guidelines into the conversation turn so the agent is aligned with WordStreak standards.
 */

'use strict';

const { readStdinJson, outputJson, isGitRepo, getGitBranch, getGitModifiedFiles, log } = require('../lib/utils');

async function main() {
  const input = await readStdinJson();
  const workspaceRoot = process.cwd();

  const isGit = isGitRepo(workspaceRoot);
  const branch = isGit ? getGitBranch(workspaceRoot) : 'N/A';
  const modifiedFiles = isGit ? getGitModifiedFiles([], workspaceRoot) : [];

  const modifiedSummary =
    modifiedFiles.length > 0
      ? `(${modifiedFiles.length} modified/untracked files: ${modifiedFiles.slice(0, 5).join(', ')}${modifiedFiles.length > 5 ? '...' : ''})`
      : '(Working tree clean)';

  const ephemeralMessage = [
    '### [WordStreak Project Context]',
    `- **Branch**: \`${branch}\` ${modifiedSummary}`,
    '- **Architecture**: Fullstack TypeScript Monorepo (pnpm workspace)',
    '  - `apps/web`: React 19 + TypeScript + Vite + Tailwind/CSS',
    '  - `apps/api`: NestJS 11 + TypeScript + Prisma ORM + PostgreSQL',
    '  - `packages/shared-types`: Workspace shared types & DTOs',
    '- **Workflow Reminder** (from `.agents/AGENTS.md`):',
    '  - Pipeline: Brainstorm (Design) -> Specify -> Plan -> Tasks -> Implement -> Review',
    '  - Mandatory: Check corresponding tech skills in `.agents/skills` before writing code.',
    '  - Quality rules: Immutable data patterns, KISS, DRY, YAGNI, File < 800 lines, Function < 50 lines.',
  ].join('\n');

  log(`Context initialized on branch [${branch}], ${modifiedFiles.length} files active.`);

  outputJson({
    injectSteps: [
      {
        ephemeralMessage,
      },
    ],
  });
}

main().catch((err) => {
  log(`Error initializing session context: ${err.message}`);
  outputJson({ injectSteps: [] });
});
