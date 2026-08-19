# Feature: Deck CRUD & Vocabulary Management (US-DECK-01)

**Slug**: `deck-crud`  
**Version**: 1.0  
**Ship date**: 2026-08-19  
**Spec**: [.specify/features/deck-crud/spec/](../../.specify/features/deck-crud/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/deck-crud/baseline.md)

## Mô tả ngắn

Tính năng cho phép người học tạo, quản lý, tìm kiếm, lọc và phân loại các bộ từ vựng (Decks) theo chủ đề cá nhân hóa. Mỗi bộ từ hỗ trợ nhận diện trực quan qua 8 Cosmos preset colors, 12 Lucide icons, custom hex color code và ảnh bìa cover image URL. Hệ thống tính toán và hiển thị các số liệu Spaced Repetition tóm tắt (`totalCards`, `newCards`, `learningCards`, `masteredCards`, `dueCards`), hỗ trợ cơ chế lưu trữ an toàn (Archive/Restore) và xóa vĩnh viễn (Hard Cascade Delete) với modal cảnh báo.

## Phạm vi (MoSCoW Must-Have đã ship)

- [x] **Deck CRUD REST APIs** (`/api/v1/decks`): Tạo mới, lấy danh sách (kèm filter active/archived/all, search, sort), chi tiết, cập nhật, lưu trữ, khôi phục, xóa vĩnh viễn cascade.
- [x] **Trang Quản lý Bộ từ** (`/decks`): Hero header, search input, status tabs (Đang học / Đã lưu trữ), sort dropdown (Mới nhất, A-Z, Số lượng từ).
- [x] **Cosmos Visual Customization**: Bảng 8 màu preset Cosmos theme, 12 icon chủ đề Lucide, hỗ trợ custom hex color và cover image URL với cơ chế fallback gradient.
- [x] **Thống kê Spaced Repetition**: Thẻ Deck hiển thị tổng số từ, số từ cần ôn hôm nay (due reviews), thanh phân bố tiến độ (Mới / Đang học / Thuần thục).
- [x] **Lưu trữ & Khôi phục (Archive & Restore)**: Tách biệt danh sách học chính mà không làm mất dữ liệu thẻ hoặc tiến độ SM-2.
- [x] **Xóa vĩnh viễn an toàn**: Modal cảnh báo nguy hiểm hiển thị chính xác số lượng thẻ bị ảnh hưởng trước khi xác nhận cascade delete.

## Ngoài phạm vi (Won't-Have)

- ❌ Chia sẻ và nhân bản Deck cộng đồng công khai (Community Deck Marketplace) — Đã lên kế hoạch `EPIC-09`.
- ❌ Import/Export file Anki `.apkg` và `.csv` — Đã lên kế hoạch `EPIC-09`.

## Các thay đổi kỹ thuật chính

### Database (Prisma)

- Mở rộng model `Deck` trong `apps/api/prisma/schema.prisma`:
  - `color`: `String @default("#6366F1")`
  - `icon`: `String @default("Book")`
  - `coverImageUrl`: `String?`
  - `tags`: `String?` (JSON string array)
  - `isArchived`: `Boolean @default(false)`
  - Index: `@@index([userId, isArchived])`

### Backend (NestJS - `apps/api`)

- Module mới: `apps/api/src/modules/decks/` (`DecksModule`, `DecksController`, `DecksService`)
- DTOs: `create-deck.dto.ts`, `update-deck.dto.ts`, `query-decks.dto.ts`
- Endpoints:
  - `POST /api/v1/decks`
  - `GET /api/v1/decks`
  - `GET /api/v1/decks/:id`
  - `PATCH /api/v1/decks/:id`
  - `PATCH /api/v1/decks/:id/archive`
  - `PATCH /api/v1/decks/:id/restore`
  - `DELETE /api/v1/decks/:id`

### Frontend (React - `apps/web`)

- Module mới: `apps/web/src/features/decks/`
  - `constants/deckThemes.ts` (Cosmos 8 preset colors + 12 icons)
  - `services/decksService.ts` (API client)
  - `hooks/useDecks.ts` (Custom hook state manager)
  - `components/DeckCard.tsx` (Stable outer anchor + spring animation)
  - `components/CreateDeckModal.tsx`, `EditDeckModal.tsx`, `DeleteDeckConfirmModal.tsx`, `DeckEmptyState.tsx`
  - `pages/DecksListPage.tsx` (Route `/decks`)
- Điều hướng: Tích hợp tab "Bộ từ vựng" vào `DashboardNavbar` và `DecksPreviewSection`.

## Test Coverage

- **Backend Unit Tests**: `apps/api/src/modules/decks/decks.service.spec.ts` (10 tests) & `decks.controller.spec.ts` (6 tests) — 100% Pass.
- **Frontend Build**: `tsc -b && vite build` — 0 errors.
- **Test plan gốc**: [.specify/features/deck-crud/test-plan.md](../../.specify/features/deck-crud/test-plan.md)

## Tác giả & Review

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: Senior BA & Product Owner
- **Date**: 2026-08-19
