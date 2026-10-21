# Changelog: Known-Word Triage Flow (US-LIB-05)

## [v1.0] - 2026-10-21

### Added
- **Shared Types:** Thêm `TriageCardItemDto`, `TriageDeckCardsDto`, và `TriageDeckCardsResponse` trong `packages/shared-types/src/official-library.ts`.
- **Backend API:**
  - `POST /api/v1/library/decks/:id/triage` ghi nhận phân loại hàng loạt vào `UserOfficialCardProgress`.
  - Từ đánh dấu "Đã biết" gán trạng thái `KNOWN_SKIPPED`, `nextReviewDate: null`.
  - Từ đánh dấu "Chưa biết" gán trạng thái `NEW` để ôn luyện SM-2.
  - Tự động đảm bảo ghi nhận enrollment cho bộ từ.
- **Frontend UI:**
  - Component `KnownWordTriageModal` tối giản theo phong cách obsidian pills, viền hairline 1px `#e5e5e5`.
  - Phím tắt desktop: `[K]` / `[ArrowRight]` (Đã biết), `[U]` / `[ArrowLeft]` (Chưa biết), `[Z]` (Hoàn tác).
  - Cử chỉ vuốt chạm trên thiết bị di động (Swipe Left / Swipe Right).
  - Popover quiz xác nhận nhanh 3 lựa chọn chống ngộ nhận cho Beginner Mode.
  - Tích hợp nút "Lọc từ đã biết" trên `OfficialDeckDetailPage`.
- **Automated Verification:**
  - 17/17 tests backend library module pass (`library.service.spec.ts` & `library.controller.spec.ts`).
  - 21/21 tests frontend library pass (`KnownWordTriageModal.spec.tsx` & `OfficialDeckDetailPage.spec.tsx`).
