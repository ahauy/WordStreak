# Quickstart Validation Guide: Complete UI Localization & Error Mapping (US-I18N-02)

- **Feature**: `i18n-ui-localization`
- **Epics**: `EPIC-10` (Multi-language & Internationalization)
- **Status**: SPECIFIED
- **Date**: 2026-08-22
- **Author**: Principal System Architect

---

## 1. Prerequisites

- Node.js >= 20
- pnpm >= 9
- Web workspace installed: `pnpm install`
- Local dev environment running: `pnpm --filter web dev` (`http://localhost:5173`)

---

## 2. Automated Test & Validation Commands

```bash
# 1. Run All Localization Unit & Utility Tests (Vitest)
pnpm --filter web test src/locales/

# 2. Run Formatter Unit Tests
pnpm --filter web test src/locales/utils/__tests__/formatters.test.ts

# 3. Run Error Mapper & Deduplication Tests
pnpm --filter web test src/locales/utils/__tests__/errorMapper.test.ts

# 4. Run Dictionary Symmetry & Pluralization Tests
pnpm --filter web test src/locales/__tests__/dictionaryParity.test.ts

# 5. Run Full Frontend Test Suite
pnpm --filter web test

# 6. Typecheck & Build Validation
pnpm --filter web typecheck
pnpm --filter web build
```

---

## 3. Manual E2E Validation Scenarios

### Scenario A: Instant Language Switching & Formatting Check

1. Start frontend: `pnpm --filter web dev`.
2. Navigate to `http://localhost:5173/dashboard`.
3. Locate the `LanguageSwitcher` in the top navbar.
4. Click and select **Tiếng Việt (`VI`)**:
   - Verify all navigation links (`Bảng điều khiển`, `Bộ từ vựng`, `Luyện tập`, `Cộng đồng`, `Phân tích`, `Cài đặt`) translate instantly.
   - Verify numbers/XP counters format with period separator (e.g. `12.500 XP`).
   - Verify dates format in `DD/MM/YYYY` (e.g. `22/08/2026`).
5. Refresh the browser page (`F5`) and verify the Vietnamese language selection persists via `localStorage`.

### Scenario B: SRS Study Session Rating Button Localization (`BR-I18N-008`)

1. Navigate to `/study/:deckId` (or start a review session).
2. Flip a flashcard:
   - Verify flashcard front and back words remain 100% in English (UGC boundary `BR-I18N-003`).
   - Verify rating buttons render localized Vietnamese labels:
     - Button 1: `"Lại"` with `< 10p`
     - Button 2: `"Khó"` with `1 ngày`
     - Button 3: `"Tốt"` with `4 ngày`
     - Button 4: `"Dễ"` with `10 ngày`
3. Switch language to English (`EN`):
   - Verify buttons immediately re-render as `"Again"`, `"Hard"`, `"Good"`, `"Easy"`.

### Scenario C: Centralized Error Mapping & Sanitization (`BR-I18N-002`)

1. Navigate to `/login`.
2. Submit invalid login credentials:
   - Verify error toast displays: `"Email hoặc mật khẩu không chính xác."` (in `vi`) or `"Invalid email or password."` (in `en`).
   - Verify no stack traces or server paths appear in the toast notification.
3. Simulate network disconnect (DevTools Offline):
   - Attempt an action; verify toast displays: `"Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng."`.

### Scenario D: Toast Rate Limiting & Deduplication (`BR-I18N-009`)

1. With network offline, click a submit button 5 times rapidly.
2. Verify only **1** error toast appears during the 2000ms sliding window.
