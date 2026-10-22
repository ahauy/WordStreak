# Changelog: Feature US-UX-03 (Backlog Guard)

## [v1.0.0] - 2026-10-21 (Done)
- **Living Spec**: Hoàn thành đặc tả `spec.md` cho `US-UX-03`.
- **Backend**:
  - Tích hợp logic Backlog Guard trong `ReviewsService.getDueCards`: Khi `totalDueCount > 3 * dailyGoal`, gắn cờ `isBacklogOverwhelmed = true`, tạm dừng nạp từ mới (`activeNewCards = []`), và trả về `backlogWarning` (`BacklogWarningDto`).
  - Cung cấp `backlogWarning` trong `TodaySessionResponse.summary` và `ReviewSummaryDto`.
  - Đạt 100% test coverage cho `TC-BG-001` và `TC-BG-002` trong `reviews.service.spec.ts`.
- **Frontend**:
  - Tạo component `BacklogGuardBanner.tsx` theo chuẩn WordStreak Design System (amber alert palette, hairline border, Obsidian CTA, icon `ShieldAlert`).
  - Tích hợp `BacklogGuardBanner` vào `DashboardPage.tsx` và `ReviewSessionPage.tsx`.
  - Thêm unit test `BacklogGuardBanner.spec.tsx` (`TC-BG-003a`, `TC-BG-003b`, `TC-BG-003c`), 100% pass.
- **Verification**:
  - Toàn bộ backend test (44 suites / 417 tests) & frontend test (92 suites / 503 tests) đều pass.
  - Monorepo `pnpm build` biên dịch sạch cả 4 workspace packages.
