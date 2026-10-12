# English Vocabulary Learning App — Feature Ideas & Roadmap

A feature brainstorm for a web-based English vocabulary learning app (NestJS backend + React frontend), organized by priority tier, with feedback and a suggested build order.

---

## 🔴 Tier 1 — Smart Learning & Review (Core Features)

### 1. Spaced Repetition System (SRS)

- Implement the **SM-2 algorithm** (same family as Anki). Based on a self-rated difficulty (Easy / Medium / Hard), the system automatically schedules when a word should reappear (after 1 day, 3 days, 7 days, etc.).
- **Consideration:** SM-2 is simple to implement and a safe starting point. For a future iteration, consider **FSRS** (the algorithm Anki itself has migrated to) — it models forgetting curves more accurately than SM-2 because it uses more parameters than a 3-level difficulty rating. Ship with SM-2 first, upgrade later once you have review-history data to tune it.

### 2. Contextual Flashcards

Each card should include more than just word + meaning:

- IPA pronunciation + audio (US/UK accents)
- A real example sentence
- Collocations and synonyms/antonyms
- An illustrative image or personal note (mnemonic)
- **Consideration:** Let users add their own custom example sentences or mnemonics — personal context is what makes a word "stick."

### 3. Varied Review/Quiz Formats

- Multiple choice (meaning / pronunciation)
- Fill-in-the-blank (complete the example sentence)
- Listening practice (hear audio, type the word)
- Word matching (match word to definition)
- **Future addition:** Sentence construction (arrange words into a correct sentence) once the core loop is stable.

---

## 🟠 Tier 2 — UX & Gamification

### 1. Streaks & Daily Goals

- Let users set a daily target (e.g., 10 new words/day).
- Track consecutive-day streaks to reinforce the habit.
- **Consideration:** Add a **"streak freeze"** (à la Duolingo). A pure streak mechanic often causes users to abandon the app entirely after missing one busy day — a freeze/grace mechanism protects retention.

### 2. Analytics Dashboard

- Charts tracking words Mastered / Learning / New.
- Estimated time-to-completion for a given vocabulary deck.
- **Consideration:** A GitHub-style contribution heatmap is a low-effort, high-impact way to visualize consistency over time.

### 3. Chrome Extension Integration

- A browser extension connected to the NestJS API: while reading an article or watching a video, highlight a new word → click to save it straight into the user's deck.
- **Consideration:** High value, but non-trivial scope (Manifest V3, content scripts, syncing auth with the main web app). Recommended for a later phase, after the core learning loop is solid — don't let it delay MVP.

---

## 🟡 Tier 3 — AI & Automation

### 1. AI-Assisted Vocabulary Data Generation

- Instead of manually typing IPA, examples, and synonyms for every word: the user enters just the English word, and the NestJS backend calls the OpenAI API or a Free Dictionary API to auto-fill the rest.
- **Considerations:**
  - Add a light review/report-an-error flow — AI-generated examples or IPA can occasionally be wrong or unnatural.
  - **Cache generated results per word in a shared database** rather than regenerating per user. This cuts API costs significantly and speeds up lookups for words other users have already added.
  - Add rate limiting on the generation endpoint to control cost abuse.

### 2. Pronunciation Checking (Voice Recognition)

- Use the Web Speech API in React so users can read a word aloud and get feedback against the target IPA.
- **Consideration:** Web Speech API browser support is inconsistent — solid in Chrome, weak/absent in Firefox and Safari. Either clearly scope this to Chrome initially, or plan for a fallback using a dedicated speech-to-text service (e.g., Whisper API) for cross-browser support.

---

## 🔵 Tier 4 — Content Library & Structured Learning Paths

### 1. Official Vocabulary Starter Library (TSL, NGSL, NAWL, BSL)

- Moving beyond user-created decks: provide scientific, corpus-backed official starter libraries licensed under **CC BY-SA 4.0** from the New General Service List (NGSL) project.
- **Lists prioritized:**
  - **TSL 1.2 (TOEIC Service List):** ~1,200 specialized words covering ~98.5% of TOEIC test corpus when paired with NGSL.
  - **NGSL 1.2 (New General Service List):** 2,809 high-frequency core words covering ~92% of general English and ~94% of TOEIC texts.
  - **NAWL (Academic):** 960 academic words for IELTS preparation.
  - **BSL (Business):** 1,700 words for workplace communications.
- **Architectural Consideration:** Avoid deep-copying 1,200 cards per user. Use a **Shared Official Card Architecture** (`OfficialCard`, `OfficialDeck`) where individual user progress (`UserOfficialCardProgress`) is lazy-loaded only when a card enters the active review queue.

### 2. TOEIC Learning Path with Estimated Vocabulary Coverage

- A structured, step-by-step ladder:
  - **Step 0:** 20-word adaptive baseline check.
  - **Step 1:** NGSL Top 1,000 ("TOEIC Foundations", ~33 decks × 30 words).
  - **Step 2:** TSL Level 1 (Rank 1–400, "Core TOEIC", 16 decks × 25 words).
  - **Step 3:** TSL Level 2 (Rank 401–800, "Intermediate TOEIC", 16 decks × 25 words).
  - **Step 4:** TSL Level 3 (Rank 801–1,200, "Advanced TOEIC", 16 decks × 25 words).
- **Estimated TOEIC Coverage Bar:** Real-time motivational progress indicator based on published corpus statistics:
  $$\text{Coverage} = 94\% \times \left(\frac{\sum \text{freq}_{\text{known NGSL}}}{\sum \text{freq}_{\text{all NGSL}}}\right) + 4.5\% \times \left(\frac{\sum \text{freq}_{\text{known TSL}}}{\sum \text{freq}_{\text{all TSL}}}\right) \le 98.5\%$$
- Transparent disclaimer: Vocabulary is one pillar; test scores also require listening comprehension, grammar, and exam strategies.

### 3. Beginner Mode & Foundation Stage

- Many learners quit because starter vocabulary is already too difficult or example sentences contain too many unknown words.
- **Foundation Stage:** Repackage NGSL Top 300 into 15 bite-sized decks (20 words/deck) focusing on survival words (pronouns, numbers, basic verbs).
- **Interspersed 2-Minute Mini-Lessons:** Micro grammar lessons (parts of speech, S+V+O word order, verb forms, plural -s/-es) before vocabulary practice.
- **Audio-First Review:** Hear pronunciation before reading text to train listening reflexes.
- **Vietnamese Final Sound Guidance (`ending_sound_tip_vi`):** Address specific Vietnamese pronunciation challenges (dropping final -s/-es, -ed, /t/, /k/).
- **Intra-session Learning Steps:** New cards are repeated at 1-min and 5-min intervals within the same session before graduating to daily SM-2 intervals.

### 4. Exam-Style Quizzes (Mini Part 5 & Word Families)

- **Mini Part 5 (Fill-in-the-blank):** 4-choice questions in workplace contexts with distractors pulled from target word confusables and word families.
- **Word Family Questions:** Test noun/verb/adjective/adverb distinction based on grammatical position.
- **Paraphrase Identification:** Contextual synonym matching mimicking Part 7 reading passages.
- **Auto-grading into SM-2:** Correctness and response speed map directly to SM-2 ratings (Again/Hard/Good/Easy) without manual self-grading.

### 5. Content Quality & Automated Enrichment Pipeline

- A 7-stage idempotent pipeline (`Import` → `Normalize` → `Enrich` → `Validate` → `Review` → `Build Decks` → `Publish`) with JSON checkpointing.
- **Vocabulary Control Rules:**
  - `example_en`: $\ge 95\%$ of words in example sentences must belong to NGSL + TSL.
  - `example_easy_en` (Beginner Mode): 5–8 words strictly constrained to NGSL Top 500.
- **Human Verification:** 100% human review for TSL Top 200 and NGSL Top 300 (first-run impression), 15–20% sample review for remaining cards.

### 6. Known-Word Triage Flow

- Fast swipe / keyboard triage (60s for 25 words) before starting any deck.
- Marked words are flagged as `KNOWN_SKIPPED`: counted toward coverage but excluded from daily SRS review queues to eliminate boredom for experienced learners.
- Beginner safeguard: Quick popover verification question to prevent mistaking familiarity with mastery.

---

## 🟢 Suggested Additions (Not in Original List)

- **User accounts & authentication** — needed before SRS scheduling, streaks, or saved decks make sense per-user.
- **Import/export decks** — support CSV and/or Anki (.apkg) format so users can migrate existing vocabulary lists in or out.
- **Deck sharing / community decks** — let users publish or clone decks (e.g., "IELTS 7.0 word list," "Business English").
- **Offline mode / PWA** — useful for a habit-forming app people use on commutes with spotty connectivity.
- **Study reminders** — push/email notifications for users at risk of breaking their streak.

---

## ✅ Build Status (as of October 2026)

**Phase 1 — MVP (core learning loop)** ✅ COMPLETED

- [x] User auth (JWT + Refresh Token, multi-device sessions)
- [x] Contextual flashcards (rich fields: IPA, audio, collocations, mnemonic)
- [x] SM-2 SRS scheduling + 3D Flashcard Review UI
- [x] 4 quiz formats (Multiple Choice, Fill-in-blank, Listening, Word Matching)
- [x] Daily streak + Streak Freeze + XP/Levels gamification

**Phase 2 — Retention & Insight** ✅ COMPLETED

- [x] Full analytics dashboard (Heatmap, Mastery Breakdown, Forecast)
- [x] Streak Freeze mechanic
- [x] AI-assisted card generation (Gemini API + shared `GlobalDictionaryCache`)
- [x] Pronunciation / voice recognition (Web Speech API + Levenshtein scoring)

**Phase 3 — Expansion** ✅ COMPLETED

- [x] Chrome Extension (Manifest V3, content script, popup, offline sync)
- [x] PWA + Offline Mode (IndexedDB, Service Worker, batch sync)
- [x] Deck import/export (CSV, XLSX, Anki .apkg)
- [x] Community Decks Marketplace (public/clone/rate)
- [x] Full i18n EN/VI

**Phase 4 — Activation & Retention Loop** 🔄 IN PROGRESS / PLANNED

- [ ] Starter Decks (Official content — IELTS, TOEIC, Daily vocab)
- [ ] Onboarding Wizard 60s (goal + mini test + auto-assign deck)
- [ ] Guest preview (5-word try-before-signup)
- [ ] Extension: Review Summary API + badge
- [ ] Extension: Smart reminder notifications (conditional rules, quiet hours)
- [ ] Extension: Notification settings (Options page)
- [ ] "Học hôm nay" one-tap session button
- [ ] Quiz auto-grade → SRS update
- [ ] Backlog guard

**Phase 5 — Quality & Growth** 🗓️ PLANNED

- [ ] Extension Micro-review popup (5-card quick review)
- [ ] AI: Short reading passages from due words
- [ ] AI: Self-sentence composition + feedback
- [ ] Leech word detection & smart suggestions
- [ ] SEO word pages (`/word/:word` with prerender/SSR)
- [ ] Chrome Web Store public submission
- [ ] Product analytics (PostHog)
- [~] Web Push & Email reminders (mobile/PWA)
- [~] Google Sign-in (reduce signup friction)

**Phase 6 — Content Library & Multi-Path Mastery** 📚 PLANNED

- [ ] Official vocabulary data architecture (Shared `OfficialCard` + Lazy `UserOfficialCardProgress`)
- [ ] 7-Stage content enrichment pipeline (`scripts/seed/` with AI batching, validation, and checkpointing)
- [ ] Soft launch: TSL Top 200 + NGSL Top 300 (100% human-verified)
- [ ] Foundation Stage (Beginner Mode: 15 decks × 20 words + 4 grammar mini-lessons)
- [ ] Known-word triage flow (swipe 25 words in 60s with popover verification)
- [ ] Full TSL Path: 1,200 words across 3 levels (48 decks × 25 words)
- [ ] Real-time Estimated TOEIC Coverage progress bar (formula: up to ~98.5%)
- [ ] TOEIC exam quizzes (Mini Part 5 distractor check, word families, paraphrase)
- [ ] Expansion to NAWL (IELTS Academic), BSL (Business English), and NGSL-S (Spoken)

---

_Phase 1–3 validated the core learning loop. Phase 4 focuses on "can a new user get value in 60 seconds and return the next day?" Phase 5 expands reach and learning quality. Phase 6 provides scientific, corpus-backed curriculum (NGSL/TSL) that turns WordStreak into an indispensable exam prep and vocabulary mastery platform._
