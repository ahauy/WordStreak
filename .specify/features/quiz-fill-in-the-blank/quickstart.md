# Quickstart: Testing Fill-in-the-blank Quiz (US-QUIZ-02)

## 1. Run Automated Test Suites

```bash
# Test shared types
pnpm --filter @wordstreak/shared-types build

# Test backend service & controller unit tests
pnpm --filter api test src/modules/practice

# Test frontend components & hooks
pnpm --filter web test src/features/practice
```

## 2. Manual Verification Walkthrough

1. Open WordStreak Web App: `http://localhost:5173`.
2. Log in and navigate to a Deck with at least 1 card.
3. Click "Practice / Quiz" on the Deck detail page.
4. Select "Điền từ vào câu (Fill-in-the-blank)" in the Setup Modal and click "Start Practice".
5. Verify:
   - Direct typing with `Enter` submission.
   - Anagram letter tile clicks and backspace removal.
   - Progressive Hint button (`Ctrl+H`) reveals first letter and IPA audio.
   - 25s timer (or Zen mode) works smoothly.
   - Results screen shows XP earned and missed cards recap.
