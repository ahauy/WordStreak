# Feature Specification: Báo lỗi nội dung thẻ & Quản lý phiên bản (Card Feedback & Versioning)

**Story ID:** `US-LIB-09`  
**Slug:** `card-feedback-versioning`  
**Execution Tier:** Tier 1 (Fast-Track)  
**Status:** Approved & In Implementation  

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
Người dùng khi học các bộ thẻ Official (TSL / NGSL / TOEIC) có thể phát hiện các lỗi nhỏ như: nghĩa chưa chuẩn, lỗi chính tả, âm thanh phát sai, hoặc ví dụ chưa tự nhiên. Cần một cơ chế một chạm để người học báo lỗi nhanh chóng mà không làm gián đoạn trải nghiệm học. Đồng thời, khi quản trị viên cập nhật thẻ, phiên bản nội dung (`contentVersion`) phải được nâng tự động để tất cả người dùng nhận được nội dung mới nhất mà không ảnh hưởng đến tiến độ học SM-2 cá nhân hoặc ghi chú riêng (`personalNote`).

### Acceptance Criteria (AC)
- **REQ-FB-001 (Feedback Button & Modal):** Hiển thị nút "Báo lỗi thẻ" trên Flashcard Review (mặt sau thẻ) và Deck Detail (danh sách từ). Nhấn nút mở modal `ReportCardFeedbackModal` cho phép chọn 1 trong 5 lý do: `WRONG_MEANING` (Nghĩa chưa chuẩn), `TYPO` (Lỗi chính tả), `AUDIO_ERROR` (Âm thanh lỗi), `EXAMPLE_UNNATURAL` (Ví dụ thiếu tự nhiên), `OTHER` (Khác), kèm ô ghi chú chi tiết tùy chọn ($\le 500$ ký tự).
- **REQ-FB-002 (Feedback Submission API):** Endpoint `POST /api/v1/library/cards/:id/feedback` ghi nhận báo lỗi vào bảng `official_card_feedback` với trạng thái mặc định `OPEN`. Yêu cầu xác thực JWT.
- **REQ-FB-003 (Admin Queue & Card Versioning):** 
  - Endpoint `GET /api/v1/library/admin/feedback` cho phép xem danh sách feedback (hỗ trợ lọc theo `status`, phân trang).
  - Endpoint `PATCH /api/v1/library/admin/cards/:id` cho phép quản trị viên cập nhật thông tin thẻ (`headword`, `pos`, `content`). Mỗi lần cập nhật thành công, `contentVersion` của `OfficialCard` tự động tăng lên 1 đơn vị (`contentVersion + 1`).
- **REQ-FB-004 (Personal Note & Progress Preservation):** Dữ liệu `UserOfficialCardProgress` (tiến độ SM-2, `personalNote`) không bị thay đổi hay xóa bỏ khi nội dung thẻ gốc được cập nhật phiên bản mới.

---

## 2. Technical Approach & Contracts

### 2.1 Contracts (`packages/shared-types`)
- `OfficialCardFeedbackReason`: `'WRONG_MEANING' | 'TYPO' | 'AUDIO_ERROR' | 'EXAMPLE_UNNATURAL' | 'OTHER'`
- `OfficialCardFeedbackStatus`: `'OPEN' | 'RESOLVED' | 'REJECTED'`
- `CreateCardFeedbackDto`: `{ reason: OfficialCardFeedbackReason; comment?: string }`
- `CardFeedbackResponse`: DTO phản hồi chứa thông tin feedback vừa tạo.
- `UpdateOfficialCardDto`: `{ headword?: string; pos?: string; content?: Partial<OfficialCardContent>; status?: string }`
- `UpdateOfficialCardResponse`: DTO trả về thông tin thẻ sau cập nhật kèm `contentVersion` mới.

### 2.2 Backend (`apps/api/src/modules/library`)
- `LibraryController`:
  - `POST /library/cards/:id/feedback`: Gửi báo lỗi.
  - `GET /library/admin/feedback`: Lấy danh sách báo lỗi (query: `status`, `page`, `limit`).
  - `PATCH /library/admin/cards/:id`: Cập nhật nội dung thẻ và tự động tăng `contentVersion`.
- `LibraryService`:
  - `submitCardFeedback(userId, cardId, dto)`
  - `getFeedbacks(query)`
  - `updateOfficialCard(cardId, dto)`

### 2.3 Frontend (`apps/web`)
- `ReportCardFeedbackModal.tsx`:
  - Thiết kế tối giản theo Design System WordStreak (`DESIGN.md`): Canvas trắng `#ffffff`, border mảnh `#e5e5e5`, nút Obsidian Pill `#000000`, radio selector rõ ràng, thông báo toast xác nhận thành công.
- Tích hợp vào `OfficialDeckDetailPage.tsx`: Nút cờ báo lỗi nhỏ trên từng thẻ từ vựng.
- Tích hợp vào `FlashcardReviewCard.tsx`: Nút báo lỗi trên thanh header của mặt sau thẻ ôn tập.
- `libraryService.ts`: Bổ sung `submitCardFeedback(cardId, dto)`.

---

## 3. Test Cases (`TC-###`)

- **`TC-FB-001` (Backend - Submit Feedback):** Gửi feedback hợp lệ cho thẻ Official tồn tại $\rightarrow$ HTTP 201, bản ghi được tạo với status `OPEN`.
- **`TC-FB-002` (Backend - Submit Non-existent Card):** Gửi feedback cho `cardId` không tồn tại $\rightarrow$ `NotFoundException` (404).
- **`TC-FB-003` (Backend - Content Version Increment):** Cập nhật nội dung thẻ qua `updateOfficialCard` $\rightarrow$ `contentVersion` tăng từ $V$ lên $V+1$.
- **`TC-FB-004` (Frontend - Report Modal Interaction):** Render modal, chọn lý do, nhập comment và bấm gửi $\rightarrow$ gọi đúng API và hiển thị toast thành công.
