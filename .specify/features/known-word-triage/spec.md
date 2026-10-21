# Feature Specification: Lọc từ đã biết trước khi học (Known-Word Triage Flow) (US-LIB-05)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-05`
- **Title:** Lọc từ đã biết trước khi học (Known-Word Triage Flow)
- **Goal:** Trước khi bắt đầu học một bộ từ vựng 25 từ, loại bỏ hoàn toàn cảm giác chán nản do phải học lại các từ người học đã biết từ trước. Màn hình phân loại (Triage) ~60 giây cho phép người học vuốt hoặc dùng phím tắt để sàng lọc từ đã biết, gán trạng thái `KNOWN_SKIPPED` (không đưa vào hàng đợi lặp lại SM-2 nhưng vẫn tính vào tổng điểm độ phủ từ vựng).

### Acceptance Criteria (`REQ-LIB-05-xxx`):
- `REQ-LIB-05-001`: Backend Endpoint `POST /api/v1/library/decks/:id/triage`:
  - Tiếp nhận danh sách `{ cardId: string, isKnown: boolean }[]`.
  - Tự động đảm bảo bản ghi `userDeckEnrollment` tồn tại khi bắt đầu triage.
  - Các thẻ có `isKnown === true`: Cập nhật/tạo `UserOfficialCardProgress` với `status: 'KNOWN_SKIPPED'` và `nextReviewDate: null`.
  - Các thẻ có `isKnown === false`: Cập nhật/tạo `UserOfficialCardProgress` với `status: 'NEW'` để sẵn sàng cho phiên học SM-2.
  - Trả về thống kê tổng hợp `TriageDeckCardsResponse`: `{ success: true, deckId, knownCount, unknownCount, totalTriaged }`.
- `REQ-LIB-05-002`: Component giao diện `KnownWordTriageModal`:
  - Hỗ trợ đầy đủ phím tắt desktop: `[K]` / `[Mũi tên phải]` = "Đã biết", `[U]` / `[Mũi tên trái]` = "Chưa biết", `[Z]` = "Hoàn tác".
  - Hỗ trợ cử chỉ vuốt chạm trên thiết bị di động (Swipe Left: Chưa biết, Swipe Right: Đã biết).
  - Thanh tiến trình thời gian thực (`Thẻ X / 25`) và bộ đếm Đã biết / Cần học.
- `REQ-LIB-05-003`: Popover Quiz chống ngộ nhận "quen mắt" (Beginner Confirmation Quiz):
  - Khi người học ở Beginner Mode chọn "Đã biết", hiển thị bài trắc nghiệm nhanh 3 lựa chọn (1 nghĩa đúng + 2 nghĩa nhiễu từ các thẻ khác).
  - Chọn đúng -> Xác nhận "Đã biết"; Chọn sai -> Tự động chuyển thành "Cần học" kèm thông báo khích lệ.
- `REQ-LIB-05-004`: Khả năng hoàn tác (Undo) linh hoạt trong phiên trước khi lưu.
- `REQ-LIB-05-005`: Màn hình tổng kết minh bạch trước khi lưu, kèm nút "Lưu & Bắt đầu học".
- `REQ-LIB-05-006`: Tuân thủ nghiêm ngặt Design System: Canvas `#ffffff`, Obsidian pure black pills `#000000`, viền hairline `#e5e5e5`.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Backend:**
  - `apps/api/src/modules/library/dto/triage-deck-cards.dto.ts`: DTO `TriageDeckCardsDto`.
  - `apps/api/src/modules/library/library.service.ts`: `triageDeckCards(userId, deckId, dto)` sử dụng atomic `$transaction`.
  - `apps/api/src/modules/library/library.controller.ts`: Route `@Post('decks/:id/triage')`.
- **Contracts:**
  - `packages/shared-types/src/official-library.ts`: `TriageCardItemDto`, `TriageDeckCardsDto`, `TriageDeckCardsResponse`.
- **Frontend:**
  - `apps/web/src/features/library/components/KnownWordTriageModal.tsx`: Giao diện modal tối giản, cử chỉ vuốt, popover quiz.
  - `apps/web/src/features/library/pages/OfficialDeckDetailPage.tsx`: Nút "Lọc từ đã biết" kích hoạt modal và callback làm mới trạng thái.
- **Tests:**
  - `apps/api/src/modules/library/library.service.spec.ts` & `library.controller.spec.ts`.
  - `apps/web/src/features/library/__tests__/KnownWordTriageModal.spec.tsx`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-05-001`: `triageDeckCards` ném `NotFoundException` nếu deckId không hợp lệ.
- `TC-LIB-05-002`: `triageDeckCards` gán đúng `KNOWN_SKIPPED` và `nextReviewDate: null` cho thẻ đã biết.
- `TC-LIB-05-003`: `triageDeckCards` gán `NEW` cho thẻ chưa biết và tự động ghi nhận enrollment.
- `TC-LIB-05-004`: `KnownWordTriageModal` phản hồi chính xác phím tắt `K`, `U`, `ArrowRight`, `ArrowLeft`.
- `TC-LIB-05-005`: `KnownWordTriageModal` hoàn tác chính xác thẻ trước đó khi bấm nút hoặc phím `Z`.
- `TC-LIB-05-006`: `KnownWordTriageModal` hiển thị popover quiz khi người dùng ở Beginner Mode bấm "Đã biết".
- `TC-LIB-05-007`: `KnownWordTriageModal` gửi kết quả lên API và đóng modal khi hoàn tất.
