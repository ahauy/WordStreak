# Requirement Traceability Matrix (RTM): Chế độ Nối từ vựng (Word Matching Game)

- **Feature Slug**: `quiz-word-matching`
- **Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Date**: 2026-08-21
- **Status**: 100% Complete & Verified

---

## 1. Traceability Mapping Matrix

| Business Goal / Epic               | Business Rule         | System Requirement                          | User Story   | Acceptance Test Scenario                  | Target Verification Component / Test Suite                                              |
| :--------------------------------- | :-------------------- | :------------------------------------------ | :----------- | :---------------------------------------- | :-------------------------------------------------------------------------------------- |
| **EPIC-04: Multi-format Practice** | `BR-MATCH-001`, `002` | `REQ-MATCH-001` (Questions Endpoint)        | `US-QUIZ-04` | Scenario 1: Flawless Round                | `apps/api/src/modules/practice/matching-generator.service.spec.ts`                      |
| **Safety & Error Prevention**      | `BR-MATCH-012`        | `REQ-MATCH-002` (Min Deck Size Guard)       | `US-QUIZ-04` | Scenario 6: Deck Size Guard ($< 5$ cards) | `apps/api/src/modules/practice/practice.controller.spec.ts` & `QuizSetupModal.spec.tsx` |
| **Tactile & Visual Engagement**    | `BR-MATCH-001`        | `REQ-MATCH-003` (2-Column Layout)           | `US-QUIZ-04` | Scenario 1, 3: Layout & Touch             | `apps/web/src/features/practice/components/WordMatchingGame.spec.tsx`                   |
| **Frictionless UI Interactions**   | `BR-MATCH-003`        | `REQ-MATCH-004` (Bidirectional Select)      | `US-QUIZ-04` | Scenario 2: Bidirectional Matching        | `apps/web/src/features/practice/hooks/useWordMatchingGame.spec.ts`                      |
| **Mistake-Proofing (Poka-Yoke)**   | `BR-MATCH-004`        | `REQ-MATCH-005` (In-Column Switching)       | `US-QUIZ-04` | Scenario 4, 5: Switch & Deselect          | `apps/web/src/features/practice/hooks/useWordMatchingGame.spec.ts`                      |
| **Tactile Feedback & Delight**     | `BR-MATCH-005`, `006` | `REQ-MATCH-006` (Match Success Feedback)    | `US-QUIZ-04` | Scenario 1: Clean Combos & Chime          | `apps/web/src/features/practice/components/MatchingTile.spec.tsx`                       |
| **Error Recovery & Memory Loop**   | `BR-MATCH-005`, `007` | `REQ-MATCH-007` (Mismatch Shake & Reset)    | `US-QUIZ-04` | Scenario 3: Mismatch Error Shake          | `apps/web/src/features/practice/components/MatchingTile.spec.tsx`                       |
| **Anti-Race Condition Safety**     | `BR-MATCH-005`        | `REQ-MATCH-008` (Interaction Locking)       | `US-QUIZ-04` | Scenario 7: Rapid Click Spam Protection   | `apps/web/src/features/practice/hooks/useWordMatchingGame.spec.ts`                      |
| **Gamification & Dopamine Loop**   | `BR-MATCH-006`, `007` | `REQ-MATCH-009` (Combo Multipliers & XP)    | `US-QUIZ-04` | Scenario 1: Combo Multipliers             | `apps/api/src/modules/practice/practice.service.spec.ts`                                |
| **Retention & Speed Incentives**   | `BR-MATCH-008`, `009` | `REQ-MATCH-010` (Speed & Perfect Bonus)     | `US-QUIZ-04` | Scenario 1, 9: Speed & Perfect Bonuses    | `apps/api/src/modules/practice/practice.service.spec.ts`                                |
| **Leaderboard & XP Integrity**     | `BR-MATCH-010`, `011` | `REQ-MATCH-011` (Anti-Abuse Velocity Guard) | `US-QUIZ-04` | Scenario 11: Bot Velocity Interception    | `apps/api/src/modules/practice/practice.service.spec.ts`                                |
| **Free SM-2 Memory Decoupling**    | `BR-MATCH-012`        | `REQ-MATCH-012` (SM-2 Decoupling & Results) | `US-QUIZ-04` | Scenario 10: Multi-round Results Summary  | `apps/web/src/features/practice/components/QuizResultsView.spec.tsx`                    |

---

## 2. Non-Functional Requirements (NFR) Traceability

| NFR Domain                | Quality Target                                                    | Mapped Requirements                               | Validation Method                                  |
| :------------------------ | :---------------------------------------------------------------- | :------------------------------------------------ | :------------------------------------------------- |
| **Performance**           | Input response $< 16\text{ms}$ (60fps animation)                  | `REQ-MATCH-003`, `REQ-MATCH-004`, `REQ-MATCH-006` | Profiler / Vitest performance benchmark            |
| **Zero-Latency Audio**    | Instant synthesized audio cues via Web Audio API                  | `REQ-MATCH-006`, `REQ-MATCH-007`                  | Unit test checking `AudioContext` oscillator calls |
| **Accessibility**         | WCAG 2.1 AA compliant ($> 4.5:1$ contrast, $48\text{px}$ targets) | `REQ-MATCH-003`                                   | Automated axe-core / a11y testing suite            |
| **Security & Anti-Abuse** | Reject bot submissions $< 1500\text{ms}$ per 5-pair round         | `REQ-MATCH-011`                                   | Backend automated integration test suite           |
| **Keyboard Usability**    | Full keyboard navigation (`1-5`, `Q-T`, `Esc`, `Space`)           | `REQ-MATCH-004`, `REQ-MATCH-005`                  | Vitest keyboard event simulation test              |
