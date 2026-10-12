# Domain Decision Baseline: Review Summary API for Extension (`US-REM-01`)

- **Status**: `SIGNED-OFF (Ready for Confirmation Gate 1)`
- **Version**: `1.0`
- **Feature Slug**: `review-summary-api`
- **Signed off by**: Customer (Stage 2 Interview Confirmed) & `ba-domain-architect` (2026-10-12)

---

## 1. Business Summary & Problem Statement (Stages 1 & 2)

- **Classification**: **Bounded Task** (0 new DB entities, 0 migrations, 1 read-only endpoint `GET /api/v1/reviews/summary`, 1 shared DTO `ReviewSummaryDto`, 1 persona `Authenticated Learner`). See [00-intake.md](./00-intake.md).
- **Problem**: The WordStreak Chrome Extension (Manifest V3) wakes up periodically via `chrome.alarms` to update its icon badge (`US-ECO-05`) and evaluate conditional study reminders (`US-ECO-06`). Fetching `GET /api/v1/reviews/due` transfers full flashcard payloads and lacks unified daily goal progress (`studiedToday`, `goalReached`), local day-end countdown (`endOfDayAt`, `streakAtRisk`), and next scheduled due timestamp (`nextDueAt`).
- **Target Metrics**:
  - P95 API latency `< 80ms` via parallel Prisma aggregation (`Promise.all`).
  - Payload size `< 500 bytes` on `200 OK` and `0 bytes` on `304 Not Modified`.
- **Elicitation Record**: See [01-elicitation.md](./01-elicitation.md).

---

## 2. Approved Domain Model Summary (Stage 4)

- **RBAC**: Protected by `JwtAuthGuard`; strictly isolated to `user.sub` (`401 Unauthorized` if unauthenticated).
- **Active Deck Scope (`BR-REM-002`)**: `dueCount`, `newAvailable`, and `nextDueAt` count only cards in non-archived decks owned by the user (`card: { deck: { userId, isArchived: false } }`).
- **Card Counts & Next Due (`BR-REM-003`, `BR-REM-005`)**:
  - `dueCount`: `status !== 'NEW'` and `nextReviewDate <= now`.
  - `newAvailable`: Uncapped count of `status === 'NEW'`.
  - `nextDueAt`: Earliest `nextReviewDate` (UTC ISO 8601) where `status !== 'NEW'` and `nextReviewDate > now`, or `null`.
- **Timezone & Daily Progress (`BR-REM-001`, `BR-REM-004`)**:
  - Priority: valid `?timezone=` query param → valid `X-Timezone` header → `'UTC'` fallback.
  - `endOfDayAt`: `23:59:59.999` of today in the resolved IANA timezone (converted to UTC ISO 8601 string).
  - `studiedToday`: Count of `ReviewLog` rows for `userId` within today's local `[startOfDayUtc, endOfDayUtc]`.
  - `goalReached`: `studiedToday >= dailyGoal` (`User.dailyGoal`, default `10`).
- **Streak Risk Formula (`BR-REM-006`)**:
  - Reuses `StreakService.getStreak(userId, timezone)`.
  - `streakAtRisk = (currentStreak >= 3) && (studiedToday === 0 && !isActiveToday) && (msUntilEndOfDay > 0 && msUntilEndOfDay <= 3 * 3600 * 1000)`.
  - Evaluates to `true` even when `streakFreezes > 0` to prevent accidental freeze consumption.
- **HTTP Caching (`BR-REM-008`)**:
  - Weak ETag `W/"<sha256-hex>"` over canonical 10-field JSON + `Cache-Control: private, must-revalidate, max-age=0`.
  - Returns `304 Not Modified` with empty body when `If-None-Match` matches.
- **Full Domain Model**: See [03-domain-model.md](./03-domain-model.md).

---

## 3. Scope Boundaries & Risk Register Summary (Stage 5)

- **Contradiction Scan**: Zero logic contradictions, zero state deadlocks, zero backward-compatibility breaks, zero DB migrations.
- **MoSCoW Summary**:
  - **Must-Have (P0)**: `ReviewSummaryDto` in `packages/shared-types`; `GET /api/v1/reviews/summary` controller & service; timezone resolution (`?timezone=` / `X-Timezone` / `'UTC'`); 10-field aggregation; Weak ETag & `304 Not Modified`; Jest unit tests for all `goalReached`, `streakAtRisk`, timezone, and ETag branches.
  - **Won't-Have (This Iteration)**: Returning card content lists, Extension MV3 alarm/badge listener (`US-ECO-05`), OS reminder notification engine (`US-ECO-06`), Extension Options page (`US-ECO-07`), or Prisma schema changes.
- **Full Risk Assessment & MoSCoW**: See [04-risk-assessment.md](./04-risk-assessment.md).

---

## 4. Specification & IEEE 29148 Validation Summary (Stages 6 & 7)

- **Formal Requirements & User Stories**: `REQ-REM-001` through `REQ-REM-006` and Gherkin `US-REM-01` (8 Given-When-Then scenarios). See [spec/user-stories.md](./spec/user-stories.md).
- **Validation Result**: `PASS` (8/8 IEEE 29148 criteria passed across all REQs and US-REM-01; unbroken traceability matrix). See [06-validation-report.md](./06-validation-report.md).

---

## 5. Handover Brief (Stage 8 — For Phase 2–4 `system-architect` & Phase 5 Implementation)

### What's Being Built
1. **Shared Contract (`packages/shared-types`)**: Export `ReviewSummaryDto` with the 10 strictly typed fields (`dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt`).
2. **Backend Service (`apps/api/src/modules/reviews/reviews.service.ts`)**: Add `getReviewSummary(userId: string, timezone?: string): Promise<ReviewSummaryDto>` reusing `StreakService.getStreak(userId, tz)` and running all Prisma count/findFirst/findUnique queries concurrently via `Promise.all`.
3. **Backend Controller (`apps/api/src/modules/reviews/reviews.controller.ts`)**: Add `@Get('summary')` endpoint accepting `@Query('timezone')`, `@Headers('x-timezone')`, `@Headers('if-none-match')`, and `@Res({ passthrough: true })`, computing Weak ETag `W/"<sha256-hex>"` and returning `304 Not Modified` on match or `200 OK` with `ApiResponse<ReviewSummaryDto>`.
4. **Unit Tests (`apps/api/src/modules/reviews/reviews.service.spec.ts` & `reviews.controller.spec.ts`)**: Full unit test coverage for `goalReached`, `streakAtRisk` (3h boundary, `currentStreak < 3`, `streakFreezes > 0`), archived deck filtering, timezone fallback, and `ETag` / `304 Not Modified`.

### What's Explicitly Out of Scope
- Any modification to `apps/api/prisma/schema.prisma`.
- Chrome Extension client code (`US-ECO-05`, `US-ECO-06`, `US-ECO-07`).

### Known Accepted Risks / Gaps
- None. All risks (`RISK-REM-001`..`005`) have concrete code-level mitigations specified in [04-risk-assessment.md](./04-risk-assessment.md).

### Next Step
Present **Confirmation Gate 1** to the customer, then dispatch `system-architect` (Phase 2–4) to produce `spec.md`, `plan.md`, `data-model.md`, `contracts/`, and `tasks.md` in `.specify/features/review-summary-api/`.
