#!/usr/bin/env node
/**
 * PreToolUse Hook - Config Protection
 *
 * Runs before `write_to_file`, `replace_file_content`, `multi_replace_file_content` in Antigravity.
 * Blocks modifications to existing linter, formatter, compiler, and workspace config files.
 * Ensures the agent fixes code defects rather than weakening project configs.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdinJson, outputJson, log } = require('../lib/utils');

const PROTECTED_FILES = new Set([
  // ESLint
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
  // Prettier
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  // Biome
  'biome.json',
  'biome.jsonc',
  // TypeScript & Monorepo
  'tsconfig.base.json',
  'pnpm-workspace.yaml',
  // Container & Environment
  'docker-compose.yml',
  '.dockerignore',
]);

function extractTargetFilePath(toolCall) {
  const args = toolCall.args || {};
  return (
    args.TargetFile ||
    args.target_file ||
    args.FilePath ||
    args.file_path ||
    args.path ||
    ''
  );
}

async function main() {
  const input = await readStdinJson();
  const toolCall = input.toolCall || {};
  const filePath = extractTargetFilePath(toolCall);

  if (!filePath) {
    return outputJson({ decision: 'allow' });
  }

  const basename = path.basename(filePath);
  const normalizedBasename = basename.toLowerCase();

  const isProtected =
    PROTECTED_FILES.has(basename) ||
    PROTECTED_FILES.has(normalizedBasename);

  if (isProtected) {
    // Check if the file already exists on disk
    let exists = false;
    try {
      fs.lstatSync(filePath);
      exists = true;
    } catch (err) {
      if (err && err.code !== 'ENOENT') {
        exists = true;
      }
    }

    if (exists) {
      const reason = [
        `BLOCKED: Modifying '${basename}' is forbidden by project config protection.`,
        'Fix the application source code to satisfy linter, typecheck, or formatting rules instead of weakening config files.',
      ].join(' ');

      log(`Blocked attempt to modify protected config: ${basename}`);
      return outputJson({
        decision: 'deny',
        reason,
      });
    }
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in config-protection hook: ${err.message}`);
  outputJson({ decision: 'allow' });
});