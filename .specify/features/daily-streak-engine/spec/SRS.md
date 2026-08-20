# Software Requirements Specification (SRS): Daily Streak Engine

- **Document ID**: `SRS-STREAK-001`
- **Feature Slug**: `daily-streak-engine`
- **Date**: 2026-08-20
- **Version**: 1.0

---

## 1. Functional Requirements

- **REQ-STREAK-001**: The system MUST provide an endpoint `GET /api/v1/streaks/me` to retrieve the authenticated user's current streak stats, best streak, status for today, and mascot flame tier.
  - _Derived from_: `BR-STREAK-004`, `01-elicitation.md` (Pillar 1 & 2).
- **REQ-STREAK-002**: The system MUST provide an endpoint `POST /api/v1/streaks/record-activity` that accepts an optional `timezone` (IANA string, e.g., `'Asia/Ho_Chi_Minh'`) to record study activity and calculate streak changes.
  - _Derived from_: `BR-STREAK-001`, `BR-STREAK-002`, `BR-STREAK-003`.
- **REQ-STREAK-003**: The backend SRS review submission handler (`POST /api/v1/reviews/submit`) MUST automatically invoke streak activity recording for the user.
  - _Derived from_: `BR-STREAK-001`, `02-gap-analysis.md` (GAP-02).
- **REQ-STREAK-004**: The streak calculation algorithm MUST convert UTC timestamps to the user's local date `YYYY-MM-DD` and correctly handle:
  - Already active today: Idempotent no-op (`streakIncreased: false`).
  - Active yesterday: Increment `currentStreak += 1`, update `bestStreak = max(bestStreak, currentStreak)`.
  - Inactive for $> 1$ day: Reset `currentStreak = 1`.
  - _Derived from_: `BR-STREAK-002`, `BR-STREAK-003`, `ASM-STREAK-003`, `ASM-STREAK-004`.
- **REQ-STREAK-005**: The system MUST lazily create a `UserStreak` record with default `0` values if none exists when queried.
  - _Derived from_: `02-gap-analysis.md` (Transition Plan).
- **REQ-STREAK-006**: The frontend MUST provide a `useStreak` hook to query and update streak state in real-time.
  - _Derived from_: `03-domain-model.md` (Section 4).
- **REQ-STREAK-007**: The frontend Navbar and Dashboard MUST render the Electric Violet Streak Flame with the live streak count and dynamic flame tiers.
  - _Derived from_: `BR-STREAK-006`, `apps/web/MEMORY.md`.
- **REQ-STREAK-008**: The frontend MUST present the `StreakCelebrationModal` with confetti animation whenever a review or practice action triggers `streakIncreased: true`.
  - _Derived from_: `BR-STREAK-007`, `01-elicitation.md` (Pillar 3).

---

## 2. Non-Functional Requirements

- **NFR-PERF-01**: Streak status retrieval latency $< 15\text{ms}$ at P95.
- **NFR-PERF-02**: Streak calculation and database upsert latency $< 25\text{ms}$ during review submission.
- **NFR-A11Y-01**: Streak counters and modal dialogs conform to WCAG 2.1 AA with screen reader aria-labels.
- **NFR-SEC-01**: Streak endpoints protected by `JwtAuthGuard` ensuring users can only view and update their own streak records.
