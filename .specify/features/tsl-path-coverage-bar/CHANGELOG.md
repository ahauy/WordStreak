# Changelog: TOEIC Path & Real-time Coverage Bar (US-LIB-06)

## [v1.0] - 2026-10-21

### Added
- **Shared Types:**
  - Export `ToeicDeckProgressDto`, `ToeicLevelProgressDto`, `ToeicPathProgressResponse` trong `packages/shared-types/src/official-library.ts`.
- **Backend API:**
  - Endpoint `GET /api/v1/library/paths/toeic/progress` trong `LibraryController`.
  - Logic tính toán độ phủ TOEIC chuẩn xác theo phân bổ nghiên cứu: NGSL Nền tảng (max 94.0%) + TSL Chuyên sâu (max 4.5%) = Tối đa 98.5%.
  - Thống kê hoàn thành theo 3 tầng cấp độ T1 (1–400), T2 (401–800), T3 (801–1.200).
  - Ước tính số ngày về đích căn cứ vào mục tiêu ngày `dailyGoal` của người dùng.
- **Frontend UI:**
  - Component `ToeicCoverageProgressBar` với các phân đoạn thanh tiến trình, huy hiệu phần trăm và trích dẫn nghiên cứu khoa học NGSL Project.
  - Trang Lộ trình `ToeicPathPage` (`/paths/toeic`) với bản đồ lộ trình học tập, thống kê tiến độ, tab chuyển cấp T1/T2/T3.
  - Đăng ký route `/paths/toeic` trong `App.tsx`.
- **Automated Verification:**
  - 19/19 backend library tests pass (`library.service.spec.ts` & `library.controller.spec.ts`).
  - 26/26 frontend library tests pass (`ToeicCoverageProgressBar.spec.tsx`, `ToeicPathPage.spec.tsx`, etc.).
