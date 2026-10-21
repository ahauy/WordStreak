# Feature Specification: Bước học trong phiên & Xác nhận từ đã biết (US-LIB-15)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-15`
- **Title:** Bước học trong phiên & Xác nhận từ đã biết (Learning Steps & Verification)
- **Goal:** Đối với người học ở cấp độ Người mới bắt đầu (Beginner Mode / `startingLevel === 'ZERO'`), việc trực tiếp chuyển sang chu kỳ lặp lại theo ngày của SM-2 (1 ngày, 6 ngày) khiến tỷ lệ quên từ vựng mới rất cao. Hệ thống cung cấp các bước học ngắn hạn trong phiên (Intra-session learning steps: 1 phút và 5 phút) để củng cố trí nhớ ngắn hạn trước khi chuyển sang chu kỳ ngày. Đồng thời, tại bước sàng lọc (Triage), bổ sung đếm ngược 3 giây cho câu hỏi xác thực để chống ngộ nhận "quen mắt", và thiết lập tốc độ học mặc định cho người mới là 5 từ/ngày.

### Acceptance Criteria (`REQ-LIB-15-xxx`):
- `REQ-LIB-15-001`: Trạng thái học tập `LEARNING_STEP` & Thuật toán Learning Steps trong `SrsService`:
  - `CardLearningStatus` mở rộng bao gồm giá trị `'LEARNING_STEP'`.
  - Hỗ trợ tham số `isBeginner?: boolean` và `currentLearningStep?: number` (0: Step 1 - 1 phút, 1: Step 2 - 5 phút).
  - Đối với người mới học thẻ mới (`status === 'NEW'` hoặc `'LEARNING_STEP'`):
    - Đánh giá `Again` (1) hoặc `Hard` (2): Giữ/đưa về Step 1 (khoảng cách 1 phút, `intervalMinutes: 1`, `learningStep: 0`, `status: 'LEARNING_STEP'`).
    - Đánh giá `Good` (3):
      - Nếu đang ở Step 1: Chuyển lên Step 2 (khoảng cách 5 phút, `intervalMinutes: 5`, `learningStep: 1`, `status: 'LEARNING_STEP'`).
      - Nếu đang ở Step 2: Tốt nghiệp bước học (`graduated: true`), chuyển sang chu kỳ ngày SM-2 đầu tiên (`interval: 1`, `repetitions: 1`, `status: 'LEARNING'`).
    - Đánh giá `Easy` (4): Tốt nghiệp ngay lập tức (`graduated: true`), chuyển sang chu kỳ ngày SM-2 (`interval: 1`, `repetitions: 1`, `status: 'LEARNING'`).
- `REQ-LIB-15-002`: Quản lý hàng đợi học tập trong phiên (`ReviewSessionPage` & `useReviewSession`):
  - Khi thẻ chưa tốt nghiệp (`graduated === false` hoặc `status === 'LEARNING_STEP'`), thẻ được giữ lại trong phiên học và xếp lại vào hàng đợi (sau 1 phút hoặc sau khi xem các thẻ khác).
  - Chỉ khi tất cả các thẻ đã hoàn thành và không còn thẻ nào trong hàng đợi learning step thì phiên học mới kết thúc (`isCompleted: true`).
- `REQ-LIB-15-003`: Xác nhận nhanh 3 giây trong Popover Quiz Triage (`KnownWordTriageModal`):
  - Khi người học ở Beginner Mode bấm "Biết", hiển thị đồng hồ đếm ngược 3 giây.
  - Nếu hết thời gian 3 giây mà chưa chọn hoặc chọn sai nghĩa: Hệ thống tự động phân loại từ đó là "Chưa biết / Cần học" (`isKnown = false`) và đưa vào hàng đợi học của deck.
  - Nếu chọn đúng trong vòng 3 giây: Xác nhận "Đã biết" (`isKnown = true`).
- `REQ-LIB-15-004`: Mặc định tốc độ học 5 từ/ngày cho người mới bắt đầu:
  - Khi lưu Onboarding với `startingLevel === 'ZERO'`, nếu không có `dailyGoal` chỉ định, mặc định lưu `dailyGoal = 5` (thay vì 10).
- `REQ-LIB-15-005`: Thiết kế tuân thủ Design System (Obsidian pill, Hairline border, không layout shift).

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Packages / Contracts:**
  - `packages/shared-types/src/reviews.ts`: Mở rộng `CardLearningStatus`, bổ sung trường `isBeginner`, `currentLearningStep`, `intervalMinutes`, `learningStep`, `graduated` vào `SrsCalculationInput` / `SrsCalculationResult`.
- **Backend:**
  - `apps/api/src/modules/reviews/srs.service.ts`: Cập nhật `calculateSm2` xử lý logic learning steps khi `isBeginner === true`.
  - `apps/api/src/modules/users/users.service.ts`: Đảm bảo `startingLevel === 'ZERO'` mặc định `dailyGoal = 5`.
- **Frontend:**
  - `apps/web/src/services/offline/clientSm2Engine.ts`: Đồng bộ logic `calculateSm2` với `SrsService`.
  - `apps/web/src/features/reviews/hooks/useReviewSession.ts`: Re-queue thẻ đang ở `LEARNING_STEP` hoặc `rating < 3` cho đến khi tốt nghiệp.
  - `apps/web/src/features/library/components/KnownWordTriageModal.tsx`: Bổ sung timer 3 giây đếm ngược cho popover quiz xác thực.
- **Tests:**
  - `apps/api/src/modules/reviews/srs.service.spec.ts`
  - `apps/api/src/modules/users/users.service.spec.ts`
  - `apps/web/src/services/offline/__tests__/clientSm2Engine.spec.ts`
  - `apps/web/src/features/library/__tests__/KnownWordTriageModal.spec.tsx`

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-15-001`: `SrsService.calculateSm2` với beginner mode: Thẻ mới đánh giá Good chuyển sang Step 2 (5 phút, `status: 'LEARNING_STEP'`).
- `TC-LIB-15-002`: `SrsService.calculateSm2` với beginner mode: Thẻ ở Step 2 đánh giá Good thì tốt nghiệp (`graduated: true`, `status: 'LEARNING'`, `interval: 1` ngày).
- `TC-LIB-15-003`: `SrsService.calculateSm2` với beginner mode: Đánh giá Again hoặc Hard đưa về Step 1 (1 phút).
- `TC-LIB-15-004`: `SrsService.calculateSm2` với beginner mode: Đánh giá Easy tốt nghiệp ngay lập tức.
- `TC-LIB-15-005`: `UsersService.saveOnboarding` gán `dailyGoal = 5` khi `startingLevel === 'ZERO'` và không có `dailyGoal` truyền vào.
- `TC-LIB-15-006`: `KnownWordTriageModal` đếm ngược 3 giây trong popover quiz và tự động đánh dấu chưa biết nếu hết giờ.
- `TC-LIB-15-007`: `useReviewSession` duy trì thẻ chưa tốt nghiệp trong hàng đợi phiên học cho đến khi hoàn thành tất cả các bước.
