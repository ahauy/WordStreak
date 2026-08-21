# Traceability Matrix: Gamification XP & Learner Levels System (US-GAME-03)

- **Feature**: Experience Points (XP) & Learner Levels System
- **Slug**: `gamification-xp-levels`
- **Date**: 2026-08-21
- **Status**: Verified (100% Traceable Chain)

---

## 1. Requirement & Story Traceability Matrix

| Business Goal / Value                                   | Business Rule(s)                          | System Requirement (SRS)                     | User Story                           | Acceptance Criteria Scenarios                                                                                                                            | Test Verification Scope                                                                         |
| ------------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **+30% Daily Review Volume**                            | `BR-XP-001`<br>`BR-XP-002`<br>`BR-XP-010` | `REQ-XP-001`<br>`REQ-XP-007`                 | `US-XP-001`                          | Scenario 1 (Good/Easy +10 XP)<br>Scenario 2 (Hard +5 XP)<br>Scenario 3 (Fail 0 XP)<br>Scenario 4 (Rate limit cap)                                        | Unit: `XpService.calculateReviewXp`<br>E2E: `POST /api/v1/reviews` with XP payload              |
| **+25% D14 Retention**<br>(Daily Habit Formation)       | `BR-XP-003`<br>`BR-XP-011`<br>`BR-XP-012` | `REQ-XP-002`<br>`REQ-XP-006`                 | `US-XP-002`                          | Scenario 1 (Goal Met +50 XP)<br>Scenario 2 (Single grant / day)<br>Scenario 3 (Timezone transition)                                                      | Integration: Daily goal evaluation with timezone mock<br>E2E: 10-card review session completion |
| **+20% Long-Term Consistency**<br>(Habit Reinforcement) | `BR-XP-004`<br>`BR-XP-005`<br>`BR-XP-012` | `REQ-XP-003`<br>`REQ-XP-004`<br>`REQ-XP-006` | `US-XP-003`                          | Scenario 1 (7-Day +100 XP)<br>Scenario 2 (30-Day +500 XP)<br>Scenario 3 (Streak Freeze deduplication)                                                    | Integration: `StreakService` + `XpService` milestone triggers                                   |
| **Clear Progression Hierarchy**<br>(Mastery Motivation) | `BR-XP-007`<br>`BR-XP-008`<br>`BR-XP-009` | `REQ-XP-005`<br>`REQ-XP-008`<br>`REQ-XP-010` | `US-XP-004`<br>`US-XP-005`           | Scenario 1 (Level up promotion)<br>Scenario 2 (Reduced motion)<br>Scenario 3 (Modal dismiss)<br>Scenario 1 (Widget render)<br>Scenario 2 (Hover popover) | Unit: `calculateLevelFromXp`<br>Frontend: `XpProgressBar`, `LevelUpModal` render tests          |
| **Gamification Audit & Anti-Abuse**                     | `BR-XP-010`<br>`BR-XP-011`<br>`BR-XP-012` | `REQ-XP-006`<br>`REQ-XP-007`                 | `US-XP-001` (S4)<br>`US-XP-002` (S2) | Scenario 4 (Rate limit cap)<br>Scenario 2 (Daily Goal deduplication)                                                                                     | Unit: Rate limiter window logic<br>Integration: DB atomic `$transaction` rollback               |
| **Fairness for Existing Users**                         | `BR-XP-007`<br>`BR-XP-008`                | `REQ-XP-012`                                 | `US-XP-006`                          | Scenario 1 (Historical XP backfill)                                                                                                                      | Migration: Historical backfill script test on seed DB                                           |
| **Practice Engagement**                                 | `BR-XP-006`                               | `REQ-XP-011`                                 | `US-XP-001`                          | Scenario 1 (Quiz XP bonus)                                                                                                                               | Unit: `PracticeService` quiz completion XP check                                                |

---

## 2. Traceability Completeness Audit

- **Total SRS Requirements**: 12 (`REQ-XP-001` through `REQ-XP-012`)
- **Total User Stories**: 6 (`US-XP-001` through `US-XP-006`)
- **Total Business Rules**: 12 (`BR-XP-001` through `BR-XP-012`)
- **Orphaned Requirements**: 0 (Every `REQ-` is traced to at least one `US-` and `BR-`)
- **Orphaned User Stories**: 0 (Every `US-` has explicit `Traces to` links to `REQ-`)
- **Coverage Status**: **100% Unbroken Traceability Chain**
