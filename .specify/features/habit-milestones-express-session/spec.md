# Feature Specification: Cột mốc nhỏ, Phiên 5 phút & Khôi phục sau khi nghỉ (US-LIB-16)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-16`
- **Title:** Cột mốc nhỏ, Phiên 5 phút & Khôi phục sau khi nghỉ (Habit Milestones, Express Session & Welcome Back)
- **Goal:** Tạo động lực bền vững cho người học qua các cột mốc thành tựu nhỏ (50, 100, 300, 500 từ), hỗ trợ chế độ ôn nhanh 5 phút (5–7 thẻ) cho những ngày bận rộn, và cơ chế "Welcome Back" phân phối lại khối lượng ôn tập nhẹ nhàng (5–10 thẻ) khi người học quay lại sau hơn 7 ngày nghỉ mà không bị ngợp bởi hàng trăm thẻ dồn ứ.

### Confirmed Assumptions (`ASM-LIB-16-xxx`):
- `ASM-LIB-16-001`: Cột mốc từ vựng dựa trên tổng số từ đã Mastered (`Interval >= 21` ngày) hoặc Learned trong hệ thống (cả Custom và Official Cards). Khi chạm mốc 50, 100, 300, 500 từ, modal vinh danh hiển thị một lần duy nhất cho mỗi mốc (lưu trạng thái mốc đã vinh danh).
- `ASM-LIB-16-002`: Chế độ "Phiên học 5 phút" (`express`) cho phép người dùng chỉ tập trung vào 5–7 thẻ ưu tiên cao nhất (quá hạn lâu nhất), có thể kích hoạt trực tiếp từ Dashboard / StudyTodayButton.
- `ASM-LIB-16-003`: Logic "Welcome Back" tự động kích hoạt khi người dùng không hoạt động `> 7 ngày` (`lastActiveDate < now - 7 days`). Khi kích hoạt, số thẻ ôn trong phiên đầu được giới hạn an toàn ở mức 7 thẻ (kèm thông báo khích lệ nhẹ nhàng), và hệ thống kiểm tra bảo vệ streak freeze tự động.

### Acceptance Criteria (`REQ-LIB-16-xxx`):
- `REQ-LIB-16-001`: Cột mốc động lực thực tế (Habit Milestones):
  - Hỗ trợ các mốc: 50, 100, 300, 500 từ vựng.
  - Thông điệp giải thích ý nghĩa bằng ngôn ngữ đời thường (EN/VI qua i18n):
    - 50 từ: Nền tảng ghi nhớ đang dần hình thành.
    - 100 từ: Đã nắm 100 từ xuất hiện nhiều nhất trong mọi bài thi TOEIC và giao tiếp.
    - 300 từ: 300 từ cốt lõi đã nằm trong trí nhớ dài hạn, hiểu hơn 65% văn bản thông thường.
    - 500 từ: Làm chủ toàn bộ nền tảng NGSL Top 500.
  - Modal vinh danh `HabitMilestoneModal` chuẩn thiết kế Obsidian Pill, animation nhẹ nhàng, không layout shift.
- `REQ-LIB-16-002`: Chế độ Phiên học 5 phút (5-minute Express Session):
  - Endpoint `GET /api/v1/reviews/due` và `GET /api/v1/reviews/today-session` hỗ trợ tham số `mode=express` (hoặc `limit=5..7`).
  - Khi ở chế độ `express`, chỉ trả về tối đa 7 thẻ có độ ưu tiên cao nhất (thẻ quá hạn lâu nhất trước, sau đó đến thẻ đến hạn hôm nay).
  - Giao diện Dashboard cung cấp nút / tùy chọn "Phiên học 5 phút" để học viên bận rộn bắt đầu ngay.
- `REQ-LIB-16-003`: Cơ chế Khôi phục sau khi nghỉ (Welcome Back Re-engagement):
  - Khi `lastActiveDate` cách hiện tại `> 7 ngày`, `ReviewsService` tự động đánh dấu cờ `isWelcomeBack: true` trong metadata của phiên học.
  - Số lượng thẻ phục vụ cho phiên Welcome Back đầu tiên được giới hạn tối đa 7 thẻ để tránh gây áp lực dồn ứ thẻ.
  - Thông báo thân thiện khích lệ học viên quay lại nhịp học.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Packages / Contracts (`packages/shared-types`):**
  - Cập nhật `QueryDueReviewsDto` bổ sung `mode?: 'express' | 'standard'`.
  - Bổ sung `isWelcomeBack?: boolean` và `expressLimit?: number` vào `TodaySessionResponse` và `DueReviewsMeta`.
  - Định nghĩa interface `HabitMilestone` (id, targetWords, titleKey, descKey).
- **Backend (`apps/api`):**
  - `apps/api/src/modules/reviews/dto/query-due-reviews.dto.ts`: Thêm `mode?: 'express' | 'standard'`.
  - `apps/api/src/modules/reviews/reviews.service.ts`:
    - Kiểm tra `userStreak.lastActiveDate`: nếu `> 7 ngày`, kích hoạt `isWelcomeBack = true`, giới hạn `limit = 7`.
    - Khi `query.mode === 'express'`, áp dụng `limit = 7` và chỉ lấy các thẻ overdue/dueToday quan trọng nhất.
- **Frontend (`apps/web`):**
  - Component `HabitMilestoneModal.tsx`: Hiển thị chúc mừng khi chạm mốc 50/100/300/500 từ.
  - Component `StudyTodayButton.tsx`: Bổ sung tùy chọn/badge "Phiên học 5 phút" (Express 5-min).
  - Tích hợp hook kiểm tra cột mốc và `isWelcomeBack` trong `DashboardPage` & `ReviewSessionPage`.
- **Tests:**
  - `apps/api/src/modules/reviews/reviews.service.spec.ts`: Test cases cho `mode=express` và `isWelcomeBack`.
  - `apps/web/src/features/dashboard/__tests__/HabitMilestoneModal.spec.tsx`.
  - `apps/web/src/features/dashboard/__tests__/StudyTodayButton.spec.tsx`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-16-001`: `ReviewsService.getDueCards` với `mode === 'express'` trả về tối đa 7 thẻ ưu tiên nhất.
- `TC-LIB-16-002`: `ReviewsService.getDueCards` với user nghỉ > 7 ngày trả về cờ `isWelcomeBack: true` và giới hạn tối đa 7 thẻ.
- `TC-LIB-16-003`: `ReviewsService.getTodaySession` chuyển tiếp `mode === 'express'` và phản hồi thẻ tương ứng.
- `TC-LIB-16-004`: `HabitMilestoneModal` render đúng nội dung mốc 50, 100, 300, 500 từ khi được kích hoạt.
- `TC-LIB-16-005`: `StudyTodayButton` cho phép kích hoạt phiên Express 5 phút.
