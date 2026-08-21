# Risk & Contradiction Register: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Date**: 2026-08-21
- **Status**: Completed

---

## 1. Contradiction Scan

An adversarial analytical scan was performed over `01-elicitation.md`, `02-gap-analysis.md`, and `03-domain-model.md`:

| Potential Conflict / Contradiction                                                                                                                                                                                                          | Scan Result | Resolution & Architectural Guardrail                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Conflict 1: Daily Goal Evaluation vs Timezone Transitions**<br>If a user starts a review at 23:59 and finishes at 00:01, which day's daily goal does the review count toward?                                                             | Resolved    | The server resolves the local calendar date at the exact instant the `POST /api/v1/reviews` request is processed by using the server clock projected into the user's registered IANA timezone. Each review increment atomically evaluates against that day's goal count. |
| **Conflict 2: Streak Freeze Maintenance vs Repeated Streak Milestone XP**<br>If a user reaches a 7-day streak, gets +100 XP, misses the next day (saved by Freeze, streak remains 7), and studies again, does the user get another +100 XP? | Resolved    | No. `BR-XP-004` and `BR-XP-012` mandate that milestone XP awards check `user_activity_logs` for an existing grant matching `(userId, activityType: 'STREAK_7_DAYS', metadata.streakMilestone: 7)`. Only genuinely new increments trigger milestone XP.                   |
| **Conflict 3: Level Degradation on Review Failure**<br>Does failing a card (`rating: AGAIN (1)`) deduct XP and potentially demote a user's level or tier?                                                                                   | Resolved    | No. `BR-XP-002` and `BR-XP-009` strictly enforce non-negative XP grants (`AGAIN` awards 0 XP). Total XP and Level are monotonically increasing lifetime mastery metrics.                                                                                                 |
| **Conflict 4: Database Contention on Fast Reviews**<br>Rapid card flipping (e.g. 1 review every 500ms) could cause optimistic concurrency lock conflicts when updating `User.totalXp`.                                                      | Resolved    | Database writes use Prisma atomic increment (`increment: xpDelta`) within a short-lived PostgreSQL transaction. Sub-millisecond index writes guarantee no deadlocks.                                                                                                     |

---

## 2. Risk Register

| ID              | Risk Description                                                                                                                                | Category         | Prob. | Impact | Mitigation Strategy                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | :---: | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-XP-001** | **Automated Bot / Script Farming**<br>Malicious users or scripts submit rapid review calls to farm XP and top leaderboards.                     | Security / Abuse |  Med  |  Med   | `BR-XP-010`: Enforce velocity rate limit of max 500 XP/hour and 2,000 XP/24 hours for card reviews. Excess reviews process SRS correctly but yield 0 bonus XP.              |
| **RISK-XP-002** | **Client Timezone Tampering**<br>Users change device clock to repeatedly trigger daily goal resets and farm +50 XP bonuses.                     | Integrity        |  Low  |  High  | `BR-XP-011`: Server strictly uses server-side UTC time converted to user's registered IANA timezone. Client-sent timestamps are never trusted for date evaluation.          |
| **RISK-XP-003** | **Network Flakiness & Double-Click Replay**<br>Poor connectivity causes mobile client to send duplicate review submissions, granting double XP. | Reliability      |  Med  |  Low   | Implement idempotency check and review submission deduplication within a 2-second sliding window per card per user.                                                         |
| **RISK-XP-004** | **Legacy User Disenchantment**<br>Existing long-time learners with hundreds of reviews find themselves reset to Level 1 (0 XP) post-release.    | User Experience  | High  |  High  | `ASM-XP-010` & `02-gap-analysis.md`: Provide an automated database backfill / lazy initial profile calculation from existing `ReviewLog` historical records on first login. |
| **RISK-XP-005** | **Review Latency Regression**<br>Adding XP calculation, activity logging, and level-up checks slows down the critical card review API path.     | Performance      |  Med  |  Med   | Single `$transaction` with indexed inserts and atomic increment. P95 latency benchmarked under 50ms. Asynchronous event emission for non-blocking notifications.            |

---

## 3. Consolidated Assumptions & Constraints

### Consolidated Assumptions

- **ASM-XP-001**: XP is calculated and awarded exclusively server-side during review and gamification actions.
- **ASM-XP-002**: Rating `GOOD (3)` and `EASY (4)` grant +10 XP; rating `HARD (2)` grants +5 XP; rating `AGAIN (1)` grants 0 XP.
- **ASM-XP-003**: Daily Goal completion grants a one-time +50 XP bonus per user per local calendar date.
- **ASM-XP-004**: 7-Day streak milestone grants +100 XP on every 7-day multiple (7, 14, 21, 28, etc.).
- **ASM-XP-005**: 30-Day streak milestone grants +500 XP on every 30-day multiple (30, 60, 90, etc.).
- **ASM-XP-006**: Level formula is deterministic: $\text{threshold}(L) = \text{floor}(50 \times (L-1)^{1.5} + 50 \times (L-1))$ across 5 tiers (Bronze, Silver, Gold, Diamond, Master).
- **ASM-XP-007**: Progression is strictly monotonic and lifetime; XP and Levels never degrade or expire.
- **ASM-XP-008**: All XP transactions are permanently recorded in an immutable `user_activity_logs` table.
- **ASM-XP-009**: XP velocity cap limits review XP to 500 XP/hr and 2,000 XP/24h.
- **ASM-XP-010**: Historical users receive initial XP backfill from existing `review_logs`.

### Technical & Business Constraints

- **C-XP-001 (Monorepo Architecture)**: Must adhere to NestJS backend, React 19 / Vite frontend, Prisma ORM, and `@wordstreak/shared-types`.
- **C-XP-002 (Zero Third-Party Gamification Services)**: Entire gamification ledger and level logic must run on internal PostgreSQL and NestJS services (no external SaaS dependency).
- **C-XP-003 (WCAG 2.1 AA Compliance)**: All tier visual badges, progress bars, and modal dialogues must meet accessible contrast and reduced-motion standards.

---

## 4. MoSCoW Scope Table

| Priority                      | Feature Scope Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Rationale                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Must-Have (P0)**            | - Server-side XP calculation for Card Reviews (+10/+5/0 XP)<br>- Daily Goal completion XP bonus (+50 XP)<br>- 7-Day and 30-Day Streak Milestone XP bonus (+100/+500 XP)<br>- Non-linear Level (1–50+) & Tier (Bronze -> Silver -> Gold -> Diamond -> Master) engine<br>- Database schema migration (`User.totalXp`, `User.level`, `User.tier`, `user_activity_logs`)<br>- Topbar Level Badge & XP Progress Bar with tooltip<br>- Study screen floating `+XP` micro-feedback<br>- Level-Up Celebration Modal with confetti and tier promotion styling<br>- Immutable transaction logging in `user_activity_logs`<br>- Rate limits and anti-abuse validation | Core functionality required by US-GAME-03 to establish the XP economy and visual progression feedback loops. |
| **Should-Have (P1)**          | - Practice / Quiz completion XP bonus (+30 XP for $\ge 80\%$ score)<br>- Historical user XP backfill script for existing accounts<br>- User profile Gamification / XP breakdown tab<br>- Sound effects for XP gain and level up (with mute toggle)                                                                                                                                                                                                                                                                                                                                                                                                         | High-value additions that round out the gamification experience and ensure fairness for existing learners.   |
| **Could-Have (P2)**           | - Weekly XP summary email / push notification<br>- Customizable tier badge borders / avatar frames<br>- Double XP weekend event multiplier engine                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Engaging enhancements suitable for subsequent iteration after base XP launch.                                |
| **Won't-Have (Out of Scope)** | - **Real-money or crypto rewards / NFT badges**: Explicitly excluded; pure educational gamification.<br>- **Paid XP Boosters / Pay-to-Win Mechanics**: Excluded to maintain learning integrity.<br>- **Live Multiplayer PvP XP Wagering**: Excluded from single-player flashcard SRS scope.<br>- **Negative XP / Level Demotions**: Excluded to preserve positive reinforcement psychology.                                                                                                                                                                                                                                                                | Explicit boundaries to prevent scope creep and maintain product ethics.                                      |

---

## Exit Checklist

- [x] Contradiction scan completed with zero unresolved logic conflicts.
- [x] `RISK-XP-001` through `RISK-XP-005` captured with probability, impact, and concrete mitigations.
- [x] Assumptions (`ASM-XP-001` to `010`) and constraints consolidated.
- [x] MoSCoW table explicitly categorizes Must-Have, Should-Have, Could-Have, and Won't-Have boundaries.
