#!/usr/bin/env node
/**
 * PreToolUse Hook - Pre-Push Verification Check
 *
 * Runs before `run_command` in Antigravity.
 * If the command is a `git push`, runs automated project build/test checks first.
 * If checks fail, blocks the command and prompts the agent to fix errors before pushing.
 */

"use strict";

const { execSync } = require("child_process");
const {
  readStdinJson,
  outputJson,
  log,
  resolveWorkspaceRoot,
} = require("../lib/utils");

function isGitPushCommand(cmd) {
  if (!cmd || typeof cmd !== "string") return false;
  // Match `git push`, `git.exe push`, ignoring leading whitespace or chaining
  const trimmed = cmd.trim();
  const pushRegex = /(?:^|[;&|`]\s*)(?:git(?:\.exe)?)\s+push\b/i;
  return pushRegex.test(trimmed);
}

function getPnpmExecutable() {
  try {
    execSync("pnpm --version", { stdio: "ignore" });
    return "pnpm";
  } catch {
    return "npx pnpm";
  }
}

function runVerificationChecks(workspaceRoot) {
  if (process.env.SKIP_PRE_PUSH_CHECK === "1") {
    log("SKIP_PRE_PUSH_CHECK=1 is set. Skipping pre-push checks.");
    return { passed: true };
  }

  const pnpm = getPnpmExecutable();
  const checks = [
    { name: "Workspace Build & Typecheck", command: `${pnpm} -r run build` },
    { name: "Workspace Lint", command: `${pnpm} -r run lint` },
  ];

  for (const check of checks) {
    try {
      log(`Running pre-push check: [${check.name}] (${check.command})...`);
      execSync(check.command, {
        cwd: workspaceRoot,
        encoding: "utf8",
        stdio: "pipe",
        timeout: 120000, // 2 minutes timeout
      });
      log(`Check passed: [${check.name}]`);
    } catch (err) {
      const stdout = err.stdout ? String(err.stdout).slice(-1500) : "";
      const stderr = err.stderr ? String(err.stderr).slice(-1500) : "";
      const outputSnippet = (stderr || stdout || err.message).trim();
      return {
        passed: false,
        failedCheck: check.name,
        details: outputSnippet,
      };
    }
  }

  return { passed: true };
}

async function main() {
  const input = await readStdinJson();
  const toolCall = input.toolCall || {};
  const toolName = toolCall.name || "";
  const args = toolCall.args || {};
  const commandLine = args.CommandLine || args.command || "";

  if (toolName !== "run_command" || !isGitPushCommand(commandLine)) {
    return outputJson({ decision: "allow" });
  }

  log(
    `Detected 'git push' command: "${commandLine}". Triggering pre-push verification...`,
  );
  const workspaceRoot = resolveWorkspaceRoot();
  const result = runVerificationChecks(workspaceRoot);

  if (!result.passed) {
    log(
      `Pre-push verification FAILED on [${result.failedCheck}]. Blocking git push.`,
    );
    return outputJson({
      decision: "deny",
      reason: [
        `BLOCKED: Pre-push verification check failed on [${result.failedCheck}].`,
        "You must ensure the codebase builds, typechecks, and passes linters before pushing to remote repository.",
        "",
        "Error details:",
        result.details,
      ].join("\n"),
    });
  }

  log("Pre-push verification succeeded. Allowing git push.");
  outputJson({
    decision: "allow",
    reason:
      "Pre-push verification checks (build, typecheck, lint) passed successfully.",
  });
}

main().catch((err) => {
  log(`Pre-push hook encountered unexpected error: ${err.message}`);
  // In case of unexpected script crash, allow command but warn
  outputJson({ decision: "allow" });
});
