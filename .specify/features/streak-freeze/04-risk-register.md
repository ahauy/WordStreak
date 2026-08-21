# Risk Register: Streak Freeze Protection Mechanic (US-GAME-02)

## 1. Contradiction Scan

- **Scan Finding 1 (Evaluation Timing)**: Does `getStreak` (read-only query) mutate database state if a freeze is consumed?
  - _Resolution_: Yes, lazy auto-consumption updates `streakFreezes` and records `lastFreezeDate` atomically on `getStreak` or `recordActivity` so the user's dashboard immediately reflects preserved streak and updated freeze balance.
- **Scan Finding 2 (Concurrent Requests)**: What if two browser tabs query `getStreak` simultaneously on the day after a missed day?
  - _Resolution_: Handled via conditional update (`where: { id: streakRecord.id, streakFreezes: { gt: 0 } }`) or transaction locking, preventing duplicate freeze deduction.
- **Scan Finding 3 (Backward Compatibility)**: Existing `user_streaks` rows don't have `streakFreezes` or `totalFreezesUsed`.
  - _Resolution_: Prisma schema uses `@default(1)` and `@default(0)` so all existing and future users automatically have valid initial balances without data corruption.

---

## 2. Risk Register

| ID                  | Risk                                                                                         | Prob. | Impact | Mitigation                                                                                                                |
| :------------------ | :------------------------------------------------------------------------------------------- | :---: | :----: | :------------------------------------------------------------------------------------------------------------------------ |
| **RISK-FREEZE-001** | Clock/Timezone manipulation to bypass freeze deduction or trigger multiple milestone refills |  Med  |  Med   | Server computes calendar days based on validated IANA timezones and server UTC timestamps.                                |
| **RISK-FREEZE-002** | User is confused about why freeze was used                                                   |  Low  |  Med   | Clear UI toast/modal notification ("Your streak was protected by Streak Freeze! 🧊") when `wasProtectedByFreeze` is true. |
| **RISK-FREEZE-003** | Race conditions during rapid repeated requests                                               |  Low  |  Med   | Atomic Prisma updates with where clause safeguards.                                                                       |
| **RISK-FREEZE-004** | Migration lock during deployment                                                             |  Low  |  Low   | Additive columns with defaults allow non-blocking zero-downtime migration.                                                |

---

## 3. Assumptions & Constraints (Consolidated)

- **ASM-FREEZE-001**: New and existing users start with 1 default Streak Freeze (`@default(1)`).
- **ASM-FREEZE-002**: Maximum freeze capacity is capped at 2 (`MAX_STREAK_FREEZES = 2`).
- **ASM-FREEZE-003**: 1 freeze protects exactly 1 missed calendar day in the user's local timezone.
- **ASM-FREEZE-004**: Lazy auto-consumption is used to bridge missed days ($\Delta d = 2$ consumes 1 freeze; $\Delta d = 3$ consumes 2 freezes if available).
- **ASM-FREEZE-005**: 7-day and 30-day streak milestones award +1 freeze (capped at 2).
- **ASM-FREEZE-006**: Monthly refill grants +1 freeze on the 1st of each calendar month (capped at 2).
- **Constraints**:
  - NestJS + Prisma PostgreSQL architecture.
  - Sub-50ms API response latency.
  - Zero generic AI slop UI styling; minimal white/gray canvas with cyan/ice badge tokens (`DESIGN.md`).

---

## 4. MoSCoW Scope Table

### Must-Have (P0)

- Database schema expansion on `UserStreak` (`streakFreezes`, `lastFreezeDate`, `totalFreezesUsed`).
- Backend lazy auto-consumption in `StreakService` for $\Delta d = 2$ and $\Delta d = 3$.
- Milestone rewards (+1 freeze at 7 and 30 days) and monthly +1 refill logic.
- API contract updates in `@wordstreak/shared-types` (`streakFreezes`, `maxStreakFreezes`, `wasProtectedByFreeze`).
- Frontend Streak Widget freeze shield icon, remaining quota badge, and Streak Saved alert modal.

### Should-Have (P1)

- Subtle ice shimmer animation on the streak shield widget when 2 freezes are available.
- Freeze history breakdown in Settings / Streak details tooltip.

### Could-Have (P2)

- Push / email notification: "Your streak freeze was just used! Study today to keep the flame burning."

### Won't-Have (v1 Out of Scope)

- XP / Gem purchase store for buying extra freezes (Reserved for US-GAME-03 / Shop).
- Streak repair / retro-active purchase for streaks broken > 2 days ago.
- Custom streak freeze skin customization.
