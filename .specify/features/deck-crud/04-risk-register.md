# Risk Register: Deck CRUD & Management (US-DECK-01)

- **Feature**: Deck CRUD & Management
- **Protocol**: Bounded Task
- **Date**: 2026-08-19

## 1. Contradiction Scan

- **Logic Contradictions**: Không tìm thấy xung đột nào giữa các quy tắc nghiệp vụ.
- **State Deadlocks**: Không có deadlock. Vòng đời `ACTIVE` <-> `ARCHIVED` <-> `DELETED` khép kín, có đường thoát và khôi phục rõ ràng.
- **Backward-Compatibility**:
  - Prisma model `Deck` hiện tại đã có các trường cơ bản (`id`, `userId`, `title`, `description`, `isPublic`, `createdAt`, `updatedAt`).
  - Các trường mới (`color`, `icon`, `coverImageUrl`, `tags`, `isArchived`) đều có giá trị `@default(...)` hoặc là nullable (`?`), không làm ảnh hưởng đến dữ liệu hiện có trong Database khi chạy migration (`prisma migrate dev`).

---

## 2. Risk Register

| ID                | Nguy cơ / Rủi ro                                                             |  Xác suất  |  Tác động  | Giải pháp giảm thiểu (Mitigation)                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------- | :--------: | :--------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RISK-DECK-001** | Người dùng vô tình xóa vĩnh viễn (Hard Delete) Deck có hàng trăm thẻ từ vựng | Trung bình |    Cao     | Bắt buộc có Modal xác nhận nguy hiểm, hiển thị số lượng từ và yêu cầu xác nhận rõ ràng trước khi gọi API `DELETE`. Khuyến khích hành động Archive trước. |
| **RISK-DECK-002** | URL ảnh bìa (`coverImageUrl`) không hợp lệ, chứa link độc hại hoặc chết link |    Thấp    |    Thấp    | Frontend kiểm tra regex URL, bắt lỗi `onError` của thẻ `<img>` và fallback tự động về Cosmos Gradient + Icon chuẩn.                                      |
| **RISK-DECK-003** | Tải danh sách Decks bị chậm khi user có nhiều deck và thẻ từ vựng            |    Thấp    | Trung bình | Sử dụng Prisma aggregation / count tối ưu, đánh index trên `[userId, isArchived]`, chỉ tính toán stats dạng tóm tắt nhẹ.                                 |
| **RISK-DECK-004** | Nhập tiêu đề Deck chứa các thẻ HTML/Script gây lỗi hiển thị hoặc XSS         |    Thấp    |    Cao     | Backend DTO sử dụng `class-validator` + `@Transform` trim và escape ký tự đặc biệt; React tự động escape khi render.                                     |

---

## 3. Assumptions & Constraints (Consolidated)

- **ASM-DECK-001**: Deck thuộc sở hữu riêng của từng User (`userId`), mặc định riêng tư (`isPublic = false`).
- **ASM-DECK-002**: Xóa mềm (Archive) bảo lưu toàn bộ dữ liệu thẻ từ và tiến độ SM-2, cho phép khôi phục nguyên vẹn.
- **ASM-DECK-003**: Xóa vĩnh viễn (Hard Delete) yêu cầu xác nhận và thực hiện cascade delete toàn bộ thẻ và tiến độ liên quan.
- **ASM-DECK-004**: Hỗ trợ song song Preset Theme (Cosmos Palette & Icons) và Custom Attributes (Hex color & Cover Image URL).
- **ASM-DECK-005**: Tên bộ từ (Title) không được để trống, độ dài từ 1 đến 100 ký tự.
- **Constraints**:
  - NestJS 11 + Prisma ORM + PostgreSQL.
  - React 19 + Tailwind CSS + Lucide Icons.
  - RESTful API tuân thủ chuẩn `/api/v1/decks`.

---

## 4. MoSCoW Scope Table

### Must-Have (P0 - Bản phát hành này)

- [x] Tạo Deck mới với Tiêu đề, Mô tả, Preset Color/Icon hoặc Custom Hex, Cover Image URL, trạng thái `isPublic`.
- [x] Xem danh sách Deck của bản thân, lọc theo trạng thái (Active / Archived), tìm kiếm theo tên/mô tả.
- [x] Hiển thị Card stats tóm tắt cho từng Deck (Tổng số từ, từ đến hạn, tiến độ).
- [x] Chỉnh sửa thông tin Deck (Title, Description, Color, Icon, Cover Image, IsPublic).
- [x] Lưu trữ (Archive) và Khôi phục (Restore) Deck.
- [x] Xóa vĩnh viễn (Hard Delete) Deck kèm cascade xóa Cards & Progress với Modal cảnh báo an toàn.

### Should-Have (P1)

- [x] Sắp xếp Deck theo Mới nhất, Cũ nhất, Tên A-Z, Số lượng từ.
- [x] Skeleton loading và Empty states đẹp mắt theo Cosmos Theme.

### Could-Have (P2)

- [ ] Nhân bản Deck (Clone/Duplicate Deck).
- [ ] Ghim bộ từ yêu thích (Pin to Top / Favorite).

### Won't-Have (v1 - Out of Scope)

- ❌ Chia sẻ và nhân bản Deck cộng đồng công khai (Community Deck Marketplace) — Sẽ làm ở `EPIC-09`.
- ❌ Import/Export file Anki `.apkg` và file `.csv` — Sẽ làm ở `EPIC-09`.
- ❌ Phân quyền cộng tác viên nhiều người cùng chỉnh sửa Deck.
