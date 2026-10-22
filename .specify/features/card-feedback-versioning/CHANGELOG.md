# Changelog: Feature US-LIB-09 (Card Feedback & Versioning)

## [v1.0.0] - 2026-10-21 (Done)
- **Shared Types:** Đã bổ sung enum `OfficialCardFeedbackReason`, `OfficialCardFeedbackStatus` cùng các DTO `CreateCardFeedbackDto`, `CardFeedbackResponse`, `UpdateOfficialCardDto`, `UpdateOfficialCardResponse`, `PaginatedOfficialCardFeedbacksResponse` trong `@wordstreak/shared-types`.
- **Backend (Library Module):**
  - Endpoint `POST /api/v1/library/cards/:id/feedback`: Cho phép người dùng gửi báo lỗi nội dung thẻ (nghĩa chưa chuẩn, chính tả, âm thanh, ví dụ, lỗi khác) lưu vào model `OfficialCardFeedback` với trạng thái `OPEN`.
  - Endpoint `GET /api/v1/library/admin/feedback`: Quản trị viên tra cứu hàng đợi báo lỗi với bộ lọc trạng thái và phân trang.
  - Endpoint `PATCH /api/v1/library/admin/cards/:id`: Cập nhật nội dung thẻ chính thức và tự động tăng `contentVersion` lên 1 đơn vị, bảo toàn toàn bộ `personalNote` và tiến độ SM-2 của người dùng.
  - Bộ unit test `library.service.spec.ts` và `library.controller.spec.ts` đạt 100% độ bao phủ (27/27 tests passed).
- **Frontend (Web App):**
  - Component `ReportCardFeedbackModal.tsx` chuẩn thiết kế Obsidian Pill & Minimal Canvas (`DESIGN.md`), có đầy đủ 5 lý do báo lỗi, ô mô tả chi tiết, xử lý loading và toast thành công.
  - Tích hợp nút báo lỗi trên `OfficialDeckDetailPage.tsx` (danh sách thẻ trong bộ từ) và `FlashcardReviewCard.tsx` (mặt sau thẻ ôn tập).
  - Viết unit test `ReportCardFeedbackModal.spec.tsx` (4/4 tests passed).
- **Verification:** Toàn bộ test suite backend (44/44 suites, 410 tests) và frontend (89/89 suites, 495 tests) cùng lệnh `pnpm build` đều hoàn thành đạt chuẩn không lỗi.
