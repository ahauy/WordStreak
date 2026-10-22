# Feature Specification: Product Analytics & GDPR Cookie Consent (US-GROW-03)

- **User Story:** `US-GROW-03: Analytics & Đo lường (Product Analytics)`
- **Epic:** `EPIC 12: UX Improvements & Growth`
- **Sprint:** `Sprint 10`
- **Status:** In Progress
- **Execution Tier:** Tier 1: Fast-Track

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
To optimize user activation and retention, WordStreak needs lightweight product telemetry tracking core retention funnels (first study session completion, goal onboarding completion, deck cloning) while strictly complying with GDPR privacy standards and never breaking when environment variables are omitted.

### Functional Requirements
- **`REQ-GROW-03-01: PostHog Analytics Client`**
  - Wraps `posthog-js` into a resilient singleton `analyticsService`.
  - Reads `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` (default: `https://us.i.posthog.com`).
  - If no key is set or environment is test/mock, client operates gracefully in no-op/mock mode without network errors.
  - Exposes `identifyUser(userId, traits)` and `resetUser()`.

- **`REQ-GROW-03-02: GDPR Cookie Consent & Privacy Compliance`**
  - Implements `CookieConsentBanner` mounted at the root layout.
  - Persists user choice in `localStorage` (`wordstreak_cookie_consent`: `"accepted"` | `"declined"`).
  - If user selects `"declined"`, calls `posthog.opt_out_capturing()` and sets persistence mode to memory.
  - If user selects `"accepted"`, calls `posthog.opt_in_capturing()`.
  - Design complies strictly with `apps/web/DESIGN.md`: `#ffffff` canvas, hairline border `#e5e5e5`, Obsidian black pill buttons (`rounded-full`), `Nunito`/`Inter` typography.

- **`REQ-GROW-03-03: Funnel & Retention Event Tracking`**
  - `study_session_completed`: `{ deckId, deckType, cardCount, xpEarned, durationSeconds }`
  - `onboarding_completed`: `{ learningGoal, startingLevel, dailyGoal }`
  - `deck_cloned`: `{ deckId, deckTitle }`

---

## 2. Technical Approach (`ponytail` Simplicity)

### Files to Touch / Create:
- `apps/web/src/services/analytics/analyticsService.ts`: Core singleton wrapper around `posthog-js`.
- `apps/web/src/services/analytics/types.ts`: Telemetry event names and type-safe payload definitions.
- `apps/web/src/components/analytics/CookieConsentBanner.tsx`: Accessible GDPR banner adhering to Obsidian design tokens.
- `apps/web/src/features/onboarding/components/OnboardingWizard.tsx`: Trigger `trackOnboardingCompleted`.
- `apps/web/src/features/reviews/pages/ReviewSessionPage.tsx`: Trigger `trackStudySessionCompleted`.
- `apps/web/src/features/community/pages/CommunityDecksPage.tsx`: Trigger `trackDeckCloned`.
- `apps/web/src/App.tsx`: Mount `CookieConsentBanner`.

---

## 3. Test Plan & Test Cases

- `TC-ANALYTICS-001`: `analyticsService.init()` initializes safely without key, operating in no-op mode without throws.
- `TC-ANALYTICS-002`: `analyticsService.track()` dispatches event to posthog when initialized and consented; prevents dispatch when opted out.
- `TC-ANALYTICS-003`: `analyticsService.setConsent('declined')` calls `posthog.opt_out_capturing()`.
- `TC-ANALYTICS-004`: `CookieConsentBanner` renders if no consent preference exists in storage.
- `TC-ANALYTICS-005`: Clicking "Accept" in `CookieConsentBanner` saves `"accepted"` and dismisses banner.
- `TC-ANALYTICS-006`: Clicking "Decline" in `CookieConsentBanner` saves `"declined"`, opts out, and dismisses banner.
- `TC-ANALYTICS-007`: Event helpers format telemetry payload correctly.
