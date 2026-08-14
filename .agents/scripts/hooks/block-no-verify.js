#!/usr/bin/env node
/**
 * PreToolUse Hook: Block git hook bypass flags (--no-verify, core.hooksPath)
 *
 * Runs before `run_command` in Antigravity.
 * Prevents skipping pre-commit, commit-msg, or pre-push hooks by blocking flags like:
 * --no-verify, git commit -n, or -c core.hooksPath=...
 */

'use strict';

const { readStdinJson, outputJson, log } = require('../lib/utils');

const GIT_COMMANDS_WITH_NO_VERIFY = [
  'commit',
  'push',
  'merge',
  'cherry-pick',
  'rebase',
  'am',
];

const VALID_BEFORE_GIT = ' \t\n\r;&|$`(<{!"\']/.~\\';
const GIT_CONFIG_KEY_PREFIX = 'core.hookspath=';

const COMMIT_OPTIONS_WITH_VALUE = new Set([
  '-m',
  '--message',
  '-F',
  '--file',
  '-C',
  '--reuse-message',
  '-c',
  '--reedit-message',
  '--author',
  '--date',
  '--template',
  '--fixup',
  '--squash',
  '--pathspec-from-file',
]);

const COMMIT_OPTIONS_WITH_INLINE_VALUE = [
  '--message=',
  '--file=',
  '--reuse-message=',
  '--reedit-message=',
  '--author=',
  '--date=',
  '--template=',
  '--fixup=',
  '--squash=',
  '--pathspec-from-file=',
];

const COMMIT_SHORT_OPTIONS_WITH_VALUE = new Set(['m', 'F', 'C', 'c', 't']);

function tokenizeShellWords(input, start = 0, end = input.length) {
  const tokens = [];
  let value = '';
  let tokenStart = null;
  let quote = null;
  let escaped = false;

  function beginToken(index) {
    if (tokenStart === null) {
      tokenStart = index;
    }
  }

  function pushToken(index) {
    if (tokenStart === null) {
      return;
    }

    tokens.push({
      value,
      start: tokenStart,
      end: index,
    });
    value = '';
    tokenStart = null;
  }

  for (let i = start; i < end; i++) {
    const char = input.charAt(i);

    if (escaped) {
      beginToken(i - 1);
      value += char;
      escaped = false;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
        continue;
      }

      if (quote === '"' && char === '\\') {
        beginToken(i);
        escaped = true;
        continue;
      }

      beginToken(i);
      value += char;
      continue;
    }

    if (char === '"' || char === "'") {
      beginToken(i);
      quote = char;
      continue;
    }

    if (char === '\\') {
      beginToken(i);
      escaped = true;
      continue;
    }

    if (/\s/.test(char)) {
      pushToken(i);
      continue;
    }

    beginToken(i);
    value += char;
  }

  if (escaped) {
    value += '\\';
  }
  pushToken(end);

  return tokens;
}

function findCommandSegmentEnd(input, start) {
  let quote = null;
  let escaped = false;

  for (let i = start; i < input.length; i++) {
    const char = input.charAt(i);

    if (escaped) {
      escaped = false;
      continue;
    }

    if (quote) {
      if (quote === '"' && char === '\\') {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === ';' || char === '|' || char === '&' || char === '\n') {
      return i;
    }
  }

  return input.length;
}

function commitOptionConsumesNextValue(value) {
  if (isCommitNoVerifyShortFlag(value)) {
    return false;
  }

  if (COMMIT_OPTIONS_WITH_VALUE.has(value)) {
    return true;
  }

  const shortValueOption = getCommitShortValueOption(value);
  return Boolean(shortValueOption && shortValueOption.consumesNextValue);
}

function commitOptionContainsInlineValue(value) {
  if (isCommitNoVerifyShortFlag(value)) {
    return false;
  }

  if (COMMIT_OPTIONS_WITH_INLINE_VALUE.some(prefix => value.startsWith(prefix))) {
    return true;
  }

  const shortValueOption = getCommitShortValueOption(value);
  return Boolean(shortValueOption && shortValueOption.containsInlineValue);
}

function getCommitShortValueOption(value) {
  if (!value.startsWith('-') || value.startsWith('--') || value === '-') {
    return null;
  }

  const options = value.slice(1);
  for (let i = 0; i < options.length; i++) {
    if (COMMIT_SHORT_OPTIONS_WITH_VALUE.has(options.charAt(i))) {
      return {
        consumesNextValue: i === options.length - 1,
        containsInlineValue: i < options.length - 1,
      };
    }
  }

  return null;
}

function isCommitNoVerifyShortFlag(value) {
  if (!value.startsWith('-') || value.startsWith('--') || value === '-') {
    return false;
  }

  const options = value.slice(1);
  for (let i = 0; i < options.length; i++) {
    const option = options.charAt(i);
    if (option === 'n') return true;
    if (COMMIT_SHORT_OPTIONS_WITH_VALUE.has(option)) return false;
  }

  return false;
}

function isInComment(input, idx) {
  const lineStart = input.lastIndexOf('\n', idx - 1) + 1;
  const before = input.slice(lineStart, idx);
  for (let i = 0; i < before.length; i++) {
    if (before.charAt(i) === '#') {
      const prev = i > 0 ? before.charAt(i - 1) : '';
      if (prev !== '$' && prev !== '\\') return true;
    }
  }
  return false;
}

function findGit(input, start) {
  let pos = start;
  while (pos < input.length) {
    const idx = input.indexOf('git', pos);
    if (idx === -1) return null;

    const isExe = input.slice(idx + 3, idx + 7).toLowerCase() === '.exe';
    const len = isExe ? 7 : 3;
    const after = input[idx + len] || ' ';
    if (!/[\s"']/.test(after)) {
      pos = idx + 1;
      continue;
    }

    const before = idx > 0 ? input[idx - 1] : ' ';
    if (VALID_BEFORE_GIT.includes(before)) return { idx, len };
    pos = idx + 1;
  }
  return null;
}

function detectGitCommand(input, start = 0) {
  while (start < input.length) {
    const git = findGit(input, start);
    if (!git) return null;

    if (isInComment(input, git.idx)) {
      start = git.idx + git.len;
      continue;
    }

    let bestCmd = null;
    let bestIdx = Infinity;

    for (const cmd of GIT_COMMANDS_WITH_NO_VERIFY) {
      let searchPos = git.idx + git.len;
      while (searchPos < input.length) {
        const cmdIdx = input.indexOf(cmd, searchPos);
        if (cmdIdx === -1) break;

        const before = cmdIdx > 0 ? input[cmdIdx - 1] : ' ';
        const after = input[cmdIdx + cmd.length] || ' ';
        if (!/\s/.test(before)) { searchPos = cmdIdx + 1; continue; }
        if (!/[\s;&#|>)\]}"']/.test(after) && after !== '') { searchPos = cmdIdx + 1; continue; }
        if (/[;|]/.test(input.slice(git.idx + git.len, cmdIdx))) break;
        if (isInComment(input, cmdIdx)) { searchPos = cmdIdx + 1; continue; }

        const gap = input.slice(git.idx + git.len, cmdIdx);
        const tokens = gap.trim().split(/\s+/).filter(Boolean);
        let onlyFlagsAndArgs = true;
        let expectFlagArg = false;
        for (const t of tokens) {
          if (expectFlagArg) { expectFlagArg = false; continue; }
          if (t.startsWith('-')) {
            if (t === '-c' || t === '-C' || t === '--work-tree' || t === '--git-dir' ||
                t === '--namespace' || t === '--super-prefix') {
              expectFlagArg = true;
            }
            continue;
          }
          onlyFlagsAndArgs = false;
          break;
        }
        if (!onlyFlagsAndArgs) { searchPos = cmdIdx + 1; continue; }

        if (cmdIdx < bestIdx) {
          bestIdx = cmdIdx;
          bestCmd = cmd;
        }
        break;
      }
    }

    if (bestCmd) {
      return {
        command: bestCmd,
        offset: bestIdx + bestCmd.length,
        gitStart: git.idx,
        gitEnd: git.idx + git.len,
        commandStart: bestIdx,
      };
    }

    start = git.idx + git.len;
  }
  return null;
}

function hasNoVerifyFlag(input, command, offset) {
  const segmentEnd = findCommandSegmentEnd(input, offset);
  const tokens = tokenizeShellWords(input, offset, segmentEnd);
  let skipNext = false;

  for (const token of tokens) {
    const value = token.value;

    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (value === '--') {
      break;
    }

    if (command === 'commit') {
      if (commitOptionConsumesNextValue(value)) {
        skipNext = true;
        continue;
      }

      if (commitOptionContainsInlineValue(value)) {
        continue;
      }
    }

    if (value === '--no-verify') return true;

    if (command === 'commit' && isCommitNoVerifyShortFlag(value)) {
      return true;
    }
  }

  return false;
}

function hasHooksPathOverride(input, detected) {
  const tokens = tokenizeShellWords(input, detected.gitEnd, detected.commandStart);

  for (let i = 0; i < tokens.length; i++) {
    const value = tokens[i].value;
    const lowered = value.toLowerCase();

    if (value === '-c') {
      const next = tokens[i + 1] && tokens[i + 1].value;
      if (typeof next === 'string' && next.toLowerCase().startsWith(GIT_CONFIG_KEY_PREFIX)) {
        return true;
      }
      i++;
      continue;
    }

    if (lowered.startsWith(`-c${GIT_CONFIG_KEY_PREFIX}`)) {
      return true;
    }
  }

  return false;
}

function checkCommand(input) {
  let start = 0;

  while (start < input.length) {
    const detected = detectGitCommand(input, start);
    if (!detected) return { blocked: false };

    const { command: gitCommand, offset } = detected;

    if (hasHooksPathOverride(input, detected)) {
      return {
        blocked: true,
        reason: `BLOCKED: Overriding core.hooksPath is forbidden with git ${gitCommand}. Git hooks must not be bypassed.`,
      };
    }

    if (hasNoVerifyFlag(input, gitCommand, offset)) {
      return {
        blocked: true,
        reason: `BLOCKED: --no-verify flag is forbidden with git ${gitCommand}. Git hooks and checks must not be bypassed.`,
      };
    }

    start = findCommandSegmentEnd(input, offset) + 1;
  }

  return { blocked: false };
}

async function main() {
  const input = await readStdinJson();
  const toolCall = input.toolCall || {};
  const toolName = toolCall.name || '';
  const args = toolCall.args || {};
  const commandLine = args.CommandLine || args.command || input.command || '';

  if (toolName !== 'run_command' && !commandLine) {
    return outputJson({ decision: 'allow' });
  }

  const result = checkCommand(commandLine);

  if (result.blocked) {
    log(result.reason);
    return outputJson({
      decision: 'deny',
      reason: result.reason,
    });
  }

  outputJson({ decision: 'allow' });
}

main().catch((err) => {
  log(`Error in block-no-verify: ${err.message}`);
  outputJson({ decision: 'allow' });
});