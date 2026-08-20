# Elicitation: Multiple Choice Quiz (US-QUIZ-01)

- **Feature**: Multiple Choice Quiz Mode
- **Date**: 2026-08-20
- **Status**: COMPLETE

---

## Stage 1 — Business Value

- **Problem**: Learners need a rapid, gamified, active-recall multiple choice quiz mode with contextual distractors to strengthen vocabulary recognition reflexes without mutating strict Spaced Repetition (SM-2) review intervals.
- **Personas**:
  - Persona A (Alex - Exam Prep): Fast recognition drill for academic words.
  - Persona B (Minh - Busy Professional): Quick 2-3 minute practice sprints (10 questions) on mobile or desktop.
  - Persona C (Linh - Casual Learner): Low-stress practice with timer/Zen mode options.
- **Success Metrics**:
  - Quiz completion rate $\ge 85\%$
  - Average response latency $< 3.5$s per question
  - Practice retention lift (+20% practice sessions per active user)

---

## Pillar 1 — Personas, Actors & RBAC

- **Learner Role**: Can start and complete multiple choice quizzes on any owned deck or public deck.
- **Data Access**: Can view and generate quizzes for decks they have read access to.
- **Guest / Unauthenticated**: Redirected to login before starting practice.

---

## Pillar 2 — State Machine & Lifecycle

- **States**: `CONFIGURING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `QUESTION_FEEDBACK` $\rightarrow$ `COMPLETED` (or `ABANDONED`).
- Instant feedback transition: 1.0s delay after answering (or instant skip via Space/key press) before advancing to next question.

---

## Pillar 3 — Business Rules & Algorithms

- **Q1 (Quiz Direction)**: Bidirectional 50/50 mix:
  - Format 1 (EN $\rightarrow$ VI): Prompt Word (+ IPA + Audio button) $\rightarrow$ 4 Vietnamese meaning choices.
  - Format 2 (VI $\rightarrow$ EN): Prompt Meaning (+ sentence context with blank) $\rightarrow$ 4 English word choices.
- **Q2 (Distractor Strategy)**:
  - Tier 1: 3 random distractor cards from the **same Deck**.
  - Tier 2: If current deck $< 4$ cards, pool from user's other decks.
  - Tier 3: Guard condition: Deck / User must have $\ge 4$ cards total to launch quiz.
- **Q3 (SM-2 & XP Separation)**:
  - Pure Practice Mode: Does not mutate `UserCardProgress` (`interval`, `easeFactor`, `nextReviewDate`).
  - Rewards: +10 XP per correct answer; +15 XP if answered within 5s (speed bonus); Combo multiplier (x2 for 3+ consecutive correct, x3 for 5+).
- **Q4 (Quiz Length Presets)**:
  - Preset options: 10 questions (Quick ~2m, Default), 20 questions (Standard ~5m), or All cards in Deck.
- **Q5 (Timer & Zen Mode)**:
  - Default: 15-second countdown timer per question.
  - Zen Mode toggle: Disables countdown timer for stress-free learning.
  - Expired timer ($t = 0$s): Counted as incorrect, highlights correct answer, transitions after feedback.
- **Q6 (Keyboard Shortcuts & Navigation)**:
  - Keys `1`, `2`, `3`, `4` (and `A`, `B`, `C`, `D`) select choices instantly.
  - `Space` / `Enter` immediately advances to next question during the 1.0s feedback window.

---

## Assumptions Confirmed

- `ASM-QUIZ-001`: Multiple choice questions are generated dynamically with a 50/50 split between EN->VI (Word to Meaning) and VI->EN (Meaning to Word).
- `ASM-QUIZ-002`: Distractor options prefer cards within the same deck, falling back to other decks owned by the user if the current deck has fewer than 4 cards, and blocking start only if the user has fewer than 4 total cards.
- `ASM-QUIZ-003`: Multiple Choice Quiz is an independent practice mode that does not mutate card SM-2 spaced repetition state, but grants XP and logs practice statistics.
- `ASM-QUIZ-004`: Quiz session length defaults to 10 questions with 20 and All-cards presets.
- `ASM-QUIZ-005`: 15s countdown timer per question with speed bonus (+15 XP for $\le 5$s) and toggleable Zen Mode.
- `ASM-QUIZ-006`: Keyboard navigation (1-4, A-D, Space) supported with a 1.0s visual feedback pause before auto-advancing.
