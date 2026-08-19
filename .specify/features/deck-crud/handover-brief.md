# Handover Brief: Deck CRUD & Management (US-DECK-01)

- **Feature**: Deck CRUD & Management (`deck-crud`)
- **Baseline Version**: 1.0 (Signed off 2026-08-19)
- **Protocol**: Bounded Task
- **Spec Documents**: [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/spec/user-stories.md)
- **Traceability Matrix**: [`traceability-matrix.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/traceability-matrix.md)
- **Validation Report**: [`validation-report.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/validation-report.md) (100% PASS)

---

## 1. What's Being Built

1. **Backend (`apps/api`)**:
   - Mở rộng model `Deck` trong Prisma schema: `color`, `icon`, `coverImageUrl`, `tags`, `isArchived`.
   - Migration additive an toàn (`prisma migrate dev`).
   - Module `decks` (`DecksModule`, `DecksController`, `DecksService`) theo kiến trúc chuẩn NestJS.
   - RESTful endpoints (`/api/v1/decks`):
     - `POST /api/v1/decks` — Tạo Deck mới.
     - `GET /api/v1/decks` — Lấy danh sách Deck kèm stats tóm tắt (filter: active/archived/all, search, sort).
     - `GET /api/v1/decks/:id` — Lấy chi tiết Deck kèm stats.
     - `PATCH /api/v1/decks/:id` — Cập nhật thông tin Deck.
     - `PATCH /api/v1/decks/:id/archive` & `PATCH /api/v1/decks/:id/restore` — Lưu trữ & Khôi phục.
     - `DELETE /api/v1/decks/:id` — Xóa vĩnh viễn Cascade Deck và Cards.
2. **Frontend (`apps/web`)**:
   - Service & Hook API cho Decks (`decksApi.ts`, React Query / Zustand / Hook).
   - Trang `DecksListPage` (`/decks`):
     - Hero header, search bar, sort & status filter tabs (Active / Archived).
     - Lưới Deck Cards với visual theme (Preset color gradient / Custom hex / Cover image, Lucide icon, badge `isPublic`).
     - Thanh tiến độ học tập (New, Learning, Mastered) và số từ cần ôn hôm nay (`dueCards`).
     - Empty states & Skeleton loading chuẩn Cosmos theme.
   - `CreateDeckModal` & `EditDeckModal`: Form tạo/sửa với bộ chọn Preset Colors (8 màu), Icons (12 icons), Custom Hex & Cover URL.
   - `DeleteDeckConfirmModal`: Modal cảnh báo an toàn hiển thị số lượng từ vựng bị ảnh hưởng.

---

## 2. What's Explicitly Out of Scope

- Không triển khai chia sẻ Deck cộng đồng (Public Deck Marketplace) trong sprint này (đã lên lịch `EPIC-09`).
- Không triển khai Import/Export file `.apkg` / `.csv` (đã lên lịch `EPIC-09`).
- Không triển khai tạo thẻ từ vựng (`US-CARD-01` là feature tiếp theo).

---

## 3. Next Steps

- Chuyển sang **Phase 2 & 3: Technical Planning (Speckit)** -> Tạo `spec.md`, `plan.md`, `data-model.md`, `tasks.md`.
- Tiếp tục **Phase 5: Implementation (TDD + Mandatory Tech Skills)**.
