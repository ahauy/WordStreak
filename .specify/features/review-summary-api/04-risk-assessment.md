# Risk Assessment & Scope: Review Summary API for Extension (`US-REM-01`)

## 1. Contradiction Scan

- **Scan Target**: Cross-checked `01-elicitation.md` and `03-domain-model.md` (`BR-REM-001` through `BR-REM-008`) against existing `ReviewsController`, `ReviewsService`, `StreakService`, and `apps/api/prisma/schema.prisma`.
- **Findings**:
  - **Logic Contradictions**: `None found`.
    - Verified `dueCount` (`status !== 'NEW' && nextReviewDate <= now`) vs `newAvailable` (`status === 'NEW'`) are mutually exclusive and collectively cover all actionable cards in active decks.
    - Verified `streakAtRisk` checks `studiedToday === 0 && !isActiveToday`: if a user studied today via normal review or offline sync, both `studiedToday > 0` and `isActiveToday === true` hold, and if `StreakService` recorded activity earlier today, `!isActiveToday` prevents false-positive risk alerts.
  - **State Deadlocks**: `None found`. The request lifecycle is a stateless, single-pass decision tree terminating in `401`, `304`, or `200`.
  - **Backward-Compatibility Risks**: `None found`.
    - `GET /api/v1/reviews/summary` is a new additive route on `ReviewsController`. Existing routes (`GET /api/v1/reviews/due`, `POST /api/v1/reviews/submit`, `POST /api/v1/reviews/sync-batch`, `GET /api/v1/reviews/stats`) remain untouched.
    - Adding `ReviewSummaryDto` to `@wordstreak/shared-types` is purely additive.

---

## 2. Risk Register

| ID | Risk Description | Prob. | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-REM-001** | **ETag Instability / Cache Miss on Every Poll**: If `endOfDayAt` or any field depended on current millisecond `now` directly, the Weak ETag would change on every request, defeating `304 Not Modified`. | Low | Med | `endOfDayAt` is anchored to `23:59:59.999` of the user's local calendar day (`BR-REM-001`), which is constant throughout the day. ETag only changes when counts/booleans/nextDueAt actually change. |
| **RISK-REM-002** | **DST / Half-Hour Timezone Offset Calculation Drift**: Naive UTC offset math can fail on half-hour timezones (e.g., `Asia/Kolkata` UTC+5:30, `Australia/Eucla` UTC+8:45) or Daylight Saving Time transitions. | Med | Med | Compute local day boundaries `[startOfDayUtc, endOfDayUtc]` using `Intl.DateTimeFormat` part extraction (`year`, `month`, `day`, `hour`, `minute`, `second`) in the target IANA timezone rather than hardcoded hour offsets (`BR-REM-001`). |
| **RISK-REM-003** | **Database Query Latency Under Frequent Extension Polling**: Sequential Prisma queries (`count`, `findFirst`, `findUnique`, `getStreak`) could increase P95 response time. | Low | Med | Execute all read queries in parallel via `Promise.all` leveraging existing composite indexes (`decks[userId, isArchived]`, `review_logs[userId, reviewedAt]`, `user_card_progress[userId, cardId]`). |
| **RISK-REM-004** | **NestJS `@Res()` vs Standard Interceptor Compatibility for `304 Not Modified`**: Using `@Res()` directly can bypass NestJS interceptors/serializers if not handled cleanly. | Low | Low | Use `@Res({ passthrough: true })` from `@nestjs/common` with Express `Response` to set `ETag`, `Cache-Control`, and `res.status(HttpStatus.NOT_MODIFIED)` when `If-None-Match` matches. |
| **RISK-REM-005** | **Cross-User Cache Poisoning in Shared Proxies**: If `Cache-Control` were `public`, an intermediate proxy could serve User A's summary to User B. | Low | High | Strictly enforce `Cache-Control: private, must-revalidate, max-age=0` on both `200 OK` and `304 Not Modified` responses (`BR-REM-008`). |

---

## 3. Consolidated Assumptions & Constraints

### Confirmed Assumptions (`ASM-REM-###`)

| ID | Description | Status |
| :--- | :--- | :--- |
| **ASM-REM-001** | `GET /api/v1/reviews/summary` requires JWT authentication (`JwtAuthGuard`); unauthenticated requests receive `401 Unauthorized`. | `CONFIRMED` |
| **ASM-REM-002** | `streakAtRisk` is `true` iff `currentStreak >= 3`, `studiedToday === 0 && !isActiveToday`, and `0 < msUntilEndOfDay <= 3 * 3600 * 1000` (3 hours), regardless of `streakFreezes > 0`. | `CONFIRMED` |
| **ASM-REM-003** | `dueCount`, `newAvailable`, and `nextDueAt` only include cards from non-archived decks owned by the user (`deck.userId === userId && deck.isArchived === false`). | `CONFIRMED` |
| **ASM-REM-004** | `dueCount` counts `status !== 'NEW' && nextReviewDate <= now`; `newAvailable` counts uncapped `status === 'NEW'`. | `CONFIRMED` |
| **ASM-REM-005** | `studiedToday` counts `ReviewLog` rows for `userId` within `[startOfDayUtc, endOfDayUtc]`; `goalReached` is `studiedToday >= dailyGoal`. | `CONFIRMED` |
| **ASM-REM-006** | `nextDueAt` is the earliest future `nextReviewDate` (`status !== 'NEW' && nextReviewDate > now`) in active decks, or `null` if none exists. | `CONFIRMED` |
| **ASM-REM-007** | Timezone resolution order: valid `?timezone=` query param → valid `X-Timezone` header → `'UTC'` fallback. | `CONFIRMED` |
| **ASM-REM-008** | Weak ETag `W/"<sha256-hex>"` is computed over the canonical 10-field summary JSON; matching `If-None-Match` returns `304 Not Modified` with empty body. | `CONFIRMED` |

### Technical & Architectural Constraints

- **CON-REM-001**: Zero database migrations (`schema.prisma` must not be modified).
- **CON-REM-002**: Reuse existing `StreakService.getStreak(userId, timezone)` in `apps/api/src/modules/streaks/streak.service.ts`.
- **CON-REM-003**: Export `ReviewSummaryDto` from `packages/shared-types` so both `apps/api` and `apps/extension` / `apps/web` share a single source of truth.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — This Iteration `US-REM-01`)

- Shared TypeScript interface `ReviewSummaryDto` in `packages/shared-types`.
- `GET /api/v1/reviews/summary` endpoint in `ReviewsController` protected by `JwtAuthGuard`.
- Timezone resolution supporting `@Query('timezone')`, `@Headers('x-timezone')`, and `'UTC'` fallback (`BR-REM-001`).
- Accurate calculation of all 10 fields: `dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt` (`BR-REM-002`..`BR-REM-007`).
- Weak `ETag` generation (`W/"<sha256-hex>"`), `Cache-Control: private, must-revalidate, max-age=0`, and `If-None-Match` → `304 Not Modified` handling (`BR-REM-008`).
- Comprehensive Jest unit tests for `ReviewsService.getReviewSummary` and `ReviewsController.getReviewSummary` covering all `goalReached`, `streakAtRisk`, timezone fallback, archived deck exclusion, and `304 Not Modified` branches.

### Should-Have (P1)

- Support comma-separated ETag lists and `*` in `If-None-Match` header parsing.
- Export helper utilities for local timezone day-boundary computation so they can be unit-tested deterministically across DST and half-hour offset zones.

### Could-Have (P2)

- Optional Swagger/OpenAPI decorator annotations if API documentation module is enabled in the future.

### Won't-Have (Explicitly Out of Scope for `US-REM-01`)

- **Returning card arrays or flashcard content** in `/api/v1/reviews/summary` (handled by `GET /api/v1/reviews/due`).
- **Chrome Extension MV3 `chrome.alarms` & Badge UI updating** (scoped separately to `US-ECO-05`).
- **Chrome Extension conditional OS notifications & quiet hours engine** (scoped separately to `US-ECO-06`).
- **Chrome Extension Options Page for notification preferences** (scoped separately to `US-ECO-07`).
- **Database schema migrations or new Prisma models** (strictly zero DB schema changes).
