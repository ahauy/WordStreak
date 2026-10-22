# Changelog: Feature US-UX-02 (Quiz auto-grade → SRS)

## [v1.0.0] - 2026-10-21 (Done)
- **Shared Types:** Bổ sung interface `AutoGradedReviewItem` và mở rộng `QuizResultResponseDto`, `MatchingQuizResultDto` hỗ trợ trường `autoGradedReviews` trong `@wordstreak/shared-types`.
- **Backend (Practice Module):**
  - Tự động chấm điểm SM-2 và đồng bộ lịch ôn tập ngắt quãng thông qua `ReviewsService.submitReview` cho tất cả các chế độ Quiz:
    - Multiple Choice, Fill-in-the-blank, Listening qua `submitQuiz`.
    - Word Matching Game qua `submitMatchingQuiz`.
  - Áp dụng chuẩn công thức `mapQuizAnswerToSm2Rating`:
    - Trả lời sai $\rightarrow$ Rating 1 (Again).
    - Trả lời đúng trong $\le 4$ giây $\rightarrow$ Rating 4 (Easy).
    - Trả lời đúng trong $4 - 10$ giây $\rightarrow$ Rating 3 (Good).
    - Trả lời đúng mất $> 10$ giây $\rightarrow$ Rating 2 (Hard).
  - Phục hồi khi gặp lỗi từng thẻ lẻ và bảo đảm an toàn chống bot script.
  - Bộ unit test `practice.service.spec.ts` đạt 100% độ bao phủ cho logic tự chấm (112/112 tests passed).
- **Frontend (Web App):**
  - Component `QuizResultsView.tsx` hiển thị thông báo trực quan khi kết quả làm bài được tự động đồng bộ vào lịch ôn tập ngắt quãng SM-2.
  - Viết unit test `QuizResultsView.spec.tsx` (2/2 tests passed).
- **Verification:** Toàn bộ test suite backend (44/44 suites, 415 tests) và frontend (91/91 suites, 500 tests) đều hoàn thành đạt chuẩn không lỗi.
