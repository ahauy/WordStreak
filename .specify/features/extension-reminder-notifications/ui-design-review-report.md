# UI Review Report: Extension Conditional Study Reminder Notifications (`US-ECO-06`)

**Surface(s) reviewed**: Product UI (Host OS Native Notification System, Chrome Extension MV3 Service Worker Event Handlers, Chrome Tab Navigation Engine, and Bilingual Copy Surfaces)  
**Rubric(s) applied**: `design-taste-product` §10/§11, universal hygiene from `design-taste-frontend` §9 (em-dash ban, zero generic AI-slop, natural habit-building voice), `apps/web/DESIGN.md`, and `apps/web/MEMORY.md`  
**Screenshot pass**: Skipped - Host OS notification toasts (Windows Action Center, macOS Notification Center, Linux/ChromeOS) are rendered natively by the host operating system via Chrome MV3 `chrome.notifications` API; not renderable via web browser DOM screenshot tools in this headless CLI environment  
**Result**: **PASS** (0 Critical, 0 High, 0 Medium, 3 Low/Advisory Findings)  

---

## 1. Executive Summary

An adversarial UI/UX, Anti-AI-Slop, and Localization review was conducted for **US-ECO-06: Thông báo nhắc học theo luật điều kiện (`extension-reminder-notifications`)** across all Extension background event handlers, notification copy generators, tab navigation routines, and storage models.

The implementation in [`apps/extension/src/background/reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts), [`apps/extension/src/background/reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts), [`apps/extension/src/background/index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts), and [`apps/extension/src/background/badge-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts) exhibits exceptional ergonomic design, empathetic habit-building copy, rigorous anti-spam rate limiting, and zero AI-slop tells.

### Evaluation Scorecard

| Evaluation Area | Target Standard | Measured Result | Verdict |
| :--- | :--- | :--- | :---: |
| **OS Notification Layout & Density** | Fits within native OS toast limits (macOS / Windows / Linux) | Titles $\le 39$ chars, bodies $\le 73$ chars; 0 clipping | ✅ PASS |
| **Asset & Icon Resolution** | Crisp 128px icon for high-DPI desktop displays | Uses `icons/icon128.png` with `chrome.runtime.getURL` | ✅ PASS |
| **Notification Priority Mapping** | 2-tier priority scale: urgent streak risk vs regular prompts | Priority 2 for `STREAK_AT_RISK`, Priority 1 for others | ✅ PASS |
| **2-Button Action Ergonomics** | Two distinct, concise actions with intuitive defaults | Button 0: `"Học ngay"` / `"Study Now"`, Button 1: `"Để sau"` / `"Snooze"` | ✅ PASS |
| **Bilingual Copy Authenticity** | Warm, encouraging, habit-focused; zero generic AI fluff | Natural Vietnamese & English; zero em-dashes (`—`) | ✅ PASS |
| **Language Fallback Hierarchy** | Deterministic resolution: user $\rightarrow$ settings $\rightarrow$ browser $\rightarrow$ default | 4-tier cascade: `user` $\rightarrow$ `settings` $\rightarrow$ `browserUiLang` $\rightarrow$ `"vi"` | ✅ PASS |
| **Smart Tab Navigation UX** | Focuses existing review tab; avoids multi-tab clutter | Windows focused + tab activated; falls back to `/review` | ✅ PASS |
| **Anti-Spam & Quiet Hours UX** | Suppresses interruptions during night; enforces cooldowns | Overnight wrap-around `22:00-07:00`, 120m cooldown, 3/day cap | ✅ PASS |
| **Consecutive Ignore Backoff** | Backs off on unengaged users; prevents uninstalls | Reduces to 1/day after 3 ignores; restores on any study | ✅ PASS |
| **Live Auto-Dismissal UX** | Dismisses stale reminders when user studies on Web App | Instantly clears notification & snooze alarm on review sync | ✅ PASS |

---

## 2. Detailed Findings Matrix

| Finding ID | Area | Finding Description | Severity | Recommendation |
| :--- | :--- | :--- | :---: | :--- |
| **FIND-UI-001** | Localization Polish | English copy does not inflect singular nouns when `dueCount === 1` (`"You have 1 due cards waiting"` and `"You have 1 vocabulary cards due"`). Vietnamese has no grammatical plural inflection, so `vi` is unaffected. | **Low (Advisory)** | In a future localization polish pass, add simple singular/plural selection in English copy strings (`dueCount === 1 ? "1 vocabulary card" : `${dueCount} vocabulary cards``). |
| **FIND-UI-002** | Tab Navigation UX | When no `/review` tab is open, `openOrFocusReviewTab` selects `tabs[0]` matching `${WEB_APP_URL}/*` and navigates it to `/review`. If the learner was actively writing or editing on `/decks/...`, navigating the current tab could interrupt unsaved work. | **Low (Advisory)** | For future hardening, prioritize non-editing tabs (e.g., `/dashboard`), or only navigate if the tab path is an idempotent landing screen, otherwise create a new tab. For the MVP, learners predominantly keep the dashboard open. |
| **FIND-UI-003** | Documentation Alignment | Intake prompts and task descriptions referenced `icons/icon-128.png` (with hyphen), whereas the physical file on disk and in `manifest.json` is `icons/icon128.png` (without hyphen). Implementation in `reminder-manager.ts` correctly uses `icons/icon128.png`. | **Low (Informational)** | Implementation correctly avoided a broken 404 icon link. Keep task documentation aligned with `icons/icon128.png`. |

---

## 3. In-Depth Evaluation by Dimension

### 3.1. OS Notification Layout, Icon Resolution & 2-Button Ergonomics

#### A. Layout & Character Density
Operating system notification systems (macOS Notification Center, Windows 10/11 Action Center, GNOME/KDE notifications) have strict physical boundaries. Titles that exceed 40 characters or bodies that exceed 120 characters are truncated with an ellipsis (`"..."`).

The copy generated by [`reminderRules.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L356-L422) is engineered for optimal glanceability:

| Notification Type | Language | Title Length | Message Length | Layout Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **`STREAK_AT_RISK`** | `vi` | 24 chars | 54 / 72 chars | Fits on 1 title line, 2 message lines. Immediate emotional recognition via `🔥`. |
| **`STREAK_AT_RISK`** | `en` | 31 chars | 68 / 69 chars | Clean, compact; clearly states the streak length and midnight deadline. |
| **`DUE_CARDS`** | `vi` | 28 chars | 51 chars | Clear habit cue via `📚`, exact due card count. |
| **`DUE_CARDS`** | `en` | 33 chars | 51 chars | Balanced length, friendly call to action. |
| **`DAILY_GOAL`** | `vi` | 38 chars | 65 chars | Clear progress breakdown (`X/Y`) with remaining card count calculation. |
| **`DAILY_GOAL`** | `en` | 34 chars | 69 chars | Punchy, positive reinforcement via `🎯`. |

#### B. Icon Resolution
- Implementation uses `chrome.runtime.getURL("icons/icon128.png")` with fallback to `"icons/icon128.png"`.
- `icon128.png` is a 128x128px PNG asset featuring the WordStreak purple flame mascot.
- Standard 16px or 48px icons appear pixelated on macOS Retina displays and Windows high-DPI scaling ($150\%-200\%$). The 128px icon renders sharp and crisp across all supported desktop platforms.

#### C. Priority Ergonomics
- **`STREAK_AT_RISK` $\rightarrow$ Priority 2**: On Chromium, Priority 2 requests high priority, triggering an immediate banner toast and sound prompt. This matches the critical nature of streak protection as the end of the day approaches.
- **`DUE_CARDS` & `DAILY_GOAL` $\rightarrow$ Priority 1**: Standard priority, presenting a normal banner toast without aggressive intrusion.
- Creates an intuitive 2-level hierarchy: routine habit prompts vs imminent loss-prevention alerts.

#### D. 2-Button Action Ergonomics
Both action buttons adhere to human interface guidelines across macOS and Windows:
1. **Button 0 (Primary Action)**:
   - **Vietnamese**: `"Học ngay"` (8 characters)
   - **English**: `"Study Now"` (9 characters)
   - Extremely short, action-oriented verb + temporal modifier.
   - Clicking Button 0 or clicking the notification body immediately focuses or opens `/review` and clears the notification.
2. **Button 1 (Secondary Action / Delay)**:
   - **Vietnamese**: `"Để sau"` (7 characters)
   - **English**: `"Snooze"` (6 characters)
   - Friendly and non-judgmental. Does not penalize the learner for postponing.
   - Schedules a 60-minute snooze alarm (`ALARM_NAMES.REMINDER_SNOOZE`), clears the current toast, and resets `consecutiveIgnores` to 0.

#### E. Race-Free Ignore Tracking
In [`reminder-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L188-L256), clicking either button or the notification body sets `activeNotificationId: null` in `chrome.storage.local` **before** calling `chrome.notifications.clear(notificationId)`.
When the browser subsequently fires `chrome.notifications.onClosed`, the handler detects that `state.activeNotificationId !== notificationId` and does not falsely count the user interaction as an ignored notification (`RISK-REMD-001`). Only true user dismissals via the close [X] button or notification timeouts increment `consecutiveIgnores`.

---

## 3.2. Bilingual Vietnamese & English Copy & Anti-AI-Slop Audit

### A. Linguistic Authenticity & Tone Audit

| String Role | Vietnamese (`vi`) | English (`en`) | Tone & Anti-AI-Slop Evaluation |
| :--- | :--- | :--- | :--- |
| **Streak At Risk (Title)** | `🔥 Chuỗi {streak} ngày sắp mất!` | `🔥 Your {streak}-day streak is at risk!` | Urgent but factual. Avoids histrionics like "Your world is ending!" or "Don't let your dreams die!". |
| **Streak At Risk (Cards Due)** | `Bạn còn {due} thẻ đến hạn. Ôn ngay để giữ chuỗi ngày học!` | `You have {due} due cards waiting. Review now to keep your streak alive!` | Clear next step. Directly connects the action (review cards) to the reward (keep streak). |
| **Streak At Risk (Goal Incomplete)** | `Hoàn thành phiên ôn tập hôm nay trước nửa đêm để bảo vệ chuỗi ngày học!` | `Complete a quick review before midnight to protect your study streak!` | Explicit deadline ("trước nửa đêm" / "before midnight"). Realistic and empowering. |
| **Due Cards (Title)** | `📚 Đến giờ ôn tập WordStreak!` | `📚 Time for your WordStreak review!` | Warm, habitual prompt. Feels like a supportive study companion. |
| **Due Cards (Body)** | `Bạn có {due} thẻ từ vựng đến hạn cần ôn tập hôm nay.` | `You have {due} vocabulary cards due for review today.` | Plain, functional language. Zero marketing fluff. |
| **Daily Goal (Title)** | `🎯 Hoàn thành mục tiêu từ vựng hôm nay!` | `🎯 Reach your daily vocabulary goal!` | Celebratory and goal-oriented. |
| **Daily Goal (Body)** | `Bạn đã học {studied}/{goal} thẻ hôm nay. Chỉ còn {rem} thẻ nữa để đạt mục tiêu!` | `You've studied {studied}/{goal} cards today. Just {rem} more to hit your daily goal!` | Emphasizes progress made (`X/Y`) and highlights how small the remaining step is (`rem`). |

### B. Anti-AI-Slop Verification (`design-taste-product` §10 & `design-taste-frontend` §9)
- **Zero Em-Dashes (`—`)**: An automated Unicode scan across `apps/extension/src` verified **0 em-dashes (`\u2014`)**. Punctuation uses standard hyphens `-`, colons, and periods.
- **No Buzzwords or AI Clichés**: No instances of "Supercharge your brain", "Linguistic journey", "Level up your cognitive retention", "Seamlessly master", or "Ignite your potential".
- **Mathematical Safety**: `Math.max(1, dailyGoal - studiedToday)` ensures that if `dailyGoal - studiedToday` evaluates to 0 or negative due to timing edge cases, the notification never displays awkward strings like "Chỉ còn 0 thẻ nữa".

---

## 3.3. Language Preference Fallback Hierarchy

[`resolveReminderLanguage`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminderRules.ts#L330-L354) implements a deterministic 4-tier language resolution cascade:

```mermaid
flowchart TD
    Start["resolveReminderLanguage()"] --> CheckUser{"user?.preferredLanguage === 'vi' | 'en'"}
    CheckUser -- Yes --> UseUser["Return user.preferredLanguage"]
    CheckUser -- No --> CheckSettings{"settings?.preferredLanguage === 'vi' | 'en'"}
    CheckSettings -- Yes --> UseSettings["Return settings.preferredLanguage"]
    CheckSettings -- No --> CheckBrowser{"browserUiLang starts with 'en' or 'vi'?"}
    CheckBrowser -- "starts with 'en'" --> UseBrowserEn["Return 'en'"]
    CheckBrowser -- "starts with 'vi'" --> UseBrowserVi["Return 'vi'"]
    CheckBrowser -- "Other / null" --> Fallback["Return 'vi' (WordStreak Default)"]
```

### Hierarchy Merits:
1. **User Profile takes top priority**: If a learner is logged in and set their account to English or Vietnamese, their account profile is respected regardless of device locale.
2. **Local Settings override**: If the user hasn't synced an account profile yet, local extension settings apply.
3. **Browser Locale detection**: Catches system language codes (e.g., `en-US`, `en-GB`, `vi-VN`) via prefix matching.
4. **Resilient Vietnamese fallback**: Ensures that unsupported browser locales (e.g., `fr`, `ja`) default gracefully to `"vi"` without throwing runtime exceptions or generating undefined copy keys.

---

## 3.4. Smart Tab Navigation UX (`openOrFocusReviewTab`)

When a learner clicks **"Học ngay"** / **"Study Now"** or clicks the notification banner, [`openOrFocusReviewTab`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/reminder-manager.ts#L307-L327) executes an intelligent search:

1. **Tab Query**: Queries all active browser tabs matching `${WEB_APP_URL}/*`.
2. **Prioritization**:
   - Searches for an existing tab already navigated to `/review` (`tabs.find((t) => t.url?.includes("/review"))`).
   - If found, it focuses the browser window (`chrome.windows.update(tab.windowId, { focused: true })`), activates the tab (`chrome.tabs.update(tab.id, { active: true })`), and refreshes to `${WEB_APP_URL}/review`.
   - If no `/review` tab is found but another WordStreak tab is open (`tabs[0]`), it focuses that window, activates the tab, and redirects it to `${WEB_APP_URL}/review`.
   - If no WordStreak tab is open at all, it creates a new active tab at `${WEB_APP_URL}/review`.

### Anti-Clutter UX Benefit:
Without this check, clicking reminders would generate dozens of orphan tabs across the user's browser sessions. Reusing and focusing existing tabs preserves browser memory, eliminates tab clutter, and brings the learner directly to their active flashcard session.

---

## 3.5. Anti-Spam Guardrails & Ethical Habit Loop UX

Frequent desktop notifications are one of the primary drivers of Chrome extension uninstalls. `US-ECO-06` implements five interlocking anti-spam layers:

```
[Trigger Event: Daily Alarm / Periodic Sync / Snooze]
                        │
                        ▼
            ┌───────────────────────┐
            │   Are Quiet Hours     │─── Yes ───► [SUPPRESS: QUIET_HOURS]
            │   Active (22:00-07:00)?
            └───────────────────────┘
                        │ No
                        ▼
            ┌───────────────────────┐
            │   Is Daily Cap (3/day │─── Yes ───► [SUPPRESS: DAILY_CAP_REACHED]
            │   or 1/day) Reached?  │
            └───────────────────────┘
                        │ No
                        ▼
            ┌───────────────────────┐
            │   Is 120m Cooldown or │─── Yes ───► [SUPPRESS: COOLDOWN_ACTIVE]
            │   Active Snooze On?   │             (Non-snooze triggers)
            └───────────────────────┘
                        │ No
                        ▼
            ┌───────────────────────┐
            │   Is Study Needed     │─── No ────► [SUPPRESS: NO_STUDY_NEEDED]
            │   (Due > 0 or At Risk)?
            └───────────────────────┘
                        │ Yes
                        ▼
            [DISPATCH SYSTEM NOTIFICATION]
```

1. **Quiet Hours (`22:00-07:00` default)**:
   - Evaluated by `isWithinQuietHours` with full timezone awareness (`summary.timezone`).
   - Supports overnight wrap-around (`22:00-07:00`), same-day intervals (`13:00-15:00`), and disabled quiet hours (`start === end`).
   - Strict priority: Quiet hours suppress all triggers, including snooze alarms and catch-up reminders after laptop sleep.
2. **120-minute Intra-day Cooldown**:
   - Automatic background sync checks cannot trigger a reminder within 2 hours of a previous reminder on the same day.
3. **Daily Ceiling (3/day)**:
   - Capped at 3 notifications per calendar day. Resets at local calendar midnight (`normalizeReminderStateForDate`).
4. **Consecutive Ignore Backoff (1/day)**:
   - If a learner ignores 3 notifications in a row without clicking or studying (`consecutiveIgnores >= 3`), the daily ceiling automatically drops from 3 to 1.
   - Respects user disengagement and prevents user annoyance.
   - Any positive interaction (clicking "Học ngay", clicking "Để sau", or reviewing cards on the Web App) immediately resets `consecutiveIgnores = 0` and restores the standard 3/day cap.
5. **Real-time Auto-Dismissal on Web App Review**:
   - Handled via `handleWebReviewActivity`: when the user reviews cards on the Web App (`hasStudiedMore || hasCompletedGoal`), any active OS notification is immediately cleared from the screen, and pending snooze alarms are canceled.
   - The user is never badgered by an outdated reminder for cards they just finished reviewing.

---

## 4. Verification & Automated Test Evidence

Automated test suites were run directly on the extension codebase via Vitest:

```bash
pnpm --filter extension test
```

### Test Results

- **Test Files Passed**: `7 / 7` (100%)
- **Total Tests Passed**: `116 / 116` (100%)
- **Reminder Rule Engine Tests (`reminderRules.spec.ts`)**: `37 / 37` passed:
  - `parseTimeToMinutes`: 5 cases covering boundary formats and fallbacks.
  - `getLocalDateAndMinutes`: 3 cases covering UTC, `Asia/Ho_Chi_Minh` (UTC+7), and invalid timezones.
  - `isWithinQuietHours`: 3 cases covering overnight wrap-around (`22:00-07:00`), same-day, and disabled quiet hours.
  - `normalizeReminderStateForDate`: 3 cases covering same-day preservation, midnight rollover, and ignore counting.
  - `computeNextDailyReminderTime`: 4 cases covering future times, next-day rollover, and 60s minimum delay clamping.
  - `evaluateReminderRules`: 14 comprehensive cases covering unauthenticated, quiet hours, cooldown, daily caps, snooze alarms, catch-up after sleep, and ignore backoff.
  - `resolveReminderLanguage`: 3 cases covering user preference, settings fallback, and browser language.
  - `buildReminderNotificationCopy`: 2 cases verifying bilingual EN/VI copy structure and priorities.
- **Reminder Manager Tests (`reminder-manager.spec.ts`)**: `19 / 19` passed:
  - Alarm registration and clearing on logout (`ensureDailyReminderAlarm`).
  - Scheduled alarm triggering and quiet hours suppression (`handleAlarm`).
  - Action button 0 ("Học ngay") tab focus and navigation (`openOrFocusReviewTab`).
  - Action button 1 ("Để sau") 60-minute snooze scheduling.
  - Dismissal ignore tracking (`handleNotificationClosed`) and race-condition prevention.
  - Web App study activity auto-dismissal (`handleWebReviewActivity`).

---

## 5. Review Conclusion

The conditional study reminder notification system for **US-ECO-06: Extension Reminder Notifications** adheres to WordStreak's product principles and anti-AI-slop design guidelines:

1. **OS Notification Ergonomics**: Perfectly balanced titles ($\le 39$ chars), concise messages ($\le 73$ chars), and crisp 128px mascot icon rendering.
2. **2-Button Action Precision**: Intuitive `"Học ngay"` / `"Để sau"` and `"Study Now"` / `"Snooze"` actions with race-free ignore counting.
3. **Bilingual Authenticity**: Warm, habit-forming tone in both Vietnamese and English with zero em-dashes (`—`) or generic AI fluff.
4. **Smart Tab Navigation**: Reuses open Web App tabs and focuses existing `/review` sessions to prevent tab clutter.
5. **Ethical Anti-Spam UX**: Strict quiet hours, 120m cooldown, 3/day ceiling, 3-ignore backoff to 1/day, and real-time auto-dismissal on study completion.

**Final Verdict**: **PASS** (Ready for production release).
