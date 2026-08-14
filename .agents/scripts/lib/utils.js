'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MAX_STDIN = 2 * 1024 * 1024; // 2MB

/**
 * Read and parse JSON from stdin with timeout/safety.
 */
function readStdinJson(maxBytes = MAX_STDIN) {
  return new Promise((resolve) => {
    let data = '';
    let truncated = false;

    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      if (data.length < maxBytes) {
        const remaining = maxBytes - data.length;
        data += chunk.substring(0, remaining);
        if (chunk.length > remaining) truncated = true;
      } else {
        truncated = true;
      }
    });

    process.stdin.on('end', () => {
      if (!data.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        resolve({ _raw: data, _parseError: err.message, _truncated: truncated });
      }
    });

    process.stdin.on('error', () => {
      resolve({});
    });
  });
}

/**
 * Write JSON object to stdout.
 */
function outputJson(data) {
  process.stdout.write(JSON.stringify(data, null, 2) + '\n');
}

/**
 * Log message to stderr.
 */
function log(msg) {
  process.stderr.write(`[WordStreak Hook] ${msg}\n`);
}

/**
 * Check if the given directory is inside a git repository.
 */
function isGitRepo(cwd = process.cwd()) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current git branch name.
 */
function getGitBranch(cwd = process.cwd()) {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get list of modified/staged/untracked files matching optional regex patterns.
 */
function getGitModifiedFiles(patterns = [], cwd = process.cwd()) {
  if (!isGitRepo(cwd)) return [];
  try {
    const output = execSync('git status --porcelain', { cwd, encoding: 'utf8' });
    const lines = output.split('\n').filter(Boolean);
    const files = [];

    for (const line of lines) {
      if (line.length < 4) continue;
      const rawPath = line.substring(3).trim();
      const filePath = rawPath.includes(' -> ') ? rawPath.split(' -> ')[1].trim() : rawPath;

      if (patterns.length > 0) {
        const matches = patterns.some((p) => {
          const reg = typeof p === 'string' ? new RegExp(p) : p;
          return reg.test(filePath);
        });
        if (!matches) continue;
      }

      files.push(filePath);
    }

    return Array.from(new Set(files));
  } catch {
    return [];
  }
}

/**
 * Read text content of a file safely.
 */
function readFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Write content to file, creating parent directories if needed.
 */
function writeFileSafe(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the project workspace root (where package.json and .agents reside).
 */
function resolveWorkspaceRoot() {
  let curr = process.cwd();
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, '.agents')) || fs.existsSync(path.join(curr, 'pnpm-workspace.yaml'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

/**
 * Extract target file path from Antigravity tool call input.
 */
function extractTargetFilePath(input) {
  const toolCall = input?.toolCall || {};
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

/**
 * Extract command line from Antigravity tool call input.
 */
function extractCommandLine(input) {
  const toolCall = input?.toolCall || {};
  const args = toolCall.args || {};
  return args.CommandLine || args.command || input?.command || '';
}

/**
 * Extract content payload from Antigravity write/replace tool calls.
 */
function extractToolContent(input) {
  const toolCall = input?.toolCall || {};
  const args = toolCall.args || {};
  let content = '';

  if (args.CodeContent) content += args.CodeContent + '\n';
  if (args.ReplacementContent) content += args.ReplacementContent + '\n';
  if (Array.isArray(args.ReplacementChunks)) {
    for (const chunk of args.ReplacementChunks) {
      if (chunk.ReplacementContent) content += chunk.ReplacementContent + '\n';
    }
  }

  return content;
}

module.exports = {
  readStdinJson,
  outputJson,
  log,
  isGitRepo,
  getGitBranch,
  getGitModifiedFiles,
  readFileSafe,
  writeFileSafe,
  resolveWorkspaceRoot,
  extractTargetFilePath,
  extractCommandLine,
  extractToolContent,
};
