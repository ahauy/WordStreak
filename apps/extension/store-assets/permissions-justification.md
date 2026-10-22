# Chrome Web Store Permissions Justification

## Single Purpose Statement
The WordStreak extension serves a single, dedicated purpose: **allowing users to capture English vocabulary words along with their surrounding sentence context from web pages, and review them using an integrated spaced repetition flashcard system.**

Every permission requested in `manifest.json` is strictly required to deliver this single core capability:

---

## Detailed Permissions Breakdown

### 1. `storage`
- **Purpose:** Used to persist user authentication tokens (`accessToken`, `refreshToken`), user preferences (reminder schedules, quiet hours, badge toggle), and cached review due counts locally in the browser (`chrome.storage.local` and `chrome.storage.sync`).
- **Why Required:** Without `storage`, the extension cannot remain authenticated or remember the user's notification preferences across browser sessions.

### 2. `activeTab`
- **Purpose:** Enables reading user-highlighted text and the surrounding DOM sentence context only on the currently active tab when the user explicitly triggers vocabulary capture.
- **Why Required:** Ensures minimal privilege access to extract the selected word and example sentence context without broad arbitrary access.

### 3. `contextMenus`
- **Purpose:** Registers a browser right-click context menu item: *"Save '[selected word]' to WordStreak"*.
- **Why Required:** Allows users to easily add new vocabulary words directly from any webpage using standard mouse interactions.

### 4. `scripting`
- **Purpose:** Injects the lightweight helper script to detect sentence boundaries and extract the contextual sentence surrounding the user's selected word on the active tab.
- **Why Required:** Rich contextual flashcards require both the target word and the surrounding sentence to maximize spaced repetition retention.

### 5. `tabs`
- **Purpose:** Used when the user clicks the "Review Now" button on study reminder notifications or clicks the badge to open the WordStreak web app review page (`/review`) in a new browser tab or focus an existing one.
- **Why Required:** Provides a smooth navigation transition from notification to the web review session.

### 6. `alarms`
- **Purpose:** Used to schedule periodic, low-frequency background checks for due flashcards (every 30–60 minutes or at user-specified reminder times) and dynamic badge updates.
- **Why Required:** In Manifest V3, persistent background pages are replaced with event-driven Service Workers. The `alarms` API is the Google-recommended mechanism for event-driven periodic tasks.

### 7. `notifications`
- **Purpose:** Delivers native desktop study notifications to alert the user when flashcards are due or when their daily streak is at risk of expiring.
- **Why Required:** Spaced repetition memory consolidation requires timely reviews before memory decay occurs. All notifications respect user-configured Quiet Hours.

### 8. Host Permissions (`<all_urls>`, `https://*.wordstreak.com/*`, `http://localhost:*/*`)
- **Purpose:**
  - `<all_urls>`: Allows the content script to run on any website where the user reads English content (news, technical docs, blogs) so they can highlight and capture words.
  - `https://*.wordstreak.com/*`: Communicates with the WordStreak backend API to authenticate, fetch due cards, and submit review results.
  - `http://localhost:*/*`: Used solely for local development and integration testing.
- **Why Required:** Users encounter unknown vocabulary across the entire open web; restricting to specific domains would break the primary capture workflow.
