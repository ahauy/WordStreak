# Domain Model: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23

---

## 1. RBAC Matrix

| Role                       | Tra từ nhanh trên Web (Tooltip) | Lưu 1-Click vào Deck         | Đổi Target Deck | Quản lý Cài đặt Extension | Xem Lịch sử Từ vừa lưu |
| -------------------------- | ------------------------------- | ---------------------------- | --------------- | ------------------------- | ---------------------- |
| **Guest (Chưa đăng nhập)** | ✅ Cho phép (Preview nghĩa)     | ❌ Yêu cầu Đăng nhập         | ❌ Không        | ⚠️ Cài đặt cục bộ cơ bản  | ❌ Không               |
| **Learner (Đã đăng nhập)** | ✅ Đầy đủ                       | ✅ Đầy đủ (Vào Deck cá nhân) | ✅ Đầy đủ       | ✅ Đầy đủ                 | ✅ 10 từ gần nhất      |
| **Pro Subscriber**         | ✅ Đầy đủ                       | ✅ Đầy đủ + AI Deep Enrich   | ✅ Đầy đủ       | ✅ Đầy đủ                 | ✅ Không giới hạn      |
| **System Admin**           | ✅ Đầy đủ                       | ✅ Đầy đủ                    | ✅ Đầy đủ       | ✅ Đầy đủ                 | ✅ Đầy đủ              |

---

## 2. State Machines & Lifecycles

### 2.1. Vòng đời Tương tác Quick Capture trên Trang Web (Content Script)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> TEXT_SELECTED: Người dùng bôi đen 1-4 từ
    TEXT_SELECTED --> FLOATING_ICON_VISIBLE: Bôi đen hợp lệ (BR-EXT-001)
    TEXT_SELECTED --> IDLE: Click ra ngoài / Bỏ chọn

    FLOATING_ICON_VISIBLE --> CAPTURE_LOADING: Bấm icon Ngọn lửa tím
    FLOATING_ICON_VISIBLE --> IDLE: Cuộn trang / Click ra ngoài

    CAPTURE_LOADING --> SAVED_SUCCESS: API trả về 201 Created
    CAPTURE_LOADING --> DUPLICATE_WARNING: API trả về isDuplicate=true
    CAPTURE_LOADING --> AUTH_REQUIRED: API trả về 401 Unauthorized
    CAPTURE_LOADING --> CAPTURE_FAILED: Lỗi kết nối / Server 500

    SAVED_SUCCESS --> IDLE: Tự đóng sau 2.5s hoặc click ra ngoài
    DUPLICATE_WARNING --> APPENDING_EXAMPLE: Bấm "Thêm ví dụ mới"
    DUPLICATE_WARNING --> IDLE: Bấm "Bỏ qua"
    APPENDING_EXAMPLE --> SAVED_SUCCESS: Cập nhật thành công
    AUTH_REQUIRED --> IDLE: Mở tab đăng nhập Web App
    CAPTURE_FAILED --> IDLE: Hiển thị Toast lỗi + Nút Thử lại
```

### 2.2. Vòng đời Xác thực & Đồng bộ Phiên (Auth Sync Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> CHECKING_SESSION: Extension khởi động
    CHECKING_SESSION --> AUTHENTICATED: Token hợp lệ trong chrome.storage.local
    CHECKING_SESSION --> UNAUTHENTICATED: Không có token / Token rỗng

    UNAUTHENTICATED --> WEB_SSO_OPENED: Bấm "Đăng nhập với WordStreak"
    WEB_SSO_OPENED --> SYNCING_TOKEN: Người dùng đăng nhập thành công trên Web
    SYNCING_TOKEN --> AUTHENTICATED: Token truyền qua message/storage

    AUTHENTICATED --> SESSION_EXPIRED: Token hết hạn (401 response)
    SESSION_EXPIRED --> UNAUTHENTICATED: Xóa token cũ, thông báo người dùng
```

---

## 3. Quy tắc Nghiệp vụ (Business Rules)

- **`BR-EXT-001` (Text Selection Filter)**: Extension chỉ kích hoạt Floating Icon khi độ dài chuỗi bôi đen từ 1 đến 5 từ (độ dài ký tự từ 2 đến 60 ký tự). Bỏ qua các chuỗi chỉ chứa số, ký tự đặc biệt, URL hoặc email.
- **`BR-EXT-002` (Smart Context Sentence Extraction)**: Tự động trích xuất toàn bộ câu văn chứa từ được bôi đen bằng thuật toán quét ranh giới câu (`.`, `!`, `?`, `\n`, `<p>`, `<li>`). Giới hạn độ dài câu tối đa 250 ký tự để đảm bảo tính ngắn gọn và tập trung của flashcard.
- **`BR-EXT-003` (Target Deck Resolution & Auto-provisioning)**:
  - Khi lưu từ 1-click, hệ thống ưu tiên lưu vào `pinnedDeckId` đã chọn trong Extension.
  - Nếu chưa có `pinnedDeckId`, ưu tiên lưu vào Deck gần nhất (`lastUsedDeckId`).
  - Nếu tài khoản người dùng chưa có bất kỳ Deck nào, hệ thống tự động khởi tạo Deck mang tên _"Inbox / Thu thập Web"_ và gán thẻ mới vào Deck này.
- **`BR-EXT-004` (SM-2 Initial State)**: Mọi thẻ từ tạo qua Extension bắt buộc phải khởi tạo với `state = NEW`, `easeFactor = 2.50`, `interval = 0`, `repetitions = 0`.
- **`BR-EXT-005` (Duplicate Resilience & Append Context)**:
  - Nếu từ vựng (không phân biệt hoa thường) đã tồn tại trong Deck đích, hệ thống trả về thông báo cảnh báo trùng lặp.
  - Người dùng có thể chọn _"Thêm ví dụ mới vào thẻ hiện có"_ $\rightarrow$ Hệ thống nối thêm câu ngữ cảnh vào trường `notes` của thẻ cũ mà **KHÔNG** làm thay đổi tiến độ ôn tập SM-2 (`state`, `interval`, `easeFactor`).
- **`BR-EXT-006` (Token Storage & Transport Security)**: Token JWT được lưu độc quyền trong `chrome.storage.local` (cách ly hoàn toàn với các extension khác và script của trang web thứ 3). Mọi lệnh gọi API gửi qua header `Authorization: Bearer <token>`.
- **`BR-EXT-007` (Shadow DOM Isolation)**: Toàn bộ thành phần UI nổi trên trang web (Content Script) bắt buộc phải đóng gói trong **Shadow Root (`attachShadow({ mode: 'open' })`)** để miễn nhiễm 100% với CSS bên ngoài.

---

## 4. Sơ đồ Thực thể & Dữ liệu (Entity Model Sketch)

```mermaid
erDiagram
    USER ||--o{ DECK : owns
    DECK ||--o{ CARD : contains
    USER ||--o{ EXTENSION_SETTINGS : configures

    CARD {
        string id PK
        string deckId FK
        string front "Từ vựng (Word)"
        string back "Nghĩa tiếng Việt (Definition)"
        string phonetic "Phiên âm IPA"
        string partOfSpeech "Loại từ (n, v, adj...)"
        string example "Câu ngữ cảnh trích xuất"
        string notes "Ghi chú & Source URL"
        string state "NEW / LEARNING / REVIEW / MASTERED"
        float easeFactor "Mặc định 2.50"
        int interval "Mặc định 0"
        int repetitions "Mặc định 0"
        datetime createdAt
    }

    EXTENSION_SETTINGS {
        string userId PK
        string pinnedDeckId FK
        boolean autoShowFloatingIcon "Mặc định true"
        string shortcutKey "Mặc định Alt+W"
        string[] blacklistedDomains "Danh sách domain tắt icon"
    }
```

---

## 5. Yêu cầu Phi Chức năng & UX (NFRs)

- **Design System & Anti-AI-Slop**:
  - Khung giao diện trắng tối giản (`#ffffff`), đường viền hairline 1px (`#e5e5e5`/`#d4d4d4`).
  - Nút bấm Obsidian Pure Black (`#000000`, `rounded-full`, text trắng).
  - Mascot Ngọn lửa WordStreak tím thương hiệu làm icon kích hoạt.
  - Typography: `Nunito` cho tiêu đề, `Inter` cho nội dung, `JetBrains Mono` cho phiên âm/mã.
  - Tuyệt đối không dùng gradient lòe loẹt, neon glow hoặc dark-mode mờ ảo không theo chuẩn.
- **Hiệu năng & Trải nghiệm**:
  - Thời gian phản hồi 1-click capture: P95 < 1.5 giây.
  - Tự động huỷ popup/icon khi người dùng cuộn trang hoặc click ra ngoài để không gây cản trở đọc văn bản.
- **Khả năng tương thích**: 100% hoạt động mượt mà trên Chrome, Brave, Microsoft Edge, Opera, Arc.
