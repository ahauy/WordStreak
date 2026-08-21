# Test Plan: AI-Assisted Vocabulary Generator & Global Dictionary Cache

**Feature slug**: `ai-vocabulary-generator`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/ai-vocabulary-generator/spec/user-stories.md`

---

## Unit & Service Tests (`apps/api`)

### `AiVocabularyService`

#### TC-001: Uncached word invokes Gemini Flash and saves to cache
```gherkin
Given word "ineffable" is NOT in GlobalDictionaryCache
  And user has remaining daily quota (e.g. 25/30)
When  generateCard({ word: "ineffable" }, userId) is called
Then  GeminiProvider is called with structured prompt
  And result is saved to GlobalDictionaryCache with hitCount = 1 and source = "GEMINI_FLASH"
  And daily quota is decremented to 24
  And returned DTO contains isCached = false
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 1, `US-AI-02` Scenario 1

#### TC-002: Cached word returns instantly with zero quota cost
```gherkin
Given word "serendipity" exists in GlobalDictionaryCache with hitCount = 5
When  generateCard({ word: "Serendipity" }, userId) is called
Then  GeminiProvider is NOT called
  And GlobalDictionaryCache hitCount is incremented to 6
  And user's daily quota is NOT decremented
  And returned DTO contains isCached = true
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 2, `US-AI-02` Scenario 1

#### TC-003: Gemini failure triggers Free Dictionary fallback
```gherkin
Given word "resilience" is NOT in GlobalDictionaryCache
  And GeminiProvider throws an error (timeout or network error)
When  generateCard({ word: "resilience" }, userId) is called
Then  FreeDictionaryProvider is called as fallback
  And result is saved to GlobalDictionaryCache with source = "FREE_DICTIONARY"
  And response returns structured card data with source = "FREE_DICTIONARY"
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 3

#### TC-004: Word not found throws 404 NotFoundException
```gherkin
Given word "xyznonexistentword99" is queried
  And GeminiProvider fails or returns null
  And FreeDictionaryProvider returns 404
When  generateCard({ word: "xyznonexistentword99" }, userId) is called
Then  NotFoundException is thrown with code "AI_WORD_NOT_FOUND"
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 4

#### TC-005: Daily quota exceeded throws 429 HttpException
```gherkin
Given user has already used 30 uncached generations today
  And word "ephemeral" is NOT in GlobalDictionaryCache
When  generateCard({ word: "ephemeral" }, userId) is called
Then  HttpException is thrown with status 429 and code "AI_DAILY_QUOTA_EXCEEDED"
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `US-AI-02` Scenario 2

#### TC-006: Burst rate limit exceeded throws 429 HttpException
```gherkin
Given user makes 6 requests within 30 seconds
When  6th request arrives
Then  HttpException is thrown with status 429 and message indicating rate limit
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-AI-004`

---

## Controller & Integration Tests (`apps/api`)

### `AiVocabularyController`

#### TC-010: POST /api/v1/ai/generate-card endpoint returns 200 with DTO
```gherkin
Given user is authenticated with valid JWT Bearer token
When  POST /api/v1/ai/generate-card is called with { "word": "eloquent" }
Then  status code is 200
  And response body matches GenerateCardResponseDto schema
```
- **File**: `apps/api/src/modules/ai-vocabulary/ai-vocabulary.controller.spec.ts`
- **Priority**: Must-Have
- **Traces to**: `REQ-AI-004`

---

## Frontend Component & Hook Tests (`apps/web`)

### `AddCardModal` & `useAiVocabulary`

#### TC-020: Sparkle button triggers auto-fill and populates form fields
```gherkin
Given AddCardModal is open with word input = "eloquent"
When  user clicks "✨ Auto-Fill with AI" button
Then  button displays "Đang tạo..." loading pulse
  And on API resolution, meaning, phonetic, exampleSentence, collocations, mnemonic inputs are populated
  And inputs remain editable
```
- **File**: `apps/web/src/features/cards/components/AddCardModal.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 1

#### TC-021: Non-destructive error handling when word not found
```gherkin
Given AddCardModal has word input = "invalidword99"
When  user clicks "✨ Auto-Fill with AI" and API returns 404
Then  error message "Không tìm thấy từ vựng" is displayed
  And word input retains "invalidword99" without clearing
```
- **File**: `apps/web/src/features/cards/components/AddCardModal.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `US-AI-01` Scenario 4
