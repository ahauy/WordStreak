# Code Review Standards

## Purpose

Code review ensures quality, security, and maintainability before code is merged. This rule defines when and how to conduct code reviews.

## When to Review

**MANDATORY review triggers:**

- After writing or modifying code
- Before any commit to shared branches
- When security-sensitive code is changed (auth, payments, user data)
- When architectural changes are made
- Before merging pull requests

**Pre-Review Requirements:**

Before requesting review, ensure:

- All automated checks (CI/CD) are passing
- Merge conflicts are resolved
- Branch is up to date with target branch

## Review Checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (<50 lines)
- [ ] Files are cohesive (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No hardcoded secrets or credentials
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality
- [ ] Test coverage meets 80% minimum

## Security Review Triggers

**STOP and use security-reviewer agent when:**

- Authentication or authorization code
- User input handling
- Database queries
- File system operations
- External API calls
- Cryptographic operations
- Payment or financial code

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
| HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
| MEDIUM | Maintainability concern | **INFO** - Consider fixing |
| LOW | Style or minor suggestion | **NOTE** - Optional |

## Agent Usage

Use these agents for code review:

| Agent | Purpose |
|-------|---------|
| **code-reviewer** | General code quality, patterns, best practices |
| **security-reviewer** | Security vulnerabilities, OWASP Top 10 |
| **typescript-reviewer** | TypeScript/JavaScript specific issues |
| **python-reviewer** | Python specific issues |
| **go-reviewer** | Go specific issues |
| **rust-reviewer** | Rust specific issues |

## Review Workflow

```
1. Run git diff to understand changes
2. Check security checklist first
3. Review code quality checklist
4. Run relevant tests
5. Verify coverage >= 80%
6. Use appropriate agent for detailed review
```

## Common Issues to Catch

### Security

- Hardcoded credentials (API keys, passwords, tokens)
- SQL injection (string concatenation in queries)
- XSS vulnerabilities (unescaped user input)
- Path traversal (unsanitized file paths)
- CSRF protection missing
- Authentication bypasses

### Code Quality

- Large functions (>50 lines) - split into smaller
- Large files (>800 lines) - extract modules
- Deep nesting (>4 levels) - use early returns
- Missing error handling - handle explicitly
- Mutation patterns - prefer immutable operations
- Missing tests - add test coverage

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Missing caching - cache expensive operations

## 4 Strict Review Execution & Stopping Rules (MANDATORY)

To prevent review fatigue, token bloat, and infinite fix-loops, all code reviews must respect these 4 boundary rules:

1. **Rule 1: Giới hạn review trong tối đa 3 vòng (Max 3 Iterations)**:
   - Maximum 3 review rounds per feature/PR.
   - **Round 1**: Initial full review of changed files.
   - **Round 2**: Incremental verification of Round 1 fixes.
   - **Round 3 (Final Gate)**: Review ONLY remaining `CRITICAL` issues. All remaining `MEDIUM`/`LOW`/Nits are downgraded to informational notes and accepted (`PASS WITH ACCEPTED NITS`). A review **CANNOT** block after Round 3 unless a true `CRITICAL` blocker remains.
2. **Rule 2: Chỉ review diff mới (Incremental Diff Only)**:
   - In Rounds 2 and 3, review **ONLY the latest git diff** (`git diff HEAD~1`).
   - Do NOT re-review untouched files or pre-existing code outside the fix diff.
3. **Rule 3: Gom bug theo loại (Categorized Findings)**:
   - Group findings into 4 clear categories:
     1. *Security & Vulnerabilities*
     2. *Logic & Business Requirements*
     3. *Performance & Architecture*
     4. *Code Cleanliness & Type Safety*
   - Avoid fragmented one-line comments; provide batch solutions for each group.
4. **Rule 4: Không báo lại bug cũ (No Regurgitation)**:
   - Never report issues that were already resolved in prior rounds or explicitly accepted by the team.
   - Only report net-new regressions directly introduced by the latest changes.

## Approval Criteria

- **Round 1 & 2**:
  - **Approve**: Zero CRITICAL or HIGH issues.
  - **Warning**: Only HIGH issues (fix in next incremental round).
  - **Block**: CRITICAL issues found.
- **Round 3 (Final Hard Stop)**:
  - **Approve**: No CRITICAL issues (all non-critical findings are auto-accepted as technical debt/notes).
  - **Block**: Only if a verified, reproducible CRITICAL vulnerability remains.

## Integration with Other Rules

This rule works with:

- [testing.md](testing.md) - Test coverage requirements
- [security.md](security.md) - Security checklist
- [git-workflow.md](git-workflow.md) - Commit standards
- [agents.md](agents.md) - Agent delegation
