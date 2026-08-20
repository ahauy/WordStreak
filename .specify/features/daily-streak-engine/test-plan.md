# Test Plan: Daily Streak Engine (US-GAME-01)

**Feature slug**: `daily-streak-engine`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/daily-streak-engine/spec/user-stories.md`

---

## 1. Backend Unit & Integration Tests (`apps/api/src/modules/streaks/streak.service.spec.ts`)

### TC-001: Initial Streak Creation on First Ever Activity

```gherkin
Given a user with no existing streak record in database
When StreakService.recordActivity(userId, { timezone: 'Asia/Ho_Chi_Minh' }) is called
Then a new UserStreak record is created with currentStreak = 1, bestStreak = 1
  And returns streakIncreased = true, flameTier = 1
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 1, `BR-STREAK-003`, `REQ-STREAK-002`, `REQ-STREAK-005`

### TC-002: Same-Day Idempotent Activity

```gherkin
Given a user whose lastActiveDate is earlier today in 'Asia/Ho_Chi_Minh' and currentStreak = 5
When StreakService.recordActivity(userId, { timezone: 'Asia/Ho_Chi_Minh' }) is called
Then currentStreak remains 5
  And returns streakIncreased = false, message = "Streak already maintained for today"
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 2, `BR-STREAK-003`, `REQ-STREAK-004`

### TC-003: Consecutive Day Activity Increment

```gherkin
Given a user whose lastActiveDate is yesterday in 'Asia/Ho_Chi_Minh' and currentStreak = 12, bestStreak = 12
When StreakService.recordActivity(userId, { timezone: 'Asia/Ho_Chi_Minh' }) is called
Then currentStreak increments to 13 and bestStreak becomes 13
  And returns streakIncreased = true, flameTier = 2
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 3, `BR-STREAK-003`, `REQ-STREAK-004`

### TC-004: Inactive Day Gap (Broken Streak Reset)

```gherkin
Given a user whose lastActiveDate was 3 days ago in 'Asia/Ho_Chi_Minh' and currentStreak = 25, bestStreak = 30
When StreakService.recordActivity(userId, { timezone: 'Asia/Ho_Chi_Minh' }) is called
Then currentStreak resets to 1, while bestStreak remains 30
  And returns streakIncreased = true, flameTier = 1
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 4, `BR-STREAK-003`, `REQ-STREAK-004`

### TC-005: Timezone-Aware Midnight Rollover

```gherkin
Given a user in timezone 'Asia/Ho_Chi_Minh' (UTC+7)
  And first activity occurs at 2026-08-20T23:55:00+07:00 (recorded for 2026-08-20)
When second activity occurs at 2026-08-21T00:05:00+07:00 (recorded for 2026-08-21)
Then the engine evaluates lastActiveDay = 2026-08-20 and today = 2026-08-21
  And increments currentStreak from N to N+1
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 6, `BR-STREAK-002`, `REQ-STREAK-004`

### TC-006: Integration with ReviewsService.submitReview

```gherkin
Given an authenticated user submitting a rating via ReviewsService.submitReview
When the review is processed
Then StreakService.recordActivity is automatically invoked for the user
  And the response includes updated streak status
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 1, 3, `BR-STREAK-001`, `REQ-STREAK-003`

---

## 2. Frontend Hook & Component Tests (`apps/web/src/features/dashboard/`)

### TC-007: Flame Mascot Tier Determination

```gherkin
Given streak counts of 3, 10, 20, and 35
Then getFlameTier returns Tier 1 (Spark), Tier 2 (Ember), Tier 3 (Inferno), and Tier 4 (Nova) respectively
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 5, `BR-STREAK-006`, `REQ-STREAK-007`

### TC-008: Celebration Modal Rendering on Streak Increase

```gherkin
Given a review session completes and returns streakIncreased = true
When ReviewSessionPage processes the response
Then StreakCelebrationModal opens displaying the new streak count and celebration animation
```

**Priority**: Must-Have  
**Traces to**: `US-GAME-01` Scenario 1, 3, `BR-STREAK-007`, `REQ-STREAK-008`

---

## 3. Test Coverage Checklist

- [ ] Initial streak creation on first activity (`TC-001`)
- [ ] Same-day idempotent streak update (`TC-002`)
- [ ] Consecutive day streak increment (`TC-003`)
- [ ] Inactive gap streak reset (`TC-004`)
- [ ] Timezone midnight transition (`TC-005`)
- [ ] ReviewsService integration (`TC-006`)
- [ ] Flame tier mapping (`TC-007`)
- [ ] Celebration modal trigger (`TC-008`)
