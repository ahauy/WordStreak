# Feature Specification: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Feature**: `browser-extension` | **Story ID**: `US-ECO-03` | **Date**: 2026-08-23  
**Status**: APPROVED & READY FOR PLANNING | **Source**: [baseline.md](./baseline.md)

---

## 1. Overview & Business Value

WordStreak Chrome Extension (chuẩn Manifest V3) là tiện ích mở rộng trình duyệt giúp người học tiếng Anh tra cứu nhanh và lưu trực tiếp từ vựng khi đang duyệt web (báo chí, tài liệu chuyên ngành, blog...) mà không cần chuyển tab hay đăng nhập thủ công vào web app. Tiện ích tự động trích xuất toàn bộ câu ngữ cảnh (`exampleSentence`), sử dụng AI/Dictionary backend để gợi ý phiên âm IPA, nghĩa tiếng Việt, kiểm tra trùng lặp và lưu vào Bộ từ với trạng thái `NEW` trong thuật toán Spaced Repetition (SM-2).

---

## 2. Target Platforms & Compatibility

- **Engine Target**: Chromium 100+ (Google Chrome, Brave Browser, Microsoft Edge, Arc, Opera, Cốc Cốc).
- **Extension Standard**: Chrome Manifest V3 (MV3) với Background Service Worker dạng ngắn hạn (ephemeral).
- **Style Isolation**: Shadow DOM (`mode: 'open'`) cho tất cả In-page Overlays (Floating Icon, Toast, Tooltip).

---

## 3. Detailed Technical Requirements

### 3.1. Content Script & Web Page Injections (`REQ-EXT-001`, `REQ-EXT-002`, `REQ-EXT-007`)

- Lắng nghe sự kiện bôi đen văn bản (`selectionchange`, `mouseup`).
- Bộ lọc hợp lệ: 1–5 từ tiếng Anh (2–60 ký tự), bỏ qua số, email, URL, ký tự đặc biệt vô nghĩa (`BR-EXT-001`).
- Thuật toán trích xuất câu ngữ cảnh (`BR-EXT-002`): Tìm ranh giới câu quanh vùng bôi đen (dấu chấm `.`, `!`, `?`, `\n`), tối đa 250 ký tự.
- Render icon Ngọn lửa tím WordStreak sát con trỏ chuột bên trong Shadow Root.
- Bấm icon $\rightarrow$ Kích hoạt 1-Click Fast Save hoặc mở Quick Tooltip.

### 3.2. Background Service Worker & Messaging (`REQ-EXT-003`, `REQ-EXT-006`)

- Xử lý message từ Content Script và Popup:
  - `ACTION_QUICK_CAPTURE`: Gọi API Backend `POST /api/v1/cards/quick-capture`.
  - `ACTION_GET_AUTH_STATUS`: Đọc JWT token từ `chrome.storage.local`.
  - `ACTION_SYNC_TOKEN`: Nhận token từ Web App WordStreak qua web messaging/storage.
  - `ACTION_FETCH_DECKS`: Lấy danh sách Deck của user để hiển thị dropdown trong Popup.
- Xử lý lỗi kết nối, token hết hạn (401) và chuyển tiếp kết quả về Content Script.

### 3.3. Extension Action Popup UI (`REQ-EXT-005`)

- Cửa sổ nhỏ gọn (360px x 480px) xuất hiện khi bấm icon extension trên toolbar:
  - Header: Logo Mascot ngọn lửa tím, trạng thái đăng nhập, Avatar/Tên người dùng.
  - Target Deck Selector: Dropdown chọn Deck mặc định để lưu (`pinnedDeckId`).
  - Recent Captures: Danh sách 5 từ mới lưu gần nhất (từ vựng, nghĩa, ngày tạo, nút xem trên Web App).
  - Quick Search / Manual Add: Ô tìm kiếm/tra từ nhanh.
  - Footer: Nút mở Web App WordStreak và trang Cài đặt (Options).

### 3.4. Backend Quick Capture Endpoint (`REQ-EXT-003`)

- **Route**: `POST /api/v1/cards/quick-capture` (Protected by `JwtAuthGuard`).
- **Input DTO (`QuickCaptureCardDto`)**:
  ```typescript
  {
    word: string;             // 1-100 ký tự (bắt buộc)
    deckId?: string;          // UUID của Deck đích (tùy chọn, fallback sang pinned/default/inbox)
    contextSentence?: string; // Câu ngữ cảnh trích xuất (tối đa 500 ký tự)
    sourceUrl?: string;       // URL trang web nguồn
  }
  ```
- **Xử lý**:
  - Phân giải Deck đích: Nếu không truyền `deckId`, tìm Deck mặc định hoặc tự động tạo Deck _"Inbox / Thu thập Web"_.
  - Kiểm tra trùng lặp: Tìm kiếm từ vựng trong Deck (case-insensitive).
  - Nếu đã tồn tại: Trả về `{ isDuplicate: true, card: existingCard }`.
  - Nếu chưa có: Tự động tra cứu IPA/nghĩa qua `AiVocabularyService` / Từ điển, khởi tạo `state = NEW`, `easeFactor = 2.50`, `interval = 0` và lưu vào PostgreSQL.

---

## 4. Design System Compliance & Anti-AI-Slop

- Giao diện tài liệu tối giản: Nền trắng tinh khiết (`#ffffff`), đường viền hairline 1px (`#e5e5e5`/`#d4d4d4`).
- CTA Buttons: Obsidian Pure Black (`#000000`, `rounded-full`, text trắng, padding cân đối).
- Typography: Tiêu đề `Nunito`, nội dung `Inter`, code/phiên âm `JetBrains Mono`.
- Mascot Ngọn lửa WordStreak tím thương hiệu làm điểm nhấn nhận diện.
