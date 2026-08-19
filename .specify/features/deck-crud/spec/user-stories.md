# User Stories: Deck CRUD & Management (US-DECK-01)

- **Feature**: Deck CRUD & Management
- **Protocol**: Bounded Task
- **Date**: 2026-08-19

---

### US-DECK-001: Tạo bộ từ vựng mới (Create Deck)

**As a** Authenticated Learner  
**I want to** tạo một bộ từ vựng mới với tiêu đề, mô tả, màu sắc, icon nhận diện và chế độ hiển thị  
**So that** tôi có thể phân loại và lưu trữ từ vựng theo từng chủ đề học tập cá nhân hóa

**Derived from**: `BR-DECK-001`, `BR-DECK-002`, `BR-DECK-003`, `ASM-DECK-001`, `ASM-DECK-004`

#### Acceptance Criteria:

- **Scenario 1 (Happy Path - Tạo Deck với Preset Cosmos Theme)**
  - **Given** người dùng đã đăng nhập và đang ở trang Quản lý Bộ từ (`/decks`)
  - **When** người dùng bấm nút **"+ Tạo Bộ Từ Mới"**, nhập tiêu đề `"IELTS Writing Task 2"`, chọn màu Preset `#6366F1` và Icon `Book`, rồi bấm **"Lưu bộ từ"**
  - **Then** hệ thống tạo mới Deck trong cơ sở dữ liệu với `userId` của người dùng, `isArchived = false`, `isPublic = false`
  - **And** hiển thị thông báo thành công và Deck mới xuất hiện ngay trên danh sách với 0 từ vựng

- **Scenario 2 (Happy Path - Tạo Deck với Custom Hex & Cover Image URL)**
  - **Given** người dùng đang ở Modal tạo Deck
  - **When** người dùng nhập tiêu đề `"Computer Science Vocabulary"`, nhập mã màu `#0EA5E9` và URL ảnh bìa hợp lệ `https://images.unsplash.com/photo-cs`
  - **Then** hệ thống lưu thành công Deck với mã màu và ảnh bìa tùy chỉnh

- **Scenario 3 (Edge Case - Tiêu đề không hợp lệ / Rỗng)**
  - **Given** người dùng đang ở Modal tạo Deck
  - **When** người dùng để trống tiêu đề hoặc chỉ nhập toàn khoảng trắng
  - **Then** hệ thống ngăn chặn submit, hiển thị thông báo lỗi inline: _"Tiêu đề bộ từ không được để trống (1-100 ký tự)"_

---

### US-DECK-002: Xem, tìm kiếm và lọc danh sách Bộ từ (View, Search & Filter Decks)

**As a** Authenticated Learner  
**I want to** xem danh sách toàn bộ các bộ từ của mình kèm số lượng thẻ và tiến độ ôn tập, có thể tìm kiếm và lọc  
**So that** tôi có thể dễ dàng theo dõi tình trạng học tập và chọn bộ từ muốn ôn tập

**Derived from**: `BR-DECK-004`, `BR-DECK-006`, `ASM-DECK-001`

#### Acceptance Criteria:

- **Scenario 1 (Happy Path - Xem danh sách và thống kê tiến độ)**
  - **Given** người dùng có 3 bộ từ trong tài khoản
  - **When** người dùng truy cập trang `/decks`
  - **Then** hệ thống hiển thị lưới danh sách 3 Deck Cards, mỗi thẻ hiển thị đầy đủ: Tên, Mô tả, Màu/Icon/Cover, Tổng số từ (`totalCards`), Số từ cần ôn hôm nay (`dueCards`), và thanh phân bố tiến độ (New / Learning / Mastered)

- **Scenario 2 (Happy Path - Tìm kiếm theo từ khóa)**
  - **Given** người dùng có các bộ từ `"IELTS Speaking"`, `"TOEIC Reading"`, `"Daily Idioms"`
  - **When** người dùng nhập `"ielts"` vào ô tìm kiếm
  - **Then** danh sách lọc ngay lập tức chỉ hiển thị bộ từ `"IELTS Speaking"`

- **Scenario 3 (Edge Case - Không tìm thấy kết quả)**
  - **Given** người dùng tìm kiếm từ khóa `"NonExistentDeck"`
  - **When** không có bộ từ nào khớp
  - **Then** hệ thống hiển thị Empty State minh họa: _"Không tìm thấy bộ từ nào phù hợp"_ kèm nút _"Xóa bộ lọc"_

---

### US-DECK-003: Cập nhật thông tin Bộ từ (Update Deck Details)

**As a** Authenticated Learner (Deck Owner)  
**I want to** chỉnh sửa tiêu đề, mô tả, màu sắc, biểu tượng hoặc quyền riêng tư của bộ từ  
**So that** thông tin bộ từ luôn chính xác và phù hợp với nhu cầu học tập

**Derived from**: `BR-DECK-001`, `BR-DECK-002`, `BR-DECK-003`, `BR-DECK-005`

#### Acceptance Criteria:

- **Scenario 1 (Happy Path - Chỉnh sửa thông tin thành công)**
  - **Given** người dùng là chủ sở hữu của Deck `"English Basic"`
  - **When** người dùng mở menu thao tác của Deck, chọn **"Chỉnh sửa"**, đổi tên thành `"English Essential Vocabulary"` và bấm **"Cập nhật"**
  - **Then** hệ thống lưu các thay đổi vào cơ sở dữ liệu và cập nhật giao diện ngay lập tức

- **Scenario 2 (Edge Case - Cố gắng chỉnh sửa Deck của người khác)**
  - **Given** người dùng A biết `id` Deck thuộc sở hữu của người dùng B
  - **When** người dùng A gửi request `PATCH /api/v1/decks/:deckBId`
  - **Then** hệ thống trả về mã lỗi `403 Forbidden` hoặc `404 Not Found`, từ chối cập nhật

---

### US-DECK-004: Lưu trữ và Khôi phục Bộ từ (Archive & Restore Deck)

**As a** Authenticated Learner  
**I want to** lưu trữ (archive) những bộ từ tạm thời không học và có thể khôi phục lại khi cần  
**So that** danh sách học tập chính luôn gọn gàng mà không bị mất dữ liệu thẻ hay tiến độ SM-2

**Derived from**: `BR-DECK-004`, `ASM-DECK-002`

#### Acceptance Criteria:

- **Scenario 1 (Happy Path - Lưu trữ Bộ từ)**
  - **Given** người dùng có Deck `"Old Vocabulary"` ở tab Active
  - **When** người dùng chọn hành động **"Lưu trữ bộ từ"**
  - **Then** Deck chuyển sang `isArchived = true`, biến mất khỏi tab Active và xuất hiện trong tab **"Đã lưu trữ" (Archived)**, toàn bộ thẻ và lịch sử SM-2 được giữ nguyên vẹn

- **Scenario 2 (Happy Path - Khôi phục Bộ từ đã lưu trữ)**
  - **Given** người dùng đang ở tab **"Đã lưu trữ"**
  - **When** người dùng bấm nút **"Khôi phục" (Restore)** trên Deck đã lưu trữ
  - **Then** Deck chuyển về `isArchived = false`, quay trở lại danh sách Active bình thường

---

### US-DECK-005: Xóa vĩnh viễn Bộ từ (Permanently Delete Deck with Cascade)

**As a** Authenticated Learner  
**I want to** xóa vĩnh viễn một bộ từ không còn nhu cầu sử dụng  
**So that** giải phóng không gian quản lý danh sách của tôi

**Derived from**: `BR-DECK-005`, `ASM-DECK-003`, `RISK-DECK-001`

#### Acceptance Criteria:

- **Scenario 1 (Happy Path - Xóa vĩnh viễn sau khi xác nhận cảnh báo)**
  - **Given** người dùng chọn xóa Deck `"Temp Deck"` đang có 25 thẻ từ vựng
  - **When** Modal cảnh báo nguy hiểm xuất hiện hiển thị rõ: _"Xóa bộ từ này sẽ xóa vĩnh viễn 25 thẻ từ và toàn bộ tiến độ học tập. Thao tác này không thể hoàn tác!"_
  - **And** người dùng bấm nút xác nhận **"Xóa vĩnh viễn"**
  - **Then** hệ thống thực hiện xóa bản ghi Deck cùng toàn bộ 25 Cards và UserCardProgress liên quan trong DB
  - **And** Deck biến mất khỏi giao diện kèm thông báo toast thành công
