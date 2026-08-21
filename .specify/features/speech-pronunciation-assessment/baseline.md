# Domain Decision Baseline: Speech Recognition & Pronunciation Assessment

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Epic**: EPIC-08 (Speech Recognition & Pronunciation Assessment)
- **Baseline Version**: 1.0 (Approved)
- **Status**: **SIGNED-OFF v1.0 (Approved 2026-08-21)**
- **Date**: 2026-08-21
- **Lead Business Analyst**: Senior BA Agent (WordStreak Engineering)

---

## 1. Business Summary & Problem Statement

Learners struggle with spoken English pronunciation and oral recall because existing flashcards only support passive reading and listening, lacking an immediate, zero-friction, interactive way to speak target vocabulary aloud, visualize voice acoustic input, receive real-time phoneme/word accuracy grading, and hear dual-accent (US/UK) native reference pronunciations at standard and slow (0.75x) playback speeds.

This feature introduces a comprehensive client-side speech studio directly into WordStreak study and quiz sessions, delivering:

- **US-VOICE-01**: Real-time microphone speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`), live acoustic soundwave visualization (`AnalyserNode`), Levenshtein & phonetic similarity scoring (Exact 100%, Close 80–99%, Retry <80%), auditory feedback chimes, and $+10\text{ XP}$ rewards with anti-abuse daily limits ($500\text{ XP/day}$) and streak qualification.
- **US-VOICE-02**: High-quality dual-accent native audio playback (US General American and UK British RP), 0.75x slow playback toggle with audio pitch preservation (`preservesPitch = true`), transparent fallback to Web Speech Synthesis, and interactive IPA syllable segmentation with stress marker visual tags.

---

## 2. Gap Analysis & Architecture Decisions Summary

- **Architecture Strategy**: 100% client-side ephemeral audio processing using modern browser Web APIs (`Web Speech API`, `Web Audio API`, `SpeechSynthesis`).
- **Privacy by Design**: Zero voice audio bytes are transmitted to or stored on WordStreak servers.
- **Resilience**: Zero external paid API keys required. Resilient fallback hierarchy (CDN Audio $\rightarrow$ High-Fidelity SpeechSynthesis; WebSpeech $\rightarrow$ Informative UX guidance).
- **Gamification**: $+10\text{ XP}$ awarded upon achieving $\ge 80\%$ score on a card, protected by a $500\text{ XP/day}$ cap and 1500ms debounce.

---

## 3. Approved Domain Model & Business Rules

Detailed artifacts located in [`03-domain-model.md`](03-domain-model.md):

- **RBAC Matrix**: Guest (audio preview & 3 trial mic checks), Authenticated Learner (unlimited practice, XP & streak earning), Admin (aggregated telemetry).
- **State Machines**:
  1. Microphone Permission Lifecycle (`UNPROMPTED` $\rightarrow$ `PRE_PROMPT` $\rightarrow$ `REQUESTING` $\rightarrow$ `GRANTED` / `DENIED` / `UNAVAILABLE`).
  2. Voice Practice & Assessment Lifecycle (`IDLE` $\rightarrow$ `LISTENING` $\rightarrow$ `PROCESSING` $\rightarrow$ `EVALUATED` $\rightarrow$ `REWARDED` / `RETRY`).
  3. Native Audio Playback Lifecycle (`AUDIO_IDLE` $\rightarrow$ `FETCHING_CDN` $\rightarrow$ `PLAYING_NATIVE` / `FALLBACK_TTS` $\rightarrow$ `FINISHED`).
- **Key Business Rules**:
  - `BR-VOICE-001`: Speech Recognition Initialization (`en-US` / `en-GB`, interim results enabled).
  - `BR-VOICE-002`: Normalized Levenshtein & Character Similarity Metric.
  - `BR-VOICE-003`: Assessment Tiers (Exact 100%, Close 80-99%, Needs Retry <80%).
  - `BR-VOICE-004`: Word & Syllable Accuracy Token Breakdown.
  - `BR-VOICE-005`: Gamification XP & Streak Credit (+10 XP per unique passing card).
  - `BR-VOICE-006`: Anti-Abuse Cap (Max 500 XP/day, 1500ms cooldown).
  - `BR-VOICE-007`: Dual Accent Native CDN Track Hierarchy (US & UK).
  - `BR-VOICE-008`: Web Speech Synthesis Fallback.
  - `BR-VOICE-009`: Slow Playback (0.75x) with Preserved Vocal Timbre.
  - `BR-VOICE-010`: Interactive IPA Syllable Segmentation.
  - `BR-VOICE-011`: Permission State Management & HTTPS Enforcement.
  - `BR-VOICE-012`: Audio Stream Privacy Guarantee (Zero server audio storage).
  - `BR-VOICE-013`: Real-Time Audio Visualizer Sampling (60 FPS FFT volume meter).
  - `BR-VOICE-014`: Silence (2.5s) & Max Duration (8.0s) Timeouts.
  - `BR-VOICE-015`: Multi-Card Pronunciation Session Streak Qualification.

---

## 4. MoSCoW Scope Summary

Detailed matrix located in [`04-risk-register.md`](04-risk-register.md):

- **Must-Have (P0)**: Web Speech STT, live soundwave visualizer, Levenshtein scoring tiers, dual-accent US/UK audio player, 0.75x slow speed with pitch preservation, interactive IPA syllables, $+10\text{ XP}$ reward with $500\text{ XP/day}$ cap, permission handling & fallbacks.
- **Should-Have (P1)**: Keyboard shortcuts (`Space`, `R`, `S`), audio chimes mute toggle, multi-word sentence accuracy highlighting.
- **Could-Have (P2)**: Pitch contour intonation curve comparison, offline WASM phonemizer.
- **Won't-Have (Out of Scope)**: Server-side audio recording storage, paid cloud speech APIs (Whisper/Azure), non-English languages.

---

## 5. Specification Document Index

- [PRD (Product Requirements Document)](spec/PRD.md)
- [SRS (System Requirements Specification)](spec/SRS.md) — Requirements `REQ-VOICE-001` through `REQ-VOICE-014`
- [User Stories & Gherkin Scenarios](spec/user-stories.md) — Stories `US-VOICE-01` and `US-VOICE-02`
- [Requirement Traceability Matrix](traceability-matrix.md)
- [Spec Validation Report (IEEE 29148)](validation-report.md)

---

## 6. Accepted Risks & Open Constraints

- `RISK-VOICE-001`: Desktop Firefox lacks out-of-the-box SpeechRecognition support $\rightarrow$ Mitigated via non-blocking guidance banner while preserving audio playback and syllable breakdown.
- `RISK-VOICE-003`: Ambient background noise $\rightarrow$ Mitigated via $\ge 80\%$ tolerance threshold, token normalization, and 2.5s silence timeout.
- Zero server audio storage constraint strictly enforced.
