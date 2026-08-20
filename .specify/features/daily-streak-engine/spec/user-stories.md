# User Stories & Gherkin Scenarios: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## **US-GAME-01: Daily Streak Engine & Timezone Logic**

_As an authenticated learner,_  
_I want my daily study habits to increment my consecutive streak based on my local timezone and display an evolving violet flame mascot,_  
_So that I stay motivated to practice vocabulary every day without losing my streak unfairly._

---

### **Scenario 1: First Ever Study Session (Streak Initialized)**

- **Given** I am a newly registered user with no previous streak records (`currentStreak = 0`)
- **When** I complete a flashcard review rating submission (`POST /api/v1/reviews/submit`)
- **Then** the streak engine evaluates my local day as `today`
- **And** updates `currentStreak = 1` and `bestStreak = 1`
- **And** returns `streakIncreased = true`
- **And** the UI displays the `StreakCelebrationModal` congratulating me on starting my streak.

---

### **Scenario 2: Idempotent Study Within the Same Day**

- **Given** I already studied earlier today in my local timezone and have `currentStreak = 5`
- **When** I submit another flashcard review or complete a practice quiz
- **Then** the streak engine recognizes that `lastActiveDay == today`
- **And** leaves `currentStreak = 5` unchanged
- **And** returns `streakIncreased = false`
- **And** the UI maintains the bright flame state without re-triggering the full celebration popup.

---

### **Scenario 3: Consecutive Day Increment**

- **Given** my last active study session was yesterday (`lastActiveDay == yesterday`) and my `currentStreak = 12`
- **When** I complete my first study session today
- **Then** the streak engine increments `currentStreak = 13`
- **And** updates `bestStreak = max(bestStreak, 13)`
- **And** returns `streakIncreased = true`
- **And** the UI displays the celebration modal and updates the flame mascot.

---

### **Scenario 4: Inactive Day Gap (Streak Reset)**

- **Given** my last active study session was 2 or more days ago (`lastActiveDay < yesterday`)
- **When** I complete a study session today
- **Then** the streak engine resets `currentStreak = 1`
- **And** preserves my historical `bestStreak`
- **And** returns `streakIncreased = true` with message `"New streak started!"`.

---

### **Scenario 5: Viewing Streak Status on Dashboard & Navbar**

- **Given** I navigate to the Dashboard or view the top Navbar
- **When** the page loads
- **Then** the `useStreak` hook fetches `GET /api/v1/streaks/me`
- **And** renders the Electric Violet Flame with the current streak number
- **And** indicates whether today's goal has been fulfilled or is pending.

---

### **Scenario 6: Timezone-Aware Midnight Transition**

- **Given** user's local timezone is `'Asia/Ho_Chi_Minh'` (UTC+7)
- **When** the user studies at 23:55 local time (Day 1) and studies again at 00:05 local time (Day 2)
- **Then** the second session is recognized as Day 2
- **And** the streak increments from $N$ to $N+1$ seamlessly across midnight.
