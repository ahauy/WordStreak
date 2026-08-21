# Handover Brief: Streak Freeze Protection Mechanic (US-GAME-02)

**Baseline version**: 1.0-draft  
**Date**: 2026-08-21  
**Spec documents**: [spec/SRS.md](spec/SRS.md), [spec/user-stories.md](spec/user-stories.md)  
**Traceability matrix**: [traceability-matrix.md](traceability-matrix.md)

## What's being built

A Streak Freeze protection system that equips learners with up to 2 freeze shields (1 default upon account creation) to automatically bridge missed calendar days ($\Delta d = 2$ or $3$). When days are missed, freezes are auto-consumed on demand without breaking the streak count, accompanied by milestone refills (+1 freeze at 7 and 30 day streaks) and dashboard visual feedback (frost shield widget and alert modal).

## What's explicitly out of scope

- In-app store for buying freezes with XP/gems (reserved for US-GAME-03 / Shop).
- Paid streak recovery for historical streaks broken > 2 days ago.
- Custom streak freeze skin customization.

## Known accepted risks / gaps

- None blocking. Race conditions and timezone manipulation mitigated via atomic server calculations.

## Next step

Present Domain Baseline to user for Confirmation Gate 1, then proceed to Speckit pipeline (`speckit-specify` -> `speckit-plan` -> `speckit-tasks`).
