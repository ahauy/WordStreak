# Handover Brief: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)
- **Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
- **Date**: 2026-08-21
- **Baseline Version**: 1.0-draft (Awaiting Confirmation Gate 1 Sign-Off)
- **Spec Documents**: [`spec/user-stories.md`](spec/user-stories.md), [`03-domain-model.md`](03-domain-model.md), [`contracts/listening-quiz.contract.ts`](contracts/listening-quiz.contract.ts)
- **Traceability Matrix**: [`traceability-matrix.md`](traceability-matrix.md)

---

## 1. Executive Summary

This feature delivers `US-QUIZ-03` (Listening & Typing Practice Mode) for WordStreak. It enables learners to hone auditory comprehension and active spelling production through:

1. **Intelligent Audio Playback Engine**: Discrete dual playback rates (`1.0x` Normal and `0.75x` Slow articulation), auto-play with browser gesture fallback, and keyboard replay hotkeys (`Space`/`R`).
2. **Resilient Web Speech API Fallback**: Automatic failover cascade to browser `window.speechSynthesis` if `audioUrl` is missing or fails to stream within 3000ms.
3. **Dynamic Typing Input & Visual Diff**: Character slot placeholders (`_ _ _ _ _`), whitespace and punctuation normalized validation (`BR-QUIZ-LISTEN-004`), and instant character-level diff highlighting upon incorrect submission.
4. **Progressive 3-Tier Hint Engine**: Length + 1st letter $\rightarrow$ Vietnamese meaning $\rightarrow$ Phonetic IPA.
5. **Gamified XP & Anti-Abuse**: $+10\text{ XP}$ base, $+15\text{ XP}$ speed bonus, combo multipliers ($2\times$, $3\times$), 400ms time guard, and 500 XP daily practice cap.
6. **SM-2 Isolation**: Complete decoupling from spaced repetition memory intervals (`UserCardProgress`).

---

## 2. Key Architecture & Dev Notes

- **Backend**:
  - Add `GET /api/v1/practice/listening?deckId=...&limit=...` to `PracticeController` and `QuizGeneratorService`.
  - Re-use `POST /api/v1/practice/submit-quiz` with `mode: 'LISTENING'` for session logging and XP granting.
- **Frontend**:
  - Create `ListeningQuizPage.tsx` under `apps/web/src/features/practice/pages/`.
  - Create `ListeningAudioPlayer.tsx`, `ListeningInputField.tsx`, `SpellingDiffVisualizer.tsx`, and `ListeningProgressiveHints.tsx` under `apps/web/src/features/practice/components/`.
  - Update `QuizSetupModal.tsx` to include "Listening & Typing" with an audio waveform icon.
  - Wire `QuizResultsView.tsx` with audio replay controls for missed cards.
- **Design Tokens**:
  - Obsidian minimalist design from `apps/web/DESIGN.md` & `apps/web/MEMORY.md`.
  - Pure white `#ffffff` canvas, obsidian black `#000000` pill buttons (`rounded-full`), 1px borders `#e5e5e5`, royal violet audio pulse (`#9333ea`), Nunito headings, Inter body text, JetBrains Mono for phonetics.

---

## 3. Scope Boundaries (MoSCoW Summary)

- **Must-Have**: Listening question generator endpoint, dual-speed audio player (1.0x/0.75x), Web Speech API failover cascade, direct typing input with length indicators, normalized validation, progressive 3-tier hints, diff visualizer, XP calculation, setup modal and recap integration.
- **Should-Have**: 20s countdown timer with Zen mode toggle, full WCAG 2.1 AA keyboard navigation (`Space`, `Shift+Space`, `Enter`, `Ctrl+H`, `Esc`).
- **Won't-Have (v1)**: Voice Speech-to-Text (STT) recording (scoped for Epic 08 Voice Practice), custom AI voice cloning.

---

## 4. Next Step

Advance to Phase 2: Speckit Technical Specification (`speckit-specify` $\rightarrow$ `speckit-plan` $\rightarrow$ `speckit-tasks`) upon user sign-off of Confirmation Gate 1.
