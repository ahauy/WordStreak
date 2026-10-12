# Formal Requirements & User Stories: Review Summary API for Extension (`US-REM-01`)

## 1. Formal Software Requirements (`REQ-REM-###`)

### REQ-REM-001: Authenticated Review Summary Endpoint & Active Deck Scoping
- **Category**: Backend API & RBAC
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The backend SHALL expose `GET /api/v1/reviews/summary` protected by `JwtAuthGuard`. All card progress aggregations (`dueCount`, `newAvailable`, `nextDueAt`) SHALL be strictly scoped to cards belonging to active, non-archived decks owned by the authenticated user (`deck.userId === user.sub && deck.isArchived === false`).
- **Derived from**: BR-REM-002, BR-REM-007, ASM-REM-001, ASM-REM-003
- **Business Rules**: BR-REM-002, BR-REM-007
- **Non-Functional Requirements**: P95 latency `< 80ms`; `401 Unauthorized` on missing/invalid JWT.
- **Dependencies**: None

### REQ-REM-002: Scheduled Due Count, Uncapped New Available Count, and Next Due Timestamp
- **Category**: Spaced Repetition Aggregation
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: Within the user's active non-archived decks, the system SHALL compute:
  1. `dueCount`: Total count of `UserCardProgress` records where `status !== 'NEW'` and `nextReviewDate <= now`.
  2. `newAvailable`: Total uncapped count of `UserCardProgress` records where `status === 'NEW'`.
  3. `nextDueAt`: The earliest `nextReviewDate` formatted as a UTC ISO 8601 string among `UserCardProgress` records where `status !== 'NEW'` and `nextReviewDate > now`, or `null` if no future scheduled review exists.
- **Derived from**: BR-REM-003, BR-REM-005, ASM-REM-004, ASM-REM-006
- **Business Rules**: BR-REM-002, BR-REM-003, BR-REM-005
- **Non-Functional Requirements**: Parallel execution via `Promise.all`; zero card content fields transferred.
- **Dependencies**: REQ-REM-001

### REQ-REM-003: Multi-Source Timezone Resolution & Local Day Boundaries
- **Category**: Timezone & Localization
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The endpoint SHALL resolve the user's IANA timezone using the priority order: (1) valid `@Query('timezone')` parameter, (2) valid `@Headers('x-timezone')` header, (3) fallback `'UTC'` if omitted or invalid according to `Intl.DateTimeFormat`. Using the resolved `timezone`, the system SHALL compute the current local calendar day's `[startOfDayUtc, endOfDayUtc]` window and return `timezone` along with `endOfDayAt` (`23:59:59.999` local time serialized as a UTC ISO 8601 string).
- **Derived from**: BR-REM-001, ASM-REM-007
- **Business Rules**: BR-REM-001
- **Non-Functional Requirements**: Never throw `400 Bad Request` on malformed timezone strings; accurately handle DST and half-hour/45-minute UTC offsets via `Intl.DateTimeFormat`.
- **Dependencies**: REQ-REM-001

### REQ-REM-004: Daily Study Progress (`studiedToday`, `dailyGoal`, `goalReached`)
- **Category**: Learning Progress & Habit Tracking
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The system SHALL compute `studiedToday` as the count of `ReviewLog` rows for `userId` where `reviewedAt` falls within `[startOfDayUtc, endOfDayUtc]` (inclusive), retrieve `dailyGoal` from `User.dailyGoal` (default `10`), and compute `goalReached = (studiedToday >= dailyGoal)`.
- **Derived from**: BR-REM-004, ASM-REM-005
- **Business Rules**: BR-REM-001, BR-REM-004
- **Non-Functional Requirements**: Uses composite index `review_logs(userId, reviewedAt)`.
- **Dependencies**: REQ-REM-003

### REQ-REM-005: Streak Integration & `streakAtRisk` 3-Hour Warning Evaluation
- **Category**: Gamification & Retention
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The system SHALL invoke `StreakService.getStreak(userId, timezone)` to obtain `currentStreak` and `isActiveToday`, and SHALL evaluate `streakAtRisk` as `true` if and only if:
  `currentStreak >= 3 && studiedToday === 0 && !isActiveToday && msUntilEndOfDay > 0 && msUntilEndOfDay <= 3 * 3600 * 1000` (`10,800,000 ms`), regardless of whether `streakFreezes > 0`.
- **Derived from**: BR-REM-006, ASM-REM-002
- **Business Rules**: BR-REM-006
- **Non-Functional Requirements**: Deterministic calculation using server clock `now`.
- **Dependencies**: REQ-REM-003, REQ-REM-004

### REQ-REM-006: Weak `ETag` Generation & Conditional `304 Not Modified` Support
- **Category**: HTTP Caching & Bandwidth Optimization
- **Priority**: Must-Have (P0)
- **Status**: Approved
- **Description**: The system SHALL compute a Weak ETag `W/"<sha256-hex>"` over the canonical JSON serialization of the 10 `ReviewSummaryDto` fields (`dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt`). Every response (`200` or `304`) SHALL include `ETag: W/"<sha256-hex>"` and `Cache-Control: private, must-revalidate, max-age=0`. When the request's `If-None-Match` header matches the computed ETag (supporting exact match, comma-separated list, or `*`), the server SHALL respond with `304 Not Modified` and an empty body.
- **Derived from**: BR-REM-007, BR-REM-008, ASM-REM-008
- **Business Rules**: BR-REM-007, BR-REM-008
- **Non-Functional Requirements**: Payload `< 500 bytes` on `200 OK`; `0 bytes` on `304 Not Modified`.
- **Dependencies**: REQ-REM-001, REQ-REM-002, REQ-REM-003, REQ-REM-004, REQ-REM-005

---

## 2. User Stories (`US-REM-01`)

### US-REM-01: API tóm tắt trạng thái học cho Extension (`GET /api/v1/reviews/summary`)

**As an** Authenticated Learner using the WordStreak Chrome Extension (or Web App)  
**I want to** fetch a lightweight, timezone-aware summary of my due cards, daily goal progress, streak risk status, and next due review timestamp via `GET /api/v1/reviews/summary` with `ETag` / `304 Not Modified` support  
**So that** my browser extension can accurately update its badge count, schedule timely alarms via `nextDueAt`, and alert me when my streak is at risk without downloading full flashcard payloads.  
**Traces to**: REQ-REM-001, REQ-REM-002, REQ-REM-003, REQ-REM-004, REQ-REM-005, REQ-REM-006  
**Derived from**: BR-REM-001..008, ASM-REM-001..008

#### Acceptance Criteria (Gherkin Given-When-Then):

- **Scenario 1 (Happy Path — Returns complete 10-field summary with Weak ETag)**
  - **Given** I am an authenticated learner with `dailyGoal = 10`, `currentStreak = 5` (`isActiveToday = false`), 12 cards in active decks with `status = 'REVIEW'` and `nextReviewDate <= now`, 35 cards in active decks with `status = 'NEW'`, 4 `ReviewLog` entries recorded today in `Asia/Ho_Chi_Minh`, and the earliest future scheduled card in an active deck at `"2026-10-12T15:30:00.000Z"`
  - **And** the current server time is `"2026-10-12T10:00:00.000Z"` (`17:00:00` in `Asia/Ho_Chi_Minh`, which is `> 3 hours` before local midnight `"2026-10-12T16:59:59.999Z"`)
  - **When** I send `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh` with a valid Bearer JWT
  - **Then** the response status is `200 OK`
  - **And** the response headers include `ETag: W/"<sha256-hex>"` and `Cache-Control: private, must-revalidate, max-age=0`
  - **And** the JSON body matches:
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

- **Scenario 2 (Happy Path — Daily goal reached when `studiedToday >= dailyGoal`)**
  - **Given** I am an authenticated learner with `dailyGoal = 10` and I have completed `10` reviews today (`studiedToday = 10`, `isActiveToday = true`)
  - **When** I send `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh`
  - **Then** the response status is `200 OK` with `goalReached: true`, `studiedToday: 10`, and `streakAtRisk: false`.

- **Scenario 3 (Edge Case — `streakAtRisk = true` within 3-hour window before local midnight, even when `streakFreezes > 0`)**
  - **Given** I am an authenticated learner with `currentStreak = 3`, `streakFreezes = 2`, `studiedToday = 0`, and `isActiveToday = false`
  - **And** the current time in my timezone (`Asia/Ho_Chi_Minh`) is `21:00:00.000` (`msUntilEndOfDay = 10,799,999 ms <= 10,800,000 ms`, or at the exact 3h boundary `10,800,000 ms`)
  - **When** I send `GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh`
  - **Then** the response returns `streakAtRisk: true` and `currentStreak: 3` so I am warned before accidentally burning a Streak Freeze.

- **Scenario 4 (Edge Case — `streakAtRisk = false` when `currentStreak < 3` or `msUntilEndOfDay > 3 hours`)**
  - **Given** I have `studiedToday = 0` and `isActiveToday = false`
  - **When** either `currentStreak` is `2` (`< 3`) within 1 hour of midnight, OR `currentStreak` is `10` with `3 hours and 1 minute` remaining until `endOfDayAt` (`msUntilEndOfDay > 10,800,000 ms`)
  - **Then** `GET /api/v1/reviews/summary` returns `streakAtRisk: false`.

- **Scenario 5 (Edge Case — Archived decks excluded from `dueCount`, `newAvailable`, and `nextDueAt`)**
  - **Given** I own an archived deck (`isArchived = true`) containing 20 overdue `REVIEW` cards, 15 `NEW` cards, and a future scheduled card at `now + 1h`, and I have zero active non-archived decks
  - **When** I send `GET /api/v1/reviews/summary`
  - **Then** the response returns `dueCount: 0`, `newAvailable: 0`, and `nextDueAt: null`.

- **Scenario 6 (Edge Case — Timezone resolution priority and safe fallback to `'UTC'` on invalid timezone)**
  - **Given** I send `GET /api/v1/reviews/summary?timezone=Invalid/Timezone` with header `X-Timezone: Not_A_Zone` (or omit both)
  - **When** the server processes the request
  - **Then** it does not return `400 Bad Request`, resolves `timezone: "UTC"`, and computes `endOfDayAt` as `23:59:59.999Z` of the current UTC date
  - **And** if `?timezone=Asia/Tokyo` is valid and `X-Timezone: America/New_York` is also present, `?timezone=Asia/Tokyo` takes priority (`timezone: "Asia/Tokyo"`).

- **Scenario 7 (Edge Case — Conditional `If-None-Match` returns `304 Not Modified` with empty body)**
  - **Given** I previously called `GET /api/v1/reviews/summary` and received `ETag: W/"<sha256-hex>"`
  - **And** none of the 10 summary fields have changed since my previous poll
  - **When** I send `GET /api/v1/reviews/summary` with header `If-None-Match: W/"<sha256-hex>"`
  - **Then** the server responds with HTTP `304 Not Modified`, an empty response body, `ETag: W/"<sha256-hex>"`, and `Cache-Control: private, must-revalidate, max-age=0`.

- **Scenario 8 (Security / RBAC — Unauthenticated request rejected)**
  - **Given** a client has no JWT or an expired/invalid JWT token
  - **When** the client sends `GET /api/v1/reviews/summary`
  - **Then** `JwtAuthGuard` rejects the request with HTTP `401 Unauthorized`.
