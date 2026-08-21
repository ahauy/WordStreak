# Domain Decision Baseline: Streak Freeze Protection Mechanic (US-GAME-02)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: User (2026-08-21)  
**Last Updated**: 2026-08-21

This document represents the signed-off business and domain baseline for the Streak Freeze protection mechanic.

---

## 1. Business Summary & Problem Statement

Learners lose their accumulated daily study streak and motivation when life events cause an unexpected 1-2 day gap. The Streak Freeze protection mechanic equips learners with an automated shield (default 1 freeze, capped at 2) that automatically bridges missed calendar days without resetting their hard-earned streak count to zero.

- **Primary Persona**: Learner (Free & Active Users).
- **Target Metric**: +20% 14-day user retention; 35% reduction in streak churn after missed days.

---

## 2. Gap Analysis Summary

See `02-gap-analysis.md`.

- **AS-IS**: Hard streak reset to 0/1 on any day missed prior to yesterday ($\Delta d \ge 2$).
- **TO-BE**: Automated lazy consumption of available streak freezes when $\Delta d \ge 2$, preserving `currentStreak`, rewarding consistency with milestone replenishments (7d/30d), and rendering frost shield indicators in the Dashboard UI.

---

## 3. Approved Domain Model Summary

See `03-domain-model.md`.

- **RBAC**: Single learner ownership; authenticated learner only.
- **State Machine**: `FULL (2)` $\leftrightarrow$ `AVAILABLE (1)` $\leftrightarrow$ `DEPLETED (0)`.
- **Business Rules**: `BR-FREEZE-001` through `BR-FREEZE-006`.
- **Entity**: `UserStreak` extended with `streakFreezes Int @default(1)`, `lastFreezeDate DateTime?`, `totalFreezesUsed Int @default(0)`.

---

## 4. MoSCoW Scope & Risk Register

See `04-risk-register.md`.

- **Must-Have (P0)**: DB schema expansion, lazy auto-consumption in `StreakService`, 7d/30d milestone replenishment, shared DTO updates, frontend shield widget & protection alert modal.
- **Won't-Have (v1)**: XP store freeze purchase, paid streak repairs.
- **Risks**: `RISK-FREEZE-001` (Timezone abuse mitigated by server UTC/IANA calculation).

---

## 5. Specification Documents

- [Software Requirements Specification (SRS)](spec/SRS.md) — `REQ-FREEZE-001` through `REQ-FREEZE-005`
- [User Stories & Acceptance Criteria](spec/user-stories.md) — `US-FREEZE-001` through `US-FREEZE-003`

---

## 6. Assumptions & Open Items

- `ASM-FREEZE-001` through `ASM-FREEZE-006` confirmed. Zero blocking open questions.
