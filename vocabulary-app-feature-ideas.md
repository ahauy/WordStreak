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

## 🟢 Suggested Additions (Not in Original List)

- **User accounts & authentication** — needed before SRS scheduling, streaks, or saved decks make sense per-user.
- **Import/export decks** — support CSV and/or Anki (.apkg) format so users can migrate existing vocabulary lists in or out.
- **Deck sharing / community decks** — let users publish or clone decks (e.g., "IELTS 7.0 word list," "Business English").
- **Offline mode / PWA** — useful for a habit-forming app people use on commutes with spotty connectivity.
- **Study reminders** — push/email notifications for users at risk of breaking their streak.

---

## Suggested Build Order

**Phase 1 — MVP (core learning loop)**
- User auth
- Contextual flashcards (manual entry first, AI-assist can come slightly later)
- SM-2 based SRS scheduling
- 2–3 quiz formats (multiple choice, fill-in-the-blank)
- Basic streak + daily goal

**Phase 2 — Retention & Insight**
- Full analytics dashboard
- Streak freeze
- AI-assisted card generation (with shared caching)
- Listening practice, word matching

**Phase 3 — Expansion**
- Chrome extension
- Pronunciation/voice recognition
- Deck import/export & sharing
- PWA/offline support

---

*Prioritizing Phase 1 lets you validate the core learning experience (does the SRS + card format actually help people retain words?) before investing in higher-complexity features like the browser extension or voice recognition.*
