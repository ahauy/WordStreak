#!/usr/bin/env node
/**
 * PostInvocation Hook - Check for leftover console.log statements
 *
 * Runs after invocation finishes in Antigravity.
 * Scans modified TS/JS files in the workspace (excluding tests, configs, scripts).
 * Injects an ephemeral warning step if debug logs remain.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdinJson, outputJson, isGitRepo, getGitModifiedFiles, readFileSafe, log } = require('../lib/utils');

const EXCLUDED_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.config\.[jt]s$/,
  /[/\\]scripts[/\\]/,
  /[/\\]\.agents[/\\]/,
  /__tests__/,
  /__mocks__/,
];

async function main() {
  await readStdinJson();

  if (!isGitRepo()) {
    return outputJson({ injectSteps: [] });
  }

  const modifiedFiles = getGitModifiedFiles(['\\.tsx?$', '\\.jsx?$'])
    .filter((f) => fs.existsSync(f))
    .filter((f) => !EXCLUDED_PATTERNS.some((pattern) => pattern.test(f)));

  const filesWithConsole = [];

  for (const file of modifiedFiles) {
    const content = readFileSafe(file);
    if (content && /console\.log\s*\(/g.test(content)) {
      filesWithConsole.push(file);
    }
  }

  if (filesWithConsole.length > 0) {
    const list = filesWithConsole.map((f) => `  - \`${f}\``).join('\n');
    log(`Found leftover console.log in ${filesWithConsole.length} file(s).`);

    return outputJson({
      injectSteps: [
        {
          ephemeralMessage: [
            '### [Code Quality Reminder]',
            `Found leftover \`console.log\` statements in modified files:`,
            list,
            'Please remove or replace debug statements with proper loggers before committing or submitting.',
          ].join('\n'),
        },
      ],
    });
  }

  outputJson({ injectSteps: [] });
}

main().catch((err) => {
  log(`Error checking console.log: ${err.message}`);
  outputJson({ injectSteps: [] });
});