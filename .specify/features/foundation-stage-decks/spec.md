# Feature Specification: Foundation Stage Decks & Mini-lessons (US-LIB-12)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-12`
- **Title:** Chặng Khởi động cho người mất gốc (Foundation Stage Decks)
- **Goal:** Cung cấp 15 bộ từ vựng sinh tồn (20 từ/deck) trích xuất từ NGSL Top 300, tích hợp 4 bài học ngữ pháp nền tảng cực ngắn ($\le 2$ phút, thuần tiếng Việt) giúp người học mất gốc dễ dàng tiếp cận mà không bị ngợp.

### Acceptance Criteria (`REQ-LIB-12-xxx`):
- `REQ-LIB-12-001`: Đóng gói 15 Foundation Decks (20 từ/deck) từ 300 từ tần suất cao nhất của NGSL 1.2, gán mã `pathCode = "FOUNDATION"`, chia theo các chủ đề sinh tồn thiết thực (Đại từ, Số đếm, Thời gian, Động từ hàng ngày, Nơi chốn, Đồ vật, v.v.).
- `REQ-LIB-12-002`: Tích hợp 4 bài học ngữ pháp nền tảng cực ngắn ($\le 2$ phút, thuần tiếng Việt, ví dụ trực quan):
  1. `LESSON-01`: 4 Từ loại cốt lõi (Danh từ, Động từ, Tính từ, Trạng từ) — Vị trí và cách nhận diện.
  2. `LESSON-02`: Trật tự từ trong câu đơn (S + V + O) — Cách ghép câu cơ bản không dịch word-by-word.
  3. `LESSON-03`: Dạng động từ (-ed và -ing) — Phân biệt đang làm vs đã qua.
  4. `LESSON-04`: Số ít & Số nhiều (-s, -es) — Quy tắc đếm được và danh từ bất quy tắc phổ biến.
- `REQ-LIB-12-003`: Giao diện `FoundationPathView` hiển thị lộ trình hình bậc thang thân thiện (Stepped progression), có nút/badge mở xem bài học ngắn trước khi bắt đầu học bộ từ tương ứng.
- `REQ-LIB-12-004`: Modal `MiniLessonModal` hiển thị nội dung bài học súc tích, thẻ ghi nhớ ví dụ song ngữ và nút CTA *"Tôi đã hiểu, bắt đầu học từ!"*.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Dataset:** `apps/web/src/features/foundation/data/foundationLessons.ts` & `apps/web/src/features/foundation/data/foundationDecks.ts`
  - Chứa nội dung chi tiết của 4 bài học ngữ pháp và danh mục 15 deck sinh tồn chuẩn NGSL Top 300.
- **Components:**
  - `apps/web/src/features/foundation/components/MiniLessonModal.tsx`: Modal đọc bài học $\le 2$ phút.
  - `apps/web/src/features/foundation/components/FoundationPathView.tsx`: Màn hình lộ trình bậc thang với 15 chặng và 4 điểm dừng bài học ngắn.
- **Integration:**
  - `apps/web/src/features/library/pages/LibraryPage.tsx`: Khi chọn lộ trình `FOUNDATION`, hiển thị `FoundationPathView` thay vì grid phẳng thông thường.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-12-001`: Dữ liệu 4 bài học có đủ tiêu đề, thời lượng $\le 2$ phút, nội dung tiếng Việt và ví dụ minh họa.
- `TC-LIB-12-002`: Dữ liệu 15 Foundation Decks có đủ 15 chặng với đúng 20 từ/deck và mã `pathCode = "FOUNDATION"`.
- `TC-LIB-12-003`: `MiniLessonModal` mở và hiển thị chính xác nội dung khi người dùng click vào một bài học.
- `TC-LIB-12-004`: `FoundationPathView` hiển thị danh sách 15 chặng bậc thang và các nút liên kết bài học ngắn.
