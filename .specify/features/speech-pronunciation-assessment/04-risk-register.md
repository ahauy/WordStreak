# Risk Register & Scope Boundaries: Speech Recognition & Pronunciation Assessment (EPIC-08)

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. Contradiction & Deadlock Scan

| Check Category             | Verification Item                                                                | Finding                                                                                                                                              | Resolution / Status |
| -------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Logic Contradiction**    | `BR-VOICE-003` grading tiers vs. `BR-VOICE-005` XP reward rules.                 | No conflict: Exact match ($100\%$) and Close match ($80-99\%$) both award $+10\text{ XP}$; Needs retry ($<80\%$) awards $0\text{ XP}$.               | PASSED              |
| **Logic Contradiction**    | Daily Voice XP Cap ($500\text{ XP}$) vs. Streak qualification in `BR-VOICE-015`. | No conflict: Reaching the daily $500\text{ XP}$ cap stops XP accrual, but further pronunciation attempts still advance or maintain streak.           | PASSED              |
| **State Deadlock**         | Voice session lifecycle transitions on permission denial or silence timeout.     | No deadlock: All error and timeout states (`TIMEOUT_SILENCE`, `DENIED`, `ERROR_STATE`) transition back to `IDLE` with appropriate recovery messages. | PASSED              |
| **Audio Player Deadlock**  | CDN audio loading failure handling in `BR-VOICE-008`.                            | No deadlock: Fetch failure immediately transitions to `FALLBACK_TTS` (`window.speechSynthesis`), guaranteeing sound plays without hanging.           | PASSED              |
| **Backward Compatibility** | Existing `Card.audioUrl` field vs. new `audioUrlUS` / `audioUrlUK`.              | No breaking change: If `audioUrlUS` is unset, client seamlessly falls back to legacy `audioUrl`, then to speech synthesis.                           | PASSED              |

---

## 2. Project Risk Register

| ID                 | Category                | Risk Description                                                                                                | Prob. | Impact | Mitigation Strategy                                                                                                                                                                                                  |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------- | ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-VOICE-001** | Technical / Browser     | Web Speech Recognition API is unsupported or disabled by default in desktop Firefox and some embedded WebViews. | Med   | Med    | Clear detection via `window.SpeechRecognition                                                                                                                                                                        |     | window.webkitSpeechRecognition`. On unsupported browsers, render an informative banner while keeping native audio playback (US/UK), 0.75x slow speed, and IPA syllable breakdowns 100% active. |
| **RISK-VOICE-002** | UX / Friction           | Learners deny microphone permission on initial browser prompt and cannot practice.                              | Med   | High   | Introduce a clear educational "Practice Speaking" pre-permission modal before triggering the browser's native prompt. If denied, provide an inline step-by-step visual unblock guide with a "Test Mic Again" button. |
| **RISK-VOICE-003** | Audio / Environment     | High background noise or low-quality laptop mic causes false-negative transcriptions.                           | Med   | Med    | Implement normalized string similarity tolerance ($\ge 80\%$ passing threshold), homophone normalization, and a generous 2.5s silence timeout so learners are not penalized for natural speech pauses.               |
| **RISK-VOICE-004** | Security / Abuse        | Automated scripts attempt to farm XP by spamming the voice completion endpoint.                                 | Low   | Med    | Enforce a server-side daily voice XP cap ($500\text{ XP/day}$), 1500ms request debounce/cooldown, and JWT authentication verification on `POST /api/v1/voice/record-attempt`.                                        |
| **RISK-VOICE-005** | Reliability / CDN       | Audio CDN URLs return 404 or high latency on slower mobile networks.                                            | Low   | Low    | Transparent fallback to Web Speech Synthesis (`window.speechSynthesis`) matching the requested accent locale (`en-US` or `en-GB`) with 0.75x speed support.                                                          |
| **RISK-VOICE-006** | Privacy / Compliance    | User concerns over voice data collection or recording storage.                                                  | Low   | High   | Architected as 100% client-side ephemeral processing. No microphone audio is ever transmitted to backend servers or third-party cloud audio buckets. Explicit "Voice data stays private on your device" notice.      |
| **RISK-VOICE-007** | Performance / Web Audio | AudioContext initialization blocked due to browser Autoplay Policy restrictions.                                | Med   | Low    | Web Audio `AudioContext` and mic stream are only initiated directly inside a user gesture handler (e.g. click/touch on the Mic CTA).                                                                                 |
| **RISK-VOICE-008** | Mobile / Haptics        | Mobile browsers (iOS Safari, Android Chrome) drop audio stream when switching tabs.                             | Low   | Low    | Implement `pagehide` and `visibilitychange` listeners to cleanly release MediaStream tracks when navigating away.                                                                                                    |

---

## 3. Consolidated Assumptions & Constraints Log

### Consolidated Assumptions

- **ASM-VOICE-001**: Browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) serves as the primary real-time speech-to-text engine with zero external STT cloud subscription costs.
- **ASM-VOICE-002**: Audio stream processing is strictly local to the browser; no raw microphone audio buffers or voice files are uploaded or stored on backend servers.
- **ASM-VOICE-003**: Normalized Levenshtein distance combined with tokenized word matching is sufficient and fast ($<20\text{ms}$) for vocabulary card pronunciation evaluation.
- **ASM-VOICE-004**: Passing a pronunciation check ($\ge 80\%$ score) awards $+10\text{ XP}$, limited to once per card per session and capped at $500\text{ XP/day}$.
- **ASM-VOICE-005**: Completing $\ge 1$ successful pronunciation check satisfies the daily study activity requirement for Daily Streak increment.
- **ASM-VOICE-006**: Dual-accent support provides both US (`en-US`) and UK (`en-GB`) pronunciation models and native reference tracks.
- **ASM-VOICE-007**: Slow speed toggle plays native reference audio at $0.75\text{x}$ playback rate with pitch preservation enabled.
- **ASM-VOICE-008**: `window.speechSynthesis` provides a reliable zero-config fallback when CDN audio files are missing or broken.
- **ASM-VOICE-009**: Unsupported browsers receive a non-blocking informative guidance state while retaining full access to listening, slow audio, and syllable breakdowns.
- **ASM-VOICE-010**: All UI components strictly adhere to WordStreak design tokens (pure white canvas, 1px `#e5e5e5` borders, obsidian black pill buttons, electric violet accents, and `JetBrains Mono` IPA typography).

### Technical & Business Constraints

- **Constraint 1 (Zero Paid API Dependency)**: Must operate without recurring third-party paid speech APIs (e.g., Azure Speech, Google Cloud Speech, OpenAI Whisper) to uphold WordStreak's 100% Free & Open-Source forever commitment.
- **Constraint 2 (HTTPS Requirement)**: Browser microphone access (`getUserMedia`) requires a secure HTTPS context in production.
- **Constraint 3 (No Heavy ML Client Bundles)**: Must not download multi-megabyte WASM/ONNX speech models to ensure ultra-fast page load times under mobile 3G/4G.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Sprint Delivery)

- [x] Web Speech API integration (`SpeechRecognition` / `webkitSpeechRecognition`) for English (`en-US` and `en-GB`).
- [x] Real-time soundwave / volume meter visualization via Web Audio API `AnalyserNode` during recording.
- [x] Client-side normalized Levenshtein similarity scoring engine with Exact (100%), Close (80–99%), and Retry (<80%) grading tiers.
- [x] Pronunciation result card showing recognized text, score percentage badge, and character/word diff breakdown.
- [x] Dual-accent native audio player (US and UK tabs) with CDN playback and Web Speech Synthesis fallback.
- [x] Slow playback speed toggle ($0.75\text{x}$) with audio pitch preservation.
- [x] Interactive IPA phonetic syllable segmentation with stress marker visual tags.
- [x] Audio chimes for exact match, close match, and retry states.
- [x] Gamified $+10\text{ XP}$ reward for passing scores with daily $500\text{ XP}$ cap enforcement and Daily Streak qualification.
- [x] Comprehensive permission denial and unsupported browser handling with actionable instructions.

### Should-Have (P1 — Enhancements)

- [ ] Keyboard shortcuts (`Space` to record, `R` to replay audio, `S` to toggle 0.75x speed).
- [ ] Sound effects mute toggle in user profile audio settings.
- [ ] Multi-word sentence pronunciation word-by-word highlight badge breakdown.

### Could-Have (P2 — Future Iterations)

- [ ] Pitch contour / intonation wave comparison curve against native speaker reference.
- [ ] Offline WebAssembly phonetic aligner (e.g. lightweight Phonemizer) for offline PWA mode.
- [ ] Pronunciation challenge mini-game mode in Practice Quizzes.

### Won't-Have (Explicitly Out of Scope for EPIC-08)

- ❌ **Server-Side Audio Recording Storage**: No saving of `.wav`/`.mp3` voice recordings on backend S3/R2 storage (zero server audio footprint by design).
- ❌ **Paid Third-Party Speech Cloud APIs**: No integration with paid SaaS APIs (Google Cloud Speech, Azure Speech, Whisper API).
- ❌ **Non-English Language Models**: Initial release strictly focuses on English vocabulary acquisition (`en-US` and `en-GB`).
- ❌ **Hardware Pitch Sensors / Specialized Microphones**: Standard consumer laptop/mobile built-in microphones only.
