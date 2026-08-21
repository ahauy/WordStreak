# User Stories: Speech Recognition & Pronunciation Assessment

- **Feature**: Speech Recognition & Pronunciation Assessment (`speech-pronunciation-assessment`)
- **Document Version**: 1.0 (Draft)
- **Date**: 2026-08-21
- **Status**: Ready for Validation

---

## US-VOICE-01: Voice Recognition & Pronunciation Assessment

**As an** authenticated English learner  
**I want to** speak vocabulary words and sentences into my microphone and receive real-time speech-to-text transcription and phonetic accuracy scoring  
**So that** I can practice active oral recall, correct my pronunciation errors immediately, and earn XP toward my daily study streak.

**Traces to**: `REQ-VOICE-001`, `REQ-VOICE-002`, `REQ-VOICE-003`, `REQ-VOICE-004`, `REQ-VOICE-005`, `REQ-VOICE-010`, `REQ-VOICE-011`, `REQ-VOICE-012`, `REQ-VOICE-013`, `REQ-VOICE-014`

---

### Acceptance Criteria

#### Scenario 1: Perfect Pronunciation Happy Path (Exact Match 100%)

- **Given** I am reviewing a vocabulary card with target word `"eloquent"` in an active study session
- **And** microphone permissions have been granted in my browser
- **When** I click the "Practice Speaking" microphone button and clearly say `"eloquent"`
- **Then** I should see animated soundwave bars reflecting my voice amplitude in real time
- **And** the speech recognition engine should transcribe `"eloquent"`
- **And** the system should display a **100% Exact Match** result badge with an Emerald Green border (`#10B981`)
- **And** a pleasant ascending success audio chime should play
- **And** I should receive `+10 XP` with a celebratory badge animation
- **And** my Daily Streak activity counter should be updated.

#### Scenario 2: Close Match with Minor Variation (80% - 99%)

- **Given** I am reviewing a card with target word `"comfortable"`
- **When** I speak the word and the engine transcribes `"comfortible"` (Levenshtein score ~91%)
- **Then** the result card should display a **Close Match (91%)** badge with a Royal Violet border (`#8B5CF6`)
- **And** the mismatched letter `"i"` should be highlighted in amber next to the correct spelling `"a"`
- **And** an encouraging audio chime should play
- **And** I should receive `+10 XP` for passing the threshold ($\ge 80\%$).

#### Scenario 3: Needs Retry (< 80%)

- **Given** I am reviewing a card with target word `"phenomenon"`
- **When** I mispronounce the word and the engine transcribes `"fenomin"` (score ~60%)
- **Then** the result card should display a **Needs Retry (60%)** badge in Warm Amber (`#F59E0B`)
- **And** a gentle neutral retry sound should play
- **And** no XP should be awarded ($0\text{ XP}$)
- **And** a prominent "Try Again" obsidian button and an "Inspect Syllables" shortcut should be displayed.

#### Scenario 4: First-Time Microphone Permission Request (Educational Pre-Prompt)

- **Given** I have never used the voice practice feature before on this browser
- **When** I click the "Practice Speaking" microphone button
- **Then** the system should display a friendly pre-permission modal explaining that voice processing happens privately in-browser
- **When** I click "Continue to Allow Mic"
- **Then** the native browser microphone permission prompt should appear.

#### Scenario 5: Microphone Permission Denied or Blocked

- **Given** I previously blocked microphone access in my browser settings
- **When** I click the "Practice Speaking" microphone button
- **Then** the UI should transition to an inline helper card stating: _"Microphone access is blocked in your browser settings"_
- **And** clear step-by-step instructions for my detected browser (Chrome, Safari, or Edge) should be shown
- **And** a "Retry Permission" button should be available without refreshing the page.

#### Scenario 6: Silence Timeout Handling

- **Given** I clicked the microphone button to start recording
- **When** I remain silent for $2.5\text{ seconds}$
- **Then** the microphone stream should automatically stop
- **And** an encouraging message should appear: _"We couldn't hear you. Please speak a bit louder or closer to the microphone"_
- **And** no penalty or failed score should be logged.

#### Scenario 7: Insecure Context or Unsupported Browser (e.g. Firefox Desktop)

- **Given** I am using a browser or context that lacks Web Speech Recognition support
- **When** I load the vocabulary card view
- **Then** the microphone button should display an informational state: _"Speech recognition not supported on this browser"_
- **And** the native audio playback and IPA syllable guides should remain fully interactive and functional.

#### Scenario 8: Anti-Abuse Daily Voice XP Cap Enforcement

- **Given** I have already earned $500\text{ XP}$ today from voice practice attempts
- **When** I complete another perfect pronunciation check ($100\%$) on a new card
- **Then** I should see the 100% Exact Match badge and success audio chime
- **And** the XP notification should indicate: _"Daily voice XP limit reached (500/500 XP). Great practice!"_
- **And** my score and streak qualification should still be recorded.

---

## US-VOICE-02: Native Reference Audio Playback & Pronunciation Guide

**As an** English learner  
**I want to** listen to high-quality US and UK native pronunciations at normal and slow speeds (0.75x) with interactive IPA syllable segmentation  
**So that** I can train my ear to distinguish regional accents, dissect complex syllables, and model authentic native intonation.

**Traces to**: `REQ-VOICE-006`, `REQ-VOICE-007`, `REQ-VOICE-008`, `REQ-VOICE-009`

---

### Acceptance Criteria

#### Scenario 1: Dual Accent Playback (US vs UK)

- **Given** I am viewing a vocabulary card for the word `"schedule"`
- **When** I select the "US" tab and click the Audio Play button
- **Then** the General American pronunciation (`/ˈskedʒ.uːl/`) audio track should play with animated audio equalizer bars
- **When** I select the "UK" tab and click the Audio Play button
- **Then** the British RP pronunciation (`/ˈʃedʒ.uːl/`) audio track should play.

#### Scenario 2: Slow Playback Speed (0.75x) with Pitch Preservation

- **Given** I am listening to a fast multisyllabic word like `"authoritarian"`
- **When** I click the Speed button to toggle from `1.0x` to `0.75x`
- **And** I click the Audio Play button
- **Then** the audio should play at $75\%$ speed
- **And** the vocal pitch should remain natural and clear without robotic bass distortion (`preservesPitch = true`).

#### Scenario 3: Interactive IPA Syllable Segmentation

- **Given** the vocabulary card displays the IPA transcription `[ˈkɑːm.pəs]`
- **When** the syllable breakdown is rendered
- **Then** it should display two distinct clickable syllable chips: `[ˈkɑːm]` (highlighted with a bold violet border indicating primary stress) and `[pəs]`
- **When** I tap the `[ˈkɑːm]` syllable chip
- **Then** the system should play the isolated audio snippet or synthesize the primary stressed syllable.

#### Scenario 4: CDN Audio Failure with Automatic Speech Synthesis Fallback

- **Given** a vocabulary card has a broken or missing CDN audio link (HTTP 404)
- **When** I click the Audio Play button
- **Then** the player should seamlessly and instantly invoke `window.speechSynthesis` using the matching system voice (`en-US` or `en-GB`)
- **And** the audio should play smoothly without throwing an unhandled browser exception or breaking the UI.
