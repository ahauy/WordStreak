#!/usr/bin/env node
/**
 * PreToolUse Hook - Prevent Direct Commits to Main Branch
 *
 * Runs before `run_command` in Antigravity.
 * Reminds developers and AI agents to work on feature branches (feat/..., fix/...)
 * instead of committing directly to `main` (per .agents/AGENTS.md).
 */

'use strict';

const {
  readStdinJson,
  outputJson,
  extractCommandLine,
  isGitRepo,
  getGitBranch,
  log,
} = require('../lib/utils');

function isGitCommitCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') return false;
  return /(?:^|[;&|`]\s*)(?:git(?:\.exe)?)\s+commit\b/i.test(cmd.trim());
}

async function main() {
  const input = await readStdinJson();
  const commandLine = extractCommandLine(input);

  if (!isGitCommitCommand(commandLine)) {
    return outputJson({ decision: 'allow' });
  }

  if (!isGitRepo()) {
    return outputJson({ decision: 'allow' });
  }

  const currentBranch = getGitBranch();
  const isMainBranch = currentBranch === 'main' || currentBranch === 'master';

  if (isMainBranch) {
    if (process.env.ALLOW_MAIN_COMMIT === '1') {
      log(`ALLOW_MAIN_COMMIT=1 is active. Allowing commit to ${currentBranch}.`);
      return outputJson({ decision: 'allow' });
    }

    const reason = [
      `BLOCKED: Direct commits to '${currentBranch}' branch are restricted by WordStreak workflow (.agents/AGENTS.md).`,
      '',
      'Please create a dedicated feature or bugfix branch before committing your changes:',
      '  git checkout -b feat/<feature-name>',
      '  git checkout -b fix/<bug-name>',
      '',
      '(To override in special maintenance cases, set ALLOW_MAIN_COMMIT=1).',
    ].join('\n');

    log(`Blocked direct commit to protected branch: ${currentBranch}`);
    return outputJson({
      decision: 'deny',
      reason,
    });
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in prevent-direct-main-commit: ${err.message}`);
  outputJson({ decision: 'allow' });
});
