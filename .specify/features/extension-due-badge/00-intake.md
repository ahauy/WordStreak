# Intake: Extension Due Cards Badge (`US-ECO-05`)

- **Date**: 2026-10-12
- **Requested by**: Product Owner / Product Backlog Roadmap (`EPIC-09 / US-ECO-05`)
- **Feature Slug**: `extension-due-badge`
- **Classification**: Bounded Task
- **Classification signals**:
  - **New or changed domain entities**: `0` (Zero database entities; consumes `ReviewSummaryDto` from `@wordstreak/shared-types` and stores lightweight client-side cache `{ summary, etag, fetchedAt }` in `chrome.storage.local` alongside typed `ExtensionMessage` variants).
  - **Existing DB schema change required**: `No` (Zero Prisma migrations; backend endpoint `GET /api/reviews/summary` from `US-REM-01` is already live).
  - **Screens/flows touched**: `1` (Chrome Extension MV3 toolbar action badge & `chrome.alarms` scheduling flow across `apps/extension` background service worker, popup, content script, and `apps/web` review completion `window.postMessage` bridge).
  - **User roles affected**: `1` (`Authenticated Learner` with the WordStreak Chrome Extension installed; unauthenticated/logged-out users see a cleared badge).
  - **Cross-cutting (auth, billing, gamification core)**: `No` (Read-only consumption of `GET /api/reviews/summary` with `If-None-Match` ETag caching; does not alter SM-2 scheduling, XP awards, or streak formulas).
  - **Reversible without user-facing consequence**: `Yes` (Additive MV3 `alarms` permission, badge renderer, and postMessage sync trigger; completely reversible with zero data impact).
- **Protocol selected**: Bounded Task (Stages 1 → 2 rapid interview [2–3 targeted questions] → 4 light domain model → 5 light risk & contradiction scan → 6 User Stories & requirements → 7 IEEE 29148 validation → 8 handover; Stage 3 Gap Analysis skipped).
- **Override**: None

## One-line problem statement

Display and automatically synchronize the learner's due flashcard count (`dueCount`) on the WordStreak Chrome Extension (Manifest V3) toolbar icon using event-driven triggers (`onStartup`, `onInstalled`, popup open, Web SSO review sync) and smart `chrome.alarms` scheduling (`nextDueAt` + periodic fallback with ETag `304 Not Modified` caching), hiding the badge whenever `dueCount = 0` or the user is logged out.
