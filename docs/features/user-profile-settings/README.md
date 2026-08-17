# Feature: User Profile & Daily Goal Settings (US-AUTH-04)

**Slug**: `user-profile-settings`  
**Version**: 1.0  
**Ship date**: 2026-08-17  
**Spec**: [.specify/features/user-profile-settings/spec/](../../.specify/features/user-profile-settings/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/user-profile-settings/baseline.md)

---

## Mô tả ngắn

Tính năng cho phép người học tùy chỉnh mục tiêu ôn tập thẻ từ vựng hàng ngày (5, 10, 20, 30, 50 từ hoặc tùy chỉnh 1–100 từ), lựa chọn Avatar từ bộ sưu tập Cosmos Presets độc quyền hoặc nhập URL ảnh riêng, và đổi mật khẩu an toàn kèm cơ chế tự động đăng xuất tất cả các thiết bị khác.

---

## Phạm vi (MoSCoW Must-Have đã ship)

- **Cài đặt mục tiêu học tập hàng ngày**: Lựa chọn 5 preset chips (5, 10, 20, 30, 50 từ/ngày) hoặc nhập số tùy chọn (1–100); cập nhật ngay lập tức trên Dashboard và store.
- **Bộ sưu tập Avatar Cosmos**: 8 preset avatar với gradient không gian và icon mang phong cách Cosmos/Cyberpunk (Stellar Voyager, Solar Flare, Quantum Bolt, Nebula Guardian, Cosmic Pioneer, Lunar Eclipse, Astral Monarch, Supernova) cùng tùy chọn ảnh URL ngoài.
- **Đổi mật khẩu & Bảo mật đa thiết bị**: Xác thực mật khẩu cũ bằng Argon2, kiểm tra độ mạnh mật khẩu mới, cập nhật hash mới và tự động revoke tất cả các session khác trong database (`revokedAt = now()`), duy trì phiên hiện tại.
- **Giao diện Modal tương tác (SettingsModal)**: Tích hợp trực tiếp trên Header và thẻ Daily Goal của Dashboard, hỗ trợ điều hướng phím tắt (Esc để đóng), phản hồi trạng thái inline.

---

## Ngoài phạm vi (Won't-Have v1)

- Tải trực tiếp file ảnh nhị phân lên Cloudflare/S3 (sẽ triển khai trong Sprint quản lý media assets).
- Đổi địa chỉ Email và quy trình xác thực OTP email (triển khai trong Sprint Email Verification).

---

## Các thay đổi kỹ thuật chính

### Database (Prisma)

- Cập nhật model `User` trong `apps/api/prisma/schema.prisma`:
  - Thêm trường `avatarUrl String?` (nullable, 100% backward compatible).

### Backend (NestJS)

- `apps/api/src/modules/users/`:
  - `UsersController`:
    - `GET /api/v1/users/profile` (Protected by `JwtAuthGuard`)
    - `PATCH /api/v1/users/profile` (Protected by `JwtAuthGuard`)
    - `POST /api/v1/users/change-password` (Protected by `JwtAuthGuard`)
  - `UsersService`:
    - `getProfile(userId)`
    - `updateProfile(userId, dto)`
    - `changePassword(userId, currentSessionId, dto)`
  - DTOs: `UpdateProfileDto`, `ChangePasswordDto`.

### Shared Packages (`packages/shared-types`)

- Thêm `avatarUrl?: string | null` vào `AuthUser` và `User`.
- Export `UpdateProfileDto` và `ChangePasswordDto`.

### Frontend (React + Vite)

- `apps/web/src/features/user-profile/`:
  - `components/SettingsModal.tsx`: Modal 3 tabs (Hồ sơ & Mục tiêu, Chọn Avatar, Bảo mật).
  - `components/UserAvatar.tsx`: Component Avatar render preset, ảnh URL hoặc chữ cái đầu.
  - `config/avatarPresets.ts`: Cấu hình 8 preset Cosmos.
  - `services/userService.ts`: API client cho user profile và settings.
- `apps/web/src/store/useAuthStore.ts`:
  - Thêm `updateUser(partialUser)` để sync state lập tức.
- `apps/web/src/features/dashboard/pages/DashboardPage.tsx`:
  - Tích hợp `UserAvatar` và `SettingsModal` trên Header và click thẻ Daily Goal.

---

## Test Coverage

- **Backend Unit Tests**:
  - `apps/api/src/modules/users/users.service.spec.ts` (6 tests: getProfile, updateProfile, changePassword, validation errors).
  - `apps/api/src/modules/users/users.controller.spec.ts` (3 tests: GET, PATCH, POST mapping).
  - Toàn bộ backend test suite: 19/19 tests PASS.
- **Frontend Typecheck & Build**:
  - `tsc --noEmit` & `vite build`: 0 errors.

---

## Tác giả & Review

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: Senior BA / Architect
- **Date**: 2026-08-17
