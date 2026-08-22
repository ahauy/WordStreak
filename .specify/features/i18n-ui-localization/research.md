# Research & Technical Decisions: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature**: `i18n-ui-localization`
- **Epics**: `EPIC-10` (Multi-language & Internationalization)
- **Status**: APPROVED
- **Date**: 2026-08-22
- **Author**: Principal System Architect

---

## 1. Research Decision 1: Locale Dictionary Partitioning & Namespace Management

### Context

WordStreak requires 100% localization for 12 core domains (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`) plus `errors`. We evaluated bundle splitting vs static bundling.

### Decision

- Maintain JSON files statically bundled in `apps/web/src/locales/{en,vi}/*.json` and initialized synchronously via `apps/web/src/locales/i18n.ts`.
- Export typed resources via `TranslationNamespaces` in `apps/web/src/locales/types.ts`.

### Rationale

- Total uncompressed dictionary size across all 13 files per locale is ~45KB (< 12KB gzipped).
- Static in-bundle loading avoids network roundtrips, flash of untranslated content (FOUC), and async suspense complexity when switching languages.
- Enables TypeScript compile-time type safety via `declare module "i18next"`.

### Alternatives Considered

- _Dynamic HTTP backend loading (`i18next-http-backend`)_: Adds unnecessary network latency, layout shift during initial load, and offline failure risks without meaningful bundle savings for an MVP.
- _Single monolithic `translation.json`_: Poor developer experience with merge conflicts and unmaintainable multi-thousand-line JSON files.

---

## 2. Research Decision 2: Cultural Formatting Engine (`Intl` Standard vs External Libraries)

### Context

Formatting dates (`DD/MM/YYYY` vs `MM/DD/YYYY`), relative time deltas (`"2 giờ trước"` vs `"2 hours ago"`), numbers/XP (`10.000 XP` vs `10,000 XP`), and percentages must react instantaneously to locale switches.

### Decision

- Standardize on native browser ECMAScript `Intl` APIs (`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`) wrapped in a lightweight utility module `apps/web/src/locales/utils/formatters.ts` and React hook `useLocaleFormat`.
- Map `'vi'` to `'vi-VN'` and `'en'` to `'en-US'`.

### Rationale

- Zero bundle size overhead (0 extra npm dependencies).
- Native browser performance (sub-millisecond execution).
- Full compliance with BCP-47 locale standards.

### Alternatives Considered

- _`date-fns` / `date-fns/locale`_: Increases web bundle size by ~30KB and requires managing separate locale objects for date calculations.
- _`numeral.js` or `accounting.js`_: Legacy libraries that lack modern Vietnamese locale customization and ECMAScript compliance.

---

## 3. Research Decision 3: Centralized API Error Interception & Sanitization

### Context

Backend services return structured JSON error payloads containing `errorCode`, `message`, `statusCode`, and in debug/crash situations, raw SQL or Prisma exception strings. We need friendly user messages and strict sanitization.

### Decision

- Create `apps/web/src/locales/utils/errorMapper.ts` with a lookup table `errorRegistry` mapping backend `errorCode` strings to `errors:<domain>.<key>`.
- Hook into the Axios response interceptor in `apps/web/src/common/api/axios.ts`.
- Implement a 2000ms deduplication sliding window for consecutive identical error toasts (`BR-I18N-009`).
- Fallback strictly to `errors:generic.unexpected_error` on unmapped or 500 errors.

### Rationale

- Prevents security leaks (table names, internal paths, SQL tokens).
- Provides consistent, translated error messages regardless of which component dispatched the request.
- Protects UI from notification flooding during network outages or button spam.

### Alternatives Considered

- _Per-component `try/catch` toast dispatch_: Highly error-prone, duplicates error-mapping code across 50+ components, and inevitably misses edge cases.
- _Backend-driven localized messages_: Couples backend business logic to user's ephemeral browser locale and prevents client-side locale switching from updating existing errors.

---

## 4. Research Decision 4: User-Generated Content (UGC) Isolation Architecture

### Context

WordStreak is an English vocabulary learning platform. Flashcard front words (`"resilience"`), definitions, phonetic IPA (`/rɪˈzɪl.jənt/`), example sentences, and user notes must **never** be translated into Vietnamese when the UI language is switched (`BR-I18N-003`).

### Decision

- Clear architectural separation between UI Chrome components (which use `t('namespace:key')`) and Data Display components (which receive typed model props and render raw strings directly).
- Flashcard and SRS review components strictly localize action buttons (`Again` / `Lại`, `Hard` / `Khó`, `Good` / `Tốt`, `Easy` / `Dễ`) and interval durations, but render card data untouched.

### Rationale

- Preserves learning integrity: learners studying English terms must see the exact English vocabulary and phonetic transcriptions.

---

## 5. Research Decision 5: Layout Expansion & Anti-Overflow (+40% Tolerance)

### Context

Vietnamese text expansion typically requires 30% to 40% more horizontal space than English (e.g. `"Decks"` -> `"Bộ từ vựng"`, `"Study Now"` -> `"Bắt đầu ôn tập"`).

### Decision

- Adopt defensive Tailwind CSS patterns across all buttons, header menus, and card badges:
  - Avoid fixed widths (`w-24`, `w-32`) on action buttons; use `px-4 py-2 min-w-[...]` or `flex-1`.
  - Use `flex-wrap` on button toolbars and metadata chips.
  - Use `truncate` + `title="..."` or tooltip only for user deck titles and card terms, never for action buttons.
  - Ensure minimum touch target size (44x44px) is preserved.

### Rationale

- Guarantees zero UI clipping or horizontal scrolling on mobile and desktop viewports (`BR-I18N-010`).
