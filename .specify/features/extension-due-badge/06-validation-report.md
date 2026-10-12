# IEEE 29148 Specification Validation Report: Extension Due Cards Badge (`US-ECO-05`)

- **Feature Slug**: `extension-due-badge`
- **Result**: **PASS** (0 Failures, 0 Traceability Gaps)
- **Date**: 2026-10-12
- **Iteration**: 1st pass
- **Validated Documents**: [spec/srs.md](./spec/srs.md), [spec/user-stories.md](./spec/user-stories.md), [03-domain-model.md](./03-domain-model.md), [04-risk-scope.md](./04-risk-scope.md)

---

## 1. ISO/IEC/IEEE 29148 8-Criteria Checklist Results

| ID | Necessary | Unambiguous | Complete | Singular | Feasible | Verifiable | Consistent | Traceable | Result | Validation Note |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **REQ-EDB-001** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Exact numeric thresholds (`<=0` → `""`, `1..99` → `String(dueCount)`, `>99` → `"99+"`) traced to `BR-EDB-001`. |
| **REQ-EDB-002** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Exact hex colors (`#863BFF`, `#EF4444`, `#FFFFFF`) and `streakAtRisk` condition traced to `BR-EDB-002`. |
| **REQ-EDB-003** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Unauthenticated/logout/`401` storage & alarm cleanup rules traced to `BR-EDB-003`. |
| **REQ-EDB-004** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Offline / `5xx` error resilience retaining `ws_review_summary_cache` traced to `BR-EDB-004`. |
| **REQ-EDB-005** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | `"alarms"` manifest permission + `"ws-badge-periodic"` (`periodInMinutes: 30`) traced to `BR-EDB-005`. |
| **REQ-EDB-006** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Dynamic `"ws-badge-next-due"` alarm window (`< 30m`, clamped `>= now + 60s`) traced to `BR-EDB-006`. |
| **REQ-EDB-007** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | `If-None-Match` + `X-Timezone` + `304 Not Modified` cache reuse + CORS `ETag` exposure traced to `BR-EDB-007`. |
| **REQ-EDB-008** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | `WORDSTREAK_REVIEW_SYNC` bridge + 3,000ms trailing debounce + single-flight lock traced to `BR-EDB-008`. |
| **REQ-EDB-009** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | Immediate lifecycle triggers (`onInstalled`, `onStartup`, alarms, Popup open, Auth, Quick Capture) traced to `BR-EDB-009`. |
| **US-ECO-05** | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** | 8 Given-When-Then scenarios covering happy path and all 6 domain edge cases. |

---

## 2. End-to-End Requirement Traceability Matrix

| Business Goal / Metric | Upstream Rule / Assumption / Risk | Requirement ID | User Story | Acceptance Criteria | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| +15% review session initiation; clean toolbar UX | `BR-EDB-001`, `ASM-EDB-001`, `ASM-EDB-002` | `REQ-EDB-001` | `US-ECO-05` | Scenarios 1, 2, 3 | Unit test (`badge-manager.spec.ts`) |
| Streak-break reduction via urgency visual cue | `BR-EDB-002`, `ASM-EDB-003`, `RISK-EDB-005` | `REQ-EDB-002` | `US-ECO-05` | Scenarios 1, 2 | Unit test (`badge-manager.spec.ts`) |
| Clean state on logout / expired token | `BR-EDB-003`, `ASM-EDB-002` | `REQ-EDB-003` | `US-ECO-05` | Scenario 7 | Unit test (`badge-manager.spec.ts` & `api-client.spec.ts`) |
| Zero badge flicker during transient offline drops | `BR-EDB-004`, `RISK-EDB-004` | `REQ-EDB-004` | `US-ECO-05` | Scenario 8 | Unit test (`badge-manager.spec.ts`) |
| Low-overhead background sync (`<= 30m` drift) | `BR-EDB-005`, `ASM-EDB-004` | `REQ-EDB-005` | `US-ECO-05` | Scenario 1 | Manifest check & unit test (`badge-manager.spec.ts`) |
| Timely badge update when next card matures | `BR-EDB-006`, `ASM-EDB-004`, `RISK-EDB-001` | `REQ-EDB-006` | `US-ECO-05` | Scenario 4 | Unit test (`badge-manager.spec.ts`) |
| `< 500B` `200 OK` / `0B` `304` bandwidth efficiency | `BR-EDB-007`, `ASM-EDB-005`, `RISK-EDB-003`, `RISK-EDB-004` | `REQ-EDB-007` | `US-ECO-05` | Scenario 5 | Unit test (`api-client.spec.ts`, `badge-manager.spec.ts`, `main.spec.ts`) |
| `<= 3.5s` real-time Web App → Extension sync | `BR-EDB-008`, `RISK-EDB-002` | `REQ-EDB-008` | `US-ECO-05` | Scenario 6 | Unit test (`badge-manager.spec.ts` debounce test) |
| Instant badge accuracy on browser/popup/auth events | `BR-EDB-009` | `REQ-EDB-009` | `US-ECO-05` | Scenarios 1, 4, 6 | Unit test (`badge-manager.spec.ts`) |

---

## 3. Traceability & Quality Gate Summary

- **Orphan Requirements (`REQ-` with no `BR-`/`ASM-` or no `US-`)**: `0`
- **Uncovered Business Rules (`BR-` with no `REQ-`)**: `0`
- **Uncovered Edge Cases from `03-domain-model.md` §4**: `0`
- **Accepted Gaps**: `None` — ready for Stage 8 (`handover`).
