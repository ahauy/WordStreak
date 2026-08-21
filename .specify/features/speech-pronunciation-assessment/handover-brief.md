# Handover Brief: Speech Recognition & Pronunciation Assessment

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Baseline Version**: 1.0 (Draft — Pending Gate 1 Approval)
- **Date**: 2026-08-21
- **Lead BA**: Senior Business Analyst Agent
- **Target Implementation Pipeline**: `speckit-specify` $\rightarrow$ `speckit-plan` $\rightarrow$ `speckit-tasks`

---

## 1. What Is Being Built

A comprehensive, client-side interactive oral pronunciation studio embedded into WordStreak vocabulary flashcard review and practice quiz sessions:

1. **US-VOICE-01 (Voice Recognition & Scoring)**: Learners tap/hold a microphone CTA to speak displayed words aloud, observe a live volume-reactive soundwave visualizer (Web Audio API `AnalyserNode`), receive instant speech-to-text transcription (Web Speech API `SpeechRecognition`), and get graded on a normalized Levenshtein similarity metric (Exact 100%, Close 80–99%, Retry <80%) with audio chimes and $+10\text{ XP}$ rewards.
2. **US-VOICE-02 (Native Reference Audio & Pronunciation Guide)**: Learners can toggle between US and UK native audio tracks, slow playback down to 0.75x with pitch preservation (`preservesPitch = true`), seamlessly fall back to browser `speechSynthesis` if CDN audio fails, and tap interactive IPA syllable chips to hear isolated syllable pronunciations.

---

## 2. What Is Explicitly Out of Scope

- ❌ **Server-Side Audio Recording Storage**: No upload or persistence of user voice audio buffers to backend servers (100% ephemeral client processing).
- ❌ **Paid Third-Party Speech Cloud APIs**: Zero dependencies on paid cloud services (Google Cloud Speech, Azure Speech, OpenAI Whisper).
- ❌ **Non-English Language Models**: Scoped exclusively to English (`en-US` and `en-GB`).
- ❌ **Hardware Pitch Sensors / Specialized Microphones**: Relies on standard built-in microphones.

---

## 3. Key Architecture & Design Guidelines

- **Zero-AI-Slop Visuals**: Comply strictly with `apps/web/DESIGN.md` & `apps/web/MEMORY.md` (`#ffffff` canvas, 1px `#e5e5e5` hairline borders, Obsidian `#000000` pill CTAs with `rounded-full`, Nunito headings, Inter body, JetBrains Mono IPA/tags, Electric Violet `#8B5CF6` / Purple Flame accents).
- **Resilience**: Graceful fallback for non-WebSpeech browsers (Firefox desktop) with non-blocking informational guidance.
- **Anti-Abuse**: Daily voice XP cap enforced at $500\text{ XP/day}$ (50 cards) with a $1500\text{ms}$ request debounce on `POST /api/v1/voice/record-attempt`.

---

## 4. Spec Document Deliverables

- [`00-intake.md`](00-intake.md) — Intake classification (Full Feature)
- [`01-elicitation.md`](01-elicitation.md) — 6-pillar requirements & confirmed assumptions
- [`02-gap-analysis.md`](02-gap-analysis.md) — AS-IS vs TO-BE gap evaluation
- [`03-domain-model.md`](03-domain-model.md) — RBAC, state diagrams, `BR-VOICE-001`..`015`, ERD
- [`04-risk-register.md`](04-risk-register.md) — Risk register, consolidated assumptions, MoSCoW
- [`spec/PRD.md`](spec/PRD.md) — Product Requirements Document
- [`spec/SRS.md`](spec/SRS.md) — System Requirements Specification (`REQ-VOICE-001`..`014`)
- [`spec/user-stories.md`](spec/user-stories.md) — Gherkin scenarios for `US-VOICE-01` & `US-VOICE-02`
- [`traceability-matrix.md`](traceability-matrix.md) — Complete 100% traceability matrix
- [`validation-report.md`](validation-report.md) — IEEE 29148 quality audit (Passed)
- [`baseline.md`](baseline.md) — Domain Decision Baseline (Draft)

---

## 5. Next Steps

1. **Confirmation Gate 1**: User reviews and approves the Domain Decision Baseline (`baseline.md`).
2. **Implementation Specification**: Trigger `speckit-specify` to generate implementation contracts, technical specs, and component architectures under `.specify/features/speech-pronunciation-assessment/spec.md`.
