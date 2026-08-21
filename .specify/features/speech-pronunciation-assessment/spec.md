# Feature Specification: Speech Recognition & Pronunciation Assessment

**Feature Branch**: `feat/speech-pronunciation-assessment`  
**Feature Slug**: `speech-pronunciation-assessment`  
**Epic**: EPIC-08 (Speech Recognition & Pronunciation Assessment)  
**Created**: 2026-08-21  
**Status**: Approved (Gate 1 Signed-off Baseline)  
**Target Stories**: US-VOICE-01 (Voice Recognition & Pronunciation Assessment) & US-VOICE-02 (Native Reference Audio & Pronunciation Guide)

---

## 1. Executive Summary & Problem Statement

Traditional digital vocabulary tools restrict learners to silent reading and passive listening. When attempting to speak English in real-world conversations, interviews, and language proficiency exams (such as IELTS or TOEFL), learners suffer from lack of immediate phonemic feedback, awkward syllable cadence, and uncertainty regarding word stress.

The **Speech Recognition & Pronunciation Assessment** feature embeds a zero-friction, client-side oral practice studio into WordStreak. It enables learners to:

1. Speak vocabulary aloud into their microphone and observe real-time volume soundwave visualizations (`AnalyserNode`).
2. Receive instant Levenshtein and character similarity feedback classified into Exact (100%), Close (80–99%), and Retry (<80%) tiers.
3. Earn $+10\text{ XP}$ per passed card toward daily goals and daily streak preservation (protected by a $500\text{ XP/day}$ cap and 1500ms cooldown).
4. Listen to dual-accent native audio references (General American `en-US` and British RP `en-GB`).
5. Slow down audio to 0.75x speed with pitch preservation (`preservesPitch = true`).
6. Fall back seamlessly to browser Web Speech Synthesis if audio tracks are unavailable.
7. Inspect and play interactive IPA syllable segments with primary (`ˈ`) and secondary (`ˌ`) stress badges.

---

## 2. User Scenarios & Acceptance Criteria _(Prioritized)_

### User Story 1 (US-VOICE-01) - Voice Recognition & Pronunciation Assessment (Priority: P1)

As a language learner practicing vocabulary in WordStreak,  
I want to speak target words aloud into my microphone and receive immediate accuracy scoring, character difference breakdowns, and gamified XP rewards,  
So that I can refine my spoken English pronunciation and maintain my daily study streak through active vocal recall.

**Why this priority**: Core value driver of the voice feature. Bridges passive flashcard reading to active vocal reproduction.

**Independent Test**: Can be verified by clicking the mic CTA on any card, speaking the word into the browser, observing the soundwave volume meter, receiving the accuracy score tier, and verifying XP/streak updates.

**Acceptance Scenarios**:

1. **Scenario 1.1 (Microphone Permission Pre-Prompt & Initialization)**:
   - **Given** an unprompted microphone state,
   - **When** the user clicks "Practice Speaking",
   - **Then** a friendly pre-permission banner explains mic usage, and granting browser permission transitions the engine to `LISTENING` with Web Speech Recognition initialized in the active accent locale (`en-US` / `en-GB`).
2. **Scenario 1.2 (Live Soundwave Visualization & Interim Streaming)**:
   - **Given** the microphone is active in `LISTENING` state,
   - **When** the user speaks into the microphone,
   - **Then** the `AnalyserNode` frequency volume meter renders 5–7 animated soundwave bars at 60 FPS reflecting vocal energy, and live interim speech transcripts display below the mic CTA.
3. **Scenario 1.3 (Exact Pronunciation Match Scoring - 100%)**:
   - **Given** the target word is `"eloquent"` and the user speaks `"eloquent"`,
   - **When** speech ends,
   - **Then** the scoring engine calculates $100\%$ similarity, displays an Emerald Green badge (`#10B981`), plays a success chime, awards $+10\text{ XP}$, and increments daily streak activity.
4. **Scenario 1.4 (Close Pronunciation Match Scoring - 80% to 99%)**:
   - **Given** the target word is `"preliminary"` and the user speaks `"preliminry"`,
   - **When** speech evaluation finishes,
   - **Then** the engine calculates $\approx 91\%$ similarity, displays a Royal Violet badge (`#8B5CF6`), renders a character-level diff highlighting the missing `"a"`, plays an encouraging chime, and awards $+10\text{ XP}$.
5. **Scenario 1.5 (Needs Retry Scoring - <80%)**:
   - **Given** the target word is `"epitome"` and the user speaks `"ep-tomb"`,
   - **When** speech finishes,
   - **Then** the engine calculates $<80\%$ similarity, displays a Warm Amber badge (`#F59E0B`), plays a neutral retry tone, awards $0\text{ XP}$, and offers an instant "Try Again" CTA along with 0.75x slow audio playback suggestions.
6. **Scenario 1.6 (Anti-Abuse Cap & Cooldown Enforcement)**:
   - **Given** an authenticated user has earned $500\text{ XP}$ from voice checks today,
   - **When** they achieve another $\ge 80\%$ score on a new card,
   - **Then** the feedback tier is displayed normally and streak activity is credited, but `xpAwarded` returns $0$ with `isDailyCapped: true`.
7. **Scenario 1.7 (Silence and Maximum Duration Watchdogs)**:
   - **Given** the mic is active,
   - **When** no voice input is detected for $2500\text{ms}$ or duration exceeds $8000\text{ms}$,
   - **Then** the recording session terminates automatically and releases all audio tracks.

---

### User Story 2 (US-VOICE-02) - Native Audio Playback & Pronunciation Guide (Priority: P2)

As a language learner studying new vocabulary,  
I want to listen to authentic dual-accent (US / UK) native audio, slow down audio to 0.75x speed with preserved vocal pitch, and click interactive IPA syllables,  
So that I can clearly understand phonemic differences, word stress, and natural cadence before speaking.

**Why this priority**: Provides the essential auditory baseline required for effective vocal mimicry and pronunciation practice.

**Independent Test**: Can be tested by loading any card, toggling between US and UK accent tabs, clicking slow speed (0.75x), and verifying that audio plays smoothly with intact vocal pitch and syllable stress highlights.

**Acceptance Scenarios**:

1. **Scenario 2.1 (Dual Accent Audio Selection - US vs UK)**:
   - **Given** a vocabulary card with both `audioUrlUS` and `audioUrlUK`,
   - **When** the user switches the accent selector tab between "US" and "UK",
   - **Then** the active track immediately switches and clicking Play streams the selected accent audio.
2. **Scenario 2.2 (0.75x Slow Playback with Pitch Preservation)**:
   - **Given** the audio player is loaded,
   - **When** the user activates the "0.75x" speed toggle,
   - **Then** the audio plays at $0.75\times$ speed with `preservesPitch = true`, preventing deep unnatural bass distortion.
3. **Scenario 2.3 (Transparent Web Speech Synthesis Fallback)**:
   - **Given** a card whose CDN audio URL is null or returns HTTP 404,
   - **When** the user clicks Play,
   - **Then** the system transparently synthesizes the target word using `window.speechSynthesis` matching the selected locale (`en-US` or `en-GB`) without displaying error toasts.
4. **Scenario 2.4 (Interactive IPA Syllable Segmentation & Stress Badges)**:
   - **Given** a card with phonetic string `"/ˈel.ɪ.kwənt/"`,
   - **When** the pronunciation breakdown is displayed,
   - **Then** the phonetic string is split into 3 clickable syllable chips (`el`, `ɪ`, `kwənt`), the primary stress syllable (`el`) is highlighted with a bold violet border, and tapping any syllable chip pronounces that isolated segment.

---

## 3. Edge Cases & Resilience Strategy

1. **Unsupported Browser (e.g. Standard Desktop Firefox)**:
   - Web Speech Recognition is unavailable. The UI gracefully disables the microphone trigger, renders an advisory note ("Voice recognition is optimized for Chrome, Edge, and Safari"), and keeps audio playback, 0.75x speed, and IPA syllable guide $100\%$ operational.
2. **Microphone Permission Denied (`NotAllowedError`)**:
   - The UI replaces the mic CTA with an inline troubleshooting banner displaying browser-specific unblock instructions (Chrome lock icon, Safari site settings, Edge permissions) and a "Retry Permission" button.
3. **Ambient Noise & Accidental Utterances**:
   - Normalized character scoring tolerance ($\ge 80\%$) accommodates background noise and minor transcript variations.
4. **Insecure HTTP Context**:
   - In non-HTTPS environments (except `localhost`), microphone access is blocked by browsers. The system warns the user of the security requirement before attempting `getUserMedia`.
5. **Rapid Double-Clicking / Spam**:
   - Submissions are debounced on the client (disabled during `PROCESSING`) and rejected on the backend if submitted $<1500\text{ms}$ apart.
6. **Zero Server Audio Retention**:
   - No audio stream or buffer is ever transmitted over network sockets or HTTP POST requests.

---

## 4. Requirements Specification

### 4.1 Functional Requirements

- **FR-001**: System MUST initialize Web Speech Recognition (`window.SpeechRecognition` or `window.webkitSpeechRecognition`) with `continuous = false`, `interimResults = true`, and locale matching the selected card accent (`en-US` or `en-GB`).
- **FR-002**: System MUST sample microphone input at 60 FPS using Web Audio `AnalyserNode` and render a 5–7 bar dynamic acoustic soundwave meter.
- **FR-003**: System MUST compute normalized Levenshtein and character similarity distance between target text and spoken transcript, stripping punctuation and case.
- **FR-004**: System MUST classify pronunciation scores into Exact (100%), Close (80–99%), and Needs Retry (<80%) tiers with visual badge styling and auditory chimes.
- **FR-005**: System MUST award $+10\text{ XP}$ to authenticated learners on passing scores ($\ge 80\%$), capped at $500\text{ XP/day}$ with a $1500\text{ms}$ cooldown.
- **FR-006**: System MUST record daily streak activity when at least one voice pronunciation check passes.
- **FR-007**: System MUST provide dual-accent native audio selection for General American (`en-US`) and British RP (`en-GB`).
- **FR-008**: System MUST support 0.75x slow audio playback speed with `preservesPitch = true`.
- **FR-009**: System MUST fall back seamlessly to `window.speechSynthesis` with matching locale voices if CDN audio files are missing or return errors.
- **FR-010**: System MUST parse IPA phonetic strings into clickable syllable chips with stress marker badges (`ˈ` primary, `ˌ` secondary).
- **FR-011**: System MUST enforce a $2500\text{ms}$ silence watchdog and an $8000\text{ms}$ max utterance watchdog.
- **FR-012**: System MUST provide inline microphone permission unblock guidance when access is denied.

### 4.2 Key Entities & Data Contracts

- **VoicePracticeAttempt**:
  - `id`: string (UUID)
  - `userId`: string (UUID)
  - `cardId`: string (UUID)
  - `targetWord`: string
  - `recognizedText`: string
  - `accuracyScore`: number (0–100)
  - `isPassed`: boolean ($\ge 80\%$)
  - `xpAwarded`: number (0 or 10)
  - `accentUsed`: `"en-US"` | `"en-GB"`
  - `createdAt`: DateTime
- **VoicePracticeSubmissionDto**:
  - `cardId`: string (UUID)
  - `targetWord`: string
  - `spokenTranscript`: string
  - `accuracyScore`: number (0–100)
  - `accent`: `"en-US"` | `"en-GB"`
  - `timeSpentMs`: number
- **VoicePracticeResultDto**:
  - `isPassed`: boolean
  - `accuracyScore`: number
  - `tier`: `"EXACT"` | `"CLOSE"` | `"RETRY"`
  - `xpAwarded`: number
  - `isDailyCapped`: boolean
  - `diffSpans`: `DiffSpan[]`
  - `streakAdvanced`: boolean

---

## 5. Success Criteria & Non-Functional Requirements

### 5.1 Measurable Outcomes

- **SC-001**: Learners receive pronunciation grading within $100\text{ms}$ of speech completion.
- **SC-002**: Audio visualizer operates at stable 60 FPS using $<2\%$ CPU on mid-tier mobile and desktop devices.
- **SC-003**: 100% of audio stream buffers are purged immediately from browser memory upon recording termination with zero audio bytes transmitted to backend servers.
- **SC-004**: Authenticated voice submissions update XP and streak state with P95 latency $<150\text{ms}$.
- **SC-005**: All UI controls pass WCAG 2.1 AA accessibility guidelines with minimum $40\times40\text{px}$ touch targets and keyboard navigation (`Space`, `R`, `S`).

### 5.2 Non-Functional Requirements

- **NFR-PERF-01**: Audio sampling loop runs strictly via `requestAnimationFrame` with zero memory leaks.
- **NFR-A11Y-01**: Complete keyboard navigation support (`Space` to record, `R` to replay native audio, `S` to toggle slow speed).
- **NFR-SEC-01**: Mandatory HTTPS origin verification. Zero external telemetry leaks of voice data.

---

## 6. Assumptions & Scope Boundaries

- **Assumption 1**: Client devices have a functioning microphone and standard browser Web APIs.
- **Assumption 2**: Audio files for US and UK accents are hosted on high-availability CDNs or generated via speech synthesis.
- **Assumption 3**: English vocabulary only (`en-US` and `en-GB`).
- **Out of Scope**: Server-side raw audio storage, third-party paid speech APIs (OpenAI Whisper / Google Speech-to-Text), real-time acoustic pitch frequency comparison graphs.
