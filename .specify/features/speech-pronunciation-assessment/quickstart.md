# Quickstart & Verification Guide: Speech Recognition & Pronunciation Assessment

**Feature**: `speech-pronunciation-assessment`  
**Epic**: EPIC-08 (Speech Recognition & Pronunciation Assessment)  
**Date**: 2026-08-21  
**Status**: Ready for Verification

---

## 1. Prerequisites & Environment Setup

### Browser Requirements

- **Recommended Browsers**: Google Chrome (v110+), Microsoft Edge (v110+), Apple Safari (v16.4+).
- **Advisory Browser**: Mozilla Firefox (desktop lacks native `SpeechRecognition`; audio playback, 0.75x slow speed, and IPA breakdown remain 100% operational with an informative fallback notice).
- **Microphone**: Working hardware mic input in a secure context (`http://localhost:*` or HTTPS).

### Monorepo Setup

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build shared types
pnpm --filter @wordstreak/shared-types build

# 3. Start PostgreSQL and migrate schema (if not already running)
docker compose up -d postgres
pnpm --filter api prisma:migrate:dev

# 4. Launch backend and frontend dev servers
pnpm --filter api start:dev
pnpm --filter web dev
```

---

## 2. Automated Test Execution

Run the complete test suite across monorepo packages:

```bash
# Build shared types package
pnpm --filter @wordstreak/shared-types build

# Run Backend Unit & Integration Tests (Practice & Voice Submit)
pnpm --filter api test -- src/modules/practice/practice.service.spec.ts src/modules/practice/practice.controller.spec.ts

# Run Frontend Audio Hooks & Component Tests
pnpm --filter web test -- src/features/practice/hooks/useSpeechRecognition.spec.ts \
  src/features/practice/hooks/useAudioVisualizer.spec.ts \
  src/features/practice/hooks/useVoicePracticeEngine.spec.ts \
  src/features/practice/utils/pronunciationScorer.spec.ts \
  src/features/practice/utils/ipaSyllableParser.spec.ts \
  src/features/practice/components/PronunciationPracticeModal.spec.tsx \
  src/features/practice/components/AcousticSoundwave.spec.tsx \
  src/features/practice/components/PhoneticWordBreakdown.spec.tsx \
  src/features/practice/components/AccentAudioSelector.spec.tsx
```

---

## 3. End-to-End Verification Scenarios

### Scenario A: Live Voice Recognition & Soundwave Visualizer (US-VOICE-01)

1. Open WordStreak in Chrome: `http://localhost:5173`.
2. Navigate to any flashcard or study deck (e.g. "Advanced Vocabulary").
3. Click the **"Practice Speaking"** Obsidian pill button.
4. Allow browser microphone access when prompted.
5. **Observe**:
   - The mic CTA pulses with Electric Violet glow (`#8B5CF6`).
   - 5–7 vertical soundbars in `AcousticSoundwave` bounce at 60 FPS in sync with voice volume.
   - Interim speech transcript renders in `JetBrains Mono` as you speak.
6. Speak the word `"eloquent"` clearly.
7. **Verify**:
   - Badge displays **Exact Match (100%)** with Emerald Green border (`#10B981`).
   - Ascending two-tone chime plays.
   - "+10 XP" chip appears and user daily streak flame pulses.

### Scenario B: Close Match Diff Highlighting & Retry Tier (US-VOICE-01)

1. Practice a multi-syllable word (e.g. `"preliminary"`).
2. Deliberately mispronounce slightly: `"preliminry"`.
3. **Verify**:
   - Score displays $\approx 91\%$ with **Close Match** Royal Violet badge (`#8B5CF6`).
   - Character diff shows missing `'a'` in amber.
   - "+10 XP" is awarded.
4. On a new card, speak an incorrect word (e.g. target `"epitome"`, spoken `"ep-tomb"`).
5. **Verify**:
   - Score displays $<80\%$ with **Needs Retry** Warm Amber badge (`#F59E0B`).
   - Gentle retry tone plays; $0\text{ XP}$ is awarded.
   - "Try Again" CTA appears alongside a suggestion to listen at 0.75x slow speed.

### Scenario C: Dual-Accent Native Audio & 0.75x Pitch-Preserved Speed (US-VOICE-02)

1. In the pronunciation modal, observe the **Accent Selector** tabs: `US` and `UK`.
2. Click `UK` $\rightarrow$ audio source switches to British RP reference.
3. Click the **"0.75x"** slow toggle $\rightarrow$ button highlights in Obsidian black.
4. Click **Play Native Audio**.
5. **Verify**:
   - Audio plays at $75\%$ speed.
   - Vocal timbre is crisp without deep robotic pitch distortion (`preservesPitch = true`).
6. Turn off WiFi / mock 404 on CDN audio URL.
7. Click **Play** $\rightarrow$ verifies automatic zero-lag fallback to `window.speechSynthesis`.

### Scenario D: Interactive IPA Syllable Segmentation (US-VOICE-02)

1. Inspect the phonetic breakdown: `[ˈel] [ɪ] [kwənt]`.
2. **Verify**:
   - `ˈel` is highlighted with a bold violet border as the primary stress syllable.
   - Clicking `[el]` isolates and speaks only that syllable via speech synthesis.
   - Clicking `[kwənt]` speaks the final syllable.

---

## 4. Backend API Verification with cURL

### 1. Successful Voice Pronunciation Submission (+10 XP)

```bash
curl -X POST http://localhost:3000/api/v1/practice/voice/submit \
  -H "Authorization: Bearer $USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": "c4b12a89-32e1-4b10-928d-192837465019",
    "targetWord": "eloquent",
    "spokenTranscript": "eloquent",
    "accuracyScore": 100,
    "accent": "en-US",
    "timeSpentMs": 1450
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "data": {
    "isPassed": true,
    "accuracyScore": 100,
    "tier": "EXACT",
    "xpAwarded": 10,
    "isDailyCapped": false,
    "streakAdvanced": true,
    "diffSpans": [
      { "char": "e", "type": "MATCH" },
      { "char": "l", "type": "MATCH" },
      { "char": "o", "type": "MATCH" },
      { "char": "q", "type": "MATCH" },
      { "char": "u", "type": "MATCH" },
      { "char": "e", "type": "MATCH" },
      { "char": "n", "type": "MATCH" },
      { "char": "t", "type": "MATCH" }
    ],
    "feedbackMessage": "Perfect pronunciation! Exact match."
  },
  "message": "Voice pronunciation evaluated successfully"
}
```

### 2. Anti-Abuse Rate Limit Test (< 1500ms cooldown)

```bash
# Submitting two requests in rapid succession (<1500ms)
curl -X POST http://localhost:3000/api/v1/practice/voice/submit \
  -H "Authorization: Bearer $USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "cardId": "c4b12a89-32e1-4b10-928d-192837465019", "targetWord": "eloquent", "spokenTranscript": "eloquent", "accuracyScore": 100, "accent": "en-US", "timeSpentMs": 200 }'
```

**Expected Response**: HTTP `429 Too Many Requests` with message `"Voice submissions rate-limited. Please wait 1.5s between checks."`
