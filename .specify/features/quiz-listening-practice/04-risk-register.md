# Risk Register & Contradiction Scan: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)
- **Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. Contradiction & Deadlock Scan

- **Contradiction Check 1 (Autoplay Policy vs Seamless Experience)**:
  - _Conflict_: Modern browsers block programmatic audio autoplay unless initiated by a direct user gesture.
  - _Resolution_: The "Start Listening Practice" button in `QuizSetupModal` serves as the prerequisite user gesture. In cases where the browser still restricts playback, the UI renders a pulsing Obsidian "Play Audio (`Space`)" button.
- **Contradiction Check 2 (Missing / Broken Audio URLs vs Session Blocker)**:
  - _Conflict_: Some user-created cards or legacy decks may have null `audioUrl` or broken CDN links.
  - _Resolution_: `BR-QUIZ-LISTEN-002` specifies an automated, zero-latency Web Speech API fallback cascade using `window.speechSynthesis`. If Web Speech is unsupported, it gracefully opens the visual hint mode.
- **Contradiction Check 3 (Strict Orthography vs Minor Punctuation Variants)**:
  - _Conflict_: Words with hyphens (e.g., `state-of-the-art`), apostrophes (e.g., `don't`), or capitalizations could cause false negatives.
  - _Resolution_: Normalization algorithm (`BR-QUIZ-LISTEN-004`) strips non-alphanumeric punctuation and standardizes quotes and hyphens while preserving strict letter spelling.
- **Contradiction Check 4 (Practice Drills vs Spaced Repetition State)**:
  - _Conflict_: Rapid practice sessions might artificially alter SM-2 memory intervals (`easeFactor`, `repetitions`).
  - _Resolution_: `BR-QUIZ-LISTEN-008` enforces complete isolation. Listening Practice is a pure recall drill; it never touches `UserCardProgress`.
- **Contradiction Check 5 (Gamification Rewards vs Automated Script Farming)**:
  - _Conflict_: Bad actors could use scripts to rapidly submit answers and farm unlimited XP.
  - _Resolution_: `BR-QUIZ-LISTEN-007` implements a 400ms minimum time-spent validation and a 500 XP daily practice cap enforced server-side.

---

## 2. Risk Register

| Risk ID           | Category            | Description                                                                | Probability | Impact | Mitigation Strategy                                                                                             |
| :---------------- | :------------------ | :------------------------------------------------------------------------- | :---------: | :----: | :-------------------------------------------------------------------------------------------------------------- |
| `RISK-LISTEN-001` | Technical / Browser | Browser autoplay policy blocks initial audio on first question load.       |    High     |  Med   | Setup modal CTA unlocks audio context; UI displays clear "Click to Play (`Space`)" button if blocked.           |
| `RISK-LISTEN-002` | Data / Operational  | Card `audioUrl` is null, 404, or fails to decode over slow network.        |     Med     |  Med   | 3000ms timeout triggers immediate fallback to browser `window.speechSynthesis` (`BR-QUIZ-LISTEN-002`).          |
| `RISK-LISTEN-003` | UX / Mobile         | Virtual keyboard on mobile devices pushes audio controls outside viewport. |     Med     |  Med   | Compact vertical layout with sticky audio player bar; minimum touch target $\ge 44 \times 44\text{px}$.         |
| `RISK-LISTEN-004` | Exploit / Abuse     | Automated scripts rapidly submit answers to artificially farm XP.          |     Low     |  Med   | Backend server validates time spent ($\ge 400\text{ms}$), caps daily practice XP at $500\text{ XP}$ (`BR-007`). |
| `RISK-LISTEN-005` | Accessibility       | Hearing-impaired learners unable to complete audio-only questions.         |     Low     |  Med   | Progressive Hint Level 2 (Vietnamese meaning) and Level 3 (Phonetic IPA) provide complete visual alternatives.  |

---

## 3. Assumptions & Constraints Log (Consolidated)

- `ASM-QUIZ-020`: Audio plays automatically upon question load when permitted by browser autoplay policy; otherwise, a prominent play trigger is displayed.
- `ASM-QUIZ-021`: Audio playback supports two speed rates: `1.0x` (Normal) and `0.75x` (Slow/Clear articulation).
- `ASM-QUIZ-022`: Browser Web Speech API (`window.speechSynthesis`) acts as an immediate zero-latency fallback when `audioUrl` is missing or fails to load.
- `ASM-QUIZ-023`: Answer validation performs whitespace trimming, case-insensitivity, and punctuation normalization.
- `ASM-QUIZ-024`: Progressive hints include 3 tiers: (1) First letter + character slots, (2) Vietnamese meaning, (3) Phonetic IPA string.
- `ASM-QUIZ-025`: Listening Practice is an isolated drill awarding XP and streak progress without modifying SM-2 spaced repetition memory state.
- `ASM-QUIZ-026`: Full keyboard accessibility allows hands-free audio replay (`Space`/`R`), speed toggling (`Shift+Space`/`S`), and hint access (`Ctrl+H`).
- `ASM-QUIZ-027`: Audio failover cascade guarantees learners can complete listening practice sessions even in offline or low-bandwidth environments.

### Technical & Architectural Constraints

- **Stack**: React 19, TypeScript, Tailwind CSS, NestJS 11, PostgreSQL.
- **Database**: Zero schema alterations; leverage existing `cards` table.
- **Design Standard**: Obsidian minimalist design tokens from `apps/web/DESIGN.md` & `apps/web/MEMORY.md`.

---

## 4. MoSCoW Scope Table

| Priority             | Scope Item                                                                                 | Traceability                           |
| :------------------- | :----------------------------------------------------------------------------------------- | :------------------------------------- |
| **Must-Have (P0)**   | Listening Question Generator endpoint `GET /api/v1/practice/listening`                     | `REQ-LISTEN-001`, `BR-QUIZ-LISTEN-001` |
| **Must-Have (P0)**   | Client-side Audio Controller with normal (1.0x) and slow (0.75x) playback rate             | `REQ-LISTEN-002`, `BR-QUIZ-LISTEN-003` |
| **Must-Have (P0)**   | Automatic Web Speech API (`window.speechSynthesis`) failover cascade                       | `REQ-LISTEN-003`, `BR-QUIZ-LISTEN-002` |
| **Must-Have (P0)**   | Interactive typing input with dynamic character length dashes (`_ _ _ _ _`)                | `REQ-LISTEN-004`, `US-QUIZ-03`         |
| **Must-Have (P0)**   | Normalized answer validation & immediate visual feedback with character diff               | `REQ-LISTEN-005`, `BR-QUIZ-LISTEN-004` |
| **Must-Have (P0)**   | Progressive 3-tier Hint system (Length/1st letter $\rightarrow$ Meaning $\rightarrow$ IPA) | `REQ-LISTEN-006`, `BR-QUIZ-LISTEN-005` |
| **Must-Have (P0)**   | Practice Setup Modal & Quiz Results recap view integration                                 | `REQ-LISTEN-007`, `BR-QUIZ-LISTEN-006` |
| **Must-Have (P0)**   | Gamification XP calculation, speed bonus, combo multiplier, and anti-abuse limits          | `REQ-LISTEN-008`, `BR-QUIZ-LISTEN-007` |
| **Should-Have (P1)** | 20s Countdown timer with toggleable Zen Mode                                               | `REQ-LISTEN-009`, `BR-QUIZ-LISTEN-009` |
| **Should-Have (P1)** | Full keyboard navigation (`Space`, `R`, `Shift+Space`, `S`, `Enter`, `Ctrl+H`, `Esc`)      | `REQ-LISTEN-010`, `BR-QUIZ-LISTEN-010` |
| **Could-Have (P2)**  | Animated purple flame audio waveform visualizer pulse                                      | Future polish                          |
| **Won't-Have (v1)**  | Voice Speech-to-Text (STT) answer recording (scoped for Epic 08 Voice Practice)            | Out of scope for Sprint 5              |
| **Won't-Have (v1)**  | Real-time AI custom accent speech synthesis / voice cloning                                | Out of scope for Sprint 5              |
