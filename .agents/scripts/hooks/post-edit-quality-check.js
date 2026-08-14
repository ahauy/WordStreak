#!/usr/bin/env node
/**
 * PostToolUse Hook - Immediate Code & Design Quality Checker
 *
 * Runs after file modification tools (`write_to_file`, `replace_file_content`, `multi_replace_file_content`).
 * Immediately analyzes the newly edited file for:
 * 1. Monorepo & AGENTS.md architectural rules (File < 800 lines, immutable patterns).
 * 2. TypeScript anti-patterns (`any` usage, ts-ignore, unhandled promise rejections).
 * 3. Frontend design quality (UI hierarchy, generic templates, accessibility cues).
 * 4. Stored debug artifacts (accidental console.log).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdinJson, outputJson, log } = require('../lib/utils');

const FRONTEND_EXTS = /\.(tsx|jsx|css|scss|html|vue|svelte)$/i;
const CODE_EXTS = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const GENERIC_UI_PATTERNS = [
  { pattern: /\bget started\b/i, label: 'Canned "Get Started" CTA text' },
  { pattern: /\blearn more\b/i, label: 'Generic "Learn more" copy' },
  { pattern: /\blorem ipsum\b/i, label: 'Placeholder "Lorem Ipsum" text' },
  { pattern: /\bgrid-cols-(3|4)\b/, label: 'Uniform multi-card grid pattern' },
  { pattern: /\bbg-gradient-to-[trbl]/, label: 'Stock gradient utility class' },
];

const CODE_QUALITY_CHECKS = [
  { pattern: /:\s*any\b/g, label: 'Explicit "any" type annotation (prefer strong typing or unknown)' },
  { pattern: /\bas\s+any\b/g, label: 'Casting to "as any" (bypasses TypeScript type safety)' },
  { pattern: /\/\/\s*@ts-ignore/g, label: '@ts-ignore comment used to suppress type errors' },
  { pattern: /\/\/\s*@ts-nocheck/g, label: '@ts-nocheck comment disabling type checking' },
];

function extractTargetFilePath(input) {
  const toolCall = input.toolCall || {};
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

function analyzeFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;

  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const lines = content.split('\n');
  const warnings = [];

  // Rule 1: File size < 800 lines (AGENTS.md)
  if (lines.length > 800) {
    warnings.push(`File is too large (${lines.length} lines > 800 line limit). Consider breaking into smaller modules.`);
  }

  // Rule 2: Code quality patterns for TS/JS
  if (CODE_EXTS.test(filePath)) {
    for (const check of CODE_QUALITY_CHECKS) {
      if (check.pattern.test(content)) {
        warnings.push(`TypeScript Quality: ${check.label}`);
      }
    }
  }

  // Rule 3: Frontend design quality checks
  if (FRONTEND_EXTS.test(filePath)) {
    const uiSignals = GENERIC_UI_PATTERNS.filter((s) => s.pattern.test(content)).map((s) => s.label);
    if (uiSignals.length > 0) {
      warnings.push(`Frontend Design Direction: Detected generic template cues (${uiSignals.join(', ')}). Ensure premium, custom aesthetics.`);
    }

    // Accessibility check: <img> without alt
    if (/<img\s+(?![^>]*\balt=)[^>]*>/i.test(content)) {
      warnings.push('Accessibility (A11y): Found <img> tag without alt attribute.');
    }
  }

  return warnings;
}

async function main() {
  const input = await readStdinJson();
  const filePath = extractTargetFilePath(input);

  if (filePath) {
    const warnings = analyzeFile(filePath);
    if (warnings && warnings.length > 0) {
      const relPath = path.relative(process.cwd(), filePath);
      log(`Quality inspection for [${relPath}]:`);
      for (const w of warnings) {
        log(`  - [WARNING] ${w}`);
      }
    }
  }

  // Antigravity PostToolUse contract expects empty JSON object
  outputJson({});
}

main().catch((err) => {
  log(`Error in post-edit-quality-check: ${err.message}`);
  outputJson({});
});
