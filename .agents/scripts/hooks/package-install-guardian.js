#!/usr/bin/env node
/**
 * PreToolUse Hook - Package Manager Guardian
 *
 * Runs before `run_command` in Antigravity.
 * Prevents running `npm install`, `npm i`, `yarn add`, etc. in this pnpm monorepo,
 * which would corrupt the lockfile and create stray package-lock.json/yarn.lock files.
 */

'use strict';

const { readStdinJson, outputJson, extractCommandLine, log } = require('../lib/utils');

const FORBIDDEN_PM_PATTERNS = [
  {
    pattern: /(?:^|[;&|`]\s*)npm\s+(?:install|i|add)\b/i,
    replacement: 'pnpm add <package> --filter <apps/web | apps/api | packages/shared-types>',
  },
  {
    pattern: /(?:^|[;&|`]\s*)yarn(?:\s+add|\s+install)?\b/i,
    replacement: 'pnpm add <package> --filter <apps/web | apps/api | packages/shared-types>',
  },
  {
    pattern: /(?:^|[;&|`]\s*)bun\s+(?:add|install)\b/i,
    replacement: 'pnpm add <package> --filter <apps/web | apps/api | packages/shared-types>',
  },
];

async function main() {
  const input = await readStdinJson();
  const commandLine = extractCommandLine(input);

  if (!commandLine) {
    return outputJson({ decision: 'allow' });
  }

  for (const { pattern, replacement } of FORBIDDEN_PM_PATTERNS) {
    if (pattern.test(commandLine.trim())) {
      const reason = [
        'BLOCKED: Detected non-pnpm package installation command in WordStreak pnpm monorepo.',
        '',
        'Please use pnpm workspace commands instead:',
        `  - To add a dependency: ${replacement}`,
        '  - To install all dependencies: pnpm install',
      ].join('\n');

      log(`Blocked non-pnpm command: "${commandLine}"`);
      return outputJson({
        decision: 'deny',
        reason,
      });
    }
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in package-install-guardian: ${err.message}`);
  outputJson({ decision: 'allow' });
});
