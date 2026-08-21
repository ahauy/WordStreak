# Elicitation: Listening & Typing Practice Quiz (US-QUIZ-03)

- **Feature**: Listening & Typing Practice Mode (`quiz-listening-practice`)
- **Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)
- **Date**: 2026-08-21
- **Status**: COMPLETE

---

## Stage 1 — Business Value

- **Problem & Pain Point**: Learners often struggle to connect spoken English with accurate written orthography. Traditional multiple-choice quizzes test passive recognition, while listening practice without typing fails to develop muscular active spelling recall. Learners need an immersive ear-training drill that plays native pronunciations, lets them toggle between normal (1.0x) and slow (0.75x) speeds, type the target word, request progressive hints when stuck, and have guaranteed audio playback via browser Web Speech API TTS if card audio is missing or failing.
- **Target Personas**:
  - **Persona A (Minh - Exam & Listening Prep)**: Wants to sharpen auditory comprehension and eliminate spelling errors for IELTS/TOEIC listening sections.
  - **Persona B (Sarah - Daily Commute / Fast Drill Learner)**: Listens with headphones, using keyboard hotkeys (`Space` to replay, `Shift+Space` to slow down, `Enter` to submit) for rapid 2-minute practice sessions.
  - **Persona C (Duc - Offline / Low-Bandwidth Learner)**: Studies on mobile in unstable network conditions; relies on seamless Web Speech API TTS synthesis when remote MP3 URLs cannot load.
- **Success Metrics**:
  - **Primary Product Metric**: $\ge 80\%$ quiz completion rate across listening sessions; $+20\%$ increase in spelling retention on subsequent SM-2 reviews.
  - **Operational / Performance Metric**: Audio playback initiation latency $< 150\text{ms}$; 100% audio availability via Web Speech API fallback cascade.

---

## Pillar 1 — Personas, Actors & RBAC

- **Learner Role**:
  - Can initiate and complete Listening Practice sessions on any owned deck or public deck.
  - Can submit completed session results for XP and streak accumulation.
- **Data Access & Privacy**:
  - Private deck audio & cards are strictly restricted to the deck owner.
  - Public decks allow all authenticated learners to generate listening quizzes.
- **Guest / Unauthenticated**:
  - Access to `/practice/listening` is protected; unauthenticated visitors are redirected to `/login` with return URL preservation.

---

## Pillar 2 — State Machine & Lifecycle

1. **Overall Session Lifecycle**:
   - `CONFIGURING` (User selects deck, question count 10/20/All, Zen timer mode) $\rightarrow$ `IN_PROGRESS` (Active question sequence) $\rightarrow$ `EVALUATING` $\rightarrow$ `FEEDBACK` $\rightarrow$ `COMPLETED` (Displays `QuizResultsView` recap) or `ABANDONED` (User exits to Deck/Dashboard).
2. **Per-Question State Machine**:
   - `AUDIO_LOADING` $\rightarrow$ `AUDIO_PLAYING` (1.0x or 0.75x) $\rightarrow$ `AWAITING_INPUT` $\rightarrow$ `ANSWER_SUBMITTED` $\rightarrow$ `FEEDBACK_CORRECT` (Emerald green glow, +XP, combo increment) or `FEEDBACK_INCORRECT` (Red shake, reveals correct word with diff) $\rightarrow$ `NEXT_QUESTION` (1.2s auto-delay or instant on `Enter`/`Space`).
3. **Audio Cascade Fallback State Machine**:
   - `CHECK_AUDIO_URL` $\rightarrow$ [If `audioUrl` exists] $\rightarrow$ `PLAY_REMOTE_AUDIO`.
   - If `audioUrl` is `null`/empty OR remote audio throws an error / times out after 3000ms $\rightarrow$ `FALLBACK_WEB_SPEECH_TTS` (uses `window.speechSynthesis` with `lang: 'en-US'`).
   - If browser does not support Web Speech API $\rightarrow$ `FALLBACK_VISUAL_PROMPT` (displays warning icon + meaning/IPA prompt).
4. **Progressive Hint State Machine**:
   - `HINT_LEVEL_0` (No hints used; eligible for speed bonus) $\rightarrow$ `HINT_LEVEL_1` (Reveals word character count dashes and first letter: `p _ _ _ _ _`) $\rightarrow$ `HINT_LEVEL_2` (Reveals Vietnamese definition / meaning) $\rightarrow$ `HINT_LEVEL_3` (Reveals phonetic IPA: `/ˌpɜː.sɪˈvɪə.rəns/`).

---

## Pillar 3 — Business Rules & Algorithms

- **Q1: Audio Source Cascade & Auto-play**:
  - Auto-play audio on question mount if permitted by browser autoplay policy. If autoplay is blocked by browser security (e.g. before initial user interaction), render a prominent "Click to Listen" Obsidian button.
  - Remote audio element uses `preload="auto"`.
  - Fallback to browser Web Speech API (`SpeechSynthesisUtterance`) with voice matching target language (`en-US` / `en-GB`).
- **Q2: Audio Speed Controls**:
  - Two discrete speed rates: `1.0x` (Normal) and `0.75x` (Slow articulation).
  - Toggling speed affects subsequent replays and current playback in real-time (`audio.playbackRate = 0.75` or `utterance.rate = 0.75`).
  - Speed toggle is accessible via UI button and keyboard shortcut (`Shift+Space` or `S`).
- **Q3: Text Normalization & Fuzzy Spelling Feedback**:
  - Submitted text is trimmed, lowercased, and stripped of extraneous whitespace and punctuation (e.g., `"  Apple ! "` $\rightarrow$ `"apple"`).
  - Target word is normalized identically.
  - Strict match required for correct status: $S_{norm} === T_{norm}$.
  - If incorrect, system computes character diff to highlight extra/missing/transposed characters for accelerated learning.
- **Q4: Progressive Hint Degradation**:
  - Level 1: Length dashes + 1st letter (`w _ _ _`).
  - Level 2: Meaning in Vietnamese (`"sự kiên trì"`).
  - Level 3: Phonetic IPA (`/ˌpɜː.sɪˈvɪə.rəns/`).
  - Requesting any hint forfeits the speed bonus for that question.
- **Q5: Gamification, XP & SM-2 Isolation**:
  - Base Reward: $+10\text{ XP}$ per correct word.
  - Speed/Accuracy Bonus: $+15\text{ XP}$ if answered in $\le 8000\text{ms}$ with 0 hints used and $\le 2$ audio replays.
  - Combo Multiplier: $x2$ for 3–4 consecutive correct, $x3$ for $5+$ consecutive correct.
  - Pure Practice Mode: Does **not** mutate SuperMemo-2 spaced repetition fields (`interval`, `easeFactor`, `nextReviewDate`).
- **Q6: Timer & Zen Mode**:
  - Default: 20 seconds countdown per question.
  - Zen Mode: Disables timer for stress-free auditory study.
  - Timer expiration triggers incorrect feedback and reveals the target word.

---

## Pillar 4 — Workflows & Edge Cases

- **Edge Case 1: Browser Autoplay Policy**:
  - Browsers often block unprompted audio playback until the user interacts with the page.
  - _Resolution_: The Setup Modal's "Start Listening Practice" button serves as the prerequisite user gesture. If the browser still rejects autoplay, the UI seamlessly displays a pulsing "Play Audio (`Space`)" button.
- **Edge Case 2: Slow/Broken Audio URL**:
  - Remote CDN MP3 link fails with 404, CORS error, or takes $> 3000\text{ms}$ to load.
  - _Resolution_: Audio controller immediately aborts network stream and invokes `window.speechSynthesis.speak(utterance)`. Learner experiences zero interruption.
- **Edge Case 3: Accents, Hyphens & Apostrophes in Target Words**:
  - Target words such as `"state-of-the-art"`, `"co-operate"`, or `"don't"`.
  - _Resolution_: Normalizer accepts both hyphenated and unhyphenated forms (`"state of the art"` $\leftrightarrow$ `"state-of-the-art"`) and standardizes typographic single quotes (`’` $\rightarrow$ `'`).
- **Edge Case 4: Rapid Double Submissions & Keyboard Spam**:
  - User hammers `Enter` repeatedly.
  - _Resolution_: Submissions are disabled once evaluating; subsequent `Enter` presses during the 1.2s feedback window act as an explicit "Skip to Next Question" trigger.

---

## Pillar 5 — Entities, Data Boundaries & Privacy

- **Entities**:
  - `Card`: Provides `id`, `word`, `phonetic`, `meaning`, `audioUrl`, `exampleSentence`. Read-only during quiz.
  - `Deck`: Provides `id`, `name`, `cardCount`.
  - `QuizSession` (Client-side): Holds `questions[]`, `currentIndex`, `answers[]`, `score`, `xpEarned`, `comboStreak`, `missedCards[]`.
  - `PracticeSubmissionDto`: Sent to `POST /api/v1/practice/submit-quiz` on session completion.
- **Data Retention & Privacy**:
  - Audio playback logs are strictly client-side.
  - No user audio recordings or microphone data are captured (this is a listening & typing mode; speech recognition is reserved for voice modes).

---

## Pillar 6 — UX & Non-Functional Requirements

- **Design System Alignment**:
  - Adheres strictly to `apps/web/DESIGN.md` and `apps/web/MEMORY.md`.
  - Canvas: Pure white `#ffffff`.
  - Action buttons: Obsidian black pills (`rounded-full`, `#000000`, text `#ffffff`).
  - Active audio waveform / speaker indicator: Royal violet (`#9333ea` / `#7e22ce`) pulse animation.
  - Typography: `Nunito` for headings, `Inter` for body/inputs, `JetBrains Mono` for phonetic/code.
- **Accessibility (WCAG 2.1 AA)**:
  - Full keyboard shortcuts: `Space` / `R` (Replay), `Shift+Space` / `S` (Toggle 0.75x speed), `Enter` (Submit/Next), `Ctrl+H` (Hint).
  - High contrast focus rings (`rgba(59,130,246,0.5)`).
  - ARIA live region (`aria-live="polite"`) announcing playback status and feedback.
- **Performance**:
  - Question generator API latency $< 100\text{ms}$ for decks up to 100 cards.
  - Client-side audio init latency $< 150\text{ms}$.

---

## Assumptions Confirmed

- `ASM-QUIZ-020`: Audio plays automatically when a question loads if permitted by browser autoplay policy; otherwise, a prominent play trigger is displayed.
- `ASM-QUIZ-021`: Audio playback supports two speed rates: `1.0x` (Normal) and `0.75x` (Slow/Clear articulation).
- `ASM-QUIZ-022`: Browser Web Speech API (`window.speechSynthesis`) acts as an immediate zero-latency fallback when `audioUrl` is missing or fails to load.
- `ASM-QUIZ-023`: Answer validation performs whitespace trimming, case-insensitivity, and punctuation normalization.
- `ASM-QUIZ-024`: Progressive hints include 3 tiers: (1) First letter + character slots, (2) Vietnamese meaning, (3) Phonetic IPA string.
- `ASM-QUIZ-025`: Listening Practice is an isolated drill awarding XP and streak progress without modifying SM-2 spaced repetition memory state.
- `ASM-QUIZ-026`: Full keyboard accessibility allows hands-free audio replay (`Space`/`R`), speed toggling (`Shift+Space`), and hint access (`Ctrl+H`).
- `ASM-QUIZ-027`: Audio failover cascade guarantees learners can complete listening practice sessions even in offline or low-bandwidth environments.

## Open Questions

- _None_ — All 6 domain pillars, business rules, fallback flows, and edge cases are fully resolved and agreed upon.
