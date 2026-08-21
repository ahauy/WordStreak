# Product Requirements Document (PRD): Chế độ Nối từ vựng (Word Matching Game)

- **Feature Title**: Chế độ Nối từ vựng (Word Matching Game)
- **Feature Slug**: `quiz-word-matching`
- **Epic**: `EPIC-04` (Multi-format Practice & Quiz Modes — US-QUIZ-04)
- **Document Version**: 1.0
- **Status**: Draft (Ready for Validation)
- **Date**: 2026-08-21

---

## 1. Executive Summary & Product Vision

### 1.1. Overview

The **Word Matching Game** (`US-QUIZ-04`) is an interactive, fast-paced vocabulary pairing practice mode in WordStreak. Players match English vocabulary terms with their corresponding Vietnamese definitions across two dynamic, randomized columns. The mode combines visual micro-interactions, synthesized sound cues, combo streak multipliers, and speed bonuses to transform vocabulary revision into an engaging, high-energy mini-game.

### 1.2. Strategic Objectives

- **Cognitive Diversity**: Expand WordStreak's practice arsenal beyond sequential single-card recall to include multi-item spatial and associative recognition.
- **Learner Engagement**: Increase average daily practice session length and retention by $+25\%$ through gamified combo streaks and tactile tile feedback.
- **Safe Practice Decoupling**: Provide rapid drill capability that rewards XP and progresses Daily Goals while keeping Spaced Repetition (SM-2) scheduling intact.

---

## 2. Target Personas & Use Cases

### 2.1. Personas

- **Alex (IELTS/TOEIC Candidate)**: Needs high-speed drill sessions to build instant semantic reflex between academic vocabulary and definitions without getting bogged down in typing.
- **Minh (Busy Professional)**: Has 3–5 minutes during commutes; seeks quick, dopamine-rich practice rounds that count towards the daily streak.
- **Linh (Visual & Associative Learner)**: Benefits from seeing multiple lexical options simultaneously and forming mental links through physical tile pairing.

### 2.2. User Journey Flow

1. **Entry**: Learner clicks "Luyện tập" on a Deck containing $\ge 5$ cards and selects the "Nối từ" tab in `QuizSetupModal`.
2. **Session Configuration**: Chooses question count (5, 10, 15, or 20 cards) and timer preference (Timed 45s vs Zen Mode).
3. **Gameplay Loop**:
   - 5 English tiles appear on the left; 5 Vietnamese definitions appear on the right (independently shuffled).
   - Learner taps an English or Vietnamese tile (highlights purple).
   - Learner taps matching counterpart:
     - **Correct**: Pleasant chime sound, emerald dissolve animation, combo count increments, tiles become inactive.
     - **Incorrect**: Soft buzz sound, rose horizontal shake animation, combo resets to 0, tiles return to neutral after 400ms.
4. **Round Progression**: When all 5 pairs are solved, next round slides in until target cards are completed.
5. **Session Summary**: Results view displays total time, accuracy %, max combo, XP earned (with combo/speed breakdown), and a review list of missed cards.

---

## 3. Product Requirements & Feature Details

### 3.1. Core Board & Interaction Engine

- **2-Column Layout**: Left column displays English words; Right column displays Vietnamese meanings. Shuffled independently using Fisher-Yates.
- **Bidirectional Selection**: Users can tap English $\to$ Vietnamese or Vietnamese $\to$ English.
- **Tile Switching & Deselection**:
  - Tapping another tile within the _same_ column switches active selection seamlessly.
  - Tapping the _currently active_ tile deselects it.
- **Interaction Lock**: Board locks user pointer events for $300\text{–}400\text{ms}$ during match/mismatch evaluations to eliminate race conditions.
- **Deck Requirement Guard**: Requires $\ge 5$ cards in deck. If $< 5$, option is disabled with an explanatory tooltip and a shortcut to add cards.

### 3.2. Visual & Motion Design System

- **WordStreak Minimal Clean Design**: Obsidian dark (`#09090b`) canvas, subtle borders, high contrast text.
- **State Styling**:
  - _Neutral_: Border `#e4e4e7` (light) / `#27272a` (dark), hover scale $1.01$.
  - _Selected_: Ring `2px #8b5cf6` (Purple Flame), scale $1.02$, light purple background tint.
  - _Matched_: Emerald border `#10b981`, fade out and opacity $0$ over $300\text{ms}$.
  - _Mismatch_: Rose border `#f43f5e`, horizontal shake (`animate-shake`) over $400\text{ms}$.
- **Performance**: 60fps hardware-accelerated transitions via Framer Motion.

### 3.3. Audio Experience

- **Zero-Latency Web Audio API Synthesizer**:
  - _Success Chime_: Ascending sine wave ($587\text{Hz} \to 880\text{Hz}$, $120\text{ms}$).
  - _Error Buzz_: Descending sawtooth wave ($180\text{Hz} \to 120\text{Hz}$, $180\text{ms}$).
  - _Combo Ding_: High bell resonance ($1046\text{Hz}$, $150\text{ms}$).
- **Controls**: Persistent mute button in game header; fail-safe silent operation if browser audio is restricted.

### 3.4. Gamification, XP & Anti-Abuse

- **Base XP**: $+2\text{ XP}$ per matched pair ($10\text{ XP}$ base for a 5-pair round).
- **Combo Multipliers**:
  - Combo 1–2: $1.0\times$
  - Combo 3–4: $1.2\times$
  - Combo 5 (Clean round): $1.5\times$
  - Combo 10+ (Multi-round streak): $2.0\times$
- **Bonuses**: $+10\text{ XP}$ Speed Bonus for round $\le 15\text{s}$ with 0 errors; $+5\text{ XP}$ Perfect Accuracy Bonus.
- **Anti-Abuse Guards**: Telemetry check flags submissions $< 1500\text{ms}$ per round or $< 200\text{ms}$ per pair as bots ($0\text{ XP}$ awarded). Global daily practice XP cap of $500\text{ XP/day}$.
- **SM-2 Decoupling**: No mutation to `UserCardProgress` spaced repetition intervals or ease factors.

---

## 4. Accessibility & Non-Functional Requirements

- **WCAG 2.1 AA Compliance**: All color contrasts $> 4.5:1$, touch targets $\ge 48\text{px} \times 48\text{px}$, ARIA live region updates for screen readers.
- **Keyboard Navigation**: Keys `1–5` for Left Column, `Q–T` / `6–0` for Right Column, `Space` for pronunciation audio, `Escape` to deselect.
- **Responsiveness**: Fluid layout across Mobile ($320\text{–}640\text{px}$), Tablet ($641\text{–}1024\text{px}$), and Desktop ($> 1024\text{px}$).
- **Latency**: UI feedback $< 16\text{ms}$, game load $< 100\text{ms}$.

---

## 5. MoSCoW Scope Boundaries

- **Must-Have**: 5-pair round board, independent shuffling, bidirectional matching, combo multipliers, sound cues, minimum deck guard ($\ge 5$), anti-abuse checks, results screen.
- **Should-Have**: Zen mode toggle, keyboard navigation, smooth round transition celebration.
- **Could-Have**: Personal best time record badge.
- **Won't-Have (v1.0)**: Real-time 1v1 multi-player battle mode, SVG drag-and-drop line drawing, speech recognition matching.
