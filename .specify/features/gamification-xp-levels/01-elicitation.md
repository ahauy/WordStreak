# Elicitation Record: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Date**: 2026-08-21
- **Status**: Completed (Elicited & Confirmed)

---

## Stage 1 — Business Value

### 1. Problem & Pain Point

While WordStreak provides spaced repetition (SRS) and daily streaks, learners lack granular, micro-action positive reinforcement for individual card reviews and daily goal milestones. Without an accumulated XP economy and transparent tier progression (Bronze -> Silver -> Gold -> Diamond -> Master), learners experience motivation plateau after establishing basic streaks. Adding a real-time XP engine with clear milestone rewards and celebration animations provides immediate dopamine feedback, long-term mastery goals, and a foundation for upcoming social leaderboards.

### 2. Target Personas

- **Learner (Primary Actor)**: Free and active learners who want clear progression feedback, XP tracking, visual level milestones, and celebratory recognition when leveling up.
- **Pro Subscriber / Dedicated Learner**: Users aiming for higher tier ranks (Diamond, Master) with intense daily study habits.
- **System Admin**: Platform operators monitoring gamification economy balance, investigating anomaly XP logs, or re-evaluating tier configurations.
- **Guest (Unauthenticated)**: Prospective users who can view public rank tiers in promo materials but cannot accrue XP or level up without creating an account.

### 3. Success Metrics

- **D14 Retention Rate**: Increase 14-day learner retention by **+25%**.
- **Daily Review Session Completion Rate**: Increase completion of daily review queues from 62% to **85%**.
- **Average Daily Cards Reviewed**: Increase mean reviews per active user by **+30%** (driven by the +10 XP per card incentive).
- **Latency & Performance SLA**: XP calculation, level-up evaluation, and ledger logging overhead **P95 < 50ms** during review submissions.

---

## Pillar 1 — Personas, Actors & RBAC

- **Role Capabilities**:
  - `Learner`:
    - View current total XP, current Level, tier badge, current level XP progress, and XP needed for next level.
    - View personal XP transaction ledger (`UserActivityLog`).
    - Earn XP automatically via card reviews, daily goal completions, and streak milestones.
    - Receive level-up notifications and trigger celebratory modal with confetti.
    - Cannot manually increment or mutate XP values (server-authoritative only).
  - `System Admin`:
    - View global XP distribution analytics.
    - Audit individual user XP ledgers for anti-cheat verification.
    - Trigger administrative XP recalibration/backfill script if necessary.
  - `Guest (Unauthenticated)`:
    - Cannot earn XP or store level progress. Progress requires an authenticated user session.
- **Ownership & Isolation**: Each learner strictly owns their XP ledger and level profile. Users can only query their own XP history. Public profiles (future) will only expose aggregated Level and Tier badge, never raw mutable state.

---

## Pillar 2 — State Machine & Level Progression

- **Mastery Tier Hierarchy**:
  - **Tier 1: Bronze** (Levels 1 – 5 | 0 – 499 XP) -> Initial starting tier for all registered learners.
  - **Tier 2: Silver** (Levels 6 – 15 | 500 – 2,499 XP) -> Regular consistent learners.
  - **Tier 3: Gold** (Levels 16 – 30 | 2,500 – 7,499 XP) -> Intermediate mastery.
  - **Tier 4: Diamond** (Levels 31 – 45 | 7,500 – 14,999 XP) -> Advanced dedicated vocabulary builders.
  - **Tier 5: Master** (Levels 46 – 50+ | 15,000+ XP) -> Elite tier with prestige level scaling.

- **Level Calculation Formula**:
  - Progressive non-linear threshold curve:
    $$\text{Total XP Required for Level } L = \text{floor}\left( 50 \times (L - 1)^{1.5} + 50 \times (L - 1) \right)$$
  - Conversely, Level $L$ is computed deterministically from $\text{totalXP}$ via monotonic lookup or exact mathematical inversion.
  - Level progression is **strictly monotonic** (XP can only increase, levels never degrade).

- **Lifecycle & Level-Up State Machine**:
  1. `XP_EARNED_EVENT`: Review submitted, daily goal met, or streak milestone triggered.
  2. `LEDGER_RECORDED`: Transaction written to `UserActivityLog` with delta XP, activity type, and reference ID.
  3. `TOTALS_UPDATED`: User's cached `totalXp` and `level` updated atomically.
  4. `LEVEL_EVALUATED`:
     - If $\text{newLevel} > \text{oldLevel}$: Transition to `LEVEL_UP_PENDING` state.
     - Emit Level-Up payload containing: `previousLevel`, `currentLevel`, `previousTier`, `currentTier`, `isTierPromotion: boolean`.
     - Client transitions to `CELEBRATION_MODAL_ACTIVE` with confetti, sound feedback, and dismiss action.
  5. `STEADY_STATE`: User continues learning in current level band.

---

## Pillar 3 — Business Rules & XP Calculation Formulas

- **BR-XP-001 (Card Review Correct XP)**: Every card reviewed with rating `GOOD (3)` or `EASY (4)` awards **+10 XP**.
- **BR-XP-002 (Card Review Review Effort XP)**: Card reviewed with rating `HARD (2)` awards **+5 XP** (encouraging honest spaced repetition difficulty grading without penalizing effort). Card reviewed with `AGAIN (1)` awards **+0 XP** (preventing spamming rapid fail reviews to farm points).
- **BR-XP-003 (Daily Goal Completion Bonus)**: When a learner reaches their configured `dailyGoal` (e.g. 10 cards reviewed within the current local calendar day), the system awards a one-time bonus of **+50 XP**.
- **BR-XP-004 (Daily Goal Grant Uniqueness)**: Daily Goal XP bonus is granted **strictly once per user per local calendar date** (enforced by unique compound key or date check in `UserActivityLog`). Subsequent reviews on the same day do not re-trigger the +50 XP bonus.
- **BR-XP-005 (7-Day Streak Milestone Bonus)**: When learner achieves or extends their streak to a multiple of 7 days (e.g. Day 7, Day 14, Day 21, Day 28...), the system awards **+100 XP**.
- **BR-XP-006 (30-Day Streak Milestone Bonus)**: When learner achieves or extends their streak to 30 days (and subsequent 30-day multiples: 60, 90, 120...), the system awards a major milestone bonus of **+500 XP**.
- **BR-XP-007 (Practice Quiz Completion Bonus)**: Completing a Practice / Quiz session with $\ge 80\%$ accuracy awards **+30 XP**.
- **BR-XP-008 (Anti-Abuse Rate Limiting)**: Maximum XP earnable from individual card reviews is capped at **500 XP per hour** and **2,000 XP per 24-hour window** to prevent automated bot scripts or macro abuse.
- **BR-XP-009 (Server-Authoritative Clock & Timezone)**: All daily goal resets, streak evaluation, and XP timestamps are resolved server-side using the verified user IANA timezone or UTC fallback. Client-supplied timestamps are never trusted.
- **BR-XP-010 (Atomic Ledger & Dual Update)**: Every XP grant must execute within a PostgreSQL database transaction (`$transaction`), inserting an immutable `UserActivityLog` record and updating `totalXp` and `level` on the user profile to prevent race conditions.

---

## Pillar 4 — Workflows & Edge Cases

### Workflow 1: Single Card Review with XP Grant & Potential Level-Up

1. Learner answers flashcard on `/study` or `/decks/:id/study` with rating `3 (Good)`.
2. Client calls `POST /api/v1/reviews` with `{ cardId, rating: 3 }`.
3. Backend:
   - Evaluates SM-2 interval & creates `ReviewLog`.
   - Records streak activity via `StreakService`.
   - Invokes `XpService.awardReviewXp(userId, cardId, rating)`.
   - Checks if daily review count for today reaches `user.dailyGoal`. If exact threshold reached and not yet awarded today, triggers `XpService.awardDailyGoalXp(userId, todayStr)`.
   - Evaluates if streak crossed a 7-day or 30-day milestone. If yes and not yet awarded for this streak milestone, triggers `XpService.awardStreakMilestoneXp(userId, streakDays)`.
   - Computes total delta XP, new level, and tier.
4. Response payload returns combined review result, streak status, `xpAwarded: number`, `totalXp: number`, `level: number`, `tier: string`, `levelUp: { isLevelUp: boolean, oldLevel, newLevel, newTier, isTierPromotion }`.
5. Frontend displays subtle `+10 XP` floating toast indicator; if `isLevelUp == true`, opens `LevelUpModal` with dynamic tier color styling and confetti.

### Workflow 2: Daily Goal Completion Mid-Session

1. User with `dailyGoal = 10` submits their 10th valid review of the day.
2. Backend detects `todayReviewsCount == 10`.
3. Checks `UserActivityLog` for `activityType = 'DAILY_GOAL_COMPLETED'` and `metadata.date = todayStr`.
4. None exists -> Awards +50 XP bonus in addition to the +10 XP card review.
5. Response returns `xpAwarded: 60`, breakdown: `[{ reason: 'CARD_REVIEW', xp: 10 }, { reason: 'DAILY_GOAL_COMPLETED', xp: 50 }]`.
6. UI displays special "Daily Goal Completed! +50 XP 🎯" toast badge.

### Edge Cases & Resolutions:

- **Offline Review Sync / Replay Attacks**: When client syncs queued offline reviews, each review payload includes an `idempotencyKey` or uses `cardId + reviewedAtTimestamp`. If duplicate request received, backend returns existing result without awarding duplicate XP.
- **Concurrent Review Submissions**: If a user submits rapid simultaneous reviews across 2 tabs, Prisma atomic increment (`increment: xpDelta`) or row-level locking ensures total XP remains exactly consistent with the sum of activity log entries.
- **Timezone Boundary Edge Case**: If user reviews cards at 23:59:50 local time, review 1 (Day N) earns Daily Goal XP. Review 2 at 00:00:10 (Day N+1) is evaluated against Day N+1 goal. Both receive proper isolated daily goal awards based on server-evaluated local date.
- **Level Degradation Protection**: System strictly forbids XP deductions or negative XP transactions for card mistakes (`AGAIN` gives 0 XP, never negative XP). Level never downgrades.

---

## Pillar 5 — Entities, Data Boundaries & Privacy

- **Entities & Schema Additions**:
  1. `User` (extended):
     - `totalXp Int @default(0)`
     - `level Int @default(1)`
     - `tier String @default("BRONZE")`
  2. `UserActivityLog` (new table `user_activity_logs`):
     - `id String @id @default(uuid())`
     - `userId String`
     - `activityType String` (`CARD_REVIEW`, `DAILY_GOAL_COMPLETED`, `STREAK_7_DAYS`, `STREAK_30_DAYS`, `PRACTICE_QUIZ`, `ADMIN_ADJUSTMENT`)
     - `xpEarned Int`
     - `metadata Json?` (e.g. `{ cardId, rating, streakCount, localDate }`)
     - `createdAt DateTime @default(now())`
     - Relations: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
     - Indexes: `@@index([userId, createdAt])`, `@@index([userId, activityType])`
- **Data Privacy & GDPR**:
  - XP records contain strictly non-PII game telemetry (timestamps, scores, card IDs).
  - User deletion triggers full cascade deletion (`onDelete: Cascade`) of all activity logs and gamification balances.
  - Minor data compliance: No behavioral advertising or cross-site tracking based on XP logs.

---

## Pillar 6 — UX Constraints & Non-Functional Requirements

- **Design System & Taste ("No AI Slop")**:
  - **Color Palette & Tier Themes**:
    - `Bronze`: Warm amber metallic (`#CD7F32` / `#B45309`) with soft bronze glow.
    - `Silver`: Platinum slate metallic (`#94A3B8` / `#E2E8F0`) with crisp cool sheen.
    - `Gold`: Radiant solar gold (`#F59E0B` / `#D97706`) with warm amber luminance.
    - `Diamond`: Cyber cyan / ice diamond (`#06B6D4` / `#38BDF8`) with frosty particle glow.
    - `Master`: Regal obsidian violet (`#8B5CF6` / `#A855F7`) with cosmic nebula gradient.
  - **Component Aesthetics**:
    - Minimalist, high-density dashboard topbar widget: `[Tier Icon] Lv. 12 • 1,450 XP (450/600 XP to Lv. 13) [Progress Bar]`.
    - Level progress bar: Sleek 6px height with smooth ease-out spring physics, liquid gradient fill, and subtle shimmer on hover.
    - Floating XP micro-indicator: Floating badge `+10 XP` with gentle upward drift and fade-out animation (Framer Motion / CSS keyframes).
    - Level-Up Modal: Obsidian glass card (`bg-slate-900/90 backdrop-blur-xl border border-white/10`), radiant tier crest animation, multi-colored canvas confetti burst, and haptic/audio confirmation.
- **Accessibility (a11y)**:
  - `prefers-reduced-motion` compliance: Disables particle explosions/confetti and reduces level bar animation duration to 0ms when requested.
  - Screen reader announcements: ARIA live region (`aria-live="polite"`) announcing "Earned 10 XP. Total XP: 1,450. Level 12".
  - Color contrast ratio: Level and tier badges exceed 4.5:1 WCAG 2.1 AA text contrast against dark backgrounds.
- **Internationalization (i18n)**:
  - English and Vietnamese string localizations for all tiers (`Đồng`, `Bạc`, `Vàng`, `Kim Cương`, `Cao Thủ`), modal messages, and reward toasts.

---

## Assumptions Confirmed

- **ASM-XP-001**: XP is awarded server-side upon review rating submission; client cannot inject arbitrary XP values.
- **ASM-XP-002**: Rating `GOOD (3)` and `EASY (4)` grant +10 XP; rating `HARD (2)` grants +5 XP; rating `AGAIN (1)` grants 0 XP.
- **ASM-XP-003**: Daily Goal completion grants a one-time +50 XP bonus per user per local calendar date upon reaching `user.dailyGoal`.
- **ASM-XP-004**: 7-Day streak milestone grants +100 XP on every 7-day interval (7, 14, 21, 28, etc.).
- **ASM-XP-005**: 30-Day streak milestone grants +500 XP on every 30-day interval (30, 60, 90, etc.).
- **ASM-XP-006**: Level formula is deterministic based on total cumulative XP across 5 tiers: Bronze (1-5), Silver (6-15), Gold (16-30), Diamond (31-45), Master (46-50+).
- **ASM-XP-007**: Level progression is permanent and non-degrading (users never lose levels or total XP).
- **ASM-XP-008**: User XP transaction history is permanently logged in an immutable `user_activity_logs` table for auditing and analytics.
- **ASM-XP-009**: Anti-abuse rate limits cap review XP at 500 XP/hour and 2,000 XP/24h to prevent automated spamming.
- **ASM-XP-010**: Existing active users will have their initial XP and Level lazily initialized or backfilled from their existing `review_logs` history (10 XP per past Good/Easy review).

---

## Open Questions (Resolved)

- _Q: Should level up grant extra streak freezes?_ -> Resolved: Streak freeze rewards remain anchored to Streak Milestones (7/30 days per US-GAME-02) to keep domain separation clean.
- _Q: Can learners lose XP for inactive days?_ -> Resolved: No, XP and Levels are cumulative mastery metrics; inactivity only affects daily streak, never XP.
