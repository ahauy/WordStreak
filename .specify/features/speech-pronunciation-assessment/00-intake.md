# Intake: Speech Recognition & Pronunciation Assessment (EPIC-08 / US-VOICE-01 & US-VOICE-02)

- **Date**: 2026-08-21
- **Feature Slug**: `speech-pronunciation-assessment`
- **Requested by**: Product Roadmap (EPIC-08: Speech Recognition & Pronunciation Assessment)
- **Classification**: Full Feature
- **Classification signals**:
  - New or changed domain entities: 3 (Speech Assessment Client Engine, Real-time Web Audio Visualizer, Voice Practice Session & Daily XP Telemetry)
  - Existing DB schema change required: Yes (Lightweight tracking for `VoicePracticeAttempt` and `UserDailyVoiceProgress` to enforce anti-abuse daily XP limits)
  - Screens/flows touched: 3+ (Flashcard Study & Review modal/view, Vocabulary Card Details view, Practice Quiz Pronunciation Trainer mode, Audio Permission Request modal)
  - User roles affected: 2 (Guest / Unauthenticated Preview, Authenticated Learner)
  - Cross-cutting: Client-side Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), Web Speech Synthesis (TTS Fallback), Web Audio API (`AudioContext`, `AnalyserNode` soundwave meter), SM-2 Study Loop integration, Gamification/XP Engine & Daily Streak qualification
  - Reversible without user-facing consequence: Yes (Feature flag toggleable without data corruption)
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation → Gap Analysis → Domain Modeling → Risk & Contradiction Scanner → Spec Writer → Spec Validator → Handover)
- **Override**: None

---

## One-line Problem Statement

Learners struggle with spoken English pronunciation and oral recall because existing digital flashcards only support passive reading and listening, lacking an immediate, zero-friction, interactive way to speak target vocabulary aloud, visualize their voice acoustic input, receive real-time phoneme/word accuracy grading, and hear dual-accent (US/UK) native reference pronunciations at standard and slow playback speeds.
