# User Stories: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Date**: 2026-08-21
- **Status**: Draft (BA Stage 6 Specification)

---

### US-XP-001: Earn XP on Flashcard Review

**As a** registered Learner  
**I want to** earn XP immediately whenever I review a flashcard  
**So that** I feel instant positive feedback for my study effort  
**Traces to**: `REQ-XP-001`, `REQ-XP-006`, `REQ-XP-009`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Good/Easy Review)**:
  - **Given** I am an authenticated learner with `totalXp = 150`
  - **When** I submit a review for card `"card-1"` with rating `3 (GOOD)`
  - **Then** the system awards `+10 XP`
  - **And** my new `totalXp` becomes `160`
  - **And** an immutable row is recorded in `user_activity_logs` with `activityType = 'CARD_REVIEW'`
  - **And** a floating `+10 XP` animation appears on the study screen.
- **Scenario 2 (Hard Review Effort XP)**:
  - **Given** I am reviewing a difficult flashcard
  - **When** I submit a review with rating `2 (HARD)`
  - **Then** the system awards `+5 XP`
  - **And** my `totalXp` increments by 5.
- **Scenario 3 (Fail Review - No Negative XP)**:
  - **Given** I forgot a flashcard
  - **When** I submit a review with rating `1 (AGAIN)`
  - **Then** the system awards `0 XP`
  - **And** my `totalXp` remains unchanged (never decreases).
- **Scenario 4 (Velocity Rate Limit Exceeded)**:
  - **Given** a learner has earned 500 XP from card reviews in the last 45 minutes
  - **When** the learner submits another review rating `3 (GOOD)`
  - **Then** the review SM-2 schedule is updated normally
  - **And** the XP award for this review is `0 XP` with status `RATE_LIMITED`
  - **And** no duplicate bonus XP is added.

---

### US-XP-002: Daily Goal Completion XP Reward

**As a** daily active Learner  
**I want to** receive a +50 XP bonus when I complete my daily review target  
**So that** I am motivated to finish my entire daily study queue  
**Traces to**: `REQ-XP-002`, `REQ-XP-006`

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Completing Daily Goal)**:
  - **Given** my `dailyGoal = 10` and I have completed 9 card reviews today in my local timezone
  - **When** I submit my 10th valid card review for today with rating `3 (GOOD)`
  - **Then** the response awards `10 XP` (for the card) + `50 XP` (for Daily Goal completion) = `60 XP` total
  - **And** a `DAILY_GOAL_COMPLETED` record is written to `user_activity_logs` with today's local date
  - **And** the UI displays a "Daily Goal Met! +50 XP 🎯" toast notification.
- **Scenario 2 (Deduplication on Subsequent Reviews Today)**:
  - **Given** I have already completed my daily goal and received the +50 XP bonus earlier today
  - **When** I review an 11th card today with rating `3 (GOOD)`
  - **Then** I receive `+10 XP` for the card review
  - **And** the system does NOT grant a second +50 XP daily goal bonus for the same date.
- **Scenario 3 (Timezone Midnight Transition)**:
  - **Given** it is 23:59:55 in my local timezone and I complete my 10th card (earning +50 XP for Day 1)
  - **When** it becomes 00:00:15 (Day 2) and I review 10 new cards
  - **Then** upon the 10th card of Day 2, the system successfully awards the +50 XP bonus for Day 2.

---

### US-XP-003: Streak Milestone XP Bonuses

**As a** habit-building Learner  
**I want to** receive major XP bonuses for maintaining 7-day and 30-day streaks  
**So that** my long-term study consistency is celebrated and rewarded  
**Traces to**: `REQ-XP-003`, `REQ-XP-004`, `REQ-XP-006`

**Acceptance Criteria**:

- **Scenario 1 (7-Day Streak Milestone)**:
  - **Given** my streak is 6 days and I submit my qualifying review for today
  - **When** my streak increments to `7`
  - **Then** the system awards `+100 XP` milestone bonus in addition to review XP
  - **And** a `STREAK_7_DAYS` record is logged in `user_activity_logs`.
- **Scenario 2 (30-Day Major Milestone)**:
  - **Given** my streak increments to `30`
  - **When** the streak update processes
  - **Then** the system awards `+500 XP` major milestone bonus
  - **And** a `STREAK_30_DAYS` record is logged.
- **Scenario 3 (Streak Freeze Bridge - No Replay Bonus)**:
  - **Given** my streak was protected by a Streak Freeze yesterday at 7 days and remains 7 days
  - **When** I submit today's review keeping my streak at 7 days without incrementing to 8
  - **Then** the system does NOT grant a duplicate +100 XP bonus for the already-rewarded 7-day milestone.

---

### US-XP-004: Level-Up Progression & Celebration

**As a** leveling Learner  
**I want to** see my level increase and enjoy a celebration modal when I cross an XP threshold  
**So that** I feel a profound sense of achievement and milestone prestige  
**Traces to**: `REQ-XP-005`, `REQ-XP-008`, `REQ-XP-010`

**Acceptance Criteria**:

- **Scenario 1 (Level Up Celebration)**:
  - **Given** I am Level 5 (Bronze) with `745 XP` (Level 6 requires `810 XP`)
  - **When** I complete a review and daily goal that awards `+70 XP`, bringing my total to `815 XP`
  - **Then** the system calculates my `newLevel = 6` and `newTier = "SILVER"`
  - **And** the review response flags `isLevelUp: true` and `isTierPromotion: true`
  - **And** the client displays the `LevelUpCelebrationModal` with confetti and Silver tier crest
  - **And** the topbar progress bar updates to Level 6 with progress reset toward Level 7.
- **Scenario 2 (Reduced Motion Accessibility)**:
  - **Given** my operating system has `prefers-reduced-motion: reduce` enabled
  - **When** I trigger a level-up celebration
  - **Then** the `LevelUpCelebrationModal` displays smoothly without animated confetti particle explosions.
- **Scenario 3 (Dismissing Celebration)**:
  - **Given** the celebration modal is active
  - **When** I press `Escape` or click the "Continue Learning" button
  - **Then** the modal closes cleanly and returns focus to the study interface.

---

### US-XP-005: Topbar Gamification Widget Navigation

**As a** Learner  
**I want to** see my current Level, Tier crest, and progress bar at all times in the header  
**So that** I always know how close I am to the next rank  
**Traces to**: `REQ-XP-008`

**Acceptance Criteria**:

- **Scenario 1 (Widget Rendering)**:
  - **Given** I am logged in as a Gold Tier Level 18 user with 4,200 XP
  - **When** I view any page on the platform
  - **Then** the topbar renders a solar gold crest icon, `Lv. 18`, and a progress bar showing progress toward Level 19.
- **Scenario 2 (Hover Popover Details)**:
  - **Given** I hover over or tap the Level badge
  - **When** the tooltip popover opens
  - **Then** it shows my Lifetime XP (4,200 XP), XP into current level, XP remaining until Level 19, and the next tier milestone (Diamond at Level 31).

---

### US-XP-006: Historical XP Backfill for Existing Learners

**As a** legacy WordStreak user  
**I want to** have my past reviews and streak history credited toward my initial XP and Level  
**So that** my past hard work is recognized immediately upon the gamification update  
**Traces to**: `REQ-XP-012`

**Acceptance Criteria**:

- **Scenario 1 (Historical Account Initial Login)**:
  - **Given** I have 250 historical `ReviewLog` entries with rating $\ge 2$ and a historical 14-day streak
  - **When** the gamification migration runs (or upon my first login post-launch)
  - **Then** the system computes my initial `totalXp = (250 * 10) + 200 (streak milestones) = 2,700 XP`
  - **And** sets my initial level to `Level 16 (Gold Tier)`
  - **And** displays a welcome dialog recognizing my earned rank.
