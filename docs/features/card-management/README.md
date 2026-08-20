# Feature: Card List Management & Search/Filter (US-CARD-02)

**Slug**: `card-management`  
**Version**: 1.0  
**Ship date**: 2026-08-20  
**Spec**: [.specify/features/card-management/](../../.specify/features/card-management/)  
**Baseline**: [SIGNED-OFF v1.0]

## Mô tả ngắn

Cung cấp công cụ quản lý và hiển thị danh sách thẻ từ vựng toàn diện trong `DeckDetailPage`: hỗ trợ chuyển đổi giao diện linh hoạt giữa dạng lưới 3D (`Grid`) và bảng dữ liệu mật độ cao (`Data Table`), phân trang và tìm kiếm/lọc trạng thái SRS phía máy chủ (`Server-side Pagination & Filtering`), cùng các thao tác hàng loạt an toàn (`Bulk Delete`, `Bulk Move`, `Bulk Reset Progress`) được thực thi trong transaction ACID.

## Phạm vi (MoSCoW Must-Have đã ship)

- Phân trang server-side (`page`, `limit = 10, 20, 50`) và tìm kiếm từ khóa case-insensitive theo từ, nghĩa, ví dụ.
- Bộ lọc trạng thái thẻ: `Tất cả (ALL)`, `Thẻ mới (NEW)`, `Đang học (LEARNING)`, `Thành thạo (MASTERED)`.
- Chuyển đổi giao diện kép (Dual View Mode: 3D Grid / Dense Data Table) lưu cấu hình vào `localStorage`.
- Phát âm từ vựng nhanh trực tiếp trên từng dòng của bảng danh sách.
- Chọn nhiều thẻ (Multi-select) và thanh thao tác hàng loạt (Floating Bulk Actions Toolbar).
- Thao tác hàng loạt an toàn:
  - Xóa hàng loạt kèm modal xác nhận cảnh báo số lượng.
  - Di chuyển hàng loạt sang bộ từ khác thuộc sở hữu người dùng.
  - Đặt lại tiến độ học Spaced Repetition hàng loạt về `NEW`.

## Ngoài phạm vi (Won't-Have v1)

- Kéo thả thủ công sắp xếp thứ tự thẻ tùy chỉnh giữa các bộ từ.
- Chỉnh sửa nội dung từng ô dữ liệu trực tiếp dạng Excel inline.

## Các thay đổi kỹ thuật chính

### Shared Types (`packages/shared-types`)

- Thêm `QueryCardsDto`, `PaginationMeta`, `PaginatedCardsResponse`, `BulkCardActionDto`, `BulkCardActionResult`.

### Backend (NestJS)

- `apps/api/src/modules/cards/dto/query-cards.dto.ts` & `bulk-card-action.dto.ts`
- `apps/api/src/modules/cards/cards.controller.ts`:
  - `GET /api/v1/decks/:deckId/cards` (hỗ trợ phân trang và filter)
  - `POST /api/v1/decks/:deckId/cards/bulk-action`
- `apps/api/src/modules/cards/cards.service.ts`: Xử lý query Prisma có phân trang và thao tác `$transaction`.

### Frontend (React)

- `apps/web/src/features/cards/services/cardsService.ts`
- `apps/web/src/features/cards/hooks/useCards.ts`
- `apps/web/src/features/cards/components/CardDataTable.tsx`
- `apps/web/src/features/cards/components/BulkActionsToolbar.tsx`
- `apps/web/src/features/cards/components/BulkMoveModal.tsx`
- `apps/web/src/features/decks/pages/DeckDetailPage.tsx`

## Test Coverage

- Unit tests: `apps/api/src/modules/cards/cards.service.spec.ts`, `cards.controller.spec.ts` (19 passing unit tests)
- Full API test suite: 56 passing tests
- Test plan: [.specify/features/card-management/test-plan.md](../../.specify/features/card-management/test-plan.md)

## Tác giả & Review

- **Implemented by**: Antigravity AI
- **Reviewed by**: Lead Architect / PO
- **Date**: 2026-08-20
