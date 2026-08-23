# User Stories: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23
- **Status**: Draft

---

### US-EXT-001: Tra cứu & Lưu từ vựng 1-Click trên trang web

**As a** Người học tiếng Anh đang đọc tin tức/tài liệu trên trình duyệt  
**I want to** Bôi đen từ mới và bấm 1-click vào icon Ngọn lửa WordStreak nổi cạnh con trỏ chuột  
**So that** Tôi có thể lưu ngay từ đó vào Bộ từ mà không bị gián đoạn luồng đọc và không phải chuyển tab  
**Traces to**: `REQ-EXT-001`, `REQ-EXT-004`, `REQ-EXT-007`

**Acceptance Criteria**:

- **Scenario 1 (Happy path - 1-Click Lưu nhanh vào Default Deck)**
  - Given người dùng đã cài Extension và đăng nhập tài khoản WordStreak, đang đọc một bài báo trên trình duyệt
  - When người dùng bôi đen từ "ubiquitous" (độ dài 1-5 từ)
  - Then một icon Ngọn lửa tím xuất hiện ngay cạnh con trỏ chuột (được đóng gói trong Shadow DOM)
  - When người dùng click vào icon Ngọn lửa
  - Then hệ thống gọi API Quick Capture lưu từ vào Deck mặc định, hiển thị Toast xanh "Đã thêm ubiquitous vào Inbox Deck" trong 2.5 giây rồi tự ẩn.
- **Scenario 2 (Từ vựng đã tồn tại trong Deck - Duplicate Warning)**
  - Given người dùng bôi đen một từ đã có trong Deck đích
  - When người dùng click lưu từ
  - Then hiển thị Toast cảnh báo "Từ này đã có trong Inbox Deck" kèm nút hành động "Thêm ví dụ mới"
  - When người dùng bấm "Thêm ví dụ mới"
  - Then hệ thống cập nhật câu ngữ cảnh mới vào thẻ mà không reset tiến độ học SM-2.
- **Scenario 3 (Chưa đăng nhập - Auth Required)**
  - Given người dùng cài Extension nhưng chưa đăng nhập WordStreak
  - When người dùng bôi đen từ và bấm icon lưu
  - Then hiển thị Toast "Vui lòng đăng nhập để lưu từ" kèm nút "Đăng nhập"
  - When người dùng click "Đăng nhập", mở tab Web App WordStreak để xác thực.

---

### US-EXT-002: Tự động trích xuất câu ngữ cảnh & AI làm giàu dữ liệu thẻ

**As a** Người học tiếng Anh  
**I want to** Extension tự động lấy câu văn chứa từ trên trang web và tự động điền phiên âm IPA, nghĩa tiếng Việt  
**So that** Thẻ từ vựng của tôi luôn có đầy đủ ngữ cảnh thực tế và phát âm chuẩn để ôn tập hiệu quả  
**Traces to**: `REQ-EXT-002`, `REQ-EXT-003`

**Acceptance Criteria**:

- **Scenario 1 (Tự động cắt câu ngữ cảnh)**
  - Given người dùng bôi đen từ "resilience" trong câu: "Economic resilience is crucial for long-term growth."
  - When người dùng bấm lưu thẻ
  - Then hệ thống tự động trích xuất nguyên văn câu "Economic resilience is crucial for long-term growth." làm trường `exampleSentence`.
- **Scenario 2 (Backend AI/Dictionary Auto-enrichment)**
  - Given backend nhận request `POST /api/v1/cards/quick-capture` với từ "resilience"
  - When backend xử lý
  - Then backend tự động sinh `phonetic = /rɪˈzɪliəns/`, `partOfSpeech = noun`, `back = sự kiên cường, khả năng phục hồi`, gán `state = NEW` (SM-2) và lưu vào database.

---

### US-EXT-003: Quản lý Bộ từ đích & Danh sách từ vừa lưu trên Popup Extension

**As a** Người học tiếng Anh  
**I want to** Mở popup Extension từ thanh công cụ trình duyệt để chọn Deck muốn lưu và xem lại các từ vừa lưu  
**So that** Tôi dễ dàng quản lý đích đến của từ vựng và xem lại nhanh các từ mình vừa thu thập trong ngày  
**Traces to**: `REQ-EXT-005`

**Acceptance Criteria**:

- **Scenario 1 (Chọn Deck mặc định)**
  - Given người dùng mở Popup Extension
  - When người dùng chọn một Deck từ danh sách dropdown (ví dụ: "IELTS Reading Vocabulary")
  - Then Extension lưu lựa chọn vào `chrome.storage.local`, các lần 1-Click Save tiếp theo trên web sẽ tự động lưu vào Deck này.
- **Scenario 2 (Xem danh sách từ vừa thu thập)**
  - Given người dùng vừa lưu 3 từ mới từ các trang báo khác nhau
  - When người dùng mở Popup Extension
  - Then hiển thị danh sách 3 từ gần nhất kèm nghĩa tóm tắt, ngày lưu và nút bấm chuyển nhanh đến thẻ trên Web App.

---

### US-EXT-004: Đồng bộ phiên đăng nhập tự động (Web SSO Sync)

**As a** Người dùng WordStreak  
**I want to** Extension tự động nhận diện tài khoản khi tôi đăng nhập trên Web App WordStreak  
**So that** Tôi không phải gõ lại mật khẩu nhiều lần trên Extension  
**Traces to**: `REQ-EXT-006`

**Acceptance Criteria**:

- **Scenario 1 (Đồng bộ phiên tự động khi đăng nhập Web)**
  - Given người dùng mở tab Web App `http://localhost:5173` và đăng nhập thành công
  - When Web App khởi tạo token
  - Then Extension tự động nhận token và chuyển trạng thái sang `AUTHENTICATED`, hiển thị avatar và tên người dùng trong popup.
