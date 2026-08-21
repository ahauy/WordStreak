# User Stories: Learning Analytics & Retention Dashboard

- **Feature Slug**: `learning-analytics`
- **Date**: 2026-08-21
- **Status**: Draft

---

### US-STAT-01: Word Mastery Breakdown & Distribution

**As an** authenticated English learner  
**I want to** see a clear visual breakdown of my cards categorized into Mastered, Learning, and New  
**So that** I understand the depth of my long-term memory retention and know how many words I truly own.

**Traces to**: REQ-STAT-001, REQ-STAT-006

**Acceptance Criteria**:

- **Scenario 1 (Happy Path — Visual Mastery Breakdown)**
  - **Given** I am logged into WordStreak and have cards across various review intervals
  - **When** I navigate to `/analytics` or view the Dashboard Overview
  - **Then** I see the total cards grouped by:
    - Mastered (Interval >= 21 days & Repetitions >= 4) with count and percentage
    - Learning (1 <= Interval < 21 days) with count and percentage
    - New (0 repetitions) with count and percentage
  - **And** the visual donut/progress bar displays the correct proportions.

- **Scenario 2 (Deck-specific Filter)**
  - **Given** I have multiple decks (e.g. "IELTS Band 8", "Daily Phrasal Verbs")
  - **When** I select a specific deck from the dropdown filter on `/analytics`
  - **Then** the mastery breakdown recalculates to display only cards belonging to the selected deck.

- **Scenario 3 (Zero Cards / Empty State)**
  - **Given** I am a brand new user with 0 cards in my account
  - **When** I view the Mastery Breakdown
  - **Then** I see an encouraging empty state with a "Create your first deck" button rather than a broken or divided-by-zero chart.

---

### US-STAT-02: 365-Day GitHub-style Activity Heatmap

**As a** daily streak builder  
**I want to** view a 365-day rolling heatmap showing my daily review volume  
**So that** I can celebrate my consistency and identify patterns in my learning routine.

**Traces to**: REQ-STAT-002, REQ-STAT-003, REQ-STAT-006

**Acceptance Criteria**:

- **Scenario 1 (Happy Path — 365-Day Activity Grid)**
  - **Given** I have submitted reviews across multiple days
  - **When** I open the `/analytics` page
  - **Then** I see a 52-week horizontal grid of calendar cells ending today
  - **And** days with 0 reviews show Level 0 (hairline border)
  - **And** days with reviews are colored according to intensity tiers:
    - 1–5 reviews -> Level 1 (Light)
    - 6–15 reviews -> Level 2 (Medium)
    - 16–30 reviews -> Level 3 (Strong)
    - 31+ reviews -> Level 4 (Vibrant glow).

- **Scenario 2 (Interactive Tooltips)**
  - **Given** the heatmap is rendered
  - **When** I hover over or focus with keyboard on any date cell
  - **Then** an accessible tooltip appears showing: `"<Count> cards reviewed on <Formatted Date>"` (e.g. "24 cards reviewed on Aug 18, 2026").

- **Scenario 3 (Timezone Normalization)**
  - **Given** my local timezone is `Asia/Ho_Chi_Minh` (UTC+7)
  - **When** I review cards at 11:30 PM local time (which is 4:30 PM UTC)
  - **Then** the review activity is correctly attributed to today's local date cell on the heatmap, not the previous day.

---

### US-STAT-03: Deck Completion Forecast & Retention Insights

**As a** goal-oriented student preparing for an exam  
**I want to** see an estimated completion date for my deck and a 30-day retention percentage  
**So that** I can plan my study schedule and know if I am on track before my exam.

**Traces to**: REQ-STAT-004, REQ-STAT-005, REQ-STAT-006, REQ-STAT-007

**Acceptance Criteria**:

- **Scenario 1 (Happy Path — Deck Forecast)**
  - **Given** a deck with 100 total cards (30 Mastered, 70 Remaining) and an average review velocity of 10 cards/day over the past 7 days
  - **When** I view the deck details or `/analytics` deck forecast table
  - **Then** the estimated days remaining displays `~7 days`
  - **And** the projected completion date displays `CurrentDate + 7 days`.

- **Scenario 2 (New Deck with Zero Review History — Velocity Fallback)**
  - **Given** a newly imported deck with 50 cards and 0 reviews submitted in the past 7 days
  - **When** the system calculates the completion forecast
  - **Then** the velocity defaults gracefully to `user.dailyGoal / 2` (or min 5 cards/day)
  - **And** displays an estimated forecast with an explanatory indicator ("Based on your daily goal").

- **Scenario 3 (Deck Fully Mastered)**
  - **Given** a deck where 100% of cards are in `MASTERED` status
  - **When** I view the deck completion forecast
  - **Then** it shows a "Completed 🎉" badge with 0 days remaining.
