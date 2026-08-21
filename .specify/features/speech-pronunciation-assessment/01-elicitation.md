# Elicitation: Speech Recognition & Pronunciation Assessment (EPIC-08)

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Stories**: US-VOICE-01 (Voice Recognition & Pronunciation Scoring) & US-VOICE-02 (Native Audio Playback & Pronunciation Guide)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## Stage 1 — Business Value

### 1. Problem & Pain Point

Learners memorizing vocabulary often develop silent reading mastery but suffer from "speech anxiety" and inaccurate spoken pronunciation because:

1. They lack real-time feedback on whether their spoken pronunciation matches standard phonetic norms (General American / British RP).
2. Existing flashcards only offer passive one-way audio playback without interactive speech-to-text evaluation or phoneme-level guidance.
3. Fast native audio recordings can be difficult to parse phonetically for beginners without slow playback (0.75x) and syllable-by-syllable International Phonetic Alphabet (IPA) visualization.

### 2. Target Personas

- **Persona 1: Dung (IELTS / Speaking Candidate)**: Needs precise phoneme-level feedback on difficult syllables, word stress, and pronunciation accuracy to gain speaking fluency.
- **Persona 2: Thao (Beginner Learner)**: Intimidated by fast native speech; needs slow (0.75x) dual-accent playback (US vs UK) and forgiving, encouraging pronunciation scoring (Close match tolerance).
- **Persona 3: Minh (Commuter / Active Reviewer)**: Practices short bursts of spoken recall in study decks and wants gamified rewards (+10 XP per accurate pronunciation) counting toward daily streak goals.
- **Persona 4: Guest / Explorer**: Tries the pronunciation check on a sample card without registration before signing up.

### 3. Success Metrics

- **Primary Retention Metric**: $+22\%$ increase in 14-day user study habit retention among learners who engage in $\ge 3$ pronunciation checks per week.
- **Engagement Metric**: Average of $\ge 4.5$ voice attempts per daily study session.
- **Operational / Performance Metric**: P95 client-side transcription and similarity scoring latency $< 350\text{ms}$ after speech completion.
- **Resilience Metric**: $100\%$ graceful fallback for browsers without Web Speech Recognition API (providing clear instructions and TTS alternatives without application crashes).

---

## Pillar 1 — Personas, Actors & RBAC

- **Guest / Unauthenticated User**:
  - Can play native audio (US/UK) and toggle 0.75x slow speed on public preview cards.
  - Can test microphone and perform up to 3 guest pronunciation checks per session (stored in ephemeral React state/sessionStorage).
  - Cannot persist practice attempt history or claim XP / streak progress until signed in.
- **Authenticated Learner**:
  - Full access to microphone pronunciation check on all deck cards and practice modes.
  - Receives real-time soundwave visualization, transcription, scoring breakdown, and audio chime feedback.
  - Earns $+10\text{ XP}$ per perfect/close pronunciation attempt (capped at $500\text{ XP/day}$ to prevent gaming).
  - Pronunciation practice counts as daily study activity toward streak maintenance.
- **System Admin / Observability**:
  - Access to aggregated telemetry on voice recognition error rates (e.g. `not-allowed`, `no-speech`, `network`) and CDN audio playback health.

---

## Pillar 2 — State Machine & Lifecycle

### 1. Microphone Permission Lifecycle

- `UNPROMPTED`: Initial state before user has engaged with voice features.
- `REQUESTING`: Browser permission dialog active (`navigator.mediaDevices.getUserMedia` or `SpeechRecognition.start()`).
- `GRANTED`: Mic access allowed; audio stream initialized.
- `DENIED`: User blocked microphone permission; actionable UI banner rendered with browser unblock steps.
- `UNAVAILABLE`: Device has no microphone hardware or browser context is non-HTTPS.

### 2. Voice Practice Session & Assessment Lifecycle

- `IDLE`: Mic button visible with idle pulse animation; ready for user tap or hold.
- `INITIALIZING`: Audio context and speech recognition engine spinning up ($<100\text{ms}$).
- `LISTENING_RECORDING`: Real-time audio waveform active via Web Audio `AnalyserNode`; speech recognition streaming partial/interim transcripts.
- `EVALUATING`: Speech recognition ended; Levenshtein distance & phonetic string comparison algorithm calculates score ($<50\text{ms}$).
- `RESULT_DISPLAY`: Score card displayed with visual color coding:
  - `EXACT_MATCH` ($100\%$ score $\rightarrow$ Green badge, $+10\text{ XP}$, success chime).
  - `CLOSE_MATCH` ($80\% - 99\%$ score $\rightarrow$ Violet badge, $+10\text{ XP}$, encouraging chime, highlighted discrepancies).
  - `NEEDS_RETRY` ($<80\%$ score $\rightarrow$ Amber badge, $0\text{ XP}$, retry affordance, syllable breakdown).
- `TIMEOUT_SILENCE`: No speech detected within $2.5\text{s}$ or max recording duration $8.0\text{s}$ reached $\rightarrow$ auto-stops and guides user.

### 3. Native Reference Audio Playback Lifecycle

- `IDLE`: Play button ready with accent badge (US / UK).
- `LOADING`: Fetching CDN audio file.
- `PLAYING`: Playing HTML5 Audio element at selected rate ($1.0\text{x}$ or $0.75\text{x}$) with animated sound bars.
- `FALLBACK_TTS`: If CDN audio URL returns 404 or network fails, automatically falls back to `window.speechSynthesis` with matching BCP 47 locale (`en-US` or `en-GB`).
- `FINISHED`: Audio playback completed; resets to IDLE.

---

## Pillar 3 — Business Rules & Algorithms

- **Q1: Speech Recognition Engine & Fallback Architecture**
  - **Decision**: Use standard browser Web Speech Recognition API (`webkitSpeechRecognition` / `SpeechRecognition`) with explicit locale set to `en-US` or `en-GB`. When unsupported (e.g. Firefox desktop without flag enabled), gracefully disable the mic record button, show a friendly explanation banner ("Speech recognition is best supported in Chrome, Edge, and Safari"), and ensure Native Audio & Syllable IPA breakdown remain $100\%$ functional.
- **Q2: Similarity Scoring & Phonetic Matching Algorithm**
  - **Decision**: Hybrid Normalized Levenshtein Similarity + Cleaned Phonetic Token Matching:
    $$\text{TextSimilarity}(T_{target}, T_{spoken}) = \left( 1 - \frac{\text{Levenshtein}(T_{target}, T_{spoken})}{\max(|T_{target}|, |T_{spoken}|)} \right) \times 100\%$$
    - Target string cleaned of punctuation, normalized to lowercase, trimmed.
    - Number words and common homophones normalized (e.g. "one" $\leftrightarrow$ "1", "to" $\leftrightarrow$ "two" $\leftrightarrow$ "too" when context allows).
    - Thresholds:
      - Score $= 100\%$: Perfect / Exact match.
      - $80\% \le \text{Score} < 100\%$: Close match (Passes check, awards XP, highlights missed letters).
      - $\text{Score} < 80\%$: Needs Retry (Encouraging feedback, awards 0 XP).
- **Q3: Gamification & Anti-Abuse Rules**
  - **Decision**:
    - $+10\text{ XP}$ awarded once per unique vocabulary card per study session upon achieving $\ge 80\%$ score.
    - Daily Cap: Maximum $500\text{ XP}$ per calendar day from voice practice attempts.
    - Client-side debounce: Minimum $1.5\text{s}$ cooldown between successive voice check submissions.
    - Completing $\ge 1$ successful pronunciation check qualifies as daily study activity, advancing the user's Daily Streak.
- **Q4: Dual Accent Audio & Slow Playback**
  - **Decision**:
    - Each vocabulary card supports US (`en-US`) and UK (`en-GB`) audio source URLs from curated CDN dictionary endpoints.
    - Users can toggle between US and UK accent tabs.
    - Users can toggle between Normal Speed ($1.0\text{x}$) and Slow Speed ($0.75\text{x}$). Pitch preservation (`preservesPitch = true`) is strictly enabled on the HTML5 `Audio` element to avoid unnatural pitch distortion.
    - Syllable Segmentation: Interactive syllable chips rendered with IPA stress markers (e.g. `[ˈkɑːm.pəs]`), tapping a syllable plays that isolated syllable via synthesis or highlights its phonetic stress.

---

## Pillar 4 — Workflows & Edge Cases

- **Workflow 1: Happy Path Voice Check**:
  1. User views card with word "Eloquent" `/ˈel.ə.kwənt/`.
  2. User taps "Listen (US)" $\rightarrow$ hears pristine native audio.
  3. User taps/holds Microphone CTA $\rightarrow$ audio visualizer animates with sound waves.
  4. User speaks "Eloquent" into microphone.
  5. Web Speech API returns transcript "eloquent".
  6. Scoring engine evaluates $100\%$ match $\rightarrow$ green card glow, success chime, $+10\text{ XP}$ notification, streak active.
- **Edge Case 1: Microphone Permission Denied / Blocked**:
  - Browser triggers `not-allowed` error event.
  - UI immediately switches from listening state to an informational inline card explaining: "Microphone access was blocked. Please enable microphone permissions in your browser settings to practice pronunciation." Includes an instant "Test Permission Again" button.
- **Edge Case 2: Insecure Context (HTTP without SSL)**:
  - `navigator.mediaDevices` and `SpeechRecognition` are restricted in insecure contexts.
  - App checks `window.isSecureContext`; if false in production, shows secure HTTPS advisory.
- **Edge Case 3: Silent Recording / Background Noise Timeout**:
  - If user presses mic but remains silent, speech recognition triggers `no-speech` after $2.5\text{s}$ or max $8.0\text{s}$.
  - System aborts gracefully with message: "We couldn't hear you clearly. Please try speaking closer to your microphone." No penalty, no error crash.
- **Edge Case 4: No Network / Speech API Service Offline**:
  - If browser speech cloud service is unreachable (`network` error in WebSpeech API), display message: "Speech recognition service momentarily unreachable. Check your internet connection or try again."
- **Edge Case 5: Missing CDN Audio URL**:
  - If card `audioUrl` is missing or returns 404, player automatically falls back to `window.speechSynthesis` with matching voice locale and rate, ensuring audio playback never fails for the learner.

---

## Pillar 5 — Entities, Data Boundaries & Privacy

- **Zero Voice Audio Storage (Privacy by Design)**:
  - Audio streams from the microphone are processed locally in real-time by the browser's Web Audio API and Web Speech API.
  - **No raw voice recordings, audio buffers, or audio files are transmitted or stored on WordStreak servers.**
  - Only anonymous assessment telemetry (card ID, target word, recognized text, similarity score $\%$, timestamp) is sent in the XP claim payload.
- **Entity Sketch**:
  - `VoicePracticeAttempt` (Client Telemetry / Optional Sync):
    - `id`: UUID
    - `userId`: UUID (FK)
    - `cardId`: UUID (FK)
    - `targetWord`: String
    - `recognizedText`: String
    - `accuracyScore`: Int (0 - 100)
    - `isPassed`: Boolean (accuracyScore >= 80)
    - `xpAwarded`: Int (0 or 10)
    - `createdAt`: DateTime
  - `UserDailyVoiceProgress`:
    - `userId`: UUID (FK)
    - `date`: String (YYYY-MM-DD in user timezone)
    - `attemptsCount`: Int
    - `passedCount`: Int
    - `totalXpEarned`: Int (capped at 500)

---

## Pillar 6 — UX & Non-Functional Requirements

- **Design System Tokens (`apps/web/DESIGN.md` & `apps/web/MEMORY.md`)**:
  - Canvas: Pure white (`#ffffff`).
  - Borders: Clean hairline (`#e5e5e5` / `#d4d4d4`).
  - Primary CTA: Obsidian black pill (`#000000`, `rounded-full`, white text).
  - Accent / Flame: Electric Violet / Purple Flame (`#8B5CF6`, `#9333ea`, `#c084fc`).
  - Feedback Badges: Emerald Green (`#10B981` / `#ECFDF5`) for Exact Match; Royal Violet (`#8B5CF6` / `#F5F3FF`) for Close Match; Warm Amber (`#F59E0B` / `#FFFBEB`) for Needs Retry.
  - Typography: `Nunito` for display headings, `Inter` for body & controls, `JetBrains Mono` for IPA transcriptions and syllable chips.
  - Zero-AI-slop: No generic robot vectors, no neon gradients; clean, refined audio wave bar visualizer with dynamic height matching mic input volume.
- **Performance**:
  - Audio Analyser sampling loop capped at 60 FPS via `requestAnimationFrame`.
  - Client-side transcription matching execution time $< 20\text{ms}$.
  - Overall assessment response $< 350\text{ms}$ after user finishes speaking.
- **Accessibility (WCAG 2.1 AA)**:
  - Voice recording button includes `aria-label="Practice speaking [word]"` and `aria-pressed` dynamic state.
  - Audio visualizer has `aria-hidden="true"`; assessment results announced via ARIA live region (`aria-live="polite"`).
  - Full keyboard accessibility: Spacebar or Enter to start/stop voice recording; keyboard shortcut `R` to replay native audio, `S` to toggle slow speed.
- **i18n**: UI localized in English and Vietnamese; speech recognition locale matches target card learning language (`en-US` default, `en-GB` toggle).

---

## Assumptions Confirmed

- `ASM-VOICE-001`: Client browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) serves as the primary real-time speech-to-text engine, requiring zero paid external STT API keys for the core application.
- `ASM-VOICE-002`: No raw microphone audio is transmitted to or stored on backend servers; audio processing is strictly local and ephemeral.
- `ASM-VOICE-003`: Similarity scoring uses normalized Levenshtein distance combined with token matching, where $\ge 80\%$ is classified as a passing attempt.
- `ASM-VOICE-004`: Passing a pronunciation check ($\ge 80\%$) awards $+10\text{ XP}$, limited to once per card per session and capped at $500\text{ XP/day}$.
- `ASM-VOICE-005`: Completing $\ge 1$ successful pronunciation check satisfies the daily study activity requirement for streak increment.
- `ASM-VOICE-006`: Dual-accent support provides both US (`en-US`) and UK (`en-GB`) pronunciation models and native audio references.
- `ASM-VOICE-007`: Slow speed toggle plays native reference audio at $0.75\text{x}$ playback rate with pitch preservation enabled.
- `ASM-VOICE-008`: If CDN audio is unavailable, `window.speechSynthesis` is used as an automatic zero-config fallback.
- `ASM-VOICE-009`: Unsupported browsers (e.g. standard Firefox desktop) receive a non-blocking informational state while retaining native audio and IPA breakdown.
- `ASM-VOICE-010`: All UI components strictly adhere to WordStreak design tokens (pure white canvas, 1px `#e5e5e5` borders, obsidian black pill buttons, electric violet accents, and `JetBrains Mono` IPA typography).

---

## Open Questions (Non-blocking)

- None. All 6 pillars, business rules, and technical boundary decisions have been fully specified and confirmed.
