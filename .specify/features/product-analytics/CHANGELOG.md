# Changelog - Product Analytics (US-GROW-03)

## [1.0.0] - 2026-10-22

### Added
- **Core Telemetry Singleton** (`analyticsService.ts`): Resilient PostHog wrapper with lazy initialization via `VITE_POSTHOG_KEY`, safe fallback in dev/test, and user identity mapping (`identifyUser`, `resetUser`).
- **GDPR Cookie Consent Banner** (`CookieConsentBanner.tsx`): Minimalist Obsidian Pill banner adhering to `DESIGN.md` tokens with local storage consent persistence (`accepted` / `declined`).
- **Funnel & Retention Event Tracking**:
  - `study_session_completed`: Triggered upon completion in `ReviewSessionPage.tsx`.
  - `onboarding_completed`: Triggered after wizard completion in `OnboardingWizard.tsx`.
  - `deck_cloned`: Triggered upon cloning in `CommunityDecksPage.tsx`.
- **Localization**: Bilingual strings (`en` and `vi`) in `common.json`.
- **Automated Tests**: 11 new tests across `analyticsService.spec.ts` (7 tests) and `CookieConsentBanner.spec.tsx` (4 tests), bringing test suite to 94 files / 514 tests passing.
