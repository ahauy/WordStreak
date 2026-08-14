#!/usr/bin/env node
/**
 * Lifecycle Hook - Prisma Database Safety & Schema Sync Guard
 *
 * 1. PreToolUse on `run_command`:
 *    Blocks destructive database operations (`prisma migrate reset`, `prisma db push --force-reset`)
 *    to prevent accidental local database data wipes.
 *
 * 2. PostToolUse on file editing tools:
 *    Detects modifications to `schema.prisma` and runs `pnpm --filter api prisma generate`
 *    (or outputs a sync reminder) to keep the generated client types up to date.
 */

'use strict';

const { execSync } = require('child_process');
const {
  readStdinJson,
  outputJson,
  extractCommandLine,
  extractTargetFilePath,
  resolveWorkspaceRoot,
  log,
} = require('../lib/utils');

const DESTRUCTIVE_PRISMA_COMMANDS = [
  /prisma\s+migrate\s+reset\b/i,
  /prisma\s+db\s+push\s+.*--force-reset\b/i,
  /prisma\s+db\s+push\s+.*--accept-data-loss\b/i,
];

async function main() {
  const input = await readStdinJson();
  const toolName = input?.toolCall?.name || '';
  const commandLine = extractCommandLine(input);
  const filePath = extractTargetFilePath(input);

  // 1. PreToolUse check for destructive Prisma commands
  if (toolName === 'run_command' && commandLine) {
    for (const pattern of DESTRUCTIVE_PRISMA_COMMANDS) {
      if (pattern.test(commandLine)) {
        if (process.env.ALLOW_PRISMA_RESET === '1') {
          log('ALLOW_PRISMA_RESET=1 set. Allowing destructive Prisma command.');
          return outputJson({ decision: 'allow' });
        }

        const reason = [
          `BLOCKED: Potentially destructive Prisma command detected: "${commandLine}".`,
          'This command will reset the database and delete all existing data.',
          'If this is intentional, use regular non-destructive migrations (`prisma migrate dev`) or set ALLOW_PRISMA_RESET=1.',
        ].join(' ');

        log(`Blocked destructive Prisma command: ${commandLine}`);
        return outputJson({
          decision: 'deny',
          reason,
        });
      }
    }

    return outputJson({ decision: 'allow' });
  }

  // 2. PostToolUse check for schema.prisma modifications
  if (filePath && /schema\.prisma$/i.test(filePath)) {
    log('Detected schema.prisma modification. Syncing Prisma client...');
    try {
      const root = resolveWorkspaceRoot();
      execSync('pnpm --filter api prisma generate', {
        cwd: root,
        stdio: 'pipe',
        timeout: 30000,
      });
      log('Prisma client generated successfully.');
    } catch (err) {
      log(`Note: Prisma client auto-generate skipped or failed: ${err.message}. Remember to run 'pnpm --filter api prisma generate' when database is ready.`);
    }

    return outputJson({});
  }

  // Default response
  if (toolName === 'run_command') {
    outputJson({ decision: 'allow' });
  } else {
    outputJson({});
  }
}

main().catch((err) => {
  log(`Error in prisma-safety-guard: ${err.message}`);
  outputJson({});
});
