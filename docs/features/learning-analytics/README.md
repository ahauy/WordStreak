# Feature: Learning Analytics & Retention Dashboard

**Slug**: `learning-analytics`  
**Version**: 1.0  
**Ship date**: 2026-08-21  
**Spec**: [.specify/features/learning-analytics/](../../.specify/features/learning-analytics/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/learning-analytics/baseline.md)

---

## Mô tả ngắn

Hệ thống **Báo cáo & Thống kê học tập (Learning Analytics & Retention Dashboard)** trực quan hóa đường cong ghi nhớ dài hạn SuperMemo-2 (Mastered vs Learning vs New), cung cấp bản đồ nhiệt hoạt động 365 ngày (GitHub-style Heatmap) với khả năng chuẩn hóa múi giờ người dùng, và thuật toán dự báo ngày hoàn thành Bộ từ dựa trên vận tốc học tập 7 ngày gần nhất.

---

## Phạm vi (MoSCoW Must-Have đã ship)

- `REQ-STAT-001`: API phân bổ mức độ thành thạo từ vựng (`GET /api/v1/analytics/mastery-summary`).
- `REQ-STAT-002`: API bản đồ nhiệt hoạt động 365 ngày trượt (`GET /api/v1/analytics/activity-heatmap`).
- `REQ-STAT-003`: Hook tự động ghi nhận nhật ký ôn tập bất biến (`ReviewLog`) trên mỗi lượt submit review.
- `REQ-STAT-004`: API tính toán vận tốc học và dự báo ngày hoàn thành deck (`GET /api/v1/analytics/deck-forecast/:deckId` & `GET /api/v1/analytics/decks-progress`).
- `REQ-STAT-005`: Chỉ số tỷ lệ nhớ từ 30 ngày (`retentionRate30Days`).
- `REQ-STAT-006`: Giao diện Trung tâm Thống kê chuyên biệt tại `/analytics`.
- `REQ-STAT-007`: Widget tóm tắt tiến độ phân bổ trí nhớ trên trang `/dashboard`.

---

## Ngoài phạm vi (Won't-Have v1)

- Bảng xếp hạng xã hội công khai (Social Leaderboard) — chuyển giao sang Epic 09.
- Live WebSockets streaming dữ liệu ôn tập thời gian thực.

---

## Các thay đổi kỹ thuật chính

### Database (Prisma)

- Tạo bảng mới `ReviewLog` (`id`, `userId`, `cardId`, `rating`, `interval`, `reviewedAt`).
- Thiết lập compound index `@@index([userId, reviewedAt])` cho phép quét dữ liệu 365 ngày đạt $P95 < 50\text{ms}$.
- Quan hệ `reviewLogs` trên `User` và `Card` với cơ chế cascade delete.

### Backend (NestJS)

- Module mới: `apps/api/src/modules/analytics/` (`AnalyticsModule`, `AnalyticsController`, `AnalyticsService`, `QueryMasterySummaryDto`, `QueryHeatmapDto`).
- Tích hợp hook logging vào `ReviewsService.submitReview`.

### Frontend (React)

- Module mới: `apps/web/src/features/analytics/`:
  - Hook: `useAnalytics.ts`
  - Components: `ActivityHeatmap.tsx`, `MasteryDistributionCard.tsx`, `AnalyticsHeroStats.tsx`, `DeckProgressTable.tsx`, `DashboardAnalyticsWidget.tsx`.
  - Page: `AnalyticsPage.tsx` tại route `/analytics`.
- Tích hợp link điều hướng trên `DashboardNavbar.tsx` và widget trên `DashboardPage.tsx`.

---

## Test Coverage

- Backend Unit Tests: `apps/api/src/modules/analytics/*.spec.ts` (100% pass, 13 test cases).
- Frontend Unit Tests: `apps/web/src/features/analytics/**/*.spec.tsx` (100% pass, 6 test cases).
- Workspace Test Suite: 22 test suites backend (146 tests) + 12 test suites web (52 tests) = **198 automated tests xanh 100%**.

---

## Tác giả & Review

- **Implemented by**: AI (Antigravity Senior Fullstack Engineer)
- **Reviewed by**: Senior BA & System Architect
- **Date**: 2026-08-21
