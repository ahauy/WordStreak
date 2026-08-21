# Test Plan: Streak Freeze Protection Mechanic (US-GAME-02)

**Slug**: `streak-freeze`  
**Date**: 2026-08-21  
**Status**: DRAFT / READY FOR TDD

---

## 1. Test Matrix & Traceability

| Test ID           | User Story & Scenario      |      Layer      | Test Description                                                                                         | Target File                                                            |
| :---------------- | :------------------------- | :-------------: | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **TC-FREEZE-001** | `US-FREEZE-001` Scenario 1 | Unit (Backend)  | Single missed day ($\Delta d = 2$) auto-consumes 1 freeze and keeps streak intact.                       | `apps/api/src/modules/streaks/streak.service.spec.ts`                  |
| **TC-FREEZE-002** | `US-FREEZE-001` Scenario 1 | Unit (Backend)  | Multiple missed days ($\Delta d = 3$) with 2 freezes consumes 2 freezes and preserves streak.            | `apps/api/src/modules/streaks/streak.service.spec.ts`                  |
| **TC-FREEZE-003** | `US-FREEZE-001` Scenario 2 | Unit (Backend)  | Inactive gap exceeding freeze quota ($\Delta d = 3$ with 1 freeze) resets streak without wasting freeze. | `apps/api/src/modules/streaks/streak.service.spec.ts`                  |
| **TC-FREEZE-004** | `US-FREEZE-002` Scenario 1 | Unit (Backend)  | Reaching 7-day or 30-day streak milestone awards +1 freeze (up to max 2).                                | `apps/api/src/modules/streaks/streak.service.spec.ts`                  |
| **TC-FREEZE-005** | `US-FREEZE-002` Scenario 2 | Unit (Backend)  | Milestone award at max freeze capacity (2) caps at 2.                                                    | `apps/api/src/modules/streaks/streak.service.spec.ts`                  |
| **TC-FREEZE-006** | `US-FREEZE-003` Scenario 1 | Unit (Frontend) | `StreakWidget` renders frost shield badge with current freeze count (`1/2 🧊`).                          | `apps/web/src/features/dashboard/components/StreakWidget.spec.tsx`     |
| **TC-FREEZE-007** | `US-FREEZE-003` Scenario 2 | Unit (Frontend) | `StreakSavedModal` renders alert notification when `wasProtectedByFreeze` is true.                       | `apps/web/src/features/dashboard/components/StreakSavedModal.spec.tsx` |
