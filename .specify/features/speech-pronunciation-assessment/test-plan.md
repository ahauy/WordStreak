# Test Plan: Speech Recognition & Pronunciation Assessment

**Feature slug**: `speech-pronunciation-assessment`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/speech-pronunciation-assessment/spec.md`

> **Mục đích**: Document này mô tả test cases ở dạng Gherkin trước khi viết code cho Speech Recognition & Pronunciation Assessment.
> Sau khi implement xong, actual test files được viết và đối soát dựa trên document này.

---

## Unit Tests

### `apps/web/src/features/practice/utils/pronunciationScorer.spec.ts`

#### TC-001: Exact match Levenshtein scoring (100%)

```gherkin
Given target word is "eloquent"
  And spoken transcript is "eloquent"
When  pronunciation scoring function is executed
Then  calculated similarity is 100%
  And result tier is "EXACT"
  And isPassed is true
  And all diff spans are marked as "MATCH"
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.3

#### TC-002: Close match Levenshtein scoring (80% to 99%)

```gherkin
Given target word is "preliminary"
  And spoken transcript is "preliminry"
When  pronunciation scoring function is executed
Then  calculated similarity is approximately 91%
  And result tier is "CLOSE"
  And isPassed is true
  And diff span correctly identifies missing character "a"
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.4

#### TC-003: Needs retry scoring (<80%)

```gherkin
Given target word is "epitome"
  And spoken transcript is "ep-tomb"
When  pronunciation scoring function is executed
Then  calculated similarity is less than 80%
  And result tier is "RETRY"
  And isPassed is false
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.5

#### TC-004: Normalization of punctuation, casing, and whitespace

```gherkin
Given target word is "Well-known!"
  And spoken transcript is "  well known  "
When  pronunciation scoring function is executed
Then  text is normalized by stripping punctuation and lowercasing
  And similarity is calculated as 100% "EXACT"
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Edge Case 3

---

### `apps/web/src/features/practice/utils/ipaSyllableParser.spec.ts`

#### TC-005: Parse IPA string with primary and secondary stress

```gherkin
Given IPA phonetic string "/ˌʌn.fəˈɡɪv.ə.bəl/"
When  ipaSyllableParser is called
Then  it returns an array of 5 syllable tokens:
      - "ʌn" with isSecondaryStress = true
      - "fə" with isPrimaryStress = false, isSecondaryStress = false
      - "ɡɪv" with isPrimaryStress = true
      - "ə" with isPrimaryStress = false
      - "bəl" with isPrimaryStress = false
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-02` Scenario 2.4

#### TC-006: Fallback for unformatted or simple phonetics

```gherkin
Given plain phonetic string "kæt" without delimiters
When  ipaSyllableParser is called
Then  it returns a single syllable token "kæt" with stress flags false
```

**Priority**: Nice-to-Have  
**Traces to**: `US-VOICE-02` Scenario 2.4

---

### `apps/web/src/features/practice/hooks/useSpeechRecognition.spec.ts`

#### TC-007: Microphone lifecycle and transcript streaming

```gherkin
Given Web Speech API is supported
When  user starts listening in locale "en-US"
Then  recognition instance is configured with continuous=false, interimResults=true, lang="en-US"
  And state transitions to LISTENING
When  interim result event is fired with "elo"
Then  interimTranscript emits "elo"
When  final result event is fired with "eloquent"
Then  finalTranscript emits "eloquent"
  And state transitions to PROCESSING
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.1, Scenario 1.2

#### TC-008: Silence watchdog timer (2500ms)

```gherkin
Given state is LISTENING
When  2500ms elapses with zero speech detected
Then  speech recognition is automatically stopped
  And state transitions to IDLE or EVALUATING
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.7

#### TC-009: Max utterance watchdog timer (8000ms)

```gherkin
Given state is LISTENING with continuous background audio
When  8000ms max recording duration is reached
Then  speech recognition aborts/stops recording
  And audio stream tracks are stopped
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.7

---

### `apps/web/src/features/practice/hooks/useAudioVisualizer.spec.ts`

#### TC-010: AnalyserNode frequency volume sampling at 60 FPS

```gherkin
Given an active MediaStream AudioContext
When  useAudioVisualizer starts sampling
Then  AnalyserNode FFT frequency data is sampled via requestAnimationFrame
  And 5 to 7 normalized bar heights (0.0 to 1.0) are calculated
When  stream is terminated
Then  animation frame is cancelled and AudioContext is closed cleanly
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.2

---

### `apps/api/src/modules/practice/practice.service.spec.ts`

#### TC-011: Submit voice pronunciation with exact match (100%)

```gherkin
Given user is authenticated with userId "user-123"
  And card with ID "card-1" has target word "eloquent"
  And today's practice XP for "user-123" is 0
When  submitVoicePronunciation is called with cardId "card-1" and spokenTranscript "eloquent"
Then  backend computes 100% accuracy
  And tier is "EXACT"
  And isPassed is true
  And xpAwarded is 10
  And isDailyCapped is false
  And streakService.recordActivity is invoked
  And userActivityLog is created with activityType "VOICE_PRONUNCIATION" and xpEarned 10
  And user.totalXp is incremented by 10
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.3

#### TC-012: Submit voice pronunciation with close match (85%)

```gherkin
Given user is authenticated with userId "user-123"
  And card with ID "card-1" has target word "preliminary"
When  submitVoicePronunciation is called with spokenTranscript "preliminry"
Then  backend computes ~91% accuracy
  And tier is "CLOSE"
  And isPassed is true
  And xpAwarded is 10
  And streakService.recordActivity is invoked
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.4

#### TC-013: Submit voice pronunciation with retry match (<80%)

```gherkin
Given user is authenticated with userId "user-123"
  And card with ID "card-1" has target word "epitome"
When  submitVoicePronunciation is called with spokenTranscript "ep-tomb"
Then  backend computes <80% accuracy
  And tier is "RETRY"
  And isPassed is false
  And xpAwarded is 0
  And streakService.recordActivity is NOT invoked
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.5

#### TC-014: Anti-abuse 500 XP daily cap enforcement

```gherkin
Given user has already earned 500 XP today from practice activities
When  submitVoicePronunciation is called with a passing score (100%)
Then  tier is "EXACT"
  And isPassed is true
  And xpAwarded is 0
  And isDailyCapped is true
  And streakService.recordActivity is still invoked
  And user.totalXp is NOT incremented
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.6

#### TC-015: Anti-abuse rapid submission cooldown (1500ms)

```gherkin
Given user submitted a voice pronunciation attempt at timestamp T
When  user submits another attempt at timestamp T + 400ms (< 1500ms)
Then  system throws HttpException 429 Too Many Requests
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.6, Edge Case 5

#### TC-016: Non-existent card ID handling (404)

```gherkin
Given cardId "invalid-uuid" does not exist in database
When  submitVoicePronunciation is called
Then  system throws NotFoundException with message "Card with ID invalid-uuid not found"
```

**Priority**: Must-Have  
**Traces to**: Error states (404)

#### TC-017: Discrepancy protection against forged client scores

```gherkin
Given card target word is "cat"
  And client sends spokenTranscript "dog" with forged accuracyScore 100
When  submitVoicePronunciation is evaluated
Then  backend recalculates canonical Levenshtein score (0%)
  And returns tier "RETRY" and xpAwarded 0
```

**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Anti-Abuse

---

## Integration Tests

### `POST /api/v1/practice/voice/submit`

#### TC-018: Successful voice pronunciation submission endpoint

```gherkin
Given user is authenticated with valid JWT bearer token
When  POST /api/v1/practice/voice/submit is called with payload:
      {
        "cardId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "spokenTranscript": "eloquent",
        "accent": "en-US",
        "timeSpentMs": 1420
      }
Then  response HTTP status is 200 OK
  And response body matches:
      {
        "success": true,
        "data": {
          "isPassed": true,
          "accuracyScore": 100,
          "tier": "EXACT",
          "xpAwarded": 10,
          "isDailyCapped": false,
          "streakAdvanced": true,
          "diffSpans": [...]
        },
        "message": "Voice pronunciation evaluated successfully"
      }
```

**File**: `apps/api/src/modules/practice/practice.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `REQ-VOICE-001`, `FR-005`

#### TC-019: Unauthorized access rejection (401)

```gherkin
Given request has no Authorization header
When  POST /api/v1/practice/voice/submit is called
Then  response HTTP status is 401 Unauthorized
```

**Priority**: Must-Have  
**Traces to**: Security standards

#### TC-020: DTO validation error on invalid input (400)

```gherkin
Given user is authenticated
When  POST /api/v1/practice/voice/submit is called with invalid cardId (non-UUID) or missing spokenTranscript
Then  response HTTP status is 400 Bad Request
```

**Priority**: Must-Have  
**Traces to**: Input validation boundary

---

## E2E Tests (Playwright)

### Flow: Voice Practice & Pronunciation Assessment

#### TC-021: Complete voice practice happy path

```gherkin
Given user is logged in and navigates to deck practice modal
When  user opens "Practice Speaking" modal for card "eloquent"
  And user grants microphone permission
  And user speaks "eloquent" into the mic
Then  soundwave visualizer bars animate at 60 FPS
  And modal transitions from LISTENING to EVALUATING
  And Emerald Green EXACT status badge (100%) appears
  And +10 XP badge is displayed with streak fire icon animation
  And daily streak counter increments
```

**File**: `apps/web/e2e/speech-pronunciation.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.1, 1.2, 1.3

#### TC-022: Retry flow on mispronounced word

```gherkin
Given user is in voice practice modal for card "epitome"
When  user speaks "ep-tomb"
Then  Warm Amber RETRY status badge (<80%) is rendered
  And 0 XP is awarded
  And "Try Again" CTA is prominently displayed
  And 0.75x slow audio button is highlighted
When  user clicks "Try Again"
Then  microphone restarts and enters LISTENING state
```

**File**: `apps/web/e2e/speech-pronunciation.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Scenario 1.5

#### TC-023: Dual accent switching and 0.75x slow speed playback

```gherkin
Given user is inspecting pronunciation guide for card with US and UK audio
When  user clicks "UK" accent tab
Then  audio source switches to UK native track
When  user toggles "0.75x" slow speed
  And clicks Play
Then  audio element plays at playbackRate 0.75 with preservesPitch = true
```

**File**: `apps/web/e2e/speech-pronunciation.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-VOICE-02` Scenario 2.1, Scenario 2.2

#### TC-024: Microphone permission denied guidance banner

```gherkin
Given user browser blocks microphone permission (NotAllowedError)
When  user clicks "Practice Speaking"
Then  mic trigger is disabled
  And inline troubleshooting banner displays browser-specific unblock instructions
  And "Retry Permission" button is available
```

**File**: `apps/web/e2e/speech-pronunciation.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-VOICE-01` Edge Case 2

---

## Test Coverage Checklist

- [x] Tất cả `US-VOICE-01` Scenario 1 (happy path 100% exact match) có TC tương ứng (TC-001, TC-011, TC-018, TC-021)
- [x] Tất cả `US-VOICE-01` Scenario 2+ (close match, retry match, watchdogs) có TC tương ứng (TC-002, TC-003, TC-008, TC-009, TC-012, TC-013, TC-022)
- [x] Tất cả `US-VOICE-02` Scenarios (dual accent, slow speed, IPA parsing) có TC tương ứng (TC-005, TC-006, TC-023)
- [x] Business rules có anti-abuse đã có TC kiểm tra (500 XP daily cap TC-014, 1500ms cooldown TC-015, client score forgery TC-017)
- [x] Error states (400, 401, 404, 429) có TC (TC-015, TC-016, TC-019, TC-020)
- [x] Idempotency / rapid double-submit scenarios có TC (TC-015)
- [x] Microphone permission denied handling có TC (TC-024)
