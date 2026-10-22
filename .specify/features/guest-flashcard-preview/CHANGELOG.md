# Changelog - Guest Flashcard Preview (US-START-03)

## [1.0.0] - 2026-10-22

### Added
- **Core Utility** (`guestStorage.ts`): Cung cấp hàm đọc, ghi và hoàn tất phiên học thử 5 từ trong `localStorage` (`wordstreak_guest_preview`).
- **Interactive Component** (`GuestFlashcardPreview.tsx`):
  - 5 thẻ từ vựng mẫu chất lượng cao (`resilient`, `ubiquitous`, `serendipity`, `diligent`, `pragmatic`).
  - Giao diện lật thẻ 3D, phát âm audio chuẩn Web Speech API, 4 nút đánh giá SuperMemo-2 (`Quên`, `Khó`, `Nhớ tốt`, `Quá dễ`).
  - Màn hình chúc mừng hoàn tất phiên học thử kèm nút CTA đăng ký bảo lưu tiến độ.
- **Dashboard Transfer Acknowledgment** (`GuestTransferBanner.tsx`):
  - Banner chúc mừng tại Dashboard sau khi người dùng đăng ký hoặc đăng nhập.
  - Tự động nhận diện phiên học thử đã hoàn tất và nút bấm xác nhận dọn dẹp bộ nhớ tạm.
- **Tích hợp giao diện**:
  - Gắn widget `GuestFlashcardPreview` vào [`LandingPage.tsx`](file:///Users/vutuanhau/Documents/Project/WordStreak/apps/web/src/features/landing/pages/LandingPage.tsx).
  - Gắn banner `GuestTransferBanner` vào [`DashboardPage.tsx`](file:///Users/vutuanhau/Documents/Project/WordStreak/apps/web/src/features/dashboard/pages/DashboardPage.tsx).
- **Kiểm thử tự động**: 12 unit & component tests mới (`guestStorage.spec.ts`, `GuestFlashcardPreview.spec.tsx`, `GuestTransferBanner.spec.tsx`) $\rightarrow$ 100% passed.
