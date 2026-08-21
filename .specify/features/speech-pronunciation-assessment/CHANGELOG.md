# Changelog: Speech Recognition & Pronunciation Assessment

All notable changes and stage progressions for this feature will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-08-21

### Shipped & DoD Final Sign-off

- **Automated Test Quality Gate**: 468/468 tests passing across monorepo (35 backend suites / 263 tests, 44 frontend suites / 205 tests; 92 tests dedicated to Speech & Pronunciation assessment).
- **Adversarial Reviews**:
  - Code Review: **93% PASS** (clean architecture, zero audio server retention, anti-abuse cooldown, typed contracts).
  - UI/UX Review: **98.5/100 PASS** (WCAG AA a11y, 60 FPS live soundwave, liquid glass modals, responsive breakdowns).
  - Anti-AI-slop & Design System: 100% compliance with `apps/web/DESIGN.md` & `apps/web/MEMORY.md`.
- **Engineering Implementation**:
  - Shared Contracts: `VoicePronunciationTier`, `VoiceEvaluationMode`, `VoicePracticeState`, `IpaSyllableToken`, `VoicePronunciationSubmitDto`, `VoicePronunciationResultDto` in `packages/shared-types`.
  - Backend NestJS (`apps/api`): `POST /api/v1/practice/voice/submit`, Levenshtein distance 2-row algorithm, LCS character diffing, 1500ms cooldown, 500 XP daily cap, and streak recording.
  - Frontend React 19 (`apps/web`): `useSpeechRecognition` (interim streaming + silence/max watchdogs), `useAudioVisualizer` (AnalyserNode FFT 60 FPS), `AcousticSoundwave`, `PronunciationScoreBadge`, `AccentAudioSelector` (US/UK dual-accent + 0.75x pitch-preserved slow playback), `useAudioSynthesizer` (Web Speech Synthesis fallback), `ipaSyllableParser` + `PhoneticWordBreakdown` (interactive syllable chips with primary `ˈ` / secondary `ˌ` stress badges), and `PronunciationPracticeModal` studio.
  - User Flow Integration: Embedded voice practice launch points in Flashcard Review (`ReviewSessionPage`), Deck Detail (`DeckDetailPage`), Card Table (`CardDataTable`), Card Item (`CardItemCard`), and `QuizSetupModal`.
- **Documentation & User Enablement**:
  - Feature Architecture & Reference: `docs/features/speech-pronunciation-assessment/README.md`.
  - Comprehensive User Guide: `docs/user-guides/speech-pronunciation-assessment.md` with 6 real annotated workflow screenshots.
  - Product Backlog & Roadmap: `docs/PRODUCT_BACKLOG_ROADMAP.md` updated with EPIC-08 (US-VOICE-01 and US-VOICE-02) and Sprint 5 marked as Completed `[x]`.

---

## [1.0.0-draft] - 2026-08-21

### Added

- **Stage 1 (intake-classifier)**: Created `00-intake.md`. Classified EPIC-08 (US-VOICE-01 & US-VOICE-02) as Full Feature.
- **Stage 2 (elicitation-interview)**: Created `01-elicitation.md` documenting business value, target personas, and the 6 domain pillars with confirmed assumptions `ASM-VOICE-001` through `ASM-VOICE-010`.
- **Stage 3 (gap-analysis)**: Created `02-gap-analysis.md` assessing AS-IS vs TO-BE states across functional, data, UX, and architectural dimensions.
- **Stage 4 (domain-modeling)**: Created `03-domain-model.md` defining RBAC matrix, Mermaid state lifecycles (Mic permissions, Voice assessment, Native audio playback), business rules `BR-VOICE-001` to `BR-VOICE-015`, anti-abuse matrix, and ERD.
- **Stage 5 (risk-contradiction-scanner)**: Created `04-risk-register.md` documenting zero contradictions/deadlocks, risk register `RISK-VOICE-001` to `008`, consolidated assumptions, and MoSCoW table.
- **Stage 6 (spec-writer)**: Created `spec/PRD.md`, `spec/SRS.md` (`REQ-VOICE-001` to `REQ-VOICE-014`), and `spec/user-stories.md` (`US-VOICE-01` & `US-VOICE-02` with testable Given-When-Then scenarios).
- **Stage 7 (spec-validator)**: Created `traceability-matrix.md` and `validation-report.md` confirming 100% compliance with ISO/IEC/IEEE 29148:2018 standards.
- **Stage 8 (handover)**: Compiled `baseline.md` (marked `DRAFT - PENDING GATE 1 APPROVAL`) and `handover-brief.md`.
