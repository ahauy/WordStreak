#!/usr/bin/env node
/**
 * PreToolUse Hook - Enforce Conventional Commits
 *
 * Runs before `run_command` in Antigravity.
 * Intercepts `git commit` and ensures the commit message adheres to the
 * Conventional Commits specification (e.g. feat:, fix:, refactor:, test:, chore:).
 */

'use strict';

const { readStdinJson, outputJson, extractCommandLine, log } = require('../lib/utils');

const CONVENTIONAL_COMMIT_REGEX = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-zA-Z0-9_\-/\s]+\))?(!)?:\s+[^\s].{2,}/;

function extractCommitMessage(commandLine) {
  if (!commandLine || typeof commandLine !== 'string') return null;

  // Match git commit commands
  const gitCommitMatch = /(?:^|[;&|`]\s*)(?:git(?:\.exe)?)\s+commit\b/i.test(commandLine);
  if (!gitCommitMatch) return null;

  // Extract -m "message" or --message="message" or -m 'message'
  const match = commandLine.match(/(?:-m|--message=)\s*["']([^"']+)["']/);
  if (match) {
    return match[1].trim();
  }

  // Handle single word without quotes like -m message
  const unquotedMatch = commandLine.match(/(?:-m|--message)\s+([^\s;&|]+)/);
  if (unquotedMatch) {
    return unquotedMatch[1].trim();
  }

  return null;
}

async function main() {
  const input = await readStdinJson();
  const commandLine = extractCommandLine(input);
  const commitMessage = extractCommitMessage(commandLine);

  if (!commitMessage) {
    // Not a git commit -m command, allow through
    return outputJson({ decision: 'allow' });
  }

  const isValid = CONVENTIONAL_COMMIT_REGEX.test(commitMessage);

  if (!isValid) {
    const reason = [
      `BLOCKED: Commit message "${commitMessage}" violates Conventional Commits standards.`,
      '',
      'Standard format: <type>(<scope>): <subject>',
      'Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert',
      '',
      'Examples of valid commit messages:',
      '  - feat(auth): add user login and registration endpoints',
      '  - fix(web): resolve word card layout overflow on mobile screens',
      '  - refactor(api): extract vocabulary score calculation service',
      '  - test(api): add unit tests for word streak counter',
    ].join('\n');

    log(`Blocked invalid commit message: "${commitMessage}"`);
    return outputJson({
      decision: 'deny',
      reason,
    });
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in enforce-commit-convention: ${err.message}`);
  outputJson({ decision: 'allow' });
});
