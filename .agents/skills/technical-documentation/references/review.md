# Technical Documentation: Review & Audit Playbook

Quality verification checklist for reviewing documentation PRs, diffs, and whole-repository audits.

---

## 1. Documentation Review Checklist

| Category           | Verification Item | Pass Criteria                                                                    |
| ------------------ | ----------------- | -------------------------------------------------------------------------------- |
| **Orientation**    | Funnel structure  | Document opens with 1–2 sentences explaining what it is and who it is for.       |
| **Diataxis Fit**   | Single purpose    | Does not mix a beginner tutorial with exhaustive API reference tables.           |
| **Accuracy**       | Code & Commands   | All commands and snippets actually run and match current repo syntax/scripts.    |
| **Link Integrity** | File & URL links  | No broken relative links (`404`); file links point to existing files.            |
| **Diagrams**       | Mermaid syntax    | Mermaid diagrams render without syntax errors.                                   |
| **Agent Clarity**  | Determinism       | Instructions avoid vague words ("maybe", "should try") and state concrete rules. |
| **Security**       | Safe patterns     | Zero hardcoded passwords, tokens, API keys, or insecure configuration examples.  |
| **Completeness**   | Feature trace     | Features link to `test-plan.md` and document UI states, errors, and rollback.    |

---

## 2. Review Report Format

When reviewing documentation changes, output findings in this format:

```markdown
# Documentation Review Report: <Target File / Feature>

**Review Scope**: <Path to file(s)>  
**Status**: PASS | REVISE

### Findings

- **[CRITICAL / MAJOR / MINOR]** <Description of issue, e.g., broken path or out-of-date API command>

### Recommendations

- <Specific suggested fixes or edits>
```
