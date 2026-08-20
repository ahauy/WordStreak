# Domain Decision Baseline: Multiple Choice Quiz (US-QUIZ-01)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: User (2026-08-20)  
**Feature Slug**: `quiz-multiple-choice`

---

## 1. Business Problem & Success Metrics

- **Problem**: Learners need a rapid, gamified, active-recall multiple choice quiz mode with contextual distractors to strengthen vocabulary recognition reflexes without mutating strict Spaced Repetition (SM-2) review intervals.
- **Target Personas**: Exam Prep (Alex), Busy Professional (Minh), Casual Learner (Linh).
- **Target Metrics**: $\ge 85\%$ completion rate, $< 3.5$s average response time, +20% daily practice sessions.

---

## 2. Core Domain Model & Business Rules

### Business Rules

- **`BR-QUIZ-001` (Question Formats)**: 50/50 randomized mix between EN $\rightarrow$ VI (Prompt word -> 4 Vietnamese meanings) and VI $\rightarrow$ EN (Prompt meaning -> 4 English words).
- **`BR-QUIZ-002` (Smart Distractors & Fallback)**: 3 unique distractors pulled from the same deck $\rightarrow$ fallback to user's other decks if $< 4$ cards $\rightarrow$ block quiz if total cards in account $< 4$.
- **`BR-QUIZ-003` (Option Shuffling)**: Uniform Fisher-Yates randomization across choices A, B, C, D (1, 2, 3, 4).
- **`BR-QUIZ-004` (15s Timer & Zen Mode)**: 15-second countdown per question with auto-timeout, or optional Zen Mode (no timer).
- **`BR-QUIZ-005` (Scoring & Combo Bonuses)**: +10 base XP per correct answer, +5 XP speed bonus for $\le 5.0$s, combo multiplier (1.2x for 3+, 1.5x for 5+).
- **`BR-QUIZ-006` (SM-2 State Immutability)**: Quiz answers do NOT alter SuperMemo-2 card intervals or next review dates.
- **`BR-QUIZ-007` (Anti-Abuse & Rate Limits)**: Submissions under human reading speed threshold ($< 3$s for 10 questions) receive 0 XP; daily deck XP capped after 5 sessions.

---

## 3. Scope Boundaries (MoSCoW)

- **Must-Have (P0)**:
  - Backend `GET /api/v1/practice/multiple-choice` & `POST /api/v1/practice/submit-quiz`.
  - Frontend interactive quiz player (hotkeys 1-4, A-D, Space), 15s timer bar, green/red feedback.
  - Setup drawer with 10 / 20 / All cards presets & Zen Mode toggle.
  - Celebratory Results Screen with accuracy donut, XP breakdown, combo streak, and missed words list.
  - "Practice Quiz" CTA button on `DeckDetailPage`.
- **Won't-Have (Out of Scope for v1)**:
  - Multiplayer live quiz battles.
  - Direct mutation of SM-2 intervals.
  - Custom per-card manual distractor authoring.

---

## 4. Upstream Artifacts

- **Intake**: [00-intake.md](./00-intake.md)
- **Elicitation**: [01-elicitation.md](./01-elicitation.md)
- **Gap Analysis**: [02-gap-analysis.md](./02-gap-analysis.md)
- **Domain Model**: [03-domain-model.md](./03-domain-model.md)
- **Risk Register**: [04-risk-register.md](./04-risk-register.md)
- **SRS**: [spec/SRS.md](./spec/SRS.md)
- **User Stories**: [spec/user-stories.md](./spec/user-stories.md)
- **Traceability Matrix**: [traceability-matrix.md](./traceability-matrix.md)
- **Validation Report**: [validation-report.md](./validation-report.md)
