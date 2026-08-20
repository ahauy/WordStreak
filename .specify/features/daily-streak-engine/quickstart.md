# Quickstart & Validation Guide: Daily Streak Engine (US-GAME-01)

- **Feature**: Daily Streak Engine & Timezone Logic
- **Slug**: `daily-streak-engine`

---

## 1. Prerequisites & Environment Setup

```bash
# Verify monorepo dependencies
pnpm install

# Generate Prisma Client
pnpm --filter api prisma generate
```

---

## 2. Automated Test Execution

```bash
# Run backend streak & review tests
pnpm --filter api test apps/api/src/modules/streaks/streak.service.spec.ts
pnpm --filter api test apps/api/src/modules/reviews/reviews.service.spec.ts

# Run frontend tests
pnpm --filter web test
```

---

## 3. Manual E2E Validation Scenarios

1. **New User Streak Initialization**:
   - Log in with a fresh test account.
   - Observe Dashboard Navbar streak counter showing `0` with pending flame state.
   - Complete 1 flashcard review session.
   - Verify streak increments to `1`, flame ignites into Tier 1 (Electric Violet Spark), and celebratory confetti appears.
2. **Same-Day Idempotency**:
   - Complete another card review or quiz within the same day.
   - Verify streak remains `1` without duplicate increment or extra popups.
3. **Timezone Accuracy**:
   - Test querying `/api/v1/streaks/me` with header `x-timezone: Asia/Tokyo` or `America/Los_Angeles`.
   - Verify `isActiveToday` accurately reflects local calendar day status.
