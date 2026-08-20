# Test Plan: Fill-in-the-blank Quiz Mode

**Feature slug**: `quiz-fill-in-the-blank`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (Pre-implementation)  
**Traces to**: `.specify/features/quiz-fill-in-the-blank/spec/user-stories.md`

---

## 1. Backend Unit Tests (`apps/api/src/modules/practice/fill-blank-generator.service.spec.ts`)

### TC-001: Extract and Mask Exact Base Word in Sentence

```gherkin
Given a card with word "discovery" and exampleSentence "The scientist made an important discovery in genetics."
When FillBlankGeneratorService.maskSentence(card) is called
Then sentenceWithBlank is "The scientist made an important [ _____ ] in genetics."
  And sentencePrefix is "The scientist made an important "
  And sentenceSuffix is " in genetics."
  And targetWord is "discovery"
  And wordLength is 9
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 1, `BR-FILL-002`, `REQ-FILL-002`

### TC-002: Extract and Mask Inflected Word in Sentence (Past Tense / Plural / Gerund)

```gherkin
Given a card with root word "acquire" and exampleSentence "The company acquired three new startups last year."
When FillBlankGeneratorService.maskSentence(card) is called
Then sentenceWithBlank is "The company [ _____ ] three new startups last year."
  And targetWord is "acquire"
  And targetInflection is "acquired"
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 1, `BR-FILL-002`, `REQ-FILL-002`

### TC-003: Fallback Prompt when exampleSentence is Empty or Target Word Missing

```gherkin
Given a card with word "ephemeral", meaning "ngắn ngủi", and exampleSentence is null
When FillBlankGeneratorService.maskSentence(card) is called
Then sentenceWithBlank is "Complete the word: \"ngắn ngủi\" [ _____ ]"
  And targetWord is "ephemeral"
  And wordLength is 9
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 3, `BR-FILL-004`, `REQ-FILL-003`

### TC-004: Generate Scrambled Anagram Letter Chips

```gherkin
Given a target word "apple"
When FillBlankGeneratorService.generateAnagram("apple") is called
Then it returns an array of 5 characters ['a', 'p', 'p', 'l', 'e'] in randomized order
  And character counts exactly match original word letters
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 2, `BR-FILL-003`, `REQ-FILL-004`

---

## 2. Frontend Hook & Component Tests (`apps/web/src/features/practice/`)

### TC-005: Answer Validation (Case-Insensitive & Inflection Matching)

```gherkin
Given question with targetWord "discover" and targetInflection "discovered"
When user submits "DISCOVERED" or "discover" or "  discovered  "
Then validateAnswer returns isCorrect = true
When user submits "discovry"
Then validateAnswer returns isCorrect = false
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 1, 5, `BR-FILL-005`, `REQ-FILL-007`

### TC-006: Progressive Hint Mechanism

```gherkin
Given question with targetWord "ephemeral"
When user triggers hint level 1
Then firstLetterHint is "e" and remaining length display is "_ _ _ _ _ _ _ _"
  And speedBonusEligible is set to false
```

**Priority**: Must-Have  
**Traces to**: `US-QUIZ-02` Scenario 4, `BR-FILL-008`, `REQ-FILL-006`

---

## 3. Test Coverage Checklist

- [x] Base root word masking tested (`TC-001`)
- [x] Inflected word masking tested (`TC-002`)
- [x] Fallback sentence template tested (`TC-003`)
- [x] Anagram shuffle tested (`TC-004`)
- [x] Answer normalization & validation tested (`TC-005`)
- [x] Progressive hint state tested (`TC-006`)
