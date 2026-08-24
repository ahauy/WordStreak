# Software Requirements Specification (SRS): Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23
- **Status**: Draft

---

### REQ-EXT-001: Lắng nghe Bôi đen Văn bản & Kích hoạt Floating Icon

- **Category**: Content Script & UI Interaction
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Content Script lắng nghe sự kiện `mouseup` và `selectionchange` trên toàn bộ trang web. Khi người dùng bôi đen từ 1 đến 5 từ tiếng Anh (2–60 ký tự), hiển thị một Floating Icon Ngọn lửa tím tại tọa độ con trỏ chuột. Icon tự động ẩn khi người dùng click ra ngoài hoặc cuộn trang.
- **Derived from**: `BR-EXT-001`, `BR-EXT-007`, `ASM-EXT-001`
- **Business Rules**: `BR-EXT-001`
- **Non-Functional Requirements**: Debounce 250ms, Shadow DOM isolation.

---

### REQ-EXT-002: Trích xuất Ngữ cảnh Câu Thông minh (Context Sentence Capture)

- **Category**: Natural Language / Text Processing
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Khi kích hoạt lưu từ, Content Script tự động phân tích DOM và trích xuất câu văn hoàn chỉnh chứa cụm từ được bôi đen (dựa trên dấu chấm câu `.`, `!`, `?`, `\n`, giới hạn tối đa 250 ký tự) để làm trường `exampleSentence`.
- **Derived from**: `BR-EXT-002`
- **Business Rules**: `BR-EXT-002`
- **Non-Functional Requirements**: Xử lý an toàn các ký tự đặc biệt và thẻ HTML lồng nhau.

---

### REQ-EXT-003: Backend Quick Capture API Endpoint

- **Category**: Backend API
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Backend NestJS cung cấp endpoint `POST /api/v1/cards/quick-capture` nhận DTO gồm `{ word, deckId?, contextSentence?, sourceUrl? }`. Endpoint tự động kiểm tra trùng lặp trong Deck, tự động tra cứu phiên âm IPA và nghĩa tiếng Việt qua dịch vụ Dictionary/AI nếu chưa có, khởi tạo thẻ ở trạng thái `NEW` (SM-2) và lưu vào database trong một transaction nguyên tử.
- **Derived from**: `BR-EXT-003`, `BR-EXT-004`, `BR-EXT-005`, `ASM-EXT-005`
- **Business Rules**: `BR-EXT-003`, `BR-EXT-004`, `BR-EXT-005`
- **Non-Functional Requirements**: Thời gian xử lý API P95 < 800ms.

---

### REQ-EXT-004: Trải nghiệm Lưu 1-Chạm (1-Click Fast Save & Toast)

- **Category**: In-page UI & Feedback
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Khi người dùng click vào Floating Icon, Extension gửi message tới Service Worker để gọi API Quick Capture. Hiển thị Toast thông báo trạng thái trực quan:
  - Thành công: "Đã thêm [Word] vào [Deck Name]" kèm nút "Đổi bộ từ" (tự ẩn sau 2.5s).
  - Trùng lặp: Cảnh báo "Từ đã có trong [Deck Name]" kèm nút "Thêm ví dụ mới".
  - Chưa đăng nhập: "Vui lòng đăng nhập để lưu từ" kèm nút "Đăng nhập".
- **Derived from**: `BR-EXT-003`, `BR-EXT-005`, `BR-EXT-006`
- **Business Rules**: `BR-EXT-003`, `BR-EXT-005`
- **Non-Functional Requirements**: Giao diện Toast không xâm lấn (non-intrusive).

---

### REQ-EXT-005: Popup Action UI & Quản lý Bộ từ Đích

- **Category**: Extension Popup UI
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Khi click icon Extension trên thanh công cụ trình duyệt, mở popup giao diện hiển thị:
  - Trạng thái tài khoản người dùng và avatar.
  - Dropdown chọn Bộ từ đích mặc định (`pinnedDeckId`).
  - Danh sách 5 từ vừa thu thập gần nhất từ web kèm ngày giờ và nút mở nhanh trên Web App.
  - Nút chuyển đến trang Cài đặt (Options) và Web App WordStreak.
- **Derived from**: `BR-EXT-003`, `BR-EXT-006`, `ASM-EXT-003`
- **Business Rules**: `BR-EXT-003`
- **Non-Functional Requirements**: Tuân thủ chuẩn Obsidian Pill và 1px hairline border của WordStreak.

---

### REQ-EXT-006: Đồng bộ Phiên Đăng nhập Web SSO (Auth Sync)

- **Category**: Authentication & Cross-Origin Sync
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Extension tự động lắng nghe và đồng bộ JWT Access Token từ Web App WordStreak khi người dùng đăng nhập. Token được lưu trữ an toàn trong `chrome.storage.local`. Khi token hết hạn (401), Extension cung cấp nút mở tab Web App để tái xác thực mượt mà.
- **Derived from**: `BR-EXT-006`, `ASM-EXT-003`
- **Business Rules**: `BR-EXT-006`
- **Non-Functional Requirements**: Bảo mật token, không rò rỉ token ra website thứ 3.

---

### REQ-EXT-007: Đóng gói Shadow DOM & Chuẩn Thiết kế Anti-AI-Slop

- **Category**: Security, Isolation & Styling
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Mọi thành phần giao diện in-page (Floating Icon, Quick Tooltip, Toast) bắt buộc render bên trong Shadow Root (`attachShadow`). Áp dụng nghiêm ngặt Design System: màu trắng `#ffffff`, viền `1px solid #e5e5e5`, nút Obsidian Pill `#000000`, Typography `Nunito`/`Inter`, Mascot Ngọn lửa tím.
- **Derived from**: `BR-EXT-007`, `ASM-EXT-002`, `ASM-EXT-006`
- **Business Rules**: `BR-EXT-007`
- **Non-Functional Requirements**: Không bị ảnh hưởng bởi CSS của bất kỳ website nào trên Internet.
