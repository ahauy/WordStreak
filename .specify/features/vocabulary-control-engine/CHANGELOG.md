# Changelog — Feature: Vocabulary Control Engine for Examples (US-LIB-13)

All notable changes to this feature specification and implementation are documented here.

## [v1.0] - 2026-10-21
### Completed
- Implemented `scripts/seed/lib/vocabulary-control.ts`:
  - `CORE_FUNCTION_WORDS`: set of standard closed-class grammatical words (pronouns, prepositions, articles, auxiliary verbs).
  - `NGSL_TOP_500_WORDS`: foundational vocabulary lemmas for Beginner mode (`example_easy_en`).
  - `NGSL_TSL_COMBINED_WORDS`: comprehensive vocabulary lemmas for Standard TOEIC mode (`example_en`).
  - `cleanToken` & `stemToken`: morphological stemming supporting plurals (-s, -es, -ies), past tense (-ed, -d, -ied), gerunds (-ing), adverbs (-ly, -ily), and agent nouns (-er, -ers).
  - `checkSentenceVocabularyCoverage`: calculates total tokens, covered tokens, coverage percentage, and lists out-of-vocabulary words.
  - `validateSentenceDifficulty`: enforces 5–8 words and 100% NGSL Top 500 coverage for beginner mode, and $\ge 95\%$ coverage for standard TOEIC mode.
- Integrated difficulty validation into `validateEnrichedWord()` in `scripts/seed/lib/validation-rules.ts`.
- Verified test suite:
  - 11 unit tests in `scripts/seed/__tests__/vocabulary-control.spec.ts` passed.
  - 6 unit tests in `scripts/seed/__tests__/validator.spec.ts` passed.
  - All 9 test files (38 tests) in `scripts/seed/__tests__/` passed.
  - Full workspace regression: 42 API test suites (373 tests) and 80 Web test suites (455 tests) passed with 0 errors.
