# System Requirements Specification (SRS): Speech Recognition & Pronunciation Assessment

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Document Version**: 1.0 (Draft)
- **Date**: 2026-08-21
- **Status**: Ready for Validation

---

## 1. Functional Requirements

### REQ-VOICE-001: Client-Side Web Speech Recognition Engine Initialization

- **Category**: Speech Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The web application MUST instantiate a speech recognition instance using `window.SpeechRecognition` or `window.webkitSpeechRecognition`. It MUST configure the instance with `continuous = false`, `interimResults = true`, `maxAlternatives = 3`, and locale matching the active card accent (`en-US` or `en-GB`).
- **Derived from**: `BR-VOICE-001`, `ASM-VOICE-001`, `GAP-FUNC-02`
- **Business Rules**: `BR-VOICE-001`, `BR-VOICE-011`
- **Non-Functional Requirements**: P95 initialization latency $< 100\text{ms}$.
- **Dependencies**: None.

### REQ-VOICE-002: Real-Time Audio Input Volume Meter & Waveform Visualizer

- **Category**: Audio Processing & UX
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When microphone recording begins, the application MUST capture the local `MediaStream`, connect it to an `AudioContext` with an `AnalyserNode`, calculate RMS audio energy at 60 FPS, and dynamically animate 5 to 7 soundwave bars reflecting live voice amplitude.
- **Derived from**: `BR-VOICE-013`, `GAP-FUNC-01`
- **Business Rules**: `BR-VOICE-013`
- **Non-Functional Requirements**: `NFR-PERF-01` ($< 2\%$ CPU utilization, strictly animated via `requestAnimationFrame`).
- **Dependencies**: `REQ-VOICE-001`.

### REQ-VOICE-003: Pronunciation Similarity & Levenshtein Scoring Engine

- **Category**: Assessment Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Upon receiving the final transcript from the speech recognition engine, the client MUST normalize both target text and spoken text (stripping punctuation, case-folding, trimming whitespace), compute normalized character-level Levenshtein distance, and evaluate number and homophone equivalences to produce a score from 0 to 100%.
- **Derived from**: `BR-VOICE-002`, `ASM-VOICE-003`, `GAP-FUNC-03`
- **Business Rules**: `BR-VOICE-002`
- **Non-Functional Requirements**: Scoring execution latency $< 20\text{ms}$.
- **Dependencies**: `REQ-VOICE-001`.

### REQ-VOICE-004: Pronunciation Assessment Result Classification & Visual Feedback

- **Category**: Assessment UX
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The application MUST classify the similarity score into one of three distinct tiers:
  1. `Exact Match` ($100\%$ score): Display Emerald Green badge, checkmark, and "+10 XP" chip.
  2. `Close Match` ($80\% - 99\%$ score): Display Royal Violet badge, "+10 XP" chip, and character difference highlighting.
  3. `Needs Retry` ($< 80\%$ score): Display Warm Amber badge, "Try Again" CTA, and IPA syllable stress hints.
- **Derived from**: `BR-VOICE-003`, `ASM-VOICE-003`
- **Business Rules**: `BR-VOICE-003`, `BR-VOICE-004`
- **Non-Functional Requirements**: WCAG AA color contrast compliance.
- **Dependencies**: `REQ-VOICE-003`.

### REQ-VOICE-005: Gamification XP Awarding & Daily Cap Protection

- **Category**: Gamification & Backend
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: For authenticated learners achieving a score $\ge 80\%$, the client MUST submit a claim to `POST /api/v1/voice/record-attempt`. The backend MUST award $+10\text{ XP}$ per unique card per session, enforce a maximum daily cap of $500\text{ XP/day}$, and record streak activity.
- **Derived from**: `BR-VOICE-005`, `BR-VOICE-006`, `ASM-VOICE-004`, `ASM-VOICE-005`
- **Business Rules**: `BR-VOICE-005`, `BR-VOICE-006`, `BR-VOICE-015`
- **Non-Functional Requirements**: API response latency P95 $< 150\text{ms}$.
- **Dependencies**: `REQ-VOICE-004`.

### REQ-VOICE-006: Dual-Accent Native Audio Reference Player

- **Category**: Audio Playback
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The vocabulary card UI MUST render dual-accent selection tabs for General American (`en-US`) and British RP (`en-GB`). Clicking the play button MUST stream the corresponding CDN audio file with loading and playing state indicators.
- **Derived from**: `BR-VOICE-007`, `ASM-VOICE-006`, `GAP-FUNC-04`
- **Business Rules**: `BR-VOICE-007`
- **Non-Functional Requirements**: Audio buffer start latency $< 200\text{ms}$.
- **Dependencies**: None.

### REQ-VOICE-007: Slow Playback Speed (0.75x) with Pitch Preservation

- **Category**: Audio Playback
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The audio player MUST provide a toggle between $1.0\text{x}$ (Normal) and $0.75\text{x}$ (Slow) speeds. When slow speed is active, the HTML5 `Audio` element MUST enforce `preservesPitch = true` (and vendor prefixes) to avoid pitch distortion.
- **Derived from**: `BR-VOICE-009`, `ASM-VOICE-007`, `GAP-FUNC-04`
- **Business Rules**: `BR-VOICE-009`
- **Non-Functional Requirements**: Zero audible pitch drop or robotic artifacting.
- **Dependencies**: `REQ-VOICE-006`.

### REQ-VOICE-008: Web Speech Synthesis Fallback Resolution

- **Category**: Audio Playback & Resilience
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: If a card's CDN audio URL fails to load, returns HTTP 404, or is missing, the player MUST automatically fall back to `window.speechSynthesis` using the highest-quality available system voice matching the selected locale (`en-US` or `en-GB`) and current rate ($1.0\text{x}$ or $0.75\text{x}$).
- **Derived from**: `BR-VOICE-008`, `ASM-VOICE-008`
- **Business Rules**: `BR-VOICE-008`
- **Non-Functional Requirements**: Fallback transition $< 50\text{ms}$ with zero console uncaught exceptions.
- **Dependencies**: `REQ-VOICE-006`.

### REQ-VOICE-009: Interactive IPA Syllable Segmentation

- **Category**: Phonetic Guidance
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The card details and pronunciation UI MUST parse the card's IPA phonetic string into discrete clickable syllable tokens, clearly highlighting primary stress (`ˈ`) and secondary stress (`ˌ`) syllables. Tapping an individual syllable MUST speak that isolated segment.
- **Derived from**: `BR-VOICE-010`, `GAP-FUNC-05`
- **Business Rules**: `BR-VOICE-010`
- **Non-Functional Requirements**: Rendered using `JetBrains Mono` font for phonetic glyph clarity.
- **Dependencies**: None.

### REQ-VOICE-010: Microphone Permission State Management & Unblock Guidance

- **Category**: Security & UX
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: When microphone permission is in a `DENIED` or `UNAVAILABLE` state, the UI MUST render an inline informative card with browser-specific steps (Chrome, Safari, Edge) to unblock the microphone, alongside a "Retry Permission" button.
- **Derived from**: `BR-VOICE-011`, `RISK-VOICE-002`
- **Business Rules**: `BR-VOICE-011`
- **Non-Functional Requirements**: Actionable guidance displayed within 1 click.
- **Dependencies**: `REQ-VOICE-001`.

### REQ-VOICE-011: Unsupported Browser Graceful Degradation

- **Category**: Compatibility
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: If the browser environment does not support `window.SpeechRecognition` or `window.webkitSpeechRecognition` (e.g. standard Firefox desktop), the UI MUST gracefully disable the microphone trigger button, display an advisory badge, and keep audio playback, 0.75x slow speed, and IPA syllable breakdown $100\%$ operational.
- **Derived from**: `ASM-VOICE-009`, `RISK-VOICE-001`
- **Business Rules**: `BR-VOICE-001`, `BR-VOICE-011`
- **Non-Functional Requirements**: Zero page crash, clean console telemetry.
- **Dependencies**: None.

### REQ-VOICE-012: Silence & Maximum Utterance Duration Watchdogs

- **Category**: Speech Engine Watchdogs
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The speech recognition hook MUST enforce two safety timeouts:
  1. A **Silence Timeout** of $2500\text{ms}$ after start if no voice activity is detected.
  2. A **Maximum Duration Timeout** of $8000\text{ms}$ (8.0s) per utterance attempt.
- **Derived from**: `BR-VOICE-014`
- **Business Rules**: `BR-VOICE-014`
- **Non-Functional Requirements**: Automatic cleanup of Web Audio stream tracks.
- **Dependencies**: `REQ-VOICE-001`, `REQ-VOICE-002`.

### REQ-VOICE-013: Auditory & Haptic Feedback Chimes

- **Category**: UX Feedback
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The UI MUST generate lightweight, synthesized Web Audio chimes for assessment outcomes: a pleasant ascending 2-tone chime for Exact Match, a bright single chime for Close Match, and a gentle neutral chime for Needs Retry.
- **Derived from**: `BR-VOICE-003`, `GAP-UX-03`
- **Business Rules**: `BR-VOICE-003`
- **Non-Functional Requirements**: Audio generation overhead $< 5\text{ms}$ via Web Audio oscillators; volume compliant with system mute.
- **Dependencies**: `REQ-VOICE-004`.

### REQ-VOICE-014: Privacy & Client-Side Ephemeral Processing Guarantee

- **Category**: Privacy & Security
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: All microphone audio streams MUST be processed exclusively in volatile browser client memory. No audio waveforms, raw PCM buffers, or audio files shall be transmitted to or stored on WordStreak servers.
- **Derived from**: `BR-VOICE-012`, `ASM-VOICE-002`, `RISK-VOICE-006`
- **Business Rules**: `BR-VOICE-012`
- **Non-Functional Requirements**: 100% compliance with privacy-by-design principles.
- **Dependencies**: `REQ-VOICE-001`, `REQ-VOICE-002`.
