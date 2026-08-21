# Feature: Listening & Typing Practice Quiz (US-QUIZ-03)

**Slug**: `quiz-listening-practice`  
**Version**: 1.0  
**Ship date**: 2026-08-21  
**Spec**: [.specify/features/quiz-listening-practice/spec/](../../.specify/features/quiz-listening-practice/)  
**Baseline**: [SIGNED-OFF v1.0]

---

## 1. Mô tả ngắn

Tính năng **Luyện nghe gõ từ (Listening & Typing Practice Quiz Mode)** cho phép người học phát triển kỹ năng phân biệt ngữ âm chuẩn xác và phản xạ chính tả tiếng Anh thông qua việc nghe phát âm từ vựng (audio MP3 chuẩn hoặc Web Speech API fallback) và gõ lại từ vào các ô ký tự động (`_ _ _ _ _`). Hệ thống tích hợp chế độ chỉnh tốc độ đọc chậm 0.75x, thang gợi ý 3 cấp độ (Độ dài từ -> Nghĩa tiếng Việt -> Phiên âm IPA), bộ so khớp ký tự trực quan (LCS Character Diff), đồng hồ 20s (kèm Zen Mode), và cơ chế tính điểm thưởng tốc độ XP kèm chống gian lận.

---

## 2. Phạm vi (MoSCoW Must-Have đã ship)

- **Endpoint `GET /api/v1/practice/listening`**: Sinh danh sách câu hỏi luyện nghe ngẫu nhiên từ thẻ từ vựng với trường `audioUrl`, `wordLength`, `firstLetterHint`, `meaning`, `phonetic`.
- **Trình phát âm thanh thích ứng kép (`useAudioPlayer`)**:
  - Phát file MP3 gốc với kiểm soát tốc độ (`1.0x` và `0.75x Slow`).
  - Tự động chuyển đổi mượt sang trình đọc trình duyệt (`window.speechSynthesis`) khi đường dẫn audio bị hỏng (404/500/timeout) hoặc không có sẵn.
  - Xử lý tương tác unlock audio khi trình duyệt chặn Autoplay (`NotAllowedError`).
- **Giao diện nhập ký tự động (`ListeningTypingInput`)**:
  - Hàng slot ký tự tương ứng độ dài từ, hỗ trợ tự động focus và kiểm tra chính tả chuẩn hóa (bỏ dấu cách thừa, lowercase, xóa ký tự đặc biệt).
- **Thang gợi ý 3 cấp độ (`ProgressiveHintBox`)**:
  - Tier 1: Độ dài từ + chữ cái đầu.
  - Tier 2: Nghĩa tiếng Việt.
  - Tier 3: Phiên âm quốc tế (IPA).
  - Tự động trừ quyền nhận điểm thưởng tốc độ khi dùng từ 1 gợi ý trở lên.
- **Bộ hiển thị khác biệt ký tự (`computeCharacterDiff`)**:
  - Sử dụng thuật toán Longest Common Subsequence (LCS) để chỉ ra chính xác ký tự bị thiếu, sai hoặc thừa khi người dùng gõ sai.
- **Hệ thống XP & Gamification**:
  - +10 XP cơ bản cho mỗi câu đúng.
  - +15 XP Speed Bonus khi hoàn thành $\le 8000\text{ms}$, 0 gợi ý và $\le 2$ lần nghe lại.
  - Anti-abuse guard: Chặn thưởng nếu thời gian nộp $< 400\text{ms}$.
  - Tích hợp chuỗi streak và modal vinh danh ngọn lửa tím (`StreakCelebrationModal`).
- **Tích hợp Modal cấu hình & Điều hướng**:
  - Tích hợp tab "Luyện nghe" (Audio & Typing) trong `QuizSetupModal`.
  - Hỗ trợ các route `/decks/:id/practice/listening` và `/practice/listening`.
- **Độc lập với SM-2**: Không làm thay đổi chu kỳ lặp lại Spaced Repetition (`UserCardProgress`).

---

## 3. Ngoài phạm vi (Won't-Have v1)

- Nhận diện giọng nói của người học để chấm điểm phát âm (thuộc Epic 08: Speech Recognition & Pronunciation Assessment - US-VOICE-01).
- Tùy chọn chuyển đổi giọng đọc nam/nữ nhiều vùng miền Anh-Anh/Anh-Mỹ nâng cao (sẽ mở rộng trong US-VOICE-02).

---

## 4. Các thay đổi kỹ thuật chính

### Shared Types (`packages/shared-types`)

- Thêm `ListeningQuestionDto`, `GetListeningQuestionsQueryDto`, `ListeningAnswerSubmissionDto`, `DiffSpan` trong `packages/shared-types/src/practice.ts`.

### Backend (NestJS)

- `apps/api/src/modules/practice/listening-generator.service.ts`: Xử lý truy vấn thẻ từ, lọc public/private deck, xáo trộn câu hỏi và chuẩn hóa payload.
- `apps/api/src/modules/practice/dto/get-listening-questions.dto.ts`: DTO validate query parameters (`deckId`, `limit`).
- `apps/api/src/modules/practice/dto/submit-listening-quiz.dto.ts`: DTO validate chi tiết nộp bài luyện nghe (`timeSpentMs`, `replaysUsed`, `hintsUsed`).
- `apps/api/src/modules/practice/practice.service.ts`: Cập nhật logic tính điểm XP thưởng tốc độ và ngưỡng chống bot.
- `apps/api/src/modules/practice/practice.controller.ts`: Thêm endpoint `GET /api/v1/practice/listening`.
- `apps/api/src/modules/practice/practice.module.ts`: Đăng ký provider và controller.

### Frontend (React 19)

- `apps/web/src/features/practice/utils/spellingDiff.ts`: Thuật toán LCS character diff và chuẩn hóa chuỗi chính tả.
- `apps/web/src/features/practice/hooks/useAudioPlayer.ts`: Custom hook phát âm thanh MP3 + Web Speech failover + toggle tốc độ.
- `apps/web/src/features/practice/hooks/useListeningQuiz.ts`: Quản lý state machine toàn bộ buổi học nghe, timer 20s, Zen mode, hotkeys.
- `apps/web/src/features/practice/components/ListeningTypingInput.tsx`: Khung nhập liệu với dynamic character slots và visual diff badge.
- `apps/web/src/features/practice/components/ProgressiveHintBox.tsx`: Khung hiển thị gợi ý phân tầng 3 bước.
- `apps/web/src/features/practice/components/ListeningQuizCard.tsx`: Thẻ bài tập nghe tích hợp hiệu ứng sóng âm, nút phát lại, và nút tốc độ.
- `apps/web/src/features/practice/components/QuizSetupModal.tsx`: Hỗ trợ lựa chọn chế độ Luyện nghe.
- `apps/web/src/features/practice/pages/ListeningQuizPage.tsx`: Trang luyện nghe hoàn chỉnh kèm thanh tiến độ và màn hình tổng kết kết quả.
- `apps/web/src/App.tsx`: Đăng ký route `/decks/:id/practice/listening` và `/practice/listening`.

---

## 5. Test Coverage

- **Backend unit tests (Jest)**:
  - `apps/api/src/modules/practice/listening-generator.service.spec.ts` (100% pass)
  - `apps/api/src/modules/practice/practice.controller.spec.ts` (100% pass)
  - `apps/api/src/modules/practice/practice.service.spec.ts` (100% pass)
  - `apps/api/src/modules/practice/dto/get-listening-quiz.dto.spec.ts` (100% pass)
  - `apps/api/src/modules/practice/dto/submit-listening-quiz.dto.spec.ts` (100% pass)
- **Frontend unit & component tests (Vitest)**:
  - `apps/web/src/features/practice/utils/spellingDiff.spec.ts` (9 tests - 100% pass)
  - `apps/web/src/features/practice/hooks/useAudioPlayer.spec.ts` (8 tests - 100% pass)
  - `apps/web/src/features/practice/hooks/useListeningQuiz.spec.ts` (7 tests - 100% pass)
  - `apps/web/src/features/practice/components/ListeningTypingInput.spec.tsx` (5 tests - 100% pass)
  - `apps/web/src/features/practice/components/ProgressiveHintBox.spec.tsx` (5 tests - 100% pass)
  - `apps/web/src/features/practice/components/ListeningQuizCard.spec.tsx` (4 tests - 100% pass)
  - `apps/web/src/features/practice/pages/ListeningQuizPage.spec.tsx` (2 tests - 100% pass)
- **Test plan gốc**: [.specify/features/quiz-listening-practice/test-plan.md](../../.specify/features/quiz-listening-practice/test-plan.md)

---

## 6. Tác giả & Phê duyệt

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: User (Approved Implementation Plan)
- **Date**: 2026-08-21
