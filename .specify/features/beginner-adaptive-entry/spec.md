# Feature Specification: Beginner Adaptive Entry & Mini-test (US-LIB-11)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-11`
- **Title:** Lối vào Người mất gốc & Mini-test thích ứng (Beginner Adaptive Entry)
- **Goal:** Cung cấp trải nghiệm phân loại và định tuyến thông minh, giảm áp lực tâm lý cho người mất gốc tiếng Anh (Persona D - Nam), đồng thời cung cấp mini-test thích ứng nhanh 60 giây cho người học ở mức sơ cấp.

### Acceptance Criteria (`REQ-LIB-11-xxx`):
- `REQ-LIB-11-001`: Màn hình chọn trình độ (Step 2 Onboarding) hiển thị 3 nhóm rõ rệt:
  1. **Mất gốc / Bắt đầu từ số 0 (`ZERO`)**: Hiển thị nhãn "Chặng Khởi động", hướng dẫn 5 từ/ngày, không yêu cầu làm bài kiểm tra.
  2. **Biết cơ bản (`BEGINNER`)**: Có tùy chọn làm Mini-test thích ứng (60s) để xác thực năng lực hoặc tiếp tục.
  3. **Đã có nền tảng / Nâng cao (`INTERMEDIATE` / `ADVANCED`)**: Cho phép chọn trực tiếp và chuyển tới thiết lập mục tiêu ngày.
- `REQ-LIB-11-002`: Mini-test thích ứng gồm 5 câu hỏi trắc nghiệm từ vựng nền tảng (NGSL Top 300).
- `REQ-LIB-11-003`: Cơ chế Dừng Sớm (Early Stop): Nếu người học trả lời sai 3 câu liên tiếp (hoặc sai $\ge 3$ câu), bài test tự động kết thúc sớm để tránh gây ức chế/mệt mỏi.
- `REQ-LIB-11-004`: Màn hình kết quả mini-test mang thông điệp khích lệ tâm lý:
  - Nếu kết quả < 3 câu đúng hoặc dừng sớm: Đề xuất Chặng Khởi động (`ZERO`) với lời nhắn: *"Đừng lo lắng! Tiếng Anh không khó khi đi từng bước nhỏ. Chặng Khởi động được thiết kế riêng để bạn lấy lại tự tin."*
  - Nếu kết quả $\ge 3$ câu đúng: Xác nhận trình độ `BEGINNER` với lời nhắn: *"Rất tốt! Bạn đã có phản xạ từ vựng cơ bản. Hãy bắt đầu với lộ trình từ vựng thông dụng."*
- `REQ-LIB-11-005`: Người học có thể chấp nhận khuyến nghị hoặc tự chọn lại trình độ, sau đó tiếp tục bước thiết lập mục tiêu ngày.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Component:** `apps/web/src/features/onboarding/components/AdaptiveMiniTest.tsx`
  - Quản lý trạng thái 5 câu hỏi, đếm số câu sai liên tiếp (`consecutiveMistakes`).
  - Giao diện tối giản, nút bấm to rõ, hỗ trợ phím số 1-4 trên desktop.
  - Tự động dừng khi `consecutiveMistakes === 3`.
- **Integration:** `apps/web/src/features/onboarding/components/OnboardingWizard.tsx`
  - Nếu `selectedLevel === 'BEGINNER'`, hiển thị nút "Kiểm tra nhanh 60s (Khuyên dùng)" và "Bỏ qua bài test".
  - Tích hợp modal/bước mini-test thích ứng inline trong Step 2.
- **Backend / Model:**
  - `apps/api/src/modules/users/users.service.ts`: Đã hỗ trợ `dto.startingLevel === 'ZERO'` tự động enroll vào deck `FOUNDATION`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-11-001`: Người dùng chọn `ZERO` ("Mất gốc") -> không kích hoạt bài test, tự động đề xuất mục tiêu 5 từ/ngày.
- `TC-LIB-11-002`: Người dùng chọn `BEGINNER` -> có thể khởi chạy Mini-test thích ứng.
- `TC-LIB-11-003`: Trả lời sai 3 câu liên tiếp trong Mini-test -> Dừng sớm (Early Stop) và đề xuất Chặng Khởi động (`ZERO`).
- `TC-LIB-11-004`: Trả lời đúng $\ge 3/5$ câu -> Xác nhận `BEGINNER` và hiển thị lời khen khích lệ.
- `TC-LIB-11-005`: Người dùng có thể bỏ qua bài test và tiếp tục trực tiếp sang bước tiếp theo.
