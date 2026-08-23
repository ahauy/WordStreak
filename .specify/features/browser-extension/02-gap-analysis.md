# Gap Analysis: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23

---

## 1. AS-IS (Hiện trạng)

- **Hành vi người dùng hiện tại**:
  - Khi người dùng đang đọc báo (BBC, Medium, NYT), tài liệu chuyên ngành hoặc lướt web và gặp từ mới tiếng Anh, họ phải:
    1. Bôi đen và copy từ vựng.
    2. Mở một tab trình duyệt mới, gõ URL `http://localhost:5173` (hoặc `app.wordstreak.com`).
    3. Đăng nhập (nếu hết session), điều hướng tới trang Bộ từ (`/decks`), tìm và chọn đúng Deck.
    4. Bấm "Thêm thẻ mới" (`CreateCardModal`), paste từ vựng.
    5. Quay lại tab báo copy câu văn làm ví dụ, tự tra nghĩa tiếng Việt hoặc bấm nút AI Generate.
    6. Bấm "Lưu thẻ".
- **Hạn chế & Điểm nghẽn**:
  - Thời gian thao tác kéo dài (25–40 giây cho mỗi từ).
  - Gây đứt gãy luồng tư duy và hứng thú đọc hiểu (context-switching friction).
  - Tỷ lệ bỏ qua từ mới cao (>70% từ mới bị lãng quên khi đọc web vì thao tác quá rườm rà).

---

## 2. TO-BE (Trạng thái kỳ vọng)

- **Trải nghiệm đích**:
  - Người dùng cài đặt WordStreak Extension (Manifest V3) trên trình duyệt Chrome, Brave, Edge.
  - Khi bôi đen bất kỳ từ vựng nào trên trang web $\rightarrow$ icon Ngọn lửa WordStreak tím xuất hiện nhẹ nhàng cạnh con trỏ chuột.
  - Bấm 1-click vào icon $\rightarrow$ Hệ thống tự động trích xuất toàn bộ câu văn chứa từ đó, gọi AI/Dictionary điền phiên âm IPA, loại từ, nghĩa tiếng Việt và lưu ngay vào Deck mặc định.
  - Xuất hiện Toast thông báo thành công siêu tốc (< 1.5 giây), không rời khỏi trang web hiện tại.
  - Thẻ từ ngay lập tức đồng bộ về hệ sinh thái WordStreak, sẵn sàng cho các phiên ôn tập Spaced Repetition (SM-2).

---

## 3. Khoảng cách & Yêu cầu chuyển dịch (Gap Analysis)

### 3.1. Khoảng cách Chức năng (Functional Gaps)

1. **Frontend / Extension Workspace (`apps/extension`)**:
   - Chưa có package `apps/extension` trong monorepo.
   - Cần xây dựng `manifest.json` chuẩn Manifest V3.
   - **Content Script**: Lắng nghe sự kiện bôi đen văn bản (`window.getSelection()`), trích xuất câu bao quanh (`sentenceContext`), tiêm **Shadow DOM** để render Floating Action Icon và Quick Tooltip (chống xung đột CSS trang web).
   - **Background Service Worker**: Quản lý vòng đời MV3 (ephemeral), nhận message từ Content Script/Popup, xử lý xác thực và gọi API NestJS.
   - **Popup UI**: Màn hình khi bấm icon extension trên thanh công cụ (quản lý trạng thái Auth, chọn Default Deck, hiển thị lịch sử 5 từ vừa lưu).
   - **Options Page**: Cài đặt phím tắt, bật/tắt auto-floating icon, quản lý danh sách trang web loại trừ (blacklist).
2. **Backend API (`apps/api`)**:
   - Đã có `POST /decks/:deckId/cards` và `POST /ai/generate-card`.
   - Cần bổ sung/tối ưu endpoint `POST /api/v1/cards/quick-capture` để nhận `{ word, deckId, contextSentence, sourceUrl }`, tự động phân tích và enrich IPA/nghĩa chỉ trong 1 request nguyên tử duy nhất.

### 3.2. Khoảng cách Dữ liệu (Data Gaps)

- Schema database hiện tại (`Card` model) đã hỗ trợ đầy đủ: `front`, `back`, `phonetic`, `partOfSpeech`, `example`, `notes`, `state`, `easeFactor`, `interval`.
- Dữ liệu `sourceUrl` và `contextSentence` có thể được lưu trữ linh hoạt trong trường `example` và `notes` (hoặc mở rộng trường `sourceUrl` tùy chọn). Không phá vỡ tương thích ngược.

### 3.3. Tác động Người dùng (User Impact)

- Hoàn toàn tích cực và cộng hưởng (Additive). Không làm thay đổi hay gián đoạn các luồng tạo thẻ/ôn tập hiện có trên Web App.

### 3.4. Yêu cầu Chuyển tiếp & Triển khai (Transition Requirements)

- Không yêu cầu migration dữ liệu cũ.
- Extension được đóng gói bằng Vite/CRXJS (`pnpm --filter extension build`), hỗ trợ load unpacked trên môi trường Dev và xuất file `.zip` sẵn sàng upload lên Chrome Web Store.
