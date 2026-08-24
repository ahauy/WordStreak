# Implementation Tasks: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Feature**: `browser-extension` | **Story ID**: `US-ECO-03` | **Date**: 2026-08-23  
**Status**: COMPLETED (100% Verified) | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Shared Types & DTO Contracts

- [x] **T-EXT-01: Khai báo Types & DTOs cho Quick Capture**
  - File: `packages/shared-types/src/cards.ts` & `packages/shared-types/src/extension.ts`
  - Thêm `QuickCaptureCardDto`, `QuickCaptureResponseDto`, `ExtensionStorageState`, `ExtensionMessage`.
  - Export qua `packages/shared-types/src/index.ts`.
  - Verify: Chạy `pnpm --filter @wordstreak/shared-types build` thành công.

---

## Phase 2: Backend Quick Capture API (`apps/api`)

- [x] **T-EXT-02: Tạo DTO Validation Backend**
  - File: `apps/api/src/modules/cards/dto/quick-capture-card.dto.ts`
  - Khai báo class `QuickCaptureCardDto` với `class-validator` (`@IsNotEmpty()`, `@IsOptional()`, `@MaxLength()`).
- [x] **T-EXT-03: Triển khai Service Method `CardsService.quickCapture`**
  - File: `apps/api/src/modules/cards/cards.service.ts`
  - Xử lý phân giải Deck đích (hoặc tự tạo Deck _"Inbox / Thu thập Web"_ nếu user chưa có Deck nào).
  - Kiểm tra từ trùng lặp trong Deck (case-insensitive).
  - Tự động điền phiên âm IPA, loại từ và nghĩa tiếng Việt nếu chưa có.
  - Khởi tạo thẻ `NEW` (SM-2: `easeFactor = 2.50`, `interval = 0`).
- [x] **T-EXT-04: Thêm Controller Endpoint `POST /cards/quick-capture`**
  - File: `apps/api/src/modules/cards/cards.controller.ts`
  - Gắn `@UseGuards(JwtAuthGuard)` và `@Post('cards/quick-capture')`.
- [x] **T-EXT-05: Viết Unit & Integration Tests cho Quick Capture API**
  - File: `apps/api/src/modules/cards/cards.service.spec.ts` & `apps/api/src/modules/cards/cards.controller.spec.ts`
  - Viết test cases: Tạo thẻ mới thành công, phát hiện trùng lặp, tự động tạo Deck fallback khi chưa có deck nào.
  - Verify: Chạy `pnpm --filter api test cards` pass 23/23 tests.

---

## Phase 3: Khởi tạo Package `apps/extension` & Manifest V3

- [x] **T-EXT-06: Khởi tạo Package Structure & Dependencies**
  - Files: `apps/extension/package.json`, `apps/extension/tsconfig.json`, `apps/extension/vite.config.ts`
  - Kết nối dependency `@wordstreak/shared-types`, `lucide-react`, `tailwindcss`.
- [x] **T-EXT-07: Cấu hình `manifest.json` Manifest V3**
  - File: `apps/extension/manifest.json`
  - Cấu hình permissions: `storage`, `activeTab`, `contextMenus`.
  - Cấu hình `host_permissions`: `http://localhost:3000/*`, `https://*.wordstreak.com/*`.
  - Khai báo `background.service_worker`, `content_scripts`, `action.default_popup`, `options_ui`.
- [x] **T-EXT-08: Setup Icons & Brand Assets**
  - Files: `apps/extension/public/icons/icon16.png`, `icon48.png`, `icon128.png`, `icon.svg`
  - Mascot ngọn lửa WordStreak tím thương hiệu.

---

## Phase 4: Content Script & Shadow DOM In-page Overlay

- [x] **T-EXT-09: Thuật toán Trích xuất Ngữ cảnh Câu (`sentence-extractor.ts`)**
  - File: `apps/extension/src/content/sentence-extractor.ts` & `sentence-extractor.spec.ts`
  - Phân tích DOM quanh vùng bôi đen, tìm dấu câu (`.`, `!`, `?`, `\n`) và trả về câu hoàn chỉnh tối đa 250 ký tự.
  - Test unit pass 4/4 tests.
- [x] **T-EXT-10: Đóng gói Shadow DOM Mount (`shadow-dom.ts`)**
  - File: `apps/extension/src/content/shadow-dom.ts`
  - Tạo Shadow Root (`attachShadow({ mode: 'open' })`), tiêm CSS reset độc lập để cách ly 100% style.
- [x] **T-EXT-11: Component Floating Flame Icon & In-page Toast**
  - Files: `apps/extension/src/content/components/FloatingFlameIcon.ts`, `apps/extension/src/content/components/InPageToast.ts`
  - Icon ngọn lửa nổi cạnh con trỏ chuột khi bôi đen từ hợp lệ (1-5 từ).
  - Toast thông báo kết quả lưu 1-click (Thành công, Trùng lặp, Yêu cầu đăng nhập) với timeout 2.5s.
- [x] **T-EXT-12: Content Script Controller & Event Handlers**
  - File: `apps/extension/src/content/index.ts`
  - Lắng nghe `mouseup`, `selectionchange`, click outside, scroll tự ẩn.
  - Gửi message `QUICK_CAPTURE` tới Service Worker.

---

## Phase 5: Background Service Worker & Messaging

- [x] **T-EXT-13: Quản lý Storage & Cấu hình (`storage.ts`)**
  - File: `apps/extension/src/shared/storage.ts`
  - Typed helper đọc/ghi `chrome.storage.local` cho `token`, `user`, `settings`, `recentCaptures`.
- [x] **T-EXT-14: API Client Service (`api-client.ts`)**
  - File: `apps/extension/src/background/api-client.ts`
  - Tự động đính kèm `Authorization: Bearer <token>`, xử lý error, parse JSON.
- [x] **T-EXT-15: Background Message Router & Context Menu**
  - File: `apps/extension/src/background/index.ts`
  - Xử lý các action message: `QUICK_CAPTURE`, `GET_AUTH_STATUS`, `FETCH_DECKS`, `SET_AUTH_TOKEN`, `LOGOUT`.
  - Đăng ký Context Menu chuột phải: _"Thêm vào WordStreak"_.

---

## Phase 6: Extension Action Popup & Options Page UI

- [x] **T-EXT-16: Component Header & Trạng thái Đăng nhập Popup**
  - Files: `apps/extension/src/popup/PopupApp.tsx`, `apps/extension/src/popup/components/AuthStatusCard.tsx`
  - Hiển thị logo ngọn lửa tím, avatar/tên user, hoặc nút "Đăng nhập với WordStreak" mở tab Web SSO.
- [x] **T-EXT-17: Component Target Deck Selector & Recent Captures List**
  - Files: `apps/extension/src/popup/components/DeckSelector.tsx`, `apps/extension/src/popup/components/RecentCapturesList.tsx`
  - Dropdown chọn Pinned Deck, danh sách 5 từ vừa lưu kèm nút xem trên Web App.
- [x] **T-EXT-18: Options Page Cài đặt**
  - Files: `apps/extension/src/options/OptionsApp.tsx`
  - Toggle bật/tắt tự động hiện icon nổi, cài đặt phím tắt, danh sách domain loại trừ.

---

## Phase 7: Web App SSO Auth Integration (`apps/web`)

- [x] **T-EXT-19: Broadcast Auth Token cho Extension**
  - File: `apps/web/src/store/useAuthStore.ts`
  - Khi user đăng nhập/refresh token trên Web App, tự động broadcast message để Extension cập nhật token vào `chrome.storage.local`.

---

## Phase 8: Build Verification, Quality Review & Documentation

- [x] **T-EXT-20: Build & Bundle Validation**
  - Verify: Chạy `pnpm --filter @wordstreak/extension build` tạo ra thư mục `apps/extension/dist` hợp lệ với Manifest V3.
- [x] **T-EXT-21: Chạy Toàn bộ Test Suites Monorepo**
  - Verify: Pass 100% (329/329 Backend tests, 398/398 Frontend Web tests, 4/4 Extension tests).
- [x] **T-EXT-22: Tài liệu Kỹ thuật & Hướng dẫn Sử dụng**
  - Tạo `docs/features/browser-extension/README.md` và `docs/user-guides/browser-extension.md` (hướng dẫn cài đặt unpacked trên Chrome & Brave).
  - Cập nhật trạng thái `US-ECO-03` thành `[x]` trong `docs/PRODUCT_BACKLOG_ROADMAP.md`.
