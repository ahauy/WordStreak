# Feature: Multiple Choice Quiz Mode (US-QUIZ-01)

**Slug**: `quiz-multiple-choice`  
**Version**: 1.0  
**Ship date**: 2026-08-20  
**Spec**: [.specify/features/quiz-multiple-choice/spec/](../../.specify/features/quiz-multiple-choice/)  
**Baseline**: [SIGNED-OFF v1.0]

---

## 1. Mô tả ngắn

Tính năng Luyện trắc nghiệm 4 đáp án (Multiple Choice Quiz Mode) cho phép người học rèn luyện phản xạ nhận diện từ vựng nhanh chóng qua các câu hỏi 2 chiều (Anh $\rightarrow$ Việt và Việt $\rightarrow$ Anh), đáp án nhiễu thông minh trong cùng bộ từ, đồng hồ đếm ngược 15s (kèm Zen Mode), hệ thống tính điểm Combo Multiplier và màn hình tổng kết sau khi hoàn thành.

---

## 2. Phạm vi (MoSCoW Must-Have đã ship)

- Endpoint `GET /api/v1/practice/multiple-choice` sinh câu hỏi trắc nghiệm 4 lựa chọn ngẫu nhiên với 50% EN $\rightarrow$ VI và 50% VI $\rightarrow$ EN.
- Thuật toán phân tầng chọn 3 distractors từ cùng Deck (fallback sang các deck khác nếu deck $< 4$ từ).
- Endpoint `POST /api/v1/practice/submit-quiz` ghi nhận kết quả, tính accuracy, điểm thưởng tốc độ (+15 XP), combo multipliers (1.2x, 1.5x) và chống spam/bot.
- Giao diện Quiz Player với thanh tiến độ, countdown 15s, phím tắt `1-4` / `A-D` / `Space`, hiệu ứng xanh/đỏ tức thì.
- Màn hình kết quả (Results Screen) hiển thị điểm số, XP kiếm được, chuỗi combo và danh sách các từ đã trả lời sai kèm audio phát âm.
- Modal cấu hình trước khi chơi (chọn 10, 20 hoặc All cards; bật/tắt Zen Mode).
- Nút CTA "Trắc nghiệm Quiz" trên trang chi tiết bộ từ (`DeckDetailPage`).

---

## 3. Ngoài phạm vi (Won't-Have)

- Chế độ thi đấu PvP trực tuyến thời gian thực.
- Chỉnh sửa đáp án nhiễu thủ công cho từng thẻ.
- Thay đổi chu kỳ lặp lại SM-2 từ kết quả bài quiz (đây là chế độ Practice độc lập).

---

## 4. Các thay đổi kỹ thuật chính

### Shared Types (`packages/shared-types`)

- Tạo `packages/shared-types/src/practice.ts` chứa `QuizQuestionDto`, `QuizOptionDto`, `SubmitQuizDto`, `QuizResultResponseDto`.
- Export trong `packages/shared-types/src/index.ts`.

### Backend (NestJS)

- Module mới: `apps/api/src/modules/practice/`
  - `practice.module.ts`: Đăng ký `PracticeController`, `PracticeService`, `QuizGeneratorService`.
  - `quiz-generator.service.ts`: Xử lý thuật toán sinh câu hỏi, Fisher-Yates shuffle, distractor pooling và mask từ trong câu ví dụ.
  - `practice.service.ts`: Xử lý tính điểm, combo streak multiplier, chống abuse và tổng hợp missed cards.
  - `practice.controller.ts`: 2 REST endpoints được bảo vệ bởi `JwtAuthGuard`.
  - DTOs: `get-quiz-questions.dto.ts`, `submit-quiz.dto.ts`.
- Đăng ký `PracticeModule` trong `apps/api/src/app.module.ts`.

### Frontend (React)

- Module mới: `apps/web/src/features/practice/`
  - `services/practiceService.ts`: Axios API client cho quiz.
  - `hooks/useQuizEngine.ts`: Custom hook điều phối state machine, timer countdown, hotkeys và auto-advance.
  - `components/QuizProgressBar.tsx`: Header hiển thị tiến độ câu hỏi, timer đếm ngược và badge combo ngọn lửa.
  - `components/QuizQuestionCard.tsx`: Card hiển thị câu hỏi, phiên âm IPA, nút phát âm thanh và ví dụ ngữ cảnh.
  - `components/QuizOptionButton.tsx`: 4 nút lựa chọn với hotkey badge `1-4` / `A-D` và hiệu ứng xanh/đỏ.
  - `components/QuizResultsView.tsx`: Màn hình tổng kết điểm accuracy, XP, combo và danh sách từ vựng cần ôn lại.
  - `components/QuizSetupModal.tsx`: Modal cấu hình số lượng thẻ và Zen Mode.
  - `pages/MultipleChoiceQuizPage.tsx`: Trang làm bài trắc nghiệm toàn màn hình.
- Routes mới trong `apps/web/src/App.tsx`: `/decks/:id/quiz` và `/practice/quiz`.
- Tích hợp nút "Trắc nghiệm Quiz" trên `DeckDetailPage.tsx`.

---

## 5. Test Coverage

- Backend unit tests:
  - `apps/api/src/modules/practice/quiz-generator.service.spec.ts` (6 tests - 100% pass)
  - `apps/api/src/modules/practice/practice.service.spec.ts` (3 tests - 100% pass)
  - `apps/api/src/modules/practice/practice.controller.spec.ts` (3 tests - 100% pass)
- Frontend unit tests:
  - `apps/web/src/features/practice/hooks/useQuizEngine.spec.ts` (4 tests - 100% pass)
- Test plan: [.specify/features/quiz-multiple-choice/test-plan.md](../../.specify/features/quiz-multiple-choice/test-plan.md)

---

## 6. Tác giả & Phê duyệt

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: User (Approved Gate 1 & Gate 2)
- **Date**: 2026-08-20
