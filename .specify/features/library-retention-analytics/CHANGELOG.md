# Changelog: Feature US-LIB-10 (Library & Path Retention Analytics)

## [v1.0.0] - 2026-10-21 (Done)
- **Shared Types:** Đã bổ sung interface `LibraryDeckAnalyticsDto` và `LibraryAnalyticsSummaryResponse` trong `@wordstreak/shared-types`.
- **Backend (Library Module):**
  - Endpoint `GET /api/v1/library/admin/analytics`: Cho phép truy xuất số liệu đo lường tổng hợp của thư viện (tổng số người học `totalEnrolledUsers`, tỷ lệ kích hoạt phiên đầu `activationRate`, tỷ lệ đạt mốc giá trị 10 thẻ đầu `firstValueRate`, tỷ lệ từ đã biết qua triage `avgTriageKnownRate`, tổng số báo lỗi thẻ `totalFeedbacks`).
  - Phân tích chi tiết số liệu theo từng `OfficialDeck`: `totalEnrolledUsers`, `firstValueCompletionRate`, `avgTriageKnownRate`, `day1RetentionRate`, `day7RetentionRate`, và `feedbackCount`.
  - Bộ unit test `library.service.spec.ts` và `library.controller.spec.ts` đạt 100% độ bao phủ (29/29 tests passed).
- **Frontend (Web App):**
  - Component `AdminLibraryAnalyticsWidget.tsx` chuẩn thiết kế Obsidian Pill & Minimal Canvas (`DESIGN.md`): 5 thẻ KPI tổng quan trực quan và bảng chi tiết từng bộ từ Official.
  - Tích hợp phương thức `getLibraryAnalytics()` vào `libraryService.ts`.
  - Viết unit test `AdminLibraryAnalyticsWidget.spec.tsx` (3/3 tests passed).
- **Verification:** Toàn bộ test suite backend (44/44 suites, 412 tests) và frontend (90/90 suites, 498 tests) đều hoàn thành đạt chuẩn không lỗi.
