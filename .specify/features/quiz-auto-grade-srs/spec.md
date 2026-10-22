# Feature Specification: Quiz tự chấm vào SRS (Auto-grade Quiz Results)

**Story ID:** `US-UX-02`  
**Slug:** `quiz-auto-grade-srs`  
**Execution Tier:** Tier 1 (Fast-Track)  
**Status:** Approved & In Implementation  

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
Người dùng khi luyện tập qua 4 chế độ Quiz (Trắc nghiệm Multiple Choice, Điền từ Fill-in-the-Blank, Luyện nghe Listening, và Nối từ Word Matching) mong muốn kết quả làm bài được tự động cập nhật trực tiếp vào thuật toán lặp lại ngắt quãng (SM-2 Spaced Repetition) mà không cần phải vào lại phiên Flashcard Review để bấm thủ công Again / Hard / Good / Easy.

### Acceptance Criteria (AC)
- **REQ-AG-001 (Answer to SM-2 Rating Mapping):** Kết quả đúng/sai kết hợp với thời gian trả lời (`timeSpentMs`) được ánh xạ tự động sang SM-2 Rating:
  - Trả lời sai (`isCorrect === false`): Rating `1` (Again).
  - Trả lời đúng trong vòng $\le 4$ giây: Rating `4` (Easy - phản xạ nhanh).
  - Trả lời đúng từ $> 4$ giây đến $\le 10$ giây: Rating `3` (Good - chuẩn).
  - Trả lời đúng mất $> 10$ giây: Rating `2` (Hard - còn do dự).
- **REQ-AG-002 (Auto-grade in Standard/Listening Quizzes):**
  - Trong phương thức `submitQuiz`, mỗi câu trả lời có `cardId` được tự động chuyển thành bản ghi ôn tập qua `ReviewsService.submitReview(userId, { cardId, rating })`.
  - Hỗ trợ cả thẻ tự tạo (`Card`) và thẻ thư viện chính thức (`OfficialCard`).
  - Phản hồi `QuizResultResponseDto` chứa mảng `autoGradedReviews` gồm thông tin rating, interval mới, số lần lặp và ngày ôn tiếp theo.
- **REQ-AG-003 (Auto-grade in Word Matching Game):**
  - Trong phương thức `submitMatchingQuiz`, các cặp thẻ hoàn thành không bị lỗi được chấm rating `4` (nếu tốc độ nhanh) hoặc `3`, các thẻ ghép sai được chấm rating `1`.
  - Phản hồi `MatchingQuizResultDto` chứa mảng `autoGradedReviews`.
- **REQ-AG-004 (Failure Resilience & Anti-Abuse):** Nếu việc cập nhật một thẻ gặp lỗi, hệ thống ghi log cảnh báo và tiếp tục xử lý các thẻ khác mà không làm gián đoạn việc nhận XP hay trả về kết quả quiz.

---

## 2. Technical Contracts & Schema

### 2.1 Contracts (`packages/shared-types/src/practice.ts`)
```typescript
export interface AutoGradedReviewItem {
  cardId: string;
  rating: number; // 1 | 2 | 3 | 4
  interval?: number;
  repetitions?: number;
  status?: string;
  nextReviewDate?: Date | string | null;
}
```
Bổ sung trường `autoGradedReviews?: AutoGradedReviewItem[]` vào `QuizResultResponseDto` và `MatchingQuizResultDto`.

---

## 3. Test Cases (`TC-###`)

- **`TC-AG-001` (Backend - Submit Quiz Auto-grades Correct Answer):** Trả lời đúng 1 câu trong 3 giây $\rightarrow$ `reviewsService.submitReview` được gọi với `rating = 4`, kết quả trả về `autoGradedReviews` có interval và repetitions cập nhật.
- **`TC-AG-002` (Backend - Submit Quiz Auto-grades Incorrect Answer):** Trả lời sai 1 câu $\rightarrow$ `reviewsService.submitReview` được gọi với `rating = 1`.
- **`TC-AG-003` (Backend - Matching Quiz Auto-grades Pairs):** Ghép từ đúng và sai $\rightarrow$ Các thẻ được tự động chấm điểm và cập nhật lịch ôn tương ứng.
