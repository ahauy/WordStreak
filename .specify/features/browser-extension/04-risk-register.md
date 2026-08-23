# Risk & Contradiction Register: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23

---

## 1. Kết quả Quét Mâu thuẫn Logic & Tương thích (Contradiction Scan)

- **Mâu thuẫn logic nghiệp vụ (Logic Contradictions)**: `KHÔNG PHÁT HIỆN` — Luồng 1-Click Save, xử lý cảnh báo trùng lặp và khởi tạo thẻ SM-2 hoàn toàn nhất quán.
- **Bế tắc trạng thái (State Deadlocks)**: `KHÔNG PHÁT HIỆN` — Mọi trạng thái tương tác Content Script và Auth Sync đều có timeout tự hủy (2.5s) hoặc fallback thoát an toàn khi click ngoài/cuộn trang.
- **Tương thích ngược (Backward Compatibility)**: `100% TƯƠNG THÍCH` — Endpoint `POST /api/v1/cards/quick-capture` là tính năng mở rộng (additive), tương thích hoàn toàn với schema `Card` và `Deck` hiện tại.

---

## 2. Bảng Đăng ký Rủi ro (Risk Register)

| ID               | Rủi ro Kỹ thuật / Nghiệp vụ                                                          | Xác suất   | Tác động   | Giải pháp Giảm thiểu (Mitigation)                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-EXT-001** | Xung đột CSS giữa website chủ (host page) và giao diện tooltip/popup của Extension   | Cao        | Cao        | Bắt buộc đóng gói toàn bộ UI in-page trong **Shadow DOM (`attachShadow`)** với CSS reset độc lập (`BR-EXT-007`).                                   |
| **RISK-EXT-002** | Background Service Worker trong Manifest V3 tự tắt (ephemeral) làm mất dữ liệu/phiên | Cao        | Trung bình | Tuyệt đối không lưu state trong bộ nhớ RAM; lưu toàn bộ token và config vào `chrome.storage.local`.                                                |
| **RISK-EXT-003** | Trình duyệt chặn gọi API (CORS / CSP) từ Extension về Backend WordStreak             | Trung bình | Cao        | Khai báo `host_permissions: ["http://localhost:3000/*", "https://*.wordstreak.com/*"]` trong `manifest.json` và cấu hình CORS Origin trong NestJS. |
| **RISK-EXT-004** | Người dùng bôi đen liên tục làm spam request AI Dictionary                           | Thấp       | Trung bình | Áp dụng debounce (300ms) trên Content Script và Rate Limiting trên Backend `cards/quick-capture`.                                                  |

---

## 3. Tổng hợp Giả định & Ràng buộc (Consolidated Assumptions & Constraints)

- `ASM-EXT-001`: Hỗ trợ 100% mọi trình duyệt Chromium (Chrome, Brave, Edge, Arc, Opera, Cốc Cốc) qua Manifest V3.
- `ASM-EXT-002`: Toàn bộ UI in-page đóng gói qua Shadow DOM để chống vỡ CSS.
- `ASM-EXT-003`: JWT token và user settings được bảo vệ trong `chrome.storage.local`.
- `ASM-EXT-004`: Thẻ mới tự động khởi tạo trạng thái `NEW` (SM-2: `easeFactor = 2.50`, `interval = 0`).
- `ASM-EXT-005`: Backend hỗ trợ endpoint `POST /api/v1/cards/quick-capture` phân tích và enrich dữ liệu nguyên tử.
- `ASM-EXT-006`: Tuân thủ chuẩn Design System WordStreak (Obsidian Pill `#000000`, 1px hairline border, Mascot Ngọn lửa tím).

---

## 4. Bảng Phân loại Phạm vi (MoSCoW Scope Table)

### Must-Have (P0 — Bắt buộc phải có trong đợt phát hành này)

- Package `apps/extension` cấu hình chuẩn Manifest V3 + TypeScript + Vite.
- Content Script lắng nghe text selection, trích xuất câu ngữ cảnh và render Floating Flame Icon qua Shadow DOM.
- 1-Click Fast Save vào Default / Pinned Deck với Toast thông báo trạng thái.
- Backend API `POST /api/v1/cards/quick-capture` tự động tra cứu IPA/nghĩa và kiểm tra trùng lặp.
- Popup Action UI: Xem thông tin user, chọn Target Deck, xem danh sách 5 từ vừa lưu.
- Cơ chế Web SSO Sync token giữa Web App và Extension.

### Should-Have (P1 — Quan trọng)

- Options Page: Bật/tắt tự động hiện Floating Icon, quản lý danh sách domain loại trừ.
- Context Menu chuột phải ("Thêm vào WordStreak") và phím tắt `Alt+W`.
- Xử lý thêm câu ví dụ mới vào thẻ cũ khi phát hiện trùng lặp.

### Could-Have (P2 — Tùy chọn mở rộng)

- Hàng đợi lưu Offline khi mất mạng (Offline Queue).
- Nút phát âm thanh mẫu IPA ngay trên tooltip.

### Won't-Have (Ngoài phạm vi bản phát hành này)

- Màn hình ôn tập Spaced Repetition đầy đủ ngay trong popup Extension (ôn tập được thực hiện trên Web App/PWA).
- Bộ công cụ đọc & ghi chú file PDF chuyên dụng.
