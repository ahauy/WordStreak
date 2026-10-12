# Elicitation: Review Summary API for Extension (`US-REM-01`)

## Stage 1 — Business Value

- **Problem & Pain Point**: The Chrome Extension (Manifest V3 Service Worker) wakes up periodically via `chrome.alarms` and on browser startup to update the extension icon badge and evaluate conditional study reminder rules (`US-ECO-05`, `US-ECO-06`). Calling `GET /api/v1/reviews/due` transfers full card objects (meanings, examples, mnemonics, audio/image URLs) and does not provide unified daily goal progress (`studiedToday`, `goalReached`), local day-end countdown (`endOfDayAt`, `streakAtRisk`), or the next scheduled card timestamp (`nextDueAt`).
- **Target Personas**: `Authenticated Learner` (using the WordStreak Chrome Extension or Web Application).
- **Success Metrics**:
  - **Primary Product Metric**: Enable zero-friction conditional reminder evaluation and accurate extension badge updates with `< 1 KB` JSON payload size (and `0 B` body on `304 Not Modified`).
  - **Operational Metric**: P95 API latency `< 80ms` for `GET /api/v1/reviews/summary`.

---

## Stage 2 — Interactive Elicitation Interview Decisions (Customer Confirmed)

### Question 1: `streakAtRisk` Formula & Interaction with `streakFreezes` (Pillar 3 — Business Rules & Algorithms)

- **Context**: The extension needs a boolean `streakAtRisk` flag to trigger an urgent reminder ("Chuỗi N ngày sắp mất") when a learner with an established streak has not studied today and local midnight is approaching.
- **Customer Decision**: **Confirmed Option A**
  - **Formula**:
    ```
    streakAtRisk = (currentStreak >= 3) && (studiedToday === 0 && !isActiveToday) && (msUntilEndOfDay <= 3 * 3600 * 1000)
    ```
    where `msUntilEndOfDay = endOfDayUtc.getTime() - now.getTime()` (`0 < msUntilEndOfDay <= 10,800,000` ms, i.e., within 3 hours of `endOfDayAt`).
  - **Streak Freeze Interaction**: `streakAtRisk` evaluates to `true` regardless of whether the user holds `streakFreezes > 0`. This warns the learner before local midnight so they do not accidentally burn a limited Streak Freeze when they still have time to complete a quick review.

### Question 2: Semantics of `dueCount`, `newAvailable`, `studiedToday`, `goalReached`, `endOfDayAt`, and `nextDueAt` (Pillar 3 & Pillar 5 — Data Boundaries)

- **Context**: Clear separation between scheduled due cards (`dueCount`) and unstudied new cards (`newAvailable`) is required so the extension badge reflects actual scheduled reviews due now rather than inflating the badge with hundreds of newly created cards, and `nextDueAt` allows the extension to schedule a precise `chrome.alarms` wakeup.
- **Customer Decision**: **Confirmed Option B**
  - **Active Deck Scope**: Only cards belonging to non-archived decks owned by the authenticated user (`card: { deck: { userId, isArchived: false } }`) are counted in `dueCount`, `newAvailable`, and `nextDueAt`.
  - **`dueCount`**: Count of `UserCardProgress` records in active decks where `status !== 'NEW'` and `nextReviewDate <= now`.
  - **`newAvailable`**: Total uncapped count of `UserCardProgress` records in active decks where `status === 'NEW'`.
  - **`studiedToday`**: Count of `ReviewLog` rows for `userId` where `reviewedAt` falls within today's local timezone window `[startOfDayUtc, endOfDayUtc]`.
  - **`dailyGoal`**: The user's configured `User.dailyGoal` (integer, default `10`).
  - **`goalReached`**: Boolean `studiedToday >= dailyGoal`.
  - **`endOfDayAt`**: UTC ISO 8601 string representing `23:59:59.999` of today in the resolved user IANA timezone.
  - **`nextDueAt`**: Earliest `nextReviewDate` (UTC ISO 8601 string) among `UserCardProgress` records in active decks with `status !== 'NEW'` and `nextReviewDate > now`, or `null` if no future scheduled review exists.

### Question 3: Timezone Resolution Priority & HTTP `ETag` / `304 Not Modified` Protocol (Pillar 4 & Pillar 6 — Workflows & NFRs)

- **Context**: Background MV3 service workers poll periodically; supporting both query/header timezone inputs and HTTP conditional requests (`If-None-Match` / `304 Not Modified`) minimizes bandwidth and client processing when learning state has not changed.
- **Customer Decision**: **Confirmed Option A**
  - **Timezone Resolution**: Accept both `@Query('timezone')` and `@Headers('x-timezone')` with resolution priority:
    1. `?timezone=` query parameter (if provided and valid IANA timezone via `Intl.DateTimeFormat`).
    2. `X-Timezone` request header (if query parameter is omitted or invalid, and header is a valid IANA timezone).
    3. Fallback to `'UTC'` if neither is provided or both are invalid IANA timezone strings.
  - **Weak ETag Computation**: Compute a Weak ETag `W/"<sha256-hex>"` (or deterministic hash digest) over the canonical JSON serialization of the 10 summary fields:
    `{ dueCount, newAvailable, studiedToday, dailyGoal, goalReached, currentStreak, streakAtRisk, timezone, endOfDayAt, nextDueAt }`.
  - **Conditional `304 Not Modified` Handling**:
    - If the incoming request's `If-None-Match` header matches the computed Weak ETag (supporting exact match, comma-separated ETag list, or `*`), respond with HTTP `304 Not Modified`, an empty body, `ETag: W/"<sha256-hex>"`, and `Cache-Control: private, must-revalidate, max-age=0`.
    - Otherwise, respond with HTTP `200 OK`, the standard `ApiResponse<ReviewSummaryDto>` JSON body, `ETag: W/"<sha256-hex>"`, and `Cache-Control: private, must-revalidate, max-age=0`.
  - **Database Schema Impact**: Zero database migrations required.

---

## Assumptions Confirmed

| ID | Assumption / Confirmed Rule | Status | Source |
| :--- | :--- | :--- | :--- |
| **ASM-REM-001** | `GET /api/v1/reviews/summary` requires a valid JWT access token via `JwtAuthGuard`; unauthenticated requests receive `401 Unauthorized`. | `CONFIRMED` | Stage 2 Interview (Q1–Q3) |
| **ASM-REM-002** | `streakAtRisk` is `true` iff `currentStreak >= 3`, `studiedToday === 0 && !isActiveToday`, and remaining time until local end-of-day is `<= 3 hours` (`10,800,000 ms`), even when `streakFreezes > 0`. | `CONFIRMED` | Stage 2 Interview (Q1 — Option A) |
| **ASM-REM-003** | Card progress metrics (`dueCount`, `newAvailable`, `nextDueAt`) strictly exclude archived decks (`deck.isArchived === false`) and only count decks owned by `userId`. | `CONFIRMED` | Stage 2 Interview (Q2 — Option B) |
| **ASM-REM-004** | `dueCount` counts only scheduled cards (`status !== 'NEW'` and `nextReviewDate <= now`), while `newAvailable` reports the total uncapped count of `status === 'NEW'` cards in active decks. | `CONFIRMED` | Stage 2 Interview (Q2 — Option B) |
| **ASM-REM-005** | `studiedToday` counts `ReviewLog` entries for `userId` within the user's local calendar day `[startOfDayUtc, endOfDayUtc]`, and `goalReached` is `studiedToday >= dailyGoal`. | `CONFIRMED` | Stage 2 Interview (Q2 — Option B) |
| **ASM-REM-006** | `nextDueAt` returns the earliest `nextReviewDate` (ISO 8601 UTC) where `status !== 'NEW'` and `nextReviewDate > now` in active decks, or `null` if none exists. | `CONFIRMED` | Stage 2 Interview (Q2 — Option B) |
| **ASM-REM-007** | Timezone resolution prioritizes valid `?timezone=` query param over valid `X-Timezone` header, falling back safely to `'UTC'` without throwing `400 Bad Request` on invalid timezone strings. | `CONFIRMED` | Stage 2 Interview (Q3 — Option A) |
| **ASM-REM-008** | Weak ETag `W/"<sha256-hex>"` is computed over the 10 response fields (`endOfDayAt` is deterministic for a given user local day, avoiding per-millisecond ETag churn), returning `304 Not Modified` on `If-None-Match` hit. | `CONFIRMED` | Stage 2 Interview (Q3 — Option A) |

## Open Questions

- None. All business rules, formulas, and edge cases are confirmed by the customer.
