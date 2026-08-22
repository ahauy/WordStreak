# Test Plan: Complete UI Localization & Error Mapping

**Feature slug**: `i18n-ui-localization`  
**Epics**: `EPIC-10` (Multi-language & Internationalization — US-I18N-02)  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: Senior Frontend Developer — Stage TDD (Implementation)  
**Traces to**: `.specify/features/i18n-ui-localization/spec.md`, `.specify/features/i18n-ui-localization/plan.md`

---

## 1. Unit & Utility Tests (`apps/web/src/locales`)

### Dictionary Parity & Pluralization

#### TC-I18N-001: 100% Dictionary Symmetry & Non-Empty Strings

```gherkin
Given all 12 domain namespaces + errors JSON files in "en" and "vi"
When  comparing key paths recursively between "en" and "vi"
Then  every key path in "en" must exist in "vi"
  And every key path in "vi" must exist in "en" (except valid plural forms _one/_other)
  And all translation string values must be non-empty strings
```

- **File**: `apps/web/src/locales/__tests__/i18n-parity.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-007`, `REQ-I18N-001`

#### TC-I18N-002: English Pluralization & Interpolation Keys

```gherkin
Given countable entities in decks, cards, gamification, and practice
When  i18next resolves plural keys with count
Then  count = 1 resolves to `_one` in English ("1 card")
  And count = 0 or count > 1 resolves to `_other` in English ("0 cards", "5 cards")
  And Vietnamese resolves invariant base key with `{{count}}` ("1 thẻ", "5 thẻ")
```

- **File**: `apps/web/src/locales/__tests__/i18n-parity.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-006`

---

### Intl Formatting Utilities (`apps/web/src/locales/utils/formatters.ts`)

#### TC-I18N-003: Number and XP Formatting with Canonical BCP-47 Tags

```gherkin
Given numeric quantities (e.g. 10000, 12450.5, 0)
When  formatNumber or formatXp is called with "vi" (vi-VN)
Then  thousands separator is "." and decimal separator is "," (e.g. "10.000 XP")
When  formatNumber or formatXp is called with "en" (en-US)
Then  thousands separator is "," and decimal separator is "." (e.g. "10,000 XP")
```

- **File**: `apps/web/src/locales/__tests__/formatters.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-001`, `BR-I18N-004`

#### TC-I18N-004: Date and Relative Time Formatting

```gherkin
Given a calendar timestamp
When  formatDate is called with "vi"
Then  date outputs format "DD/MM/YYYY" (or canonical Vietnamese locale format)
When  formatDate is called with "en"
Then  date outputs format "MM/DD/YYYY" (or canonical US locale format)
When  formatRelativeTime is called with elapsed seconds/minutes/hours/days
Then  outputs localized relative string (e.g. "2 giờ trước" / "2 hours ago")
```

- **File**: `apps/web/src/locales/__tests__/formatters.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-005`

---

### Error Mapping & Sanitization (`apps/web/src/locales/utils/errorMapper.ts`)

#### TC-I18N-005: Backend Error Code Resolution & Sanitization

```gherkin
Given backend API exceptions with known errorCodes (AUTH_INVALID_CREDENTIALS, DECK_NOT_FOUND, etc.)
When  mapApiError(error, t) is invoked
Then  it resolves to localized user-friendly message from errors.json
  And zero stack traces, SQL tokens, or database internals leak into output
```

- **File**: `apps/web/src/locales/__tests__/errorMapper.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-002`, User Scenario 3

#### TC-I18N-006: Unmapped Codes & HTTP Fallback

```gherkin
Given unmapped 404, 403, 401, 500, or ECONNABORTED network drop
When  mapApiError(error, t) is invoked
Then  HTTP 401 maps to auth.unauthorized
  And network failure / timeout maps to network.connection_failed
  And unknown 500 or generic errors fallback to generic.unexpected_error
```

- **File**: `apps/web/src/locales/__tests__/errorMapper.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-002`, `REQ-I18N-002`

#### TC-I18N-007: Error Toast Deduplication (2000ms Window)

```gherkin
Given rapid duplicate error events within 2000ms
When  isDuplicateToast(key, 2000) is checked
Then  first call returns false (allow toast)
  And subsequent duplicate calls within 2000ms return true (suppress toast)
  And calls after 2000ms window return false (allow toast again)
```

- **File**: `apps/web/src/locales/__tests__/errorMapper.test.ts`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-009`, User Scenario 4

---

## 2. Component & Hook Tests (`apps/web/src`)

### SRS Rating & UGC Isolation

#### TC-I18N-008: SRS Rating Button Localization & Interval Cues

```gherkin
Given Study session is active and card answer is revealed
When  viewing SrsRatingButtons in "vi"
Then  buttons show "Lại" (< 10p), "Khó" (1 ngày), "Tốt" (4 ngày), "Dễ" (10 ngày)
When  switching to "en"
Then  buttons show "Again" (< 10m), "Hard" (1d), "Good" (4d), "Easy" (10d)
  And keyboard shortcuts [1, 2, 3, 4] remain identical
```

- **File**: `apps/web/src/features/reviews/components/__tests__/SrsRatingButtons.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-008`, User Scenario 2

#### TC-I18N-009: Strict UGC Content Preservation

```gherkin
Given a flashcard with English term "ephemeral", phonetic "/ɪˈfem.ər.əl/", definition "lasting for a very short time"
When  rendered in Vietnamese locale ("vi")
Then  term, phonetic, and definition are preserved 100% untranslated
  And surrounding UI chrome (buttons, headers, badges) is translated into Vietnamese
```

- **File**: `apps/web/src/features/cards/components/__tests__/CardIsolation.spec.tsx`
- **Priority**: Must-Have
- **Traces to**: `BR-I18N-003`
