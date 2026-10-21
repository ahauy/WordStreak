# Feature Specification: "Học hôm nay" Button & Combined Session (US-UX-01)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-UX-01`
- **Title:** Nút "Học hôm nay" — Phiên học gộp (Study Today Combined Session)
- **Goal:** Giảm thiểu ma sát lựa chọn cho người học, đặc biệt là người mới bắt đầu. Thay vì phải phân vân giữa 4 chế độ quiz hay duyệt từng bộ từ, một nút bấm duy nhất trên Dashboard gộp toàn bộ từ đến hạn và từ mới thành một phiên học liền mạch tối ưu theo thuật toán SM-2.

### Acceptance Criteria (`REQ-UX-01-xxx`):
- `REQ-UX-01-001`: Backend Endpoint `GET /api/v1/reviews/today-session`:
  - Trả về danh sách thẻ ưu tiên học hôm nay gộp cả 2 nguồn: thẻ tự tạo (`Card`) và thẻ thư viện chuẩn hóa (`OfficialCard`).
  - Thứ tự ưu tiên:
    1. Thẻ quá hạn & đến hạn ôn tập (`overdue` + `dueToday`).
    2. Thẻ mới (`NEW`) được lấy bổ sung cho đến khi chạm mục tiêu ngày (`dailyGoal`).
  - Cấu trúc trả về `TodaySessionResponse`:
    - `cards`: Danh sách `DueCardItem[]`.
    - `summary`: `{ dueCount: number, newCount: number, totalCount: number, dailyGoal: number, isGoalCompleted: boolean }`.
- `REQ-UX-01-002`: Component giao diện `StudyTodayButton`:
  - Đặt ở vị trí nổi bật nhất trên `DashboardPage` (khu vực Hero CTA).
  - Tuân thủ nghiêm ngặt Design System: Obsidian pill (`rounded-full`, viền hairline `#e5e5e5`, `#000000` background khi active).
  - Hiển thị nhãn trực quan:
    - Nếu có thẻ cần học: *"Học hôm nay · X thẻ"* hoặc *"Ôn tập ngay · X thẻ đến hạn"*.
    - Nếu đã hoàn thành: *"Mục tiêu hôm nay đã hoàn thành ✓"*.
  - Nhấp chuột điều hướng thẳng vào `/review` (chế độ auto-mix).
- `REQ-UX-01-003`: Song ngữ i18n (EN/VI) trong `dashboard.json`.
- `REQ-UX-01-004`: Bộ kiểm thử tự động (Jest + Vitest) đạt 100% pass.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Backend:**
  - `apps/api/src/modules/reviews/reviews.service.ts`: Viết hàm `getTodaySession(userId)`. Tái sử dụng logic sắp xếp và lọc thẻ từ `getDueCards(userId, { limit: 50 })`.
  - `apps/api/src/modules/reviews/reviews.controller.ts`: Thêm route `@Get('today-session')`.
- **Contracts:**
  - `packages/shared-types/src/index.ts`: Export type `TodaySessionResponse`.
- **Frontend:**
  - `apps/web/src/features/dashboard/components/StudyTodayButton.tsx`: Obsidian pill CTA.
  - `apps/web/src/features/dashboard/pages/DashboardPage.tsx`: Nhúng `StudyTodayButton` vào phần Overview.
- **Tests:**
  - `apps/api/src/modules/reviews/reviews.service.spec.ts` & `reviews.controller.spec.ts`.
  - `apps/web/src/features/dashboard/components/__tests__/StudyTodayButton.spec.tsx`.

---

## 3. Test Cases (`TC-###`)

- `TC-UX-01-001`: `getTodaySession` trả về đúng danh sách thẻ đến hạn + thẻ mới bù đủ dailyGoal.
- `TC-UX-01-002`: `GET /api/v1/reviews/today-session` yêu cầu xác thực JWT và trả về 200 OK.
- `TC-UX-01-003`: `StudyTodayButton` render số lượng thẻ cần học hôm nay và điều hướng tới `/review`.
- `TC-UX-01-004`: `StudyTodayButton` chuyển sang trạng thái hoàn thành khi `totalCount === 0`.
