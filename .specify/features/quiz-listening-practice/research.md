# Technical Research & Architecture Decisions: Listening & Typing Practice Quiz (US-QUIZ-03)

**Feature**: `quiz-listening-practice`  
**Epic**: EPIC-04 Multi-format Practice & Quiz Modes (Sprint 5)  
**Date**: 2026-08-21  
**Status**: COMPLETE

---

## 1. Client-Side Audio Engine & Web Speech API Failover Cascade

### Decision:

Implement a lightweight React hook `useAudioPlayer` using HTML5 `Audio` with automatic failover to the browser's native Web Speech API (`window.speechSynthesis`).

### Rationale:

- **Zero External Dependencies**: Avoids heavy third-party audio packages (e.g. Howler.js, Tone.js), saving $\sim 35\text{KB}$ in gzipped bundle size.
- **Granular Speed Control**: HTML5 `Audio.playbackRate` natively supports `1.0` and `0.75` speed adjustments without pitch distortion on modern browsers.
- **Resilient Fallback**: If `audioUrl` is missing (`null`/empty), fails with network 404/CORS, or fails to emit `canplaythrough` within 3000ms, the engine seamlessly switches to `window.speechSynthesis.speak(new SpeechSynthesisUtterance(word))` configured with `lang: 'en-US'` and matching `rate: 0.75 | 1.0`.
- **Autoplay Handling**: Listens for `NotAllowedError` promise rejection from `.play()` and cleanly transitions the UI to render a pulsing `"Play Audio (Space)"` Obsidian button to unlock audio on the first user interaction.

### Alternatives Considered:

- **Server-Side TTS Generation (AWS Polly / Google Cloud TTS)**: Rejected for MVP due to external API latency ($> 300\text{ms}$), recurrent recurring cloud costs, and unnecessary backend complexity when modern client devices already include high-quality OS-level TTS voices.
- **Pre-downloading all audio files in batch**: Rejected because it increases initial quiz load latency on mobile networks. On-demand streaming with `preload="auto"` and preloading the immediate next question provides the best perceived performance.

---

## 2. Text Normalization & Character-Level Diff Engine

### Decision:

Implement client-side normalization and a Longest Common Subsequence (LCS) / character span diff algorithm in `@wordstreak/shared-types` or frontend utility `apps/web/src/features/practice/utils/spellingDiff.ts`.

### Normalization Logic:

```typescript
export function normalizeSpelling(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019`]/g, "'") // Standardize curly quotes/apostrophes
    .replace(/[\s\-_]+/g, "") // Ignore spaces, hyphens, underscores
    .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?"!]/g, ""); // Strip non-alphanumeric punctuation
}
```

### Character Diff Logic:

When an answer is incorrect ($S_{norm} \neq T_{norm}$), compute the character diff:

- **Correct characters in place**: Neutral ink color.
- **Missing characters**: Rendered in soft blue/accent badge `[c]`.
- **Incorrect/Extra characters**: Rendered in strikethrough red `#ff5f56`.

### Rationale:

Orthographic acquisition requires clear visual comparison. Users learn significantly faster when they see the exact missing or inverted letter (e.g., `"acomodation"` $\rightarrow$ missing `'c'` and `'m'`) rather than just a binary "Incorrect" label.

---

## 3. Backend Architecture (`apps/api`)

### Decision:

Add `ListeningGeneratorService` to `apps/api/src/modules/practice/listening-generator.service.ts` and expose `GET /api/v1/practice/listening` on `PracticeController`.

### API Flow:

1. **Guard**: Protected by `JwtAuthGuard`.
2. **Access Control**: Validates that `deckId` belongs to `userId` or has `isPublic: true`.
3. **Card Selection**: Retrieves cards with `id`, `word`, `phonetic`, `meaning`, `audioUrl`, shuffles them via Fisher-Yates, and slices to `limit` (default 10, max 100).
4. **DTO Transformation**: Maps cards to `ListeningQuestionDto[]`:
   - `id`: `listen_q_${card.id}_${index}`
   - `cardId`: `card.id`
   - `word`: `card.word`
   - `phonetic`: `card.phonetic`
   - `meaning`: `card.meaning`
   - `audioUrl`: `card.audioUrl`
   - `wordLength`: `card.word.length`
   - `firstLetterHint`: `card.word.charAt(0).toUpperCase()`

### Gamification & Submission:

Reuses `POST /api/v1/practice/submit-quiz` with extended handling for listening mode:

- Base XP: $+10\text{ XP}$ per correct answer.
- Speed / Precision Bonus: $+15\text{ XP}$ if `timeSpentMs <= 8000` AND `hintsUsed === 0` AND `replayCount <= 2`.
- Combo Multipliers: $1.0\times$ (1–2 streak), $2.0\times$ (3–4 streak), $3.0\times$ ($\ge 5$ streak).
- Isolation: Spaced repetition memory parameters (`UserCardProgress`) are strictly NOT updated.

---

## 4. Frontend Component & Hook Architecture (`apps/web`)

### Component Breakdown:

- **`ListeningQuizPage.tsx`**: Top-level page container hosting session state, progress bar, combo tracker, and results view.
- **`ListeningQuizCard.tsx`**: Central practice card displaying speaker/waveform animation, audio speed toggle pill (`1.0x` / `0.75x`), replay button, and 3-tier progressive hint drawer.
- **`ListeningTypingInput.tsx`**: Dynamic input box featuring letter slot guides (`_ _ _ _ _`), autofocus, enter-to-submit listener, green/red feedback glow, and character diff display.
- **`ProgressiveHintBox.tsx`**: Expandable 3-tier hint component displaying Tier 1 (First letter & length), Tier 2 (Meaning), Tier 3 (IPA).
- **`useListeningQuiz.ts`**: Core state machine hook managing questions, current index, user input, audio playback rate, hint level, time tracking, scoring, and submit lifecycle.
- **`useAudioPlayer.ts`**: Audio controller managing HTML5 audio streaming, Web Speech API fallback, speed rate changes, and autoplay unlocking.

---

## 5. Visual Design Tokens & Obsidian Guidelines

- **Canvas**: `#ffffff` (pure white sheet).
- **CTA Pills**: Obsidian black `#000000` (`rounded-full`, text `#ffffff`, hover `#171717`, active `#090909`).
- **Secondary Controls**: Hairline outline pills (`#ffffff` bg, `1px solid #e5e5e5`, text `#000000`).
- **Audio Active Pulse**: Violet accent `#9333ea` / `#7e22ce` for speaker waveform animation.
- **Status Colors**: Emerald green `#27c93f` (correct), Red `#ff5f56` (incorrect shake), Amber `#ffbd2e` (hint alert).
- **Typography**: SF Pro Rounded / Nunito for headings, Inter for inputs/body, JetBrains Mono for IPA and character slots.
