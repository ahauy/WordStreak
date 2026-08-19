# Elicitation: Deck CRUD & Management (US-DECK-01)

- **Feature**: Deck CRUD & Vocabulary Management
- **Protocol**: Bounded Task
- **Date**: 2026-08-19

## Stage 1 — Business Value

- **Problem & Friction**: Người học cần một không gian có tổ chức để phân loại từ vựng tiếng Anh theo các chủ đề hoặc mục tiêu học cụ thể (ví dụ: IELTS 7.5, TOEIC 800, Lập trình IT, Giao tiếp nhà hàng). Nếu không có Deck CRUD, toàn bộ từ vựng sẽ bị dồn chung, gây khó khăn cho việc quản lý, theo dõi tiến độ và học tập có định hướng.
- **Target Personas**:
  - **Learner (Primary)**: Muốn tự tạo các bộ từ riêng biệt, gán màu sắc và biểu tượng nhận diện để dễ nhớ, tìm kiếm và chọn bộ từ để ôn tập.
  - **Guest**: Chưa đăng nhập, được chuyển hướng về trang Login/Register khi truy cập Deck Management.
- **Success Metrics**:
  - Tỷ lệ người dùng tạo ít nhất 1 Deck cá nhân > 80% sau khi đăng ký.
  - Thời gian tạo mới một Deck < 5 giây (UI trực quan, responsive).
  - P95 API response time cho `GET /api/v1/decks` (kèm aggregation thống kê từ) < 150ms.

---

## Pillar 1 — Personas, Actors & RBAC

**Q1: Ownership & Visibility**

- **Decision**: Learner là chủ sở hữu (Owner) của Deck.
- Mặc định `isPublic = false` (Deck riêng tư).
- Chỉ Owner mới có quyền tạo, xem chi tiết, sửa, lưu trữ (Archive), khôi phục (Restore), và xóa vĩnh viễn (Hard Delete) Deck của mình.
- User khác không thể xem hoặc chỉnh sửa private deck của người khác.

---

## Pillar 2 — State Machine & Lifecycle

**Q2: Deletion & Archive Policy**

- **Decision**: Hỗ trợ cơ chế **Soft Delete / Archive** (`isArchived: boolean`) VÀ **Hard Delete** (xóa vĩnh viễn):
  - **Archive**: Đưa Deck vào danh sách Lưu trữ, ẩn khỏi danh sách học chủ động trên Dashboard, có thể khôi phục (Restore) bất cứ lúc nào.
  - **Hard Delete**: Xóa vĩnh viễn Deck kèm toàn bộ Cards và UserCardProgress trong 1 transaction (Cascade), yêu cầu Modal xác nhận rõ ràng số lượng từ vựng bị ảnh hưởng để tránh rủi ro mất dữ liệu ngoài ý muốn.

---

## Pillar 3 — Business Rules & Visual Customization

**Q3: Visual Styling (Color & Icon/Cover)**

- **Decision**: Hỗ trợ **cả hai phương thức**:
  - **Preset Palette & Icons**: Bộ 8 màu chuẩn Cosmos theme + 12 Lucide icon chủ đề (Book, Sparkles, Code, Globe, Briefcase, Heart, Dumbbell, Music, Plane, Coffee, Lightbulb, Star).
  - **Customization**: Cho phép nhập mã màu Custom Hex Code (`#RRGGBB`) và cung cấp URL ảnh bìa tùy chỉnh (`coverImageUrl`).

---

## Pillar 4 — UX & Workflows

**Q4: Search, Filter & Summary Stats**

- **Decision**:
  - Trang `/decks` hỗ trợ tìm kiếm nhanh theo tiêu đề và mô tả của Deck.
  - Hỗ trợ lọc theo tab: **Active (Đang học)** / **Archived (Đã lưu trữ)**.
  - Sắp xếp theo: Mới nhất (Newest), Tên A-Z (Alphabetical), Số lượng từ (Card count).
  - Mỗi Deck Card hiển thị tóm tắt: Tên, Mô tả, Tag/Icon, Tổng số từ vựng, Số từ cần ôn hôm nay (Due count), Thanh tiến độ học tập (New / Learning / Mastered).

---

## Assumptions Confirmed

- **ASM-DECK-001**: Deck thuộc sở hữu riêng của từng User (`userId`), mặc định riêng tư (`isPublic = false`).
- **ASM-DECK-002**: Xóa mềm (Archive) bảo lưu toàn bộ dữ liệu thẻ từ và tiến độ SM-2, cho phép khôi phục nguyên vẹn.
- **ASM-DECK-003**: Xóa vĩnh viễn (Hard Delete) yêu cầu xác nhận và thực hiện cascade delete toàn bộ thẻ và tiến độ liên quan.
- **ASM-DECK-004**: Hỗ trợ song song Preset Theme (Cosmos Palette & Icons) và Custom Attributes (Hex color & Cover Image URL).
- **ASM-DECK-005**: Tên bộ từ (Title) không được để trống, độ dài từ 1 đến 100 ký tự, được tự động chuẩn hóa (trim whitespace).
