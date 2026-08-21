# User Stories: Streak Freeze Protection Mechanic (US-GAME-02)

### US-FREEZE-001: Automatic Streak Preservation with Freeze Shield

**As a** WordStreak learner  
**I want** my daily streak to be automatically preserved when I miss 1 day if I have a Streak Freeze  
**So that** I don't lose all my accumulated progress and motivation due to unexpected life events  
**Traces to**: REQ-FREEZE-001, REQ-FREEZE-002

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - 1 Missed Day with 1 Freeze)**
  - Given a user has an active streak of 5 days, `lastActiveDate` was 2 days ago ($\Delta d = 2$), and `streakFreezes = 1`
  - When the user visits the dashboard or records study activity today
  - Then 1 streak freeze is automatically consumed (`streakFreezes` becomes 0)
  - And `currentStreak` remains 5 (or becomes 6 upon completing today's study activity)
  - And `wasProtectedByFreeze` is returned as `true` with `freezesUsed = 1`
- **Scenario 2 (Edge Case - Missed Days Exceed Freeze Balance)**
  - Given a user has an active streak of 10 days, `lastActiveDate` was 3 days ago ($\Delta d = 3$), and `streakFreezes = 1`
  - When the user visits the dashboard or records study activity
  - Then the streak cannot be bridged ($\Delta d > 1 + 1$)
  - And `currentStreak` resets to 0 (or starts new at 1 upon completing review)
  - And the single freeze is NOT consumed fruitlessly

---

### US-FREEZE-002: Earning Milestone Replenishment Freezes

**As a** dedicated WordStreak learner  
**I want to** earn bonus Streak Freezes when I hit major streak milestones  
**So that** I am rewarded for my long-term consistency and have a safety buffer for future emergencies  
**Traces to**: REQ-FREEZE-003

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - 7-Day Milestone Award)**
  - Given a user has `currentStreak = 6` and `streakFreezes = 1`
  - When the user completes today's review session bringing `currentStreak = 7`
  - Then the system awards +1 streak freeze, setting `streakFreezes = 2` (capped at max 2)
  - And a celebratory notification is shown acknowledging both the 7-day milestone and the earned freeze shield
- **Scenario 2 (Edge Case - Milestone Reached at Max Freeze Capacity)**
  - Given a user has `currentStreak = 6` and already holds `streakFreezes = 2` (max cap)
  - When the user completes today's review session bringing `currentStreak = 7`
  - Then `streakFreezes` remains capped at 2 without crashing or overflowing
  - And the user still receives standard milestone XP and congratulations

---

### US-FREEZE-003: Visual Streak Freeze Shield on Dashboard & Celebration Feedback

**As a** WordStreak learner  
**I want to** see how many Streak Freezes I currently hold on my Dashboard and receive a clear alert when a freeze saved my streak  
**So that** I know my safety status and am reminded to study today  
**Traces to**: REQ-FREEZE-004, REQ-FREEZE-005

**Acceptance Criteria**:

- **Scenario 1 (Dashboard Indicator)**
  - Given a user is logged into the Dashboard
  - When viewing the Streak widget
  - Then a cyan/ice shield icon is displayed showing the active freeze count (e.g. "1/2 🧊" or "2/2 🧊") with an informative hover tooltip
- **Scenario 2 (Freeze Saved Modal Notification)**
  - Given a user's streak was auto-saved by a freeze upon loading the app
  - When the user arrives on the Dashboard
  - Then a modal/toast notifies them: _"Your streak was saved by Streak Freeze! 🧊 Study today to keep your streak alive."_
  - And the modal can be dismissed with a single click or keyboard Escape
