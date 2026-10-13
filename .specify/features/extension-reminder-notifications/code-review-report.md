# Adversarial Code Quality & Security Review Report: Conditional Study Reminder Notifications (`US-ECO-06`)

- **Feature Slug**: `extension-reminder-notifications`
- **User Story**: `US-ECO-06` — Thông báo nhắc học theo luật điều kiện (Conditional Study Reminder Notifications)
- **Reviewer**: `code-reviewer` (Independent Adversarial Review — Phase 6A)
- **Date**: 2026-10-13
- **Baseline & Spec Artifacts**:
  - [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/baseline.md)
  - [`spec.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/spec.md)
  - [`plan.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/plan.md)
  - [`data-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/data-model.md)
  - [`test-plan.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-reminder-notifications/test-plan.md)
- **Verdict**: **PASS / APPROVED (0 Critical, 0 Major, 0 Minor, 0 Nit Open — All 4 Initial Findings Remediated & Verified)**

---

## 1. Executive Summary

An independent adversarial audit and re-verification were performed across all 13 created and modified files for `US-ECO-06` (`extension-reminder-notifications`), verifying requirement conformance (`REQ-REMD-001`..`010`), business rules (`BR-REMD-001`..`010`), edge cases (`EC-REMD-01`..`08`), race condition safety (`RISK-REMD-001`), MV3 permissions & security boundaries, and code quality constraints (file `< 800` lines, function `< 50` lines, immutability, and strict TypeScript compilation).

All **4 findings** from the initial review pass (`MAJ-REMD-001`, `MAJ-REMD-002`, `MIN-REMD-001`, `NIT-REMD-001`) have been cleanly remediated and verified. All **119 Vitest unit tests** across **7 test suites** in `apps/extension` and the `@wordstreak/shared-types` TypeScript build pass with `0` errors.

### Severity Summary

| Severity | Initial Count | Open Count | Status |
| :--- | :---: | :---: | :--- |
| **Critical** | `0` | `0` | ✅ Zero Critical bugs |
| **Major** | `2` | `0` | ✅ Resolved & Verified (`MAJ-REMD-001`, `MAJ-REMD-002`) |
| **Minor** | `1` | `0` | ✅ Resolved & Verified (`MIN-REMD-001`) |
| **Nit** | `1` | `0` | ✅ Resolved & Verified (`NIT-REMD-001`) |

---

## 2. Requirement & Business Rule Conformance Matrix (`REQ-REMD-001`..`010` / `BR-REMD-001`..`010`)

| Req / Rule ID | Description | Conformance Status | Audited Files & Evidence |
| :--- | :--- | :---: | :--- |
| **REQ-REMD-001** / **BR-REMD-001** | `"notifications"` permission in `manifest.json` & default reminder settings in `DEFAULT_SETTINGS` / `ExtensionSettingsPayload` | ✅ **PASS** | [`manifest.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/manifest.json#L6), [`extension.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/extension.ts#L31-L45), [`constants.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/constants.ts#L46-L56) |
| **REQ-REMD-002** / **BR-REMD-002** | Persistent `ws_reminder_state` in `chrome.storage.local` & local calendar date rollover normalization | ✅ **PASS** | [`storage.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.ts#L180-L218), [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L114-L145), [`storage.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.spec.ts#L180-L370) |
| **REQ-REMD-003** / **BR-REMD-003** | Quiet hours suppression (`[quietHoursStart, quietHoursEnd)`) supporting overnight wrap-around (`22:00–07:00`), same-day, and disabled (`start === end`) | ✅ **PASS** | [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L89-L109), [`reminderRules.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.spec.ts#L70-L112) |
| **REQ-REMD-004** / **BR-REMD-004** | Daily ceiling of `3/day` (`consecutiveIgnores < 3`) and frequency backoff to `1/day` (`consecutiveIgnores >= 3`) | ✅ **PASS** | [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L220-L222), [`reminderRules.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.spec.ts#L293-L327) |
| **REQ-REMD-005** / **BR-REMD-005** | 120-minute intra-day cooldown & active snooze suppression for non-snooze triggers; bypassed by `SNOOZE_ALARM` | ✅ **PASS** | [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L184-L202), [`reminderRules.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.spec.ts#L329-L388) |
| **REQ-REMD-006** / **BR-REMD-006** | Pure 11-step `evaluateReminderRules`, sleep catch-up on `PERIODIC_SYNC` after `dailyReminderTime`, priority `STREAK_AT_RISK` > `DUE_CARDS` > `DAILY_GOAL` | ✅ **PASS** | [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L171-L328), [`reminderRules.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.spec.ts#L390-L488) |
| **REQ-REMD-007** / **BR-REMD-007** | Recurring `"daily-reminder"` alarm (`periodInMinutes: 1440`, clamped `>= now + 60s`) & one-shot `"ws-reminder-snooze"` (`delayInMinutes: 60`) | ✅ **PASS** | [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L150-L169), [`reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L28-L53), [`index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts#L12-L73) |
| **REQ-REMD-008** / **BR-REMD-008** | Consecutive ignore tracking (`onClosed` & unclicked supersede) and reset (`Học ngay`, `Để sau`, Web App study); race-free `activeNotificationId` clearing | ✅ **PASS** | [`reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L115-L223), [`reminder-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.spec.ts#L225-L540) |
| **REQ-REMD-009** / **BR-REMD-009** | Smart `/review` tab reuse (`${WEB_APP_URL}/*` query, window focus, tab update) or new tab creation on click | ✅ **PASS** | [`reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L375-L395), [`reminder-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.spec.ts#L236-L283) |
| **REQ-REMD-010** / **BR-REMD-010** | Bilingual EN/VI notification localization via `user.preferredLanguage ?? settings.preferredLanguage ?? browserUiLang ?? "vi"` | ✅ **PASS** | [`api-client.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L110-L130), [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L333-L441), [`reminderRules.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.spec.ts#L491-L601) |

---

## 3. Remediated Findings Log

### Critical Issues (`0`)

*None.*

---

### Remediated Major Issues (`2`)

#### `MAJ-REMD-001` (RESOLVED): Unclicked Active Notification Accounting When Superseded on the Same Day
- **Severity**: **Major** → **RESOLVED ✅**
- **Traces to**: `REQ-REMD-008`, `BR-REMD-008`, `EC-REMD-04`, `RISK-REMD-005`, `TC-REMD-014`
- **Verification**:
  - [`ReminderManager.checkSupersededNotification`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L146-L163) now checks if `state.activeNotificationId !== null` when a non-cooldown evaluation runs (`triggerSource !== "PERIODIC_SYNC" || !isCooldownActive(...)`), increments `consecutiveIgnores: state.consecutiveIgnores + 1`, and clears `activeNotificationId: null` prior to invoking `evaluateReminderRules`.
  - Covered by the new unit test in [`reminder-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.spec.ts#L357-L387) (`TC-REMD-014`).

#### `MAJ-REMD-002` (RESOLVED): `clearRemindersAndAlarms()` Race-Safe Storage Clearing Before `chrome.notifications.clear`
- **Severity**: **Major** → **RESOLVED ✅**
- **Traces to**: `REQ-REMD-008`, `BR-REMD-008`, `EC-REMD-03`, `EC-REMD-06`, `RISK-REMD-001`
- **Verification**:
  - [`ReminderManager.clearRemindersAndAlarms`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L364-L369) now awaits `extensionStorage.clearReminderState()` **before** calling `chrome.notifications.clear(REMINDER_NOTIFICATION_ID)` and [`BadgeManager.clearAuthAndBadge`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L86-L95) invokes `reminderManager.clearRemindersAndAlarms()` before `extensionStorage.clearAuth()`, preventing both `onClosed` race increments and post-logout state re-creation.
  - Verified by invocation order and `onClosed` assertions in [`reminder-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.spec.ts#L510-L534) (`TC-REMD-016`).

---

### Remediated Minor & Nit Issues (`2`)

#### `MIN-REMD-001` (RESOLVED): `handleWebReviewActivity` & `evaluateFromSummary` Reconcile Against `ReminderState.lastStudiedToday`
- **Severity**: **Minor** → **RESOLVED ✅**
- **Traces to**: `REQ-REMD-008`, `BR-REMD-008`, `EC-REMD-05`, `TC-REMD-015`
- **Verification**:
  - [`ReminderManager.reconcileStudyProgress`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L115-L144) and [`ReminderManager.handleWebReviewActivity`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L330-L362) now use `state.lastStudiedToday` when `previousSummary` is null/omitted and reconcile Web App study progress during `evaluateFromSummary`.
  - Verified by unit tests in [`reminder-manager.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.spec.ts#L467-L507) (`TC-REMD-015`).

#### `NIT-REMD-001` (RESOLVED): Document `skipReminderCheck` Alias in `BadgeManager.refreshBadgeNow`
- **Severity**: **Nit** → **RESOLVED ✅**
- **Verification**: Documented in [`badge-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L107-L111).

---

## 4. Security, MV3 Permissions & Code Quality Audit

### 4.1. Security & MV3 Permission Boundaries
- **Manifest Permissions (`REQ-REMD-001`)**: Only `"notifications"` was added to [`apps/extension/manifest.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/manifest.json#L6). `host_permissions` and `content_scripts` were untouched.
- **No Sensitive Token or PII Leakage**: Notification payloads in [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L356-L441) interpolate only numeric counters (`currentStreak`, `dueCount`, `studiedToday`, `dailyGoal`). Zero JWT tokens (`ws_token`), email addresses, or user IDs are ever exposed in OS notifications.
- **Hardcoded Navigation Target (`BR-REMD-009`)**: [`openOrFocusReviewTab()`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L375-L395) strictly navigates to `${WEB_APP_URL}/review`, eliminating open-redirect vectors.
- **Unauthenticated Isolation**: Step 1 of `evaluateReminderRules` strictly rejects unauthenticated states (`!input.isAuthenticated || !input.summary`).

### 4.2. Code Quality & Size Metrics
All files strictly obey the repository's `< 800` lines/file and `< 50` lines/function limits and use immutable spread patterns:

| File | Total Lines (`< 800`) | Max Function Length (`< 50`) | Immutable State Patterns | Pure / Side-Effect Isolation |
| :--- | :---: | :---: | :---: | :---: |
| [`packages/shared-types/src/extension.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/extension.ts) | `158` | N/A (Types) | ✅ | ✅ |
| [`apps/extension/manifest.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/manifest.json) | `44` | N/A (JSON) | ✅ | ✅ |
| [`apps/extension/src/shared/constants.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/constants.ts) | `75` | N/A (Constants) | ✅ (`as const`) | ✅ |
| [`apps/extension/src/shared/storage.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/storage.ts) | `246` | `25` lines (`getAll`) | ✅ | ✅ |
| [`apps/extension/src/background/api-client.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts) | `213` | `46` lines (`request`) | ✅ | ✅ |
| [`apps/extension/src/background/reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts) | `442` | `46` lines (`getLocalDateAndMinutes`) | ✅ | ✅ (100% pure, 0 `chrome.*` calls) |
| [`apps/extension/src/background/reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts) | `399` | `44` lines (`evaluateFromSummary`) | ✅ | ✅ |
| [`apps/extension/src/background/badge-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts) | `227` | `29` lines (`executeRefresh`) | ✅ | ✅ |
| [`apps/extension/src/background/index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts) | `298` | `38` lines (`onInstalled`) | ✅ | ✅ |

---

## 5. Final Sign-Off

- **Phase 6A Adversarial Code Quality & Security Review**: **PASS / APPROVED** (`119/119` unit tests passing, `0` open issues).
