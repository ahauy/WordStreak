#!/usr/bin/env node
/**
 * PreInvocation Hook - WordStreak Project Context Initializer
 *
 * Runs before the model is called in Antigravity.
 * Injects project context, git status, active tech stack, and mandatory development
 * guidelines into the conversation turn so the agent is aligned with WordStreak standards.
 * Also tracks 5-hour rolling window usage (Gemini Quota Pool) and provides early warnings.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { readStdinJson, outputJson, isGitRepo, getGitBranch, getGitModifiedFiles, log } = require('../lib/utils');

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
const LEDGER_PATH = '/tmp/wordstreak-5h-quota-ledger.json';
const SOFT_TURN_LIMIT = parseInt(process.env.WORDSTREAK_5H_TURN_LIMIT || '150', 10);
const SOFT_ACTIVE_TOKEN_LIMIT = parseInt(process.env.WORDSTREAK_5H_TOKEN_LIMIT || '2000000', 10);

function loadLedger() {
  try {
    if (fs.existsSync(LEDGER_PATH)) {
      const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') {
        return data.entries || data;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

function saveLedger(ledger) {
  try {
    fs.writeFileSync(
      LEDGER_PATH,
      JSON.stringify({ entries: ledger, lastUpdated: Date.now() }, null, 2),
      'utf8'
    );
  } catch {
    // ignore
  }
}

function pruneLedger(ledger, now) {
  const pruned = {};
  for (const [key, item] of Object.entries(ledger)) {
    if (item && item.ts && item.ts >= now - FIVE_HOURS_MS) {
      pruned[key] = item;
    }
  }
  return pruned;
}

function processTranscriptFile(filePath, ledger, now) {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.mtimeMs < now - FIVE_HOURS_MS) return;

    const convId = path.basename(path.dirname(filePath)) || 'session';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'PLANNER_RESPONSE' && obj.created_at) {
          const ts = new Date(obj.created_at).getTime();
          if (!isNaN(ts) && ts >= now - FIVE_HOURS_MS) {
            const stepIndex = obj.step_index !== undefined ? obj.step_index : (obj.stepIndex !== undefined ? obj.stepIndex : 0);
            const id = `${convId}:${stepIndex}`;
            ledger[id] = {
              id,
              ts,
              inputTokens: obj.input_tokens || obj.inputTokens || 0,
              cacheTokens: obj.cache_read_tokens || obj.cacheTokens || 0,
              outputTokens: obj.output_tokens || obj.outputTokens || 0,
            };
          }
        }
      } catch {
        // ignore parse error on malformed line
      }
    }
  } catch {
    // ignore file read error
  }
}

function syncTranscripts(input, ledger, now) {
  const filesToScan = new Set();

  if (input && input.transcriptPath) {
    filesToScan.add(input.transcriptPath);
    try {
      const rootDir = path.dirname(path.dirname(path.dirname(input.transcriptPath)));
      function scan(dir, depth) {
        if (depth > 3) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            scan(path.join(dir, entry.name), depth + 1);
          } else if (entry.isFile() && entry.name === 'transcript.jsonl') {
            filesToScan.add(path.join(dir, entry.name));
          }
        }
      }
      scan(rootDir, 0);
    } catch {
      // restricted in sandbox, falls back to input.transcriptPath + ledger
    }
  }

  for (const file of filesToScan) {
    processTranscriptFile(file, ledger, now);
  }
}

function calculate5hQuota(ledger, now) {
  const entries = Object.values(ledger);
  const turns = entries.length;
  let activeTokens = 0;
  let cacheTokens = 0;
  let windowStartMs = now;

  for (const entry of entries) {
    activeTokens += (entry.inputTokens || 0) + (entry.outputTokens || 0);
    cacheTokens += (entry.cacheTokens || 0);
    if (entry.ts < windowStartMs) {
      windowStartMs = entry.ts;
    }
  }

  if (turns === 0) {
    windowStartMs = now;
  }

  const resetAtMs = windowStartMs + FIVE_HOURS_MS;
  const remainingMinutes = Math.max(0, Math.ceil((resetAtMs - now) / 60000));
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  const resetDate = new Date(resetAtMs);
  const resetHours = String(resetDate.getHours()).padStart(2, '0');
  const resetMins = String(resetDate.getMinutes()).padStart(2, '0');
  const resetTimeFormatted = `${resetHours}:${resetMins}`;

  const usagePct = Math.min(
    100,
    Math.round(
      Math.max(
        (turns / SOFT_TURN_LIMIT) * 100,
        (activeTokens / SOFT_ACTIVE_TOKEN_LIMIT) * 100
      )
    )
  );

  let statusBadge = '🟢 OK';
  if (usagePct >= 90) {
    statusBadge = '🔴 CRITICAL';
  } else if (usagePct >= 75) {
    statusBadge = '🟡 WARNING';
  }

  return {
    turns,
    activeTokens,
    cacheTokens,
    windowStartMs,
    resetAtMs,
    remainingMinutes,
    hours,
    mins,
    resetTimeFormatted,
    usagePct,
    statusBadge,
  };
}

function runStatusCli() {
  const now = Date.now();
  let ledger = loadLedger();
  ledger = pruneLedger(ledger, now);
  saveLedger(ledger);
  const quota = calculate5hQuota(ledger, now);

  console.log('============================================================');
  console.log('WordStreak 5-Hour Rolling Quota Pool Status');
  console.log('============================================================');
  console.log(`Status:            ${quota.statusBadge} (~${quota.usagePct}% estimated capacity)`);
  console.log(`Active Turns:      ${quota.turns} / ${SOFT_TURN_LIMIT}`);
  console.log(`Active Tokens:     ${Math.round(quota.activeTokens / 1000)}k / ${Math.round(SOFT_ACTIVE_TOKEN_LIMIT / 1000)}k (${quota.activeTokens.toLocaleString()} tokens)`);
  console.log(`Cached Tokens:     +${Math.round(quota.cacheTokens / 1000)}k (${quota.cacheTokens.toLocaleString()} tokens)`);
  console.log(`Rolling Window:    Last 5 hours`);
  console.log(`Next Reset:        ${quota.resetTimeFormatted} (in ${quota.hours}h ${quota.mins}m)`);
  console.log(`Ledger Path:       ${LEDGER_PATH}`);
  console.log('============================================================');
  process.exit(0);
}

async function main() {
  const input = await readStdinJson();
  const workspaceRoot = process.cwd();
  const now = Date.now();

  let ledger = loadLedger();
  syncTranscripts(input, ledger, now);
  ledger = pruneLedger(ledger, now);
  saveLedger(ledger);

  const quota = calculate5hQuota(ledger, now);

  const isGit = isGitRepo(workspaceRoot);
  const branch = isGit ? getGitBranch(workspaceRoot) : 'N/A';
  const modifiedFiles = isGit ? getGitModifiedFiles([], workspaceRoot) : [];

  const modifiedSummary =
    modifiedFiles.length > 0
      ? `(${modifiedFiles.length} modified/untracked files: ${modifiedFiles.slice(0, 5).join(', ')}${modifiedFiles.length > 5 ? '...' : ''})`
      : '(Working tree clean)';

  const poolMonitorLines = [
    `- **5h Pool Monitor**: ${quota.statusBadge} ~${quota.usagePct}% estimated 5h pool used (${quota.turns}/${SOFT_TURN_LIMIT} turns, ${Math.round(quota.activeTokens / 1000)}k/${Math.round(SOFT_ACTIVE_TOKEN_LIMIT / 1000)}k active tokens, +${Math.round(quota.cacheTokens / 1000)}k cached) — Resets at ${quota.resetTimeFormatted} (in ${quota.hours}h ${quota.mins}m)`,
  ];

  if (quota.usagePct >= 75) {
    poolMonitorLines.push(
      `  ⚠️ MANDATORY QUOTA ALERT: 5h pool usage is at ${quota.usagePct}%. You MUST display a warning banner at the top of your response to inform the user that the 5h limit is approaching (${quota.hours}h ${quota.mins}m until reset at ${quota.resetTimeFormatted}) and suggest delegating to flash/flash_lite or scheduling a resume timer.`
    );
  }

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
    ...poolMonitorLines,
  ].join('\n');

  log(`Context initialized on branch [${branch}], ${modifiedFiles.length} files active. 5h Pool: ${quota.statusBadge} (${quota.usagePct}%, ${quota.turns} turns, resets at ${quota.resetTimeFormatted}).`);

  outputJson({
    injectSteps: [
      {
        ephemeralMessage,
      },
    ],
  });
}

if (process.argv.includes('--status')) {
  runStatusCli();
} else {
  main().catch((err) => {
    log(`Error initializing session context: ${err.message}`);
    outputJson({ injectSteps: [] });
  });
}
