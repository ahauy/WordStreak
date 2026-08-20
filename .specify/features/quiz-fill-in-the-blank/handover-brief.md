# Handover Brief: Fill-in-the-blank Quiz (US-QUIZ-02)

- **Feature**: Fill-in-the-blank Quiz Mode
- **Date**: 2026-08-20
- **Version**: 1.0 (Draft / Ready for Sign-Off)
- **Handover Target**: Speckit Pipeline (`speckit-specify` -> `speckit-plan` -> `speckit-tasks`)

---

## 1. Executive Summary

This feature delivers `US-QUIZ-02` (Fill-in-the-blank Sentence Completion Quiz) for WordStreak. It enables learners to practice vocabulary inside authentic example sentences with:

1. Intelligent morphological regex masking of root words and inflections (`[ _____ ]`).
2. Dual input modes: direct keyboard typing with auto-check & length guide, and interactive scrambled letter tiles (anagrams) for mobile friendliness.
3. Progressive Hint support (first letter reveal + phonetic audio).
4. Graceful contextual meaning fallback for cards without example sentences.
5. Gamification XP (+10 XP base, +15 XP speed bonus, combo multiplier) and recap view.

---

## 2. Key Architecture & Dev Notes

- **Backend**:
  - Add `GET /api/v1/practice/fill-in-the-blank?deckId=...&limit=...` to `PracticeController` and `QuizGeneratorService`.
  - Reuse `POST /api/v1/practice/submit-quiz` for score calculation and XP award.
- **Frontend**:
  - Add `FillInTheBlankQuizPage.tsx` under `apps/web/src/features/practice/pages/`.
  - Add `FillBlankInput.tsx` and `AnagramTilePicker.tsx` under `apps/web/src/features/practice/components/`.
  - Update `QuizSetupModal.tsx` to allow selecting quiz type (`multiple-choice` vs `fill-in-the-blank`).
- **Design Tokens**: Pure white `#ffffff` canvas, Obsidian black pills, 1px borders `#e5e5e5`, Nunito display font, Inter body font.
