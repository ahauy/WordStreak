# Technical Architecture Plan: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature**: `i18n-ui-localization`
- **Epics**: `EPIC-10` (Multi-language & Internationalization)
- **Status**: SPECIFIED
- **Date**: 2026-08-22
- **Author**: Principal System Architect

---

## 1. Technical Architecture Overview

The UI localization architecture builds upon the core `i18next` and `react-i18next` integration established in `US-I18N-01`. It expands the engine to achieve 100% UI chrome translation, structured error mapping, and culturally accurate dynamic data formatting across all pages and features in `apps/web`.

```
apps/web/src/
├── locales/
│   ├── en/                             # English JSON resource dictionaries (12 domain namespaces + errors)
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── decks.json
│   │   ├── cards.json                  # [NEW] Flashcard CRUD, Table, Bulk Actions
│   │   ├── study.json                  # [NEW] SRS Flashcard Review & Ratings
│   │   ├── practice.json               # [EXPANDED] 5 Quiz Modes + Voice Assessment
│   │   ├── community.json
│   │   ├── analytics.json
│   │   ├── settings.json
│   │   ├── gamification.json           # [NEW] Streaks, XP, Badges, Mascots
│   │   ├── ai_vocabulary.json          # [NEW] AI Generator Modal & Prompts
│   │   └── errors.json                 # [NEW] Centralized API Error Code Registry
│   ├── vi/                             # Vietnamese JSON resource dictionaries
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── decks.json
│   │   ├── cards.json
│   │   ├── study.json
│   │   ├── practice.json
│   │   ├── community.json
│   │   ├── analytics.json
│   │   ├── settings.json
│   │   ├── gamification.json
│   │   ├── ai_vocabulary.json
│   │   └── errors.json
│   ├── utils/
│   │   ├── formatters.ts               # [NEW] Intl.NumberFormat, DateTimeFormat, RelativeTimeFormat helpers
│   │   ├── errorMapper.ts              # [NEW] Axios Error Mapper & Toast Rate Limiter
│   │   └── storage.ts                  # LocalStorage sync helper
│   ├── hooks/
│   │   └── useLocaleFormat.ts          # [NEW] Reactive hook for locale-aware formatting
│   ├── constants.ts                    # Supported locales, canonical BCP-47 tags
│   ├── types.ts                        # TranslationNamespaces, ErrorCodeKey, Strong typings
│   ├── i18n.ts                         # i18next instance configuration
│   └── index.ts                        # Barrel exports
```

---

## 2. Implementation Slices

### Slice 1: Locale Dictionary Expansion (12 Namespaces + Errors Dictionary) & Types

- Expand `apps/web/src/locales/en/` and `apps/web/src/locales/vi/` to include all 13 dictionary files:
  - Add `cards.json` (Table headers, modal labels, form inputs, status chips, bulk action bars).
  - Add `study.json` (SRS rating buttons `Again`/`Hard`/`Good`/`Easy`, intervals, summary stats).
  - Add `gamification.json` (Streak counters, freeze alerts, level up modals, XP gains, flame mascots).
  - Add `ai_vocabulary.json` (Topic prompts, CEFR levels, card count sliders, generation states).
  - Add `errors.json` (Auth, decks, cards, practice, ai, network, and generic error messages).
  - Update `common.json`, `auth.json`, `dashboard.json`, `decks.json`, `practice.json`, `community.json`, `analytics.json`, `settings.json` for full coverage and Vietnamese linguistic accuracy.
- Update `apps/web/src/locales/types.ts` to register all 13 namespaces in `TranslationResources` and `declare module 'i18next'`.
- Update `apps/web/src/locales/index.ts` and `apps/web/src/locales/i18n.ts` to load all namespaces into the active runtime.

### Slice 2: Centralized Intl Formatting Helpers (`formatters.ts` & `useLocaleFormat`)

- Create `apps/web/src/locales/utils/formatters.ts`:
  - `formatNumber(value: number, locale: SupportedLocale, options?: Intl.NumberFormatOptions): string`: Formats numbers/XP with canonical BCP-47 (`10.000 XP` in `vi-VN` vs `10,000 XP` in `en-US`).
  - `formatDate(date: Date | string | number, locale: SupportedLocale, options?: Intl.DateTimeFormatOptions): string`: Formats calendar dates (`DD/MM/YYYY` in `vi-VN` vs `MM/DD/YYYY` in `en-US`).
  - `formatRelativeTime(date: Date | string | number, locale: SupportedLocale): string`: Calculates time delta and formats with `Intl.RelativeTimeFormat` (`"2 giờ trước"`, `"2 hours ago"`).
  - `formatPercent(value: number, locale: SupportedLocale, options?: Intl.NumberFormatOptions): string`: Formats percentages (`95,5%` in `vi-VN` vs `95.5%` in `en-US`).
- Create `apps/web/src/locales/hooks/useLocaleFormat.ts`:
  - Custom React hook subscribing to active i18next language and providing reactive formatting methods.

### Slice 3: Axios Error Interceptor & Error Mapper (`errorMapper.ts`)

- Create `apps/web/src/locales/utils/errorMapper.ts`:
  - `errorRegistry`: Mapping backend error codes (`AUTH_INVALID_CREDENTIALS`, `DECK_NOT_FOUND`, `CARD_LIMIT_EXCEEDED`, etc.) to `errors:<namespace>.<key>`.
  - `mapApiError(error: unknown): { key: string; message: string }`: Resolves Axios error, network drop (`ERR_NETWORK`), or HTTP status to translated string.
  - `isDuplicateToast(key: string, windowMs?: number): boolean`: 2000ms sliding window rate-limiter for toast deduplication (`BR-I18N-009`).
  - Strict sanitization: Prevents Prisma/SQL errors and stack traces from reaching end users (`BR-I18N-002`).
- Update `apps/web/src/common/api/axios.ts`:
  - Enhance response interceptor to utilize `mapApiError` when handling rejections and dispatching notifications.

### Slice 4: Landing & Authentication UI Localization

- Audit & localize:
  - `apps/web/src/pages/LandingPage.tsx`
  - `apps/web/src/features/landing/components/HeroSection.tsx`
  - `apps/web/src/features/landing/components/FeatureGrid.tsx`
  - `apps/web/src/features/landing/components/CallToAction.tsx`
  - `apps/web/src/features/landing/components/LandingFooter.tsx`
  - `apps/web/src/features/auth/pages/LoginPage.tsx` & `RegisterPage.tsx`
  - `apps/web/src/features/auth/components/LoginForm.tsx` & `RegisterForm.tsx`
  - `apps/web/src/features/auth/components/AuthShowcase.tsx`
- Replace all static text with `t('auth:...')` and `t('common:...')`.

### Slice 5: Dashboard, Decks & Cards UI Localization

- Audit & localize:
  - `apps/web/src/features/dashboard/pages/DashboardPage.tsx` & widgets (`DashboardStatsGrid`, `StreakHeroBanner`, `StreakWidget`, `DecksPreviewSection`, `FlameNurtureModal`, `StreakCelebrationModal`).
  - `apps/web/src/features/decks/pages/DecksPage.tsx` & `DeckDetailPage.tsx`.
  - `apps/web/src/features/decks/components/CreateDeckModal.tsx`, `EditDeckModal.tsx`, `DeckCard.tsx`, `DeckHeader.tsx`, `DeckFilterBar.tsx`.
  - `apps/web/src/features/cards/components/AddCardModal.tsx`, `EditCardModal.tsx`, `DeleteCardConfirmModal.tsx`, `CardDataTable.tsx`, `CardItemCard.tsx`, `BulkActionsToolbar.tsx`, `BulkMoveModal.tsx`.
  - `apps/web/src/components/deck/DeckImportModal.tsx`, `DeckExportModal.tsx`, `ImportPreviewTable.tsx`.
- Enforce strict UGC preservation: Card terms, phonetics, definitions, and user notes are rendered verbatim (`BR-I18N-003`).

### Slice 6: SRS Study Session & Spaced Repetition UI Localization

- Audit & localize:
  - `apps/web/src/features/reviews/pages/StudyPage.tsx` & `ReviewSession.tsx`.
  - `apps/web/src/features/reviews/components/ReviewCard.tsx` (front prompt, back flip button).
  - `apps/web/src/features/reviews/components/SrsRatingButtons.tsx`:
    - Localize Rating 1 (`Lại` / `Again`), Rating 2 (`Khó` / `Hard`), Rating 3 (`Tốt` / `Good`), Rating 4 (`Dễ` / `Easy`) (`BR-I18N-008`).
    - Localize interval previews (`< 10p` / `< 10m`, `1 ngày` / `1d`, `4 ngày` / `4d`, `10 ngày` / `10d`).
  - `apps/web/src/features/reviews/components/StudySummaryModal.tsx` (XP earned, retention percentage, cards reviewed counter).

### Slice 7: Practice Quiz Modes & Voice Assessment UI Localization

- Audit & localize:
  - `apps/web/src/features/practice/pages/PracticePage.tsx`.
  - `apps/web/src/features/practice/components/MultipleChoiceQuiz.tsx`.
  - `apps/web/src/features/practice/components/FillInTheBlankQuiz.tsx`.
  - `apps/web/src/features/practice/components/WordMatchingQuiz.tsx`.
  - `apps/web/src/features/practice/components/ListeningQuiz.tsx`.
  - `apps/web/src/features/practice/components/SpeechPronunciationPractice.tsx`.
  - `apps/web/src/features/practice/components/QuizSummaryModal.tsx`.
  - `apps/web/src/components/voice/AccentAudioSelector.tsx`, `MicPermissionBanner.tsx`, `PhoneticWordBreakdown.tsx`, `PronunciationPracticeModal.tsx`, `PronunciationScoreBadge.tsx`.

### Slice 8: Community, Analytics, Gamification & Settings UI Localization

- Audit & localize:
  - `apps/web/src/features/community/pages/CommunityDecksPage.tsx`, `CommunityDeckCard.tsx`, `CommunityDeckPreviewModal.tsx`, `RateDeckModal.tsx`, `CategoryFilterBar.tsx`.
  - `apps/web/src/features/analytics/pages/AnalyticsPage.tsx`, `ActivityHeatmap.tsx`, `MasteryDistributionCard.tsx`, `AnalyticsHeroStats.tsx`, `DeckProgressTable.tsx`, `DashboardAnalyticsWidget.tsx`.
  - `apps/web/src/features/gamification/components/LevelUpModal.tsx`, `StreakBanner.tsx`, `XpBadge.tsx`, `StreakFreezeModal.tsx`.
  - `apps/web/src/features/user-profile/pages/UserProfileModal.tsx`, `LanguageSelector.tsx`, `ThemeSettings.tsx`.
  - `apps/web/src/components/LanguageSwitcher/LanguageSwitcher.tsx`.

### Slice 9: AI Vocabulary Generator UI Localization

- Audit & localize:
  - `apps/web/src/features/ai-vocabulary/components/AiDeckGeneratorModal.tsx` (or AI generation modal triggers).
  - CEFR level options (A1-C2), topic guidance placeholders, progress states, and error handling.

### Slice 10: Vitest Automation & Verification

- Unit & Component Test Suite:
  - `formatters.spec.ts`: Test `formatNumber`, `formatDate`, `formatRelativeTime`, `formatPercent` in `vi` and `en` with edge cases.
  - `errorMapper.spec.ts`: Test error code resolution, fallback behavior, network offline handling, and 2000ms deduplication rate limiter.
  - `i18n.spec.ts`: Test dictionary symmetry (all keys in `en` exist in `vi`), pluralization rules (`_one`/`_other`), and runtime language switching.
  - `SrsRatingButtons.spec.tsx`: Test SRS rating label rendering in `vi` and `en`.
  - `AddCardModal.spec.tsx` & `ReviewCard.spec.tsx`: Test UGC isolation (card word untranslated).

---

## 3. Component Localization Audit & Migration Matrix

| Component File                                                              | Namespace(s)                          | Hardcoded Strings Migrated                      | UGC Boundary Verified |
| :-------------------------------------------------------------------------- | :------------------------------------ | :---------------------------------------------- | :-------------------: |
| `apps/web/src/components/layout/Header.tsx`                                 | `common`                              | Navigation links, Logout, Brand                 |          N/A          |
| `apps/web/src/components/LanguageSwitcher/LanguageSwitcher.tsx`             | `common`, `settings`                  | Language labels, Accessibility tags             |          N/A          |
| `apps/web/src/pages/LandingPage.tsx`                                        | `common`, `auth`                      | Hero, CTA, Feature benefits, Footer             |          N/A          |
| `apps/web/src/features/auth/components/LoginForm.tsx`                       | `auth`, `common`, `errors`            | Email/password labels, submit, forgot password  |          N/A          |
| `apps/web/src/features/auth/components/RegisterForm.tsx`                    | `auth`, `common`, `errors`            | Name/email/password fields, CTA, terms          |          N/A          |
| `apps/web/src/features/dashboard/pages/DashboardPage.tsx`                   | `dashboard`, `gamification`, `common` | Welcome banner, quick actions, stats            |          N/A          |
| `apps/web/src/features/decks/pages/DecksPage.tsx`                           | `decks`, `common`                     | Title, create deck button, search, filters      |  ✅ Deck titles UGC   |
| `apps/web/src/features/decks/pages/DeckDetailPage.tsx`                      | `decks`, `cards`, `common`            | Tab headers, study button, stats, empty states  |  ✅ Deck titles UGC   |
| `apps/web/src/features/cards/components/AddCardModal.tsx`                   | `cards`, `ai_vocabulary`, `common`    | Form labels, AI auto-fill button, hints         |    ✅ Term/Def UGC    |
| `apps/web/src/features/cards/components/EditCardModal.tsx`                  | `cards`, `ai_vocabulary`, `common`    | Form labels, save button, auto-fill             |    ✅ Term/Def UGC    |
| `apps/web/src/features/cards/components/CardDataTable.tsx`                  | `cards`, `common`                     | Table columns (Word, Phonetic, Meaning, Status) |    ✅ Row data UGC    |
| `apps/web/src/features/cards/components/BulkActionsToolbar.tsx`             | `cards`, `common`                     | Selected count pluralization, action triggers   |          N/A          |
| `apps/web/src/features/reviews/pages/StudyPage.tsx`                         | `study`, `common`                     | Study header, progress counter, exit prompt     |   ✅ Front/Back UGC   |
| `apps/web/src/features/reviews/components/SrsRatingButtons.tsx`             | `study`                               | Again/Hard/Good/Easy buttons, interval duration |          N/A          |
| `apps/web/src/features/reviews/components/StudySummaryModal.tsx`            | `study`, `gamification`, `common`     | Score summary, XP earned, retention rate        |          N/A          |
| `apps/web/src/features/practice/pages/PracticePage.tsx`                     | `practice`, `common`                  | Mode selection cards, instructions              |          N/A          |
| `apps/web/src/features/practice/components/MultipleChoiceQuiz.tsx`          | `practice`, `common`                  | Question prompt, check answer, next button      | ✅ Answer choices UGC |
| `apps/web/src/features/practice/components/SpeechPronunciationPractice.tsx` | `practice`, `common`                  | Mic prompts, assessment feedback, score badge   |  ✅ Target word UGC   |
| `apps/web/src/features/community/pages/CommunityDecksPage.tsx`              | `community`, `common`                 | Search, categories, clone button, rating count  |  ✅ Deck titles UGC   |
| `apps/web/src/features/analytics/pages/AnalyticsPage.tsx`                   | `analytics`, `common`                 | Heatmap legend, retention graphs, filters       |          N/A          |
| `apps/web/src/features/gamification/components/LevelUpModal.tsx`            | `gamification`, `common`              | Level title, congratulations, claim XP          |          N/A          |
| `apps/web/src/components/deck/DeckImportModal.tsx`                          | `decks`, `cards`, `common`            | CSV upload instructions, preview headers        | ✅ Imported data UGC  |
