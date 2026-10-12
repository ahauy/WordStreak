# Feature Specification: Review Summary API for Extension (`US-REM-01`)

**Feature Branch**: `feat/review-summary-api`  
**Feature Slug**: `review-summary-api`  
**Backlog Reference**: `US-REM-01` (EPIC-06: Browser Extension & Ecosystem — Smart Reminders)  
**Created**: 2026-10-12  
**Status**: Approved (Phase 2 - Specify)  
**Domain Baseline**: [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/baseline.md)  
**User Stories & Formal Requirements**: [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/spec/user-stories.md)

---

## 1. Executive Summary & Value Proposition

The WordStreak Chrome Extension (Manifest V3) wakes up periodically via `chrome.alarms` to update its toolbar icon badge (`US-ECO-05`) and evaluate conditional OS study reminders (`US-ECO-06`). Previously, polling `GET /api/v1/reviews/due` transferred full flashcard payloads (words, meanings, phonetics, examples, audio URLs) and lacked unified daily goal progress (`studiedToday`, `goalReached`), local day-end countdown (`endOfDayAt`, `streakAtRisk`), and the next scheduled review timestamp (`nextDueAt`).

This specification defines a lightweight, timezone-aware, read-only endpoint `GET /api/v1/reviews/summary` that returns a compact 10-field `ReviewSummaryDto` wrapped in `ApiResponse<ReviewSummaryDto>` (`< 500 bytes`), complete with Weak `ETag` (`W/"<sha256-hex>"`) and `304 Not Modified` conditional caching (`0 bytes` body when unchanged).

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 — Lightweight Timezone-Aware Review Summary & Conditional Caching (`US-REM-01`, Priority: P1 - MVP)

**As an** Authenticated Learner using the WordStreak Chrome Extension (or Web App)  
**I want to** fetch a lightweight, timezone-aware summary of my due cards, daily goal progress, streak risk status, and next due review timestamp via `GET /api/v1/reviews/summary` with `ETag` / `304 Not Modified` support  
**So that** my browser extension can accurately update its badge count, schedule timely alarms via `nextDueAt`, and alert me when my streak is at risk without downloading full flashcard payloads.

**Why this priority**: Foundation for the entire Chrome Extension background reminder & badge engine (`US-ECO-05`, `US-ECO-06`), eliminating unnecessary payload transfer and database overhead during periodic background polling.

**Independent Test**:
- Send `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh` with a valid Bearer JWT.
- Verify `200 OK` response with all 10 `ReviewSummaryDto` fields, `ETag: W/"<sha256-hex>"`, and `Cache-Control: private, must-revalidate, max-age=0`.
- Re-send the request with `If-None-Match: W/"<sha256-hex>"` when state is unchanged and verify `304 Not Modified` with an empty body.

**Acceptance Scenarios**:

1. **Scenario 1 (Happy Path — Returns complete 10-field summary with Weak ETag)**:
   - **Given** an authenticated learner with `dailyGoal = 10`, `currentStreak = 5` (`isActiveToday = false`), 12 cards in active decks with `status = 'REVIEW'` and `nextReviewDate <= now`, 35 cards in active decks with `status = 'NEW'`, 4 `ReviewLog` entries recorded today in `Asia/Ho_Chi_Minh`, and the earliest future scheduled card in an active deck at `"2026-10-12T15:30:00.000Z"`, at server time `"2026-10-12T10:00:00.000Z"` (`17:00:00` in `Asia/Ho_Chi_Minh`, `> 3 hours` before local midnight `"2026-10-12T16:59:59.999Z"`),
   - **When** the client sends `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh` with a valid Bearer JWT,
   - **Then** the server responds with `200 OK`, headers `ETag: W/"<sha256-hex>"` and `Cache-Control: private, must-revalidate, max-age=0`, and JSON body:
     ```json
     {
       "success": true,
       "data": {
         "dueCount": 12,
         "newAvailable": 35,
         "studiedToday": 4,
         "dailyGoal": 10,
         "goalReached": false,
         "currentStreak": 5,
         "streakAtRisk": false,
         "timezone": "Asia/Ho_Chi_Minh",
         "endOfDayAt": "2026-10-12T16:59:59.999Z",
         "nextDueAt": "2026-10-12T15:30:00.000Z"
       }
     }
     ```

2. **Scenario 2 (Happy Path — Daily goal reached when `studiedToday >= dailyGoal`)**:
   - **Given** an authenticated learner with `dailyGoal = 10` who has completed `10` reviews today (`studiedToday = 10`, `isActiveToday = true`),
   - **When** the client sends `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh`,
   - **Then** the server responds with `200 OK`, `goalReached: true`, `studiedToday: 10`, and `streakAtRisk: false`.

3. **Scenario 3 (Edge Case — `streakAtRisk = true` within 3-hour window before local midnight, even when `streakFreezes > 0`)**:
   - **Given** an authenticated learner with `currentStreak = 3`, `streakFreezes = 2`, `studiedToday = 0`, and `isActiveToday = false`, and the current time in `Asia/Ho_Chi_Minh` is `21:00:00.000` (`msUntilEndOfDay = 10,799,999 ms <= 10,800,000 ms`, or at the exact 3h boundary `10,800,000 ms`),
   - **When** the client sends `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh`,
   - **Then** the response returns `streakAtRisk: true` and `currentStreak: 3` so the learner is warned before accidentally burning a Streak Freeze.

4. **Scenario 4 (Edge Case — `streakAtRisk = false` when `currentStreak < 3` or `msUntilEndOfDay > 3 hours`)**:
   - **Given** an authenticated learner with `studiedToday = 0` and `isActiveToday = false`,
   - **When** either `currentStreak` is `2` (`< 3`) within 1 hour of midnight, OR `currentStreak` is `10` with `3 hours and 1 minute` remaining until `endOfDayAt` (`msUntilEndOfDay > 10,800,000 ms`),
   - **Then** `GET /api/v1/reviews/summary` returns `streakAtRisk: false`.

5. **Scenario 5 (Edge Case — Archived decks excluded from `dueCount`, `newAvailable`, and `nextDueAt`)**:
   - **Given** an authenticated learner who owns an archived deck (`isArchived = true`) containing 20 overdue `REVIEW` cards, 15 `NEW` cards, and a future scheduled card at `now + 1h`, and has zero active non-archived decks,
   - **When** the client sends `GET /api/v1/reviews/summary`,
   - **Then** the response returns `dueCount: 0`, `newAvailable: 0`, and `nextDueAt: null`.

6. **Scenario 6 (Edge Case — Timezone resolution priority and safe fallback to `'UTC'` on invalid timezone)**:
   - **Given** a client sends `GET /api/v1/reviews/summary?timezone=Invalid/Timezone` with header `X-Timezone: Not_A_Zone` (or omits both),
   - **When** the server processes the request,
   - **Then** it does not return `400 Bad Request`, resolves `timezone: "UTC"`, and computes `endOfDayAt` as `23:59:59.999Z` of the current UTC date; and when `?timezone=Asia/Tokyo` is valid and `X-Timezone: America/New_York` is also present, `?timezone=Asia/Tokyo` takes priority (`timezone: "Asia/Tokyo"`).

7. **Scenario 7 (Edge Case — Conditional `If-None-Match` returns `304 Not Modified` with empty body)**:
   - **Given** a client previously called `GET /api/v1/reviews/summary` and received `ETag: W/"<sha256-hex>"`, and none of the 10 summary fields have changed since the previous poll,
   - **When** the client sends `GET /api/v1/reviews/summary` with header `If-None-Match: W/"<sha256-hex>"`,
   - **Then** the server responds with HTTP `304 Not Modified`, an empty response body, `ETag: W/"<sha256-hex>"`, and `Cache-Control: private, must-revalidate, max-age=0`.

8. **Scenario 8 (Security / RBAC — Unauthenticated request rejected)**:
   - **Given** a client has no JWT or an expired/invalid JWT token,
   - **When** the client sends `GET /api/v1/reviews/summary`,
   - **Then** `JwtAuthGuard` rejects the request with HTTP `401 Unauthorized`.

---

## 3. Edge Cases & Boundary Matrix

| Edge Case ID | Boundary / Trigger Condition | Expected System Behavior | Business Rule |
| :--- | :--- | :--- | :--- |
| **EC-REM-01** | **`streakAtRisk` Exact 3-Hour Boundary**: `currentStreak >= 3`, `studiedToday === 0`, `!isActiveToday`, and `msUntilEndOfDay === 10,800,000` (3h) vs `10,800,001` (>3h) | Returns `streakAtRisk: true` at `<= 10,800,000 ms` (and `> 0`), and `streakAtRisk: false` at `>= 10,800,001 ms`. | `BR-REM-006` |
| **EC-REM-02** | **`currentStreak < 3` Threshold**: `currentStreak` is `0`, `1`, or `2` with `< 3h` until midnight and `studiedToday === 0` | Returns `streakAtRisk: false`. Only streaks of 3 or more days trigger risk warnings. | `BR-REM-006` |
| **EC-REM-03** | **Learner Has `streakFreezes > 0` Near Midnight**: `currentStreak >= 3`, `studiedToday === 0`, `!isActiveToday`, `msUntilEndOfDay <= 3h`, and `streakFreezes === 2` | Returns `streakAtRisk: true` so the learner is warned before midnight rather than silently burning a Streak Freeze. | `BR-REM-006` |
| **EC-REM-04** | **Archived Deck Exclusion**: User has overdue `LEARNING`/`MASTERED` cards or `NEW` cards inside decks where `isArchived === true` | Strictly excluded from `dueCount`, `newAvailable`, and `nextDueAt`. Note: `studiedToday` still counts all `ReviewLog` rows completed today even if the deck was archived later today. | `BR-REM-002`, `BR-REM-004` |
| **EC-REM-05** | **Invalid or Missing Timezone Input**: `?timezone=Invalid/Zone` and `X-Timezone: Mars/Phobos` (or both omitted) | Never throws `400 Bad Request`. Safely falls back to `'UTC'` (`?timezone=` valid → `X-Timezone` valid → `'UTC'`). | `BR-REM-001` |
| **EC-REM-06** | **Brand-New User (Zero Decks, Zero Reviews)**: Newly registered user calls `GET /api/v1/reviews/summary` | Returns `dueCount: 0`, `newAvailable: 0`, `studiedToday: 0`, `dailyGoal: 10`, `goalReached: false`, `currentStreak: 0`, `streakAtRisk: false`, `timezone: "<resolved>"`, `endOfDayAt: "<ISO>"`, `nextDueAt: null`. | `BR-REM-002`..`007` |
| **EC-REM-07** | **DST & Half-Hour/45-Minute Timezone Offsets**: User in `Asia/Kolkata` (`UTC+5:30`), `Asia/Kathmandu` (`UTC+5:45`), or `America/New_York` on DST transition day | Local calendar date and `[startOfDayUtc, endOfDayUtc]` are computed accurately via `Intl.DateTimeFormat.prototype.formatToParts`. | `BR-REM-001`, `RISK-REM-002` |
| **EC-REM-08** | **Multi-Value or Wildcard `If-None-Match`**: Header contains `W/"other", W/"<current-hash>"` or `*` | Matches current ETag and responds with `304 Not Modified` and empty body. | `BR-REM-008` |

---

## 4. Requirements *(mandatory)*

### Functional Requirements

- **REQ-REM-001 (Authenticated Review Summary Endpoint & Active Deck Scoping)**:
  - The backend SHALL expose `GET /api/v1/reviews/summary` protected by `JwtAuthGuard` (`401 Unauthorized` on missing/invalid JWT).
  - All card progress aggregations (`dueCount`, `newAvailable`, `nextDueAt`) SHALL be strictly scoped to cards belonging to active, non-archived decks owned by the authenticated user (`userId === user.sub` AND `card: { deck: { userId: user.sub, isArchived: false } }`).
  - *Traces to*: `BR-REM-002`, `BR-REM-007`, `ASM-REM-001`, `ASM-REM-003`.

- **REQ-REM-002 (Scheduled Due Count, Uncapped New Available Count, and Next Due Timestamp)**:
  - Within the user's active non-archived decks, the system SHALL compute:
    1. `dueCount`: Total count of `UserCardProgress` records where `status !== 'NEW'` (`status: { not: 'NEW' }`) and `nextReviewDate <= now`.
    2. `newAvailable`: Total uncapped count of `UserCardProgress` records where `status === 'NEW'`.
    3. `nextDueAt`: The earliest `nextReviewDate` formatted as a UTC ISO 8601 string among `UserCardProgress` records where `status !== 'NEW'` and `nextReviewDate > now`, or `null` if no future scheduled review exists.
  - *Traces to*: `BR-REM-003`, `BR-REM-005`, `ASM-REM-004`, `ASM-REM-006`.

- **REQ-REM-003 (Multi-Source Timezone Resolution & Local Day Boundaries)**:
  - The endpoint SHALL resolve the user's IANA timezone using the priority order:
    1. Valid `@Query('timezone')` parameter,
    2. Valid `@Headers('x-timezone')` header,
    3. Fallback `'UTC'` if omitted or invalid according to `Intl.DateTimeFormat`.
  - Using the resolved `timezone`, the system SHALL compute the current local calendar day's `[startOfDayUtc, endOfDayUtc]` window and return `timezone` along with `endOfDayAt` (`23:59:59.999` local time serialized as a UTC ISO 8601 string).
  - *Traces to*: `BR-REM-001`, `ASM-REM-007`.

- **REQ-REM-004 (Daily Study Progress — `studiedToday`, `dailyGoal`, `goalReached`)**:
  - The system SHALL compute `studiedToday` as the count of `ReviewLog` rows for `userId` where `reviewedAt` falls within `[startOfDayUtc, endOfDayUtc]` (inclusive), retrieve `dailyGoal` from `User.dailyGoal` (default `10`), and compute `goalReached = (studiedToday >= dailyGoal)`.
  - *Traces to*: `BR-REM-004`, `ASM-REM-005`.

- **REQ-REM-005 (Streak Integration & `streakAtRisk` 3-Hour Warning Evaluation)**:
  - The system SHALL invoke `StreakService.getStreak(userId, timezone)` to obtain `currentStreak` and `isActiveToday`, and SHALL evaluate `streakAtRisk` as `true` if and only if:
    `currentStreak >= 3 && studiedToday === 0 && !isActiveToday && msUntilEndOfDay > 0 && msUntilEndOfDay <= 3 * 3600 * 1000` (`10,800,000 ms`), regardless of whether `streakFreezes > 0`.
  - *Traces to*: `BR-REM-006`, `ASM-REM-002`.

- **REQ-REM-006 (Weak `ETag` Generation & Conditional `304 Not Modified` Support)**:
  - The system SHALL compute a Weak ETag `W/"<sha256-hex>"` over the canonical JSON serialization of the 10 `ReviewSummaryDto` fields (`dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt`).
  - Every response (`200 OK` or `304 Not Modified`) SHALL include `ETag: W/"<sha256-hex>"` and `Cache-Control: private, must-revalidate, max-age=0`.
  - When the request's `If-None-Match` header matches the computed ETag (supporting exact weak/strong token comparison, comma-separated list, or `*`), the server SHALL respond with `304 Not Modified` and an empty body.
  - *Traces to*: `BR-REM-007`, `BR-REM-008`, `ASM-REM-008`.

### Key Entities *(0 Schema Migrations)*

- **`User`** (`users`): Read-only lookup of `dailyGoal` (defaults to `10`).
- **`Deck`** (`decks`): Filtered via relation (`userId === user.sub && isArchived === false`) utilizing composite index `@@index([userId, isArchived])`.
- **`UserCardProgress`** (`user_card_progress`): Aggregated for `dueCount`, `newAvailable`, and earliest future `nextDueAt`.
- **`ReviewLog`** (`review_logs`): Counted for `studiedToday` within `[startOfDayUtc, endOfDayUtc]` utilizing composite index `@@index([userId, reviewedAt])`.
- **`UserStreak`** (`user_streaks`): Accessed via `StreakService.getStreak(userId, timezone)` for `currentStreak` and `isActiveToday`.
- **`ReviewSummaryDto`** (`@wordstreak/shared-types`): Shared 10-field TypeScript contract returned inside `ApiResponse<ReviewSummaryDto>`.

---

## 5. Traceability Matrix

| Requirement ID | Business Rules | Assumptions | User Story / Scenarios | Target Files |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-REM-001** | `BR-REM-002`, `BR-REM-007` | `ASM-REM-001`, `ASM-REM-003` | `US-REM-01` (Scenarios 1, 5, 8) | `packages/shared-types/src/reviews.ts`, `reviews.controller.ts`, `reviews.service.ts` |
| **REQ-REM-002** | `BR-REM-003`, `BR-REM-005` | `ASM-REM-004`, `ASM-REM-006` | `US-REM-01` (Scenarios 1, 5) | `reviews.service.ts`, `reviews.service.spec.ts` |
| **REQ-REM-003** | `BR-REM-001` | `ASM-REM-007` | `US-REM-01` (Scenarios 1, 6) | `reviews.controller.ts`, `reviews.service.ts`, `reviews.service.spec.ts` |
| **REQ-REM-004** | `BR-REM-004` | `ASM-REM-005` | `US-REM-01` (Scenarios 1, 2) | `reviews.service.ts`, `reviews.service.spec.ts` |
| **REQ-REM-005** | `BR-REM-006` | `ASM-REM-002` | `US-REM-01` (Scenarios 1, 2, 3, 4) | `reviews.service.ts`, `reviews.service.spec.ts` |
| **REQ-REM-006** | `BR-REM-007`, `BR-REM-008` | `ASM-REM-008` | `US-REM-01` (Scenarios 1, 7) | `reviews.controller.ts`, `reviews.controller.spec.ts` |

---

## 6. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Low-Latency Aggregation)**: 95% of `GET /api/v1/reviews/summary` requests complete in `< 80ms` by executing all independent database reads and streak resolution concurrently.
- **SC-002 (Compact Payload & Zero-Body Caching)**: `200 OK` serialized JSON payload is `< 500 bytes` (containing zero flashcard text/media content), and `304 Not Modified` responses transfer `0 bytes` of body payload.
- **SC-003 (100% Timezone Resilience)**: 100% of valid IANA timezones (including half-hour/45-minute offsets and DST transitions) resolve accurate local midnight boundaries, and 100% of malformed or missing timezone inputs safely fall back to `'UTC'` without `400 Bad Request` errors.
- **SC-004 (Branch Coverage)**: 100% unit test coverage of all 8 Gherkin acceptance scenarios (`goalReached`, `streakAtRisk` 3-hour boundary, `currentStreak < 3`, `streakFreezes > 0` override, archived deck exclusion, timezone priority/fallback, and `ETag` / `304 Not Modified`).

---

## 7. Assumptions & Scope Boundaries

- **Confirmed Assumptions**: `ASM-REM-001` through `ASM-REM-008` as signed off in [`baseline.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/baseline.md) and [`04-risk-assessment.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/04-risk-assessment.md).
- **In Scope (Must-Have P0)**:
  - `ReviewSummaryDto` exported from `@wordstreak/shared-types`.
  - `GET /api/v1/reviews/summary` endpoint in `ReviewsController` & `ReviewsService`.
  - Timezone resolution (`?timezone=` → `X-Timezone` → `'UTC'`) & DST-safe local day UTC boundary calculation.
  - Weak ETag (`W/"<sha256-hex>"`) & `304 Not Modified` support with `Cache-Control: private, must-revalidate, max-age=0`.
  - Unit tests in `reviews.service.spec.ts` and `reviews.controller.spec.ts`.
- **Out of Scope (Won't-Have in `US-REM-01`)**:
  - Database schema migrations (`apps/api/prisma/schema.prisma` is unchanged).
  - Chrome Extension MV3 `chrome.alarms` & Badge UI listener (`US-ECO-05`).
  - Chrome Extension OS notification engine (`US-ECO-06`) and Options page (`US-ECO-07`).
