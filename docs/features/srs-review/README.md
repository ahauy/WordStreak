# Feature: Spaced Repetition System & Flashcard Review Flow (SRS Review)

**Slug**: `srs-review`  
**Version**: 1.0  
**Ship date**: 2026-08-20  
**Spec**: [.specify/features/srs-review/](../../.specify/features/srs-review/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/srs-review/baseline.md)  
**User Guide**: [docs/user-guides/srs-review.md](../../user-guides/srs-review.md)

---

## 1. Mô tả ngắn (Overview)

Tính năng **Spaced Repetition System (SRS Review)** là trái tim học tập cốt lõi của WordStreak, áp dụng thuật toán **SuperMemo-2 (SM-2)** để lập lịch ôn tập từ vựng ngắt quãng tối ưu. Tính năng bao gồm truy vấn danh sách thẻ đến hạn (`GET /api/v1/reviews/due`), ghi nhận đánh giá tức thời (`POST /api/v1/reviews/submit`), giao diện lật thẻ 3D trực quan hỗ trợ phím tắt toàn diện (`Space`, `1`..`4`, `R`), và màn hình tổng kết phiên học.

---

## 2. Phạm vi (MoSCoW Must-Have đã hoàn thành)

- [x] **US-SRS-01**: `SrsService` độc lập tính toán chu kỳ SM-2 ($EF' = \max(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)))$), cập nhật $I$ và $n$.
- [x] **US-SRS-02**: Endpoint `GET /api/v1/reviews/due` ưu tiên thẻ quá hạn $\rightarrow$ thẻ đến hạn hôm nay $\rightarrow$ thẻ mới (giới hạn theo `dailyGoal`).
- [x] **US-SRS-03**: Endpoint `POST /api/v1/reviews/submit` và `GET /api/v1/reviews/stats`.
- [x] **US-SRS-03**: Giao diện lật thẻ 3D Flashcard (`FlashcardReviewCard`), vòng lặp lặp lại trong phiên đối với thẻ chọn "Again", thanh tiến độ `ReviewProgressBar`, và modal tổng kết `ReviewSummaryModal`.
- [x] **Routing & Integration**: Hỗ trợ 2 tuyến đường `/review` (toàn bộ bộ từ) và `/decks/:id/review` (theo bộ từ cụ thể) với nút bấm "Ôn tập ngay" tích hợp trên Dashboard và DeckDetail.

---

## 3. Ngoài phạm vi (Won't-Have v1)

- Trắc nghiệm gõ từ tự do trong flashcard (chuyển sang Epic 04: `US-QUIZ-02`).
- Thuật toán FSRS.
- Offline Service Worker PWA.

---

## 4. Các thay đổi kỹ thuật chính

### Backend (`apps/api`)

- Module mới: `apps/api/src/modules/reviews/`
  - `srs.service.ts`: Thuật toán SM-2 thuần túy (100% unit test branch coverage).
  - `reviews.service.ts`: Query queue, atomic review submit, aggregation stats.
  - `reviews.controller.ts`: REST endpoints với `JwtAuthGuard`.
  - `reviews.module.ts`: Đã đăng ký vào `app.module.ts`.

### Frontend (`apps/web`)

- Module mới: `apps/web/src/features/reviews/`
  - `services/reviewsService.ts`: Client API calls.
  - `hooks/useReviewSession.ts`: State machine quản lý hàng đợi ôn tập và vòng lặp `Again`.
  - `components/FlashcardReviewCard.tsx`: Card 3D CSS perspective flip, âm thanh native/WebSpeech, phím tắt `Space`, `1`..`4`, `R`.
  - `components/ReviewProgressBar.tsx`: Thanh tiến độ.
  - `components/ReviewEmptyState.tsx`: Trạng thái hoàn thành sạch sẽ.
  - `components/ReviewSummaryModal.tsx`: Modal tổng kết độ chính xác, số thẻ, thời gian.
  - `pages/ReviewSessionPage.tsx`: Trang ôn tập toàn màn hình.
- Routes mới: `/review` và `/decks/:id/review`.

### Shared Types (`packages/shared-types`)

- `packages/shared-types/src/reviews.ts`: `SrsRating`, `CardLearningStatus`, `DueCardItem`, `SubmitReviewDto`, `ReviewStatsResponse`.

---

## 5. Test Coverage & Verification

- **Backend Unit Tests**: 11 test suites passing (72 tests total)
  - `srs.service.spec.ts`: 6/6 test cases (SM-2 formulas, clamping $EF \ge 1.3$, easy bonus, mastering threshold).
  - `reviews.service.spec.ts`: 6/6 test cases (Queue ordering, dailyGoal limits, deck filter, ownership validation).
  - `reviews.controller.spec.ts`: 3/3 test cases.
- **Frontend Build**: `pnpm --filter web build` passing with zero errors.

---

## 6. Tác giả & Review

- **Implemented by**: AI Pair Programmer (Antigravity)
- **Status**: Verified & Ready for Deployment
