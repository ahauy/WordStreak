# Feature: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Slug**: `browser-extension`  
**Version**: 1.0  
**Ship date**: 2026-08-23  
**Spec**: [.specify/features/browser-extension/](../../.specify/features/browser-extension/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/browser-extension/baseline.md)  
**User Story**: `US-ECO-03` (EPIC 09: Ecosystem & Integrations)

---

## 1. Mô tả ngắn

WordStreak Browser Extension là tiện ích mở rộng trình duyệt chuẩn **Manifest V3 (MV3)**, tương thích 100% với **Google Chrome, Brave Browser, Microsoft Edge, Arc, Opera, Cốc Cốc**. Tiện ích giúp người học tiếng Anh bôi đen từ vựng trên bất kỳ trang web nào để tra nhanh nghĩa, tự động trích xuất câu văn ngữ cảnh (`exampleSentence`), tự động điền phiên âm IPA/nghĩa tiếng Việt qua AI và 1-Click lưu trực tiếp vào Bộ từ WordStreak với trạng thái `NEW` trong thuật toán Spaced Repetition (SM-2).

---

## 2. Kiến trúc Kỹ thuật (Technical Architecture)

```
apps/extension/
├── manifest.json                  # Manifest V3 (storage, activeTab, contextMenus, host_permissions)
├── vite.config.ts                 # Multi-input build (popup, options, content, background)
├── src/
│   ├── background/
│   │   ├── index.ts               # Background Service Worker (ephemeral, message router, auth)
│   │   └── api-client.ts          # API client gửi Authorization Bearer token
│   ├── content/
│   │   ├── index.ts               # Selection listeners, debounce, in-page controller
│   │   ├── sentence-extractor.ts  # Trích xuất câu ngữ cảnh (ranh giới ., !, ?, \n, tối đa 250 chars)
│   │   ├── shadow-dom.ts          # Đóng gói Shadow DOM (cô lập 100% style)
│   │   └── components/
│   │       ├── FloatingFlameIcon.ts # Icon ngọn lửa tím nổi cạnh con trỏ chuột
│   │       └── InPageToast.ts     # Toast thông báo kết quả lưu thẻ (< 2.5s auto dismiss)
│   ├── popup/
│   │   ├── PopupApp.tsx           # UI chính Popup (AuthStatusCard, DeckSelector, RecentCapturesList)
│   │   └── components/
│   ├── options/
│   │   └── OptionsApp.tsx         # Trang cài đặt (toggle auto-icon, blacklist domains)
│   └── shared/
│       ├── constants.ts
│       └── storage.ts             # Typed wrapper cho chrome.storage.local
```

---

## 3. Backend Quick Capture Endpoint

- **Route**: `POST /api/v1/cards/quick-capture`
- **Security**: Bảo vệ bởi `JwtAuthGuard`
- **Logic**:
  - Tự động phân giải Deck đích (hoặc tự tạo Deck _"Inbox / Thu thập Web"_ nếu user chưa có deck nào).
  - Kiểm tra từ vựng trùng lặp (case-insensitive) $\rightarrow$ Trả về `isDuplicate: true` kèm thông tin thẻ cũ.
  - Tự động làm giàu dữ liệu (AI auto-fill IPA phonetic, part of speech, Vietnamese meaning).
  - Khởi tạo tiến độ SM-2: `state = NEW`, `easeFactor = 2.50`, `interval = 0`, `repetitions = 0`.

---

## 4. Kiểm thử & Độ tin cậy (Testing & Verification)

- **Unit Tests**:
  - `apps/api/src/modules/cards/cards.service.spec.ts`: Test cases `TC-EXT-001` đến `TC-EXT-003` (Quick Capture, duplicate detection, auto-deck creation).
  - `apps/api/src/modules/cards/cards.controller.spec.ts`: Test case `TC-EXT-010` (Quick capture endpoint integration).
  - `apps/extension/src/content/sentence-extractor.spec.ts`: Test cases `TC-EXT-004` đến `TC-EXT-005` (Sentence boundary extraction, length limits, selection validation).
- **Trạng thái Build**: Build output `apps/extension/dist` chuẩn Manifest V3.
