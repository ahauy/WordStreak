# Feature: Fill-in-the-blank Quiz Mode (US-QUIZ-02)

**Slug**: `quiz-fill-in-the-blank`  
**Version**: 1.0  
**Ship date**: 2026-08-20  
**Spec**: [.specify/features/quiz-fill-in-the-blank/spec/](../../.specify/features/quiz-fill-in-the-blank/)  
**Baseline**: [SIGNED-OFF v1.0]

---

## 1. Mô tả ngắn

Tính năng Luyện điền từ vào câu ví dụ (Fill-in-the-blank Quiz Mode) cho phép người học rèn luyện phản xạ nhớ từ chủ động (active recall), chính tả chính xác và cấu trúc ngữ pháp trong câu ví dụ thực tế. Tính năng hỗ trợ 2 chế độ nhập: gõ trực tiếp qua bàn phím với kiểm tra tức thì, hoặc chọn các mảnh chữ cái xáo trộn (anagram chips) thân thiện trên thiết bị di động, kèm hệ thống gợi ý chữ cái đầu và phiên âm IPA.

---

## 2. Phạm vi (MoSCoW Must-Have đã ship)

- **Endpoint `GET /api/v1/practice/fill-in-the-blank`**: Sinh câu hỏi điền từ từ câu ví dụ của thẻ từ vựng với giải thuật regex nhận diện từ gốc và các biến thể hình thái (`-s`, `-ed`, `-ing`, `-es`, `-d`).
- **Graceful Fallback Template**: Tự động sinh mẫu câu hỏi gợi ý dựa trên nghĩa tiếng Việt (`Complete the word: "[Meaning]" [ _____ ]`) đối với các thẻ chưa có câu ví dụ.
- **Giải thuật Anagram Scrambler**: Tạo các mảnh chữ cái ngẫu nhiên (Fisher-Yates) đảm bảo không trùng với từ gốc.
- **Frontend Practice Player**: Giao diện toàn màn hình hỗ trợ nhập văn bản trực tiếp, bảng chọn mảnh chữ cái xáo trộn, nút Hint gợi ý chữ cái đầu & IPA, đồng hồ đếm ngược 25s (kèm Zen Mode).
- **Hệ thống tính điểm & XP**: Tích hợp với `POST /api/v1/practice/submit-quiz` tặng +10 XP cơ bản, +15 XP thưởng tốc độ và hệ số combo streak.
- **Tích hợp Modal cấu hình**: Chuyển đổi linh hoạt giữa chế độ "Trắc nghiệm" và "Điền từ vào câu" trong `QuizSetupModal`.
- **Độc lập với Spaced Repetition**: Không làm thay đổi chu kỳ lặp lại SM-2 (`UserCardProgress`).

---

## 3. Ngoài phạm vi (Won't-Have v1)

- Tự động sinh câu ví dụ động bằng AI/LLM trực tiếp trong lúc làm bài (thuộc Epic 07: AI Vocab Generator).
- Nhận diện giọng nói để điền từ bằng giọng đọc (thuộc Epic 08: Speech Recognition).

---

## 4. Các thay đổi kỹ thuật chính

### Shared Types (`packages/shared-types`)

- Thêm `FillBlankQuestionDto`, `GetFillBlankQuestionsQueryDto` trong `packages/shared-types/src/practice.ts`.

### Backend (NestJS)

- `apps/api/src/modules/practice/fill-blank-generator.service.ts`: Xử lý thuật toán bóc tách từ trong câu ví dụ, che từ (`[ _____ ]`), tạo anagram và fallback template.
- `apps/api/src/modules/practice/dto/get-fill-blank-questions.dto.ts`: DTO validate query parameters.
- `apps/api/src/modules/practice/practice.controller.ts`: Thêm endpoint `GET /api/v1/practice/fill-in-the-blank`.
- `apps/api/src/modules/practice/practice.module.ts`: Đăng ký provider và exports.

### Frontend (React 19)

- `apps/web/src/features/practice/services/practiceService.ts`: Thêm method `getFillBlankQuiz`.
- `apps/web/src/features/practice/hooks/useFillBlankQuiz.ts`: Custom hook điều phối state, phím tắt, timer, gợi ý và gửi kết quả.
- `apps/web/src/features/practice/components/FillBlankInput.tsx`: Component hiển thị câu ví dụ, ô nhập từ vựng và visual feedback xanh/đỏ.
- `apps/web/src/features/practice/components/AnagramTilePicker.tsx`: Component chọn mảnh chữ cái xáo trộn.
- `apps/web/src/features/practice/components/QuizSetupModal.tsx`: Hỗ trợ chuyển đổi giữa chế độ Trắc nghiệm và Điền từ.
- `apps/web/src/features/practice/pages/FillInTheBlankQuizPage.tsx`: Trang làm bài điền từ hoàn chỉnh.
- `apps/web/src/App.tsx`: Đăng ký route `/decks/:id/practice/fill-blank` và `/practice/fill-blank`.

---

## 5. Test Coverage

- Backend unit tests:
  - `apps/api/src/modules/practice/fill-blank-generator.service.spec.ts` (8 tests - 100% pass)
  - `apps/api/src/modules/practice/practice.controller.spec.ts` (4 tests - 100% pass)
- Frontend unit tests:
  - `apps/web/src/features/practice/hooks/useFillBlankQuiz.spec.ts` (5 tests - 100% pass)
- Test plan: [.specify/features/quiz-fill-in-the-blank/test-plan.md](../../.specify/features/quiz-fill-in-the-blank/test-plan.md)

---

## 6. Tác giả & Phê duyệt

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: User (Approved Gate 1 & Gate 2)
- **Date**: 2026-08-20
