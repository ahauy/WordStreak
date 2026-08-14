#!/usr/bin/env node
/**
 * PostToolUse Hook - Auto-Format with Prettier
 *
 * Runs after `write_to_file`, `replace_file_content`, `multi_replace_file_content`.
 * Automatically formats the modified file using Prettier so the code remains
 * consistent and clean without needing manual format commands.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  readStdinJson,
  outputJson,
  extractTargetFilePath,
  resolveWorkspaceRoot,
  log,
} = require('../lib/utils');

const FORMATTABLE_EXTENSIONS = /\.(tsx?|jsx?|json|css|scss|md)$/i;

async function main() {
  const input = await readStdinJson();
  const filePath = extractTargetFilePath(input);

  if (filePath && fs.existsSync(filePath) && FORMATTABLE_EXTENSIONS.test(filePath)) {
    try {
      const workspaceRoot = resolveWorkspaceRoot();
      // Run prettier with relative or quoted path
      execSync(`npx prettier --write "${filePath}"`, {
        cwd: workspaceRoot,
        stdio: 'pipe',
        timeout: 15000,
      });
      const relPath = path.relative(workspaceRoot, filePath);
      log(`Auto-formatted with Prettier: ${relPath}`);
    } catch (err) {
      // Don't fail the hook if Prettier is busy or has a syntax parse issue
      log(`Prettier auto-format skipped: ${err.message}`);
    }
  }

  outputJson({});
}

main().catch((err) => {
  log(`Error in auto-format-on-edit: ${err.message}`);
  outputJson({});
});
