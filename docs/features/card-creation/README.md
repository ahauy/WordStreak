# Feature: Contextual Card Creation (US-CARD-01)

**Slug**: `card-creation`  
**Version**: 1.0  
**Ship date**: 2026-08-19  
**Spec**: [.specify/features/card-creation/spec/](../../.specify/features/card-creation/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/card-creation/baseline.md)

## Mô tả ngắn

Tính năng cho phép người học tạo, xem, chỉnh sửa và quản lý các thẻ từ vựng (Flashcards) giàu ngữ cảnh đa phương tiện (từ vựng, phiên âm IPA, nghĩa, câu ví dụ, collocations, mẹo nhớ mnemonic, audio URL và image URL) bên trong các Bộ từ vựng (Decks). Hệ thống tích hợp xem trước Flashcard 3D theo thời gian thực (Live 3D Flip Preview), cơ chế phát âm Hybrid (Web Speech API fallback khi không có link audio), chế độ nhập liên tục nhanh ("Lưu & Thêm từ tiếp"), cảnh báo mềm khi từ bị trùng lặp trong bộ từ, và tự động khởi tạo bản ghi tiến độ học lặp lại `UserCardProgress` (trạng thái `NEW`).

## Phạm vi (MoSCoW Must-Have đã ship)

- [x] **Card CRUD REST APIs** (`/api/v1/decks/:deckId/cards`, `/api/v1/cards/:id`): Tạo mới kèm transaction khởi tạo `UserCardProgress` (`status: 'NEW'`, `easeFactor: 2.5`, `interval: 0`, `repetitions: 0`), lấy danh sách thẻ theo deck, xem chi tiết, cập nhật nội dung thẻ, xóa thẻ (cascade delete progress).
- [x] **Trang Chi tiết Bộ từ & Quản lý Thẻ** (`/decks/:id` - `DeckDetailPage`): Header hiển thị theme, tags, thông tin số lượng thẻ theo trạng thái (Mới / Đang học / Thuần thục), công cụ tìm kiếm từ vựng theo thời gian thực, lưới hiển thị thẻ với thao tác nhanh.
- [x] **Modal Tạo Thẻ Giàu Ngữ Cảnh** (`AddCardModal`): Thiết kế 2 cột responsive. Bên trái là form nhập liệu chia tầng (Thông tin bắt buộc & Ngữ cảnh mở rộng: ví dụ, collocations, mẹo nhớ), bên phải là thẻ Flashcard 3D tương tác lật mặt xem trước trực tiếp.
- [x] **Chế độ Nhập Nhanh (Fast Sequential Entry)**: Nút "Lưu & Thêm từ tiếp" tự động lưu thẻ, hiện thông báo thành công và reset form kèm focus ngay vào ô nhập từ tiếp theo.
- [x] **Cảnh báo từ trùng lặp (Duplicate Soft Warning)**: Kiểm tra không phân biệt hoa thường và hiển thị badge nhắc nhở nhẹ nhàng nếu từ đã có trong bộ từ mà không chặn lưu.
- [x] **Phát âm từ vựng Hybrid (Speech Utility)**: Phát file audio nếu có `audioUrl`, tự động fallback sang `window.speechSynthesis` (Web Speech API) với giọng đọc `en-US` chuẩn khi bấm nút 🔊.
- [x] **Chỉnh sửa & Xóa thẻ an toàn**: `EditCardModal` với dữ liệu pre-populated và `DeleteCardConfirmModal` cảnh báo xóa tiến độ.

## Ngoài phạm vi (Won't-Have)

- ❌ Tự động điền dữ liệu bằng AI (OpenAI / Gemini) — Đã lên kế hoạch `EPIC-07 (US-AI-01)`.
- ❌ Bảng dữ liệu nâng cao kèm lọc đa tiêu chí cho 100+ thẻ — Đã lên kế hoạch `US-CARD-02`.
- ❌ Thuật toán tính điểm ôn tập SM-2 — Đã lên kế hoạch `EPIC-03 (US-SRS-01)`.
- ❌ Import file Anki `.apkg` và `.csv` — Đã lên kế hoạch `EPIC-09 (US-ECO-01)`.

## Các thay đổi kỹ thuật chính

### Shared Types (`packages/shared-types`)

- Thêm `packages/shared-types/src/cards.ts`: `CardResponse`, `CardProgressInfo`, `CreateCardDto`, `UpdateCardDto`.
- Xuất khẩu qua `packages/shared-types/src/index.ts`.

### Backend (NestJS - `apps/api`)

- Module mới: `apps/api/src/modules/cards/` (`CardsModule`, `CardsController`, `CardsService`)
- DTOs: `create-card.dto.ts`, `update-card.dto.ts` với `class-validator` decorators.
- Transaction an toàn khởi tạo đồng thời `Card` và `UserCardProgress`.
- Endpoints:
  - `POST /api/v1/decks/:deckId/cards`
  - `GET /api/v1/decks/:deckId/cards`
  - `GET /api/v1/cards/:id`
  - `PATCH /api/v1/cards/:id`
  - `DELETE /api/v1/cards/:id`

### Frontend (React - `apps/web`)

- Feature mới: `apps/web/src/features/cards/`
  - `services/cardsService.ts`
  - `utils/speech.ts` (Hybrid Web Speech API audio player)
  - `hooks/useCards.ts` (Custom hook state manager)
  - `components/CardPreview.tsx` (3D interactive Flashcard flip card)
  - `components/AddCardModal.tsx` (Side-by-side rich form & live 3D preview)
  - `components/EditCardModal.tsx` & `DeleteCardConfirmModal.tsx`
  - `components/CardItemCard.tsx` (Card item view inside deck)
- Trang & Routing:
  - `DeckDetailPage.tsx` (`apps/web/src/features/decks/pages/DeckDetailPage.tsx`)
  - Tuyến đường `/decks/:id` được đăng ký trong `App.tsx` dưới `ProtectedRoute`.
  - Tích hợp điều hướng từ `DeckCard.tsx` và `DecksListPage.tsx` vào trang chi tiết `/decks/:id`.

## Test Coverage

- **Backend Unit Tests**:
  - `apps/api/src/modules/cards/cards.service.spec.ts` (5 tests) — 100% Pass.
  - `apps/api/src/modules/cards/cards.controller.spec.ts` (5 tests) — 100% Pass.
  - Toàn bộ backend test suite: 8 test suites, 50 passing tests.
- **Frontend Workspace Build**: `pnpm build` (`tsc -b && vite build`) — 0 errors.
- **Test plan gốc**: [.specify/features/card-creation/test-plan.md](../../.specify/features/card-creation/test-plan.md)

## Tác giả & Review

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: Senior BA & Product Owner
- **Date**: 2026-08-19
