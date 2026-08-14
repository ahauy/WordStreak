#!/usr/bin/env node
/**
 * PreToolUse Hook - Secret & Credential Leak Blocker
 *
 * Runs before `write_to_file`, `replace_file_content`, `multi_replace_file_content`.
 * Scans newly inserted code for hardcoded secrets, private keys, live API tokens,
 * and database passwords before they are written to disk.
 */

'use strict';

const path = require('path');
const {
  readStdinJson,
  outputJson,
  extractTargetFilePath,
  extractToolContent,
  log,
} = require('../lib/utils');

const SECRET_PATTERNS = [
  {
    name: 'Private Cryptographic Key',
    pattern: /-----BEGIN\s+(?:[A-Z0-9_-]+\s+)?PRIVATE\s+KEY-----/i,
  },
  {
    name: 'AWS Access Key ID',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{82}\b/,
  },
  {
    name: 'Stripe Live Secret Key',
    pattern: /\bsk_live_[0-9a-zA-Z]{24,}\b/,
  },
  {
    name: 'Slack / Discord Webhook / Bot Token',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9A-Za-z]+|https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+/,
  },
  {
    name: 'Hardcoded Database Password in Connection URI',
    pattern: /postgres(?:ql)?:\/\/(?!postgres:[^@]*@localhost)[a-zA-Z0-9_]+:[^@\s"']{4,}@[a-zA-Z0-9_.-]+:\d+\//i,
  },
];

const ALLOWED_SECRET_FILES = [
  /\.env\.example$/i,
  /\.mock\.[jt]sx?$/i,
  /\.spec\.[jt]sx?$/i,
  /\.test\.[jt]sx?$/i,
  /__fixtures__/,
  /__mocks__/,
];

async function main() {
  const input = await readStdinJson();
  const filePath = extractTargetFilePath(input);
  const content = extractToolContent(input);

  if (!filePath || !content) {
    return outputJson({ decision: 'allow' });
  }

  // Skip files explicitly designed for fake/example secrets
  const isAllowedFile = ALLOWED_SECRET_FILES.some((pattern) => pattern.test(filePath));
  if (isAllowedFile) {
    return outputJson({ decision: 'allow' });
  }

  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      const relPath = path.relative(process.cwd(), filePath);
      const reason = [
        `BLOCKED: Potential sensitive secret leak detected (${name}) in '${relPath}'.`,
        'Never hardcode private keys, database credentials, or live API tokens into source files.',
        'Use environment variables (.env / ConfigService / process.env) instead.',
      ].join(' ');

      log(`Blocked sensitive secret in '${relPath}': ${name}`);
      return outputJson({
        decision: 'deny',
        reason,
      });
    }
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in secret-leak-blocker: ${err.message}`);
  outputJson({ decision: 'allow' });
});
