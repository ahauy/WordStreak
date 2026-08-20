# Risk Register & Contradiction Scan: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## 1. Contradiction & Deadlock Scan

| Check                          | Potential Conflict                                                                 | Mitigation / Resolution                                                                                                               |
| :----------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Timezone Shift vs Midnight** | User changes timezone from UTC+7 to UTC-5 mid-day, creating an apparent date jump. | Minimum 4-hour cooldown between consecutive day increments; server-side validation using client IANA timezone with UTC normalization. |
| **Concurrent Submissions**     | User submits 2 flashcards simultaneously from two browser tabs.                    | Database row lock / Prisma transaction on `UserStreak` ensures atomic increment and prevents double streak addition.                  |
| **Offline Date Tampering**     | Client local system clock is altered to manipulate streaks.                        | Server always computes `now` using authoritative server UTC time converted to user's specified IANA timezone.                         |

---

## 2. Risk Register

| Risk ID           | Category  | Description                                                                     | Likelihood | Impact | Mitigation Strategy                                                               |
| :---------------- | :-------- | :------------------------------------------------------------------------------ | :--------: | :----: | :-------------------------------------------------------------------------------- |
| `RISK-STREAK-001` | Technical | Database contention during high-volume review submissions.                      |    Low     | Medium | Optimized upsert query with index on `userId`.                                    |
| `RISK-STREAK-002` | Business  | Learner demotivated by unintended streak loss due to daylight saving or travel. |   Medium   |  High  | Accurate IANA timezone conversion; grace period / pending indicator on dashboard. |
| `RISK-STREAK-003` | Security  | Timezone spoofing to artificially inflate streak.                               |    Low     |  Low   | Streak increments require valid review activity log and 4h cooldown.              |

---

## 3. Scope Bounding (MoSCoW Matrix)

### Must-Have (v1 - This Feature)

- Accurate daily streak increment upon completing SRS flashcard review or quiz.
- Timezone-aware calendar day boundary calculation (IANA timezone strings).
- Idempotent execution within the same calendar day.
- REST endpoints: `GET /api/v1/streaks/me`, `POST /api/v1/streaks/record-activity`.
- Frontend `useStreak` hook, dynamic `StreakFlame` counter, and `StreakCelebrationModal`.

### Should-Have (v1.1)

- User profile preference for fixed timezone selection.

### Could-Have (Sprint 4)

- Streak Freeze item protection (`US-GAME-02`).
- XP multipliers linked to streak milestones (`US-GAME-03`).

### Won't-Have (v1)

- Paid streak recovery (WordStreak is 100% free forever per `apps/web/MEMORY.md`).
- Social streak battles / leaderboards (Future Phase).
