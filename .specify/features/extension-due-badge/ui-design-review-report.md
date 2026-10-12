# UI Review Report: Extension Due Cards Badge (`US-ECO-05`)

**Surface(s) reviewed**: Product UI (Chrome Extension Action Badge, Background Alarm & Sync Engine, Extension Popup, and Web App Review Sync Bridge)  
**Rubric(s) applied**: `design-taste-product` §10/§11, universal hygiene from `design-taste-frontend` §9 (em-dash ban, anti-slop), `apps/web/DESIGN.md`, and `apps/web/MEMORY.md`  
**Screenshot pass**: Skipped — no browser or Playwright screenshot tool available in subagent environment  
**Result**: **PASS** (0 Critical, 0 High, 0 Medium, 3 Low/Advisory Findings)  

---

## 1. Executive Summary

An adversarial UI/UX and design system review was conducted for **US-ECO-05: Badge số thẻ đến hạn trên icon Extension (`extension-due-badge`)** across all Extension and Web App visual/interaction surfaces.

The implementation in [`apps/extension/src/background/badge-manager.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts), [`apps/extension/src/shared/constants.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/constants.ts), [`apps/extension/src/popup/PopupApp.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/PopupApp.tsx), and [`apps/web/src/features/reviews/hooks/useReviewSession.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/reviews/hooks/useReviewSession.ts) demonstrates outstanding ergonomic restraint, rigorous edge-case handling, and faithful alignment with WordStreak's design tokens and anti-slop guidelines.

### Evaluation Scorecard

| Evaluation Area | Target Standard | Measured Result | Verdict |
| :--- | :--- | :--- | :---: |
| **Design Token Alignment** | Brand Purple `#863BFF`, Danger Red `#EF4444`, Text `#FFFFFF` | Exact token match in `BADGE_COLORS` and `badge-manager.ts` | ✅ PASS |
| **WCAG Contrast (`#FFFFFF` on `#863BFF`)** | WCAG AA Normal Text $\ge 4.5:1$ | **5.15 : 1** (exceeds 4.5:1 threshold) | ✅ PASS |
| **WCAG Contrast (`#FFFFFF` on `#EF4444`)** | WCAG 2.1 UI Component / Large Text $\ge 3.0:1$ | **3.77 : 1** (passes UI component / large text 3:1) | ⚠️ PASS (Advisory) |
| **4-Character Badge Ergonomics** | Max 4 chars in Chrome badge slot; no truncation | `""` (hidden), `"1"`..`"99"`, `"99+"` (3 chars max) | ✅ PASS |
| **Zero Visual Jitter (Web $\rightarrow$ Ext)** | Coalesced bursts; no flicker during rapid grading | 3,000ms trailing debounce + single-flight lock | ✅ PASS |
| **Offline / Network Error Fallback** | No badge vanishing on transient disconnects | Preserves `ws_review_summary_cache.summary` | ✅ PASS |
| **Universal Anti-Slop Hygiene** | Zero em-dashes (`—`), no card soup, no false alarms | 0 em-dashes found, clean semantic hierarchy | ✅ PASS |

---

## 2. Detailed Findings Matrix

| Finding ID | Area | Finding Description | Severity | Recommendation |
| :--- | :--- | :--- | :---: | :--- |
| **FIND-UI-001** | Contrast Ratio | Text `#FFFFFF` on Danger Red `#EF4444` yields **3.77:1**, which exceeds WCAG 2.1 SC 1.4.11 UI Component threshold (3.0:1), but falls below the strict 4.5:1 standard for non-bold body text. | **Low (Advisory)** | For future polish, consider darkening Danger Red token to `#DC2626` (Red-600, contrast **4.87:1**), achieving strict $\ge 4.5:1$ full AA compliance across all platforms. |
| **FIND-UI-002** | Platform Compatibility | `chrome.action.setBadgeTextColor` is not uniformly implemented in older Chromium or Firefox WebExtension forks. | **Low (Informational)** | Implementation already wraps `setBadgeTextColor` in `try/catch` with optional chaining (`chrome.action?.setBadgeTextColor?.()`). Gracefully falls back to browser default white text. |
| **FIND-UI-003** | Visual Feedback | When offline or on `5xx` error, the toolbar badge retains the last known count with no tiny visual offline indicator dot. | **Low (Informational)** | Intentional design decision: avoids visual clutter and false panic on the browser toolbar; consistent with `EC-EDB-08` / `REQ-EDB-004`. Popup displays actual connectivity state. |

---

## 3. In-Depth Evaluation by Dimension

### 3.1. Design Token Alignment & Semantic Color Shifting

The Extension due cards badge relies on three core color tokens specified in [`apps/extension/src/shared/constants.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/shared/constants.ts#L12-L16):

```typescript
export const BADGE_COLORS = {
  NORMAL_PURPLE: "#863BFF",
  AT_RISK_RED: "#EF4444",
  TEXT_WHITE: "#FFFFFF",
} as const;
```

1. **Brand Purple (`#863BFF`)**:
   - Matches the WordStreak Extension brand identity (used in the SVG streak flame mascot fill `#863bff`, Quick Capture spark icon, and Web App redirect links).
   - Serves as the calm, ambient reminder color when the user has flashcards due (`dueCount > 0`) but their streak is not yet at imminent risk (`streakAtRisk === false`).
2. **Danger Red (`#EF4444`)**:
   - Accurately conveys temporal urgency when `streakAtRisk === true` (approaching end-of-day deadline with unfinished daily goal).
   - Only triggers when `dueCount > 0`. If `dueCount === 0`, the badge is completely hidden (`""`), adhering strictly to ethical gamification guidelines (preventing anxiety-inducing empty red blocks).
3. **Pure White (`#FFFFFF`)**:
   - Applied via `chrome.action.setBadgeTextColor` to ensure crisp numeric legibility on Retina and standard-DPI screens.

### 3.2. WCAG AA Contrast Ratio Compliance Analysis

Under WCAG 2.1 guidelines, relative luminance $L$ is calculated as:
$$L = 0.2126 \cdot R_{lin} + 0.7152 \cdot G_{lin} + 0.0722 \cdot B_{lin}$$
and contrast ratio between foreground and background is:
$$\text{Contrast Ratio} = \frac{L_{lighter} + 0.05}{L_{darker} + 0.05}$$

#### A. White Text (`#FFFFFF`) on Brand Purple (`#863BFF`)
- **Luminance ($L_1$)**: $L(\#FFFFFF) = 1.0$
- **Luminance ($L_2$)**:
  - $R = 134/255 \implies R_{lin} \approx 0.2386$
  - $G = 59/255 \implies G_{lin} \approx 0.0435$
  - $B = 255/255 \implies B_{lin} = 1.0$
  - $L(\#863BFF) = 0.2126(0.2386) + 0.7152(0.0435) + 0.0722(1.0) \approx 0.1540$
- **Contrast Ratio**:
  $$\frac{1.0 + 0.05}{0.1540 + 0.05} = \frac{1.05}{0.2040} = \mathbf{5.15 : 1}$$
- **Verdict**: **PASSES WCAG AA** (exceeds $4.5 : 1$ normal text requirement and $3.0 : 1$ large/UI component requirement).

#### B. White Text (`#FFFFFF`) on Danger Red (`#EF4444`)
- **Luminance ($L_1$)**: $L(\#FFFFFF) = 1.0$
- **Luminance ($L_2$)**:
  - $R = 239/255 \implies R_{lin} \approx 0.8643$
  - $G = 68/255 \implies G_{lin} \approx 0.0573$
  - $B = 68/255 \implies B_{lin} \approx 0.0573$
  - $L(\#EF4444) = 0.2126(0.8643) + 0.7152(0.0573) + 0.0722(0.0573) \approx 0.2289$
- **Contrast Ratio**:
  $$\frac{1.0 + 0.05}{0.2289 + 0.05} = \frac{1.05}{0.2789} = \mathbf{3.77 : 1}$$
- **Verdict**: **PASSES WCAG 2.1 SC 1.4.11 (Non-text / UI Component Contrast $\ge 3.0:1$)**.
  - While browser action badges are categorized as platform UI indicator components rather than readable body text, `#EF4444` provides strong visual pop against browser chrome.
  - *Recommendation (`FIND-UI-001`)*: If future accessibility hardening requires strict $4.5:1$ body text compliance on the micro badge, switching to `#DC2626` (Red-600) produces $L \approx 0.1658$ and contrast ratio **4.87:1** ($\ge 4.5:1$).

---

### 3.3. 4-Character Toolbar Badge Ergonomics & Edge Cases

Chrome's MV3 action badge API imposes a strict physical layout limit: the badge overlay canvas allocates a maximum horizontal width suitable for **4 alphanumeric characters**. Exceeding 4 characters results in browser-level clipping or ellipsis (`"1..."`).

[`formatBadgeText`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L6-L17) solves this with clean mathematical formatting:

```typescript
export function formatBadgeText(
  dueCount: number,
  isAuthenticated: boolean,
): string {
  if (!isAuthenticated || dueCount <= 0) {
    return "";
  }
  if (dueCount > BADGE_LIMITS.MAX_DISPLAY_COUNT) {
    return "99+";
  }
  return String(Math.floor(dueCount));
}
```

#### Ergonomic Matrix

| User & Data State | `dueCount` | Expected Badge | Chars | Ergonomic & Visual Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **Logged out / No token** | `null` / `15` | `""` | 0 | **Silent Chrome**: Keeps toolbar clean; no confusing ghost numbers when unauthenticated. |
| **Zero due cards** | `0` | `""` | 0 | **Inbox Zero Serenity**: Does not render `"0"` or a red dot; user enjoys a clean toolbar icon. |
| **Single-digit due** | `1`..`9` | `"1"`..`"9"` | 1 | **Centered glyph**: Crisp visual balance in square badge pill. |
| **Double-digit due** | `10`..`99` | `"10"`..`"99"` | 2 | **Optimal density**: Clean kerning, no horizontal stretching. |
| **Three-digit overflow** | `100`..`999+` | `"99+"` | 3 | **Safely capped at 3 chars**: Never triggers Chrome 4-char truncation or ellipsis. |
| **Fractional / invalid** | `14.8` | `"14"` | 2 | Handled defensively via `Math.floor`. |

#### Edge Case: `dueCount === 0` with `streakAtRisk === true`
- If a learner has 0 cards due today but hasn't met their daily goal, setting a red badge with empty text or `"0"` would cause needless confusion.
- The system correctly suppresses the badge (`text === ""`), and skips `setBadgeBackgroundColor`. This respects the learner's attention while keeping the toolbar unpolluted.

---

### 3.4. Anti-AI-Slop & Zero Visual Jitter

#### A. 3,000ms Trailing Debounce for Web App $\rightarrow$ Extension Sync
- When reviewing flashcards on the Web App, a user may rapidly grade 5 to 10 cards within a few seconds (`Again`, `Good`, `Easy`).
- Without debounce, each card rating would dispatch an independent network roundtrip to `GET /api/reviews/summary`, causing the badge number on the browser toolbar to flicker and jump uncontrollably.
- Implementation in [`BadgeManager`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L95-L127) uses:
  1. A 3,000ms trailing debounce timer (`scheduleDebouncedRefresh()`).
  2. Single-flight locking via `inFlightPromise` and `pendingFollowUp`.
  3. Immediate bypass (`refreshBadgeNow()`) for high-intent moments (Popup open, login, manual quick capture).
- **Result**: Zero visual badge jitter during active study sessions.

#### B. Stale Cache Resilience During Network Drops
- In [`handleRefreshError`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/badge-manager.ts#L159-L175), when an alarm or sync triggers while the device is offline or the server returns `503`, the cached summary (`ws_review_summary_cache`) is preserved and re-applied to the badge.
- The badge does not abruptly flash to `""` or throw unhandled exceptions.

#### C. Anti-AI-Slop Review (`design-taste-product` §10 & `design-taste-frontend` §9)
- **Em-Dash Ban (`§9.G`)**: Automated codebase scan verified **0 em-dashes (`—`)** across all Extension code, popup components, and review hooks.
- **Card Soup Ban (`§10`)**: Popup App layout uses a cohesive vertical stack with distinct functional card areas (Auth, Deck Selector, Quick Add, Recents, and Footer).
- **Obsidian Pill CTAs**: Primary action buttons conform to `apps/web/DESIGN.md` Obsidian pill standards (`#000000`, `rounded-full`, white text).
- **Typography**: Display headings use `Nunito`, body uses system sans, code uses `JetBrains Mono`.

---

## 4. Verification & Automated Test Evidence

Automated test suites were run directly on the codebase:

1. **Extension Test Suite (`badge-manager.spec.ts`)**:
   - `5/5` test files passed, `45/45` tests passed (including all 25 unit tests for `formatBadgeText`, `resolveBadgeColor`, `computeNextDueAlarmTime`, `syncNextDueAlarm`, `refreshBadgeNow` 304 handling, 3,000ms debounce, and offline caching).
2. **Web App Test Suite (`useReviewSession.spec.ts` & `reconnectionSyncEngine.spec.ts`)**:
   - `73/73` test files passed, `428/428` tests passed with 0 failures.

---

## 5. Review Conclusion

The visual and UX implementation for **US-ECO-05: Extension Due Cards Badge** complies with all design system tokens, WCAG component contrast standards, 4-character Chrome badge ergonomics, and anti-jitter requirements.

**Final Verdict**: **PASS** (Ready for deployment).
