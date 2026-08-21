# Gap Analysis: Speech Recognition & Pronunciation Assessment (EPIC-08)

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## 1. AS-IS vs. TO-BE State Comparison

| Dimension                              | AS-IS (Current State)                                                       | TO-BE (Target State - EPIC-08)                                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Audio Interaction Mode**             | Passive 1-way playback of generic audioUrl (if present) during card review. | Interactive 2-way speech loop: Listen native audio $\leftrightarrow$ Speak target vocabulary aloud $\rightarrow$ Immediate visual & accuracy score feedback.                                                   |
| **Speech Recognition & STT**           | None. No microphone access, voice capture, or speech-to-text transcription. | Real-time Web Speech API integration (`SpeechRecognition`) with zero external API key dependencies and live acoustic soundwave visualization.                                                                  |
| **Pronunciation Assessment & Grading** | None. User cannot know if their pronunciation is correct.                   | Automated phonetic & string similarity engine (Levenshtein + token matching) classifying attempts into Exact Match (100%), Close Match (80–99%), or Needs Retry (<80%).                                        |
| **Accent Support**                     | Single static audio file or unconfigured browser speech synthesis default.  | Dual-accent toggle: General American (US) and British RP (UK) with dedicated CDN audio streams and matching WebSpeech synthesis/recognition locales (`en-US`, `en-GB`).                                        |
| **Playback Speed Control**             | Fixed 1.0x playback speed only.                                             | 1.0x Normal and 0.75x Slow speed toggle with native HTML5 pitch preservation (`preservesPitch = true`) to prevent audio distortion.                                                                            |
| **Phonetic & Syllable Guidance**       | Static text string for IPA (e.g. `/ˈelɪkwənt/`) without interaction.        | Interactive syllable chips with phonetic stress markers, visual highlighting during playback, and clickable pronunciation breakdown.                                                                           |
| **Gamification Integration**           | Reviews only reward SM-2 recall rating clicks.                              | Pronunciation practice awards $+10\text{ XP}$ per passing card (capped at $500\text{ XP/day}$), provides cheerful auditory chime feedback, and qualifies as daily study activity for Daily Streak maintenance. |
| **Browser Compatibility & Fallbacks**  | Basic HTML5 audio tags with silent failures if audio URL is broken.         | Intelligent fallback chain: CDN Audio $\rightarrow$ High-Fidelity Web Speech Synthesis $\rightarrow$ Visual syllable breakdown; graceful unsupported browser banners with clear instructions.                  |

---

## 2. Detailed Gap Identification

### 2.1 Functional Gaps (GAP-FUNC)

- **GAP-FUNC-01 (Voice Capture & Audio Visualizer)**: No client-side audio streaming mechanism. Needs Web Audio API `AudioContext` and `AnalyserNode` connected to microphone stream to compute real-time frequency/volume data (60 FPS) for soundwave rendering.
- **GAP-FUNC-02 (Speech-to-Text Recognition)**: No interface to browser speech recognition. Needs a robust React hook (`useSpeechRecognition`) wrapping `webkitSpeechRecognition` and `SpeechRecognition` with start, stop, abort, and error lifecycle handlers.
- **GAP-FUNC-03 (Phonetic & Text Similarity Scoring)**: No scoring algorithm. Needs client-side normalized Levenshtein distance calculation, homophone normalization, and letter-level difference highlighting.
- **GAP-FUNC-04 (Dual Accent & Slow Speed Playback Player)**: Existing audio player lacks speed rate switching and accent selection. Needs a dedicated `AudioPronunciationPlayer` component supporting US/UK tracks, $0.75\text{x}$ rate, and pitch preservation.
- **GAP-FUNC-05 (Interactive IPA Syllable Segmenter)**: Static IPA display does not segment words into clickable syllables. Needs an algorithmic syllable tokenizer splitting IPA strings by stress markers (`ˈ`, `ˌ`) and syllable dots (`.`).

### 2.2 Data & Schema Gaps (GAP-DATA)

- **GAP-DATA-01 (Card Dual-Audio URLs)**: Cards currently store a single `audioUrl`. Needs support for dual accent URLs (`audioUrlUS`, `audioUrlUK`) or structured metadata with fallback to synthesized speech.
- **GAP-DATA-02 (Voice Practice Telemetry & Daily XP Tracking)**: Backend has no schema tracking voice attempts or daily voice XP quotas. Needs `VoicePracticeAttempt` and `UserDailyVoiceProgress` Prisma models to enforce the $500\text{ XP/day}$ anti-abuse cap.

### 2.3 User Impact & Experience Gaps (GAP-UX)

- **GAP-UX-01 (Speech Anxiety & Passive Rut)**: Learners feel anxious speaking English without a safe, private evaluation environment. TO-BE provides an encouraging, gamified, private self-practice environment.
- **GAP-UX-02 (Permission Friction)**: Browser microphone prompts often startle users if unprompted. TO-BE introduces a polite educational pre-permission card before triggering native browser prompts.
- **GAP-UX-03 (Auditory & Haptic Feedback)**: Current UI has no audio feedback sounds. TO-BE adds lightweight, delightful audio chimes for exact match, close match, and retry states (with mute setting).

### 2.4 Architecture & Transition Gaps (GAP-ARCH)

- **GAP-ARCH-01 (Web Speech API Browser Variance)**: Chrome and Edge support Web Speech natively; Safari on iOS/macOS has partial support; Firefox desktop requires manual configuration flags. TO-BE delivers zero-crash feature detection with clear, non-blocking UI states.
- **GAP-ARCH-02 (Zero Server Audio Pipeline)**: Ensures no audio payload is sent across the network, eliminating high server storage costs, privacy concerns, and latency bottlenecks.

---

## 3. Transition & Implementation Strategy

1. **Phase A: Core Audio Playback & Phonetic Syllables (US-VOICE-02)**
   - Implement `AudioPronunciationPlayer` with dual-accent tabs (US/UK), 0.75x slow speed toggle, pitch preservation, and Web Speech Synthesis fallback.
   - Implement `IpaSyllableBreakdown` component to parse and highlight syllables.
2. **Phase B: Microphone Capture, Visualizer & STT Engine (US-VOICE-01)**
   - Implement `useMicrophoneStream` and `useSpeechRecognition` hooks.
   - Build `VoiceSoundwaveVisualizer` canvas/CSS component showing live volume reactivity.
   - Build client-side `calculatePronunciationScore` with Levenshtein difference highlighting.
3. **Phase C: Gamification, Anti-Abuse & Backend Sync**
   - Implement API endpoint `POST /api/v1/voice/record-attempt` with daily XP quota validation.
   - Connect voice check success to daily streak qualification and XP celebration toasts.
4. **Phase D: Polish, Accessibility & Browser Compatibility**
   - Conduct cross-browser testing (Chrome, Safari, Edge, Firefox), verify WCAG 2.1 AA keyboard/screen reader compliance, and finalize fallback messaging.
