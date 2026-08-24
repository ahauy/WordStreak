# Elicitation: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23
- **Status**: COMPLETED & SIGNED-OFF

---

## Stage 1 — Business Value

- **Problem Statement**: Người học tiếng Anh thường xuyên gặp từ vựng mới khi đọc tin tức, báo chí, tài liệu chuyên ngành trên web. Việc phải mở tab khác, đăng nhập web app WordStreak và gõ thủ công tạo ra ma sát lớn làm đứt gãy luồng đọc (context switching friction) và thường làm mất ngữ cảnh câu văn nguyên bản.
- **Target Personas**:
  - **Authenticated Learner**: Người học có tài khoản WordStreak sử dụng trình duyệt máy tính nền tảng Chromium (Google Chrome, Brave, Microsoft Edge, Arc, Opera, Cốc Cốc).
- **Success Metrics**:
  - Tốc độ lưu từ mới (End-to-End Latency): < 1.5 giây từ lúc bôi đen đến khi lưu thành công vào Deck.
  - Tăng trưởng thu thập từ vựng: Tăng ít nhất 25% số lượng thẻ từ mới được tạo mỗi tuần trên mỗi active user.

---

## Confirmed Decisions (6 Domain Pillars)

### Pillar 1 — Xác thực & Phân quyền (Auth & RBAC)

- **Q1: Cơ chế Xác thực**: **Phương án A (Hybrid SSO Flow)**
  - Tự động kiểm tra và đồng bộ phiên đăng nhập từ Web App WordStreak (`localStorage`/Cookie).
  - Nếu chưa đăng nhập, Extension hiển thị nút "Đăng nhập với WordStreak" để mở tab Web App xác thực và tự động gửi token về `chrome.storage.local`.
  - Quyền hạn: Chỉ người dùng đã xác thực mới có quyền lưu từ vào Deck cá nhân; khách vãng lai (chưa đăng nhập) được hỗ trợ tra nhanh nghĩa và hiện lời mời đăng nhập.

### Pillar 2 — Trải nghiệm Lưu từ & Chọn Bộ từ (Target Deck Flow)

- **Q2: Luồng Lưu Thẻ**: **Phương án A (1-Click Fast Save)**
  - Bôi đen từ -> Bấm icon ngọn lửa/Nút Lưu nhanh -> Hệ thống lập tức lưu thẻ vào Deck mặc định (Deck gần nhất hoặc Inbox Deck) để không làm gián đoạn việc đọc.
  - Hiển thị Toast thông báo thành công không xâm lấn kèm action button "Đổi bộ từ" nếu người dùng muốn chuyển sang Deck khác.

### Pillar 3 — Trích xuất Ngữ cảnh & Làm giàu Dữ liệu (Context & AI Auto-fill)

- **Q3: Trích xuất Câu & Từ điển**: **Phương án A (Smart Context Capture & Auto-fill)**
  - Extension tự động trích xuất toàn bộ câu văn trên trang web đang chứa từ được bôi đen làm `exampleSentence`.
  - Gọi API Backend WordStreak (kết hợp AI Vocabulary / Dictionary service) để tự động tra cứu phiên âm IPA, loại từ (POS) và nghĩa tiếng Việt tương ứng, tạo thành thẻ từ vựng hoàn chỉnh.

### Pillar 4 — Tương tác Người dùng & Kích hoạt (Trigger Behavior)

- **Q4: Kích hoạt Tooltip trên trang web**: **Phương án A (Smart Floating Icon)**
  - Khi bôi đen cụm từ (1–4 từ), tự động hiển thị một icon Ngọn lửa WordStreak nhỏ gọn, tinh tế ngay sát con trỏ chuột.
  - Click vào icon sẽ mở popup tra cứu/lưu từ; nếu click ra ngoài hoặc cuộn trang thì icon tự ẩn.
  - Cung cấp tùy chọn Bật/Tắt chế độ tự động hiện icon trong trang Cài đặt (Options) của Extension; hỗ trợ thêm phím tắt nhanh (`Alt+W` / `Cmd+Shift+W`) và Context Menu chuột phải.

### Pillar 5 — Xử lý Trùng lặp & Tính toàn vẹn Dữ liệu (Duplicate Handling)

- **Q5: Xử lý Thẻ Trùng lặp**: **Phương án A (Cảnh báo & Cho phép bổ sung ngữ cảnh)**
  - Nếu từ bôi đen đã tồn tại trong Deck đích, hệ thống hiển thị badge _"Đã có trong Deck"_.
  - Cho phép người dùng bấm _"Thêm câu ví dụ mới vào thẻ hiện có"_ (Append example sentence) hoặc bỏ qua mà không làm hỏng tiến độ học SM-2 trước đó.

### Pillar 6 — Trạng thái Thực thể & Spaced Repetition (State Machine)

- Mọi thẻ từ mới tạo qua Extension được gán trạng thái ban đầu `NEW`, hệ số dễ `easeFactor = 2.50`, khoảng cách ôn tập `interval = 0`, sẵn sàng cho chu trình học Spaced Repetition (SM-2) trên Web App.

---

## Assumptions Confirmed

- `ASM-EXT-001`: Extension tuân thủ chuẩn **Manifest V3 (MV3)**, hỗ trợ 100% tất cả trình duyệt Chromium (Chrome, Brave, Edge, Arc, Opera, Cốc Cốc).
- `ASM-EXT-002`: In-page Tooltip / Overlay UI trên trang web của người dùng được đóng gói bên trong **Shadow DOM (`attachShadow`)** để cô lập hoàn toàn CSS, chống xung đột màu sắc/font chữ với website gốc.
- `ASM-EXT-003`: Token xác thực (JWT) và cấu hình người dùng (ID Deck mặc định, tùy chọn hiển thị) được lưu trữ an toàn trong `chrome.storage.local`.
- `ASM-EXT-004`: Mọi thẻ từ tạo qua Extension được tự động khởi tạo ở trạng thái `NEW` trong thuật toán Spaced Repetition (SM-2).
- `ASM-EXT-005`: Backend cung cấp API endpoint chuyên dụng cho Quick Capture (hỗ trợ trích xuất câu ví dụ `sourceUrl`, `contextSentence`, `word`, `deckId`).
- `ASM-EXT-006`: Tuân thủ nghiêm ngặt Anti-AI-Slop và Design System của WordStreak (Màu tím ngọn lửa Mascot, nút Obsidian Pill `#000000`, 1px hairline border, typography Nunito/Inter).
