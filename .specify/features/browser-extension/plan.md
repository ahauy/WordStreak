# Implementation Plan: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Feature**: `browser-extension` | **Story ID**: `US-ECO-03` | **Date**: 2026-08-23  
**Status**: APPROVED & READY FOR TASKS | **Spec**: [spec.md](./spec.md)

---

## 1. Technical Context & Monorepo Layout

- **Monorepo Structure**: pnpm workspace
  - `packages/shared-types`: Khai báo DTOs và types dùng chung (`QuickCaptureCardDto`, `QuickCaptureResponseDto`, `ExtensionStorageState`).
  - `apps/api`: NestJS 11 + Prisma ORM + PostgreSQL. Thêm endpoint `POST /api/v1/cards/quick-capture` và service logic kiểm tra trùng lặp, auto-enrichment.
  - `apps/extension` _(New Workspace App)_: Vite 6/8 + React 19 + TypeScript 5.7+ + TailwindCSS + `@crxjs/vite-plugin` (hoặc custom Vite multi-entry build cho MV3).
  - `apps/web`: React 19 + Vite. Thêm cơ chế broadcast auth token cho extension khi user đăng nhập.
- **Target Platforms**: Google Chrome, Brave, Microsoft Edge, Arc, Opera (Chromium 100+).
- **Extension Manifest**: Manifest V3 (`manifest.json`) với Service Worker background.

---

## 2. Architecture & Design Principles

```
apps/extension/
├── manifest.json                  # Manifest V3 configuration (permissions, icons, scripts)
├── package.json                   # Workspace package config
├── tsconfig.json
├── vite.config.ts                 # Multi-input build (popup, options, content, background)
├── src/
│   ├── background/
│   │   ├── index.ts               # Service Worker entry (message router, API caller, auth sync)
│   │   └── api-client.ts          # Fetch wrapper sending Authorization Bearer token
│   ├── content/
│   │   ├── index.ts               # Content script entry (selection listeners, debounce)
│   │   ├── sentence-extractor.ts  # Trích xuất câu văn ngữ cảnh quanh từ được chọn
│   │   ├── shadow-dom.ts          # Mount & Encapsulate UI in Shadow Root
│   │   └── components/
│   │       ├── FloatingFlameIcon.tsx # Icon ngọn lửa tím nổi cạnh con trỏ chuột
│   │       └── InPageToast.tsx    # Toast thông báo kết quả lưu 1-click
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── PopupApp.tsx           # UI chính của Popup (Deck selector, recent cards, auth card)
│   │   └── components/
│   ├── options/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── OptionsApp.tsx         # Trang cài đặt (toggle auto-icon, blacklist domains)
│   └── shared/
│       ├── storage.ts             # Typed wrapper around chrome.storage.local
│       └── constants.ts
```

---

## 3. Phased Implementation Plan

### Phase 1: Shared Types & DTO Contracts (`packages/shared-types`)

- Thêm `QuickCaptureCardDto`, `QuickCaptureResponseDto`, `ExtensionStorageState` vào `packages/shared-types/src/cards.ts` và index export.
- Chạy `pnpm --filter shared-types build`.

### Phase 2: Backend Quick Capture Endpoint (`apps/api`)

- Viết DTO `QuickCaptureCardDto` với `class-validator` (`@IsNotEmpty`, `@IsOptional`, `@MaxLength`).
- Cập nhật `CardsService.quickCapture(userId, dto)`:
  - Phân giải Deck đích (nếu không truyền `deckId`, tìm Default Deck hoặc tự tạo Deck _"Inbox / Thu thập Web"_).
  - Kiểm tra từ vựng trùng lặp trong Deck (case-insensitive).
  - Tự động tra cứu phiên âm IPA và nghĩa tiếng Việt nếu chưa có.
  - Khởi tạo thẻ ở trạng thái `NEW` (SM-2: `easeFactor = 2.50`, `interval = 0`).
- Thêm endpoint `POST cards/quick-capture` vào `CardsController`.
- Viết Unit/Integration Tests (`cards.controller.spec.ts`, `cards.service.spec.ts`).

### Phase 3: Tạo Workspace Package `apps/extension`

- Khởi tạo `apps/extension/package.json` kết nối vào pnpm workspace.
- Cấu hình `manifest.json` (Manifest V3, `permissions: ["storage", "activeTab", "contextMenus"]`, `host_permissions: ["http://localhost:3000/*", "https://*.wordstreak.com/*"]`).
- Cấu hình `vite.config.ts` build multi-entry cho Content Script, Background Worker, Popup và Options.

### Phase 4: Content Script & Shadow DOM In-page Overlay

- Xây dựng thuật toán trích xuất câu `sentence-extractor.ts` (`.`, `!`, `?`, `\n`).
- Lắng nghe sự kiện bôi đen `mouseup` / `selectionchange` (1–5 từ) với debounce 200ms.
- Tạo Shadow Root (`attachShadow({ mode: 'open' })`) để gắn `FloatingFlameIcon` và `InPageToast`.
- Đảm bảo 100% style isolation chống xung đột CSS.

### Phase 5: Background Service Worker & Messaging

- Xây dựng `background/index.ts` xử lý các message: `QUICK_CAPTURE`, `GET_AUTH_STATUS`, `FETCH_DECKS`, `SET_AUTH_TOKEN`.
- Tương tác bền vững với `chrome.storage.local`.
- Xử lý gọi API với retry và catch 401 Unauthorized.

### Phase 6: Extension Popup UI & Options Page

- Xây dựng `PopupApp.tsx` chuẩn WordStreak Design System:
  - Mascot ngọn lửa tím, trạng thái đăng nhập.
  - Dropdown chọn Bộ từ đích (`pinnedDeckId`).
  - Danh sách 5 từ vừa lưu gần nhất kèm nút xem chi tiết.
- Xây dựng `OptionsApp.tsx` (bật/tắt tự động hiện icon nổi, blacklist domain).

### Phase 7: Web App SSO Auth Synchronization (`apps/web`)

- Thêm cơ chế gửi message / custom event hoặc BroadcastChannel đồng bộ auth token sang Extension khi người dùng đăng nhập trên Web App.

### Phase 8: Quality Review, Build Verification & Documentation

- Chạy toàn bộ test suites (`pnpm test`, `pnpm --filter api test`).
- Kiểm tra build extension (`pnpm --filter extension build`).
- Cập nhật tài liệu kỹ thuật và hướng dẫn sử dụng.
