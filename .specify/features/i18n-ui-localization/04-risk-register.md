# Risk Register & Scope Boundaries: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature Slug**: `i18n-ui-localization`
- **Backlog Reference**: `US-I18N-02` (EPIC 10: Multi-language & Internationalization)
- **Date**: 2026-08-22
- **Author**: Lead Business Analyst

---

## 1. Contradiction & Compatibility Scan

| Check Category              | Verification Item                                                    | Scan Result | Resolution / Status                                                                                                                                                     |
| :-------------------------- | :------------------------------------------------------------------- | :---------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logic Contradiction**     | Raw Backend Stack Trace vs Friendly Fallback                         | **Passed**  | `BR-I18N-002` explicitly guarantees that any unmapped error or server 500 error falls back to `errors:generic.unexpected_error`, strictly suppressing raw stack traces. |
| **Pluralization Asymmetry** | English plural rules (`_one`/`_other`) vs Vietnamese invariant nouns | **Passed**  | `BR-I18N-006` dictates `_one`/`_other` for English and base singular keys for Vietnamese, matching the linguistic grammar of both languages without contradiction.      |
| **Content Collision**       | System UI Chrome translation vs User-Generated Flashcards            | **Passed**  | `BR-I18N-003` defines a strict boundary: only UI Shell strings pass through `t()`, while UGC (terms, definitions, IPA transcriptions) is rendered verbatim.             |
| **Layout Integrity**        | Vietnamese text expansion (+20% to +40%) vs fixed width buttons      | **Passed**  | `BR-I18N-010` mandates flex-wrapping and container elasticity with CSS text truncation and tooltips where fixed bounds exist.                                           |
| **Error Flooding**          | High-frequency API failures causing screen toast spam                | **Passed**  | `BR-I18N-009` introduces a 2000ms debounce deduplication window for identical error toasts.                                                                             |

---

## 2. Risk Register

| ID                | Risk Description                                                                                                                                          | Prob. | Impact | Mitigation Strategy                                                                                                                                         |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :---: | :----: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-I18N-001** | **Unmapped Backend Error Code**: Backend API deploys a new error code not yet registered in `errors.json`, causing blank or raw English errors to appear. |  Med  |  Med   | Interceptor implements strict fallback to `errors:generic.unexpected_error` and emits a developer console warning with the unmapped code per `BR-I18N-002`. |
| **RISK-I18N-002** | **Accidental UGC Translation**: Flashcard front terms or IPA phonetic symbols passed into `t()` resulting in corrupted vocabulary displays.               |  Low  |  High  | Strict UI Shell Isolation (`BR-I18N-003` & `ASM-I18N-004`). Component architecture separates flashcard data props from localization hooks.                  |
| **RISK-I18N-003** | **UI Layout Breakage from Text Expansion**: Vietnamese strings overflowing button containers, table columns, or modal action footers.                     |  Med  |  Med   | Responsive design guidelines enforced via `BR-I18N-010` (`flex-wrap`, `min-w`, `truncate` with tooltips) tested on both mobile and desktop viewports.       |
| **RISK-I18N-004** | **Locale Desynchronization in Formatters**: `Intl` formatters utilizing a stale or mismatched locale tag while i18next language switches.                 |  Low  |  Med   | Implement unified `useLocaleFormat` custom hook that subscribes directly to `i18n.language` and updates canonical tags reactively (`BR-I18N-001`).          |
| **RISK-I18N-005** | **Toast Notification Storm**: Network outage triggering a rapid cascade of 5+ failed API toasts simultaneously.                                           |  Med  |  Low   | Implement toast rate-limiting and deduplication per `BR-I18N-009` (2000ms window).                                                                          |
| **RISK-I18N-006** | **Missing Pluralization Key**: English countable string missing `_other` key, displaying un-interpolated template variables.                              |  Low  |  Low   | Compile-time TypeScript schema validation and runtime fallback to base key per `BR-I18N-006`.                                                               |

---

## 3. Consolidated Assumptions & Constraints

### Assumptions (`ASM-I18N-###`)

- **`ASM-I18N-001`**: The error mapping layer maps backend enum/error strings (`errorCode`) to localized messages in `errors.json`; unmapped errors fallback to `errors:generic.unexpected_error` and never expose raw backend stack traces to end-users.
- **`ASM-I18N-002`**: All dates, relative times, and numbers across all features must use standard browser `Intl` API (`Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat`) parameterized dynamically by the active i18next language (`vi-VN` for `vi`, `en-US` for `en`).
- **`ASM-I18N-003`**: Pluralization for countable items (e.g., cards, reviews, days, streak freezes) must utilize i18next standard plural keys (`_one`, `_other` for English; base/other for Vietnamese).
- **`ASM-I18N-004`**: UI Shell Isolation strictly demarcates system chrome (labels, buttons, tooltips, toasts, modals, SRS rating buttons `Again`, `Hard`, `Good`, `Easy`) from User-Generated Content (cards, terms, definitions, phonetic transcripts, examples), guaranteeing UGC is rendered raw and untranslated.
- **`ASM-I18N-005`**: All 10+ core feature modules and their sub-screens must have 100% coverage in corresponding JSON translation namespaces (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`, `errors`).

### Constraints (`CST-I18N-###`)

- **`CST-I18N-001 (Tech Stack)`**: Must build upon `i18next`, `react-i18next`, native ECMAScript `Intl`, and `lucide-react` / Tailwind CSS in `apps/web`.
- **`CST-I18N-002 (Performance SLA)`**: Error mapping resolution < `2ms`; language switch UI re-render < `16ms` (P95); 0 page reloads.
- **`CST-I18N-003 (Zero Backend Migration)`**: `US-I18N-02` requires zero database schema modifications or ORM migrations.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 — Non-negotiable for Release)

- Comprehensive UI string extraction and translation into `vi` and `en` across all 12 modules (`common`, `auth`, `dashboard`, `decks`, `cards`, `study`, `practice`, `community`, `analytics`, `settings`, `gamification`, `ai_vocabulary`).
- Creation of `errors.json` (Vietnamese and English) covering all core backend error codes (Auth, Decks, Cards, Practice, AI, Network, Generic).
- Axios response interceptor for global API error translation with friendly fallback and stack trace suppression (`BR-I18N-002`).
- Centralized formatting utilities / hook (`useLocaleFormat`) utilizing `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.RelativeTimeFormat`.
- Implementation of standard i18next pluralization for countable entities (`cards`, `reviews`, `days`, `xp`).
- Strict UI Shell Isolation guaranteeing 0% translation of User-Generated Content (`BR-I18N-003`).
- Localized SRS rating action buttons (`Again` / `Lại`, `Hard` / `Khó`, `Good` / `Tốt`, `Easy` / `Dễ`) in study sessions (`BR-I18N-008`).

### Should-Have (P1 — Important for Complete Experience)

- Error toast deduplication & rate-limiting (2000ms window per `BR-I18N-009`).
- Dynamic `aria-label` attribute synchronization for all icon buttons, close triggers, and rating buttons (WCAG 2.1 AA).
- Layout overflow protection styling (`flex-wrap`, `truncate`) across all localized table headers, badge chips, and modal footers.

### Could-Have (P2 — Future Iterations)

- Integration with external translation management system (TMS) CLI (e.g. Crowdin / Lokalise sync script).
- Client-side error telemetry reporting to Sentry for unmapped error code tracking.

### Won't-Have (Explicitly Out of Scope for `US-I18N-02`)

- ❌ Automatic machine translation of User-Generated Flashcard content via Google Translate / DeepL API.
- ❌ Additional languages beyond Vietnamese (`vi`) and English (`en`) (e.g. French, Japanese, Spanish, Chinese).
- ❌ Backend database schema migrations (e.g. storing user language in PostgreSQL `User` table is scoped under User Profile Settings).
- ❌ Right-to-Left (RTL) directional layout changes (Arabic, Hebrew).
