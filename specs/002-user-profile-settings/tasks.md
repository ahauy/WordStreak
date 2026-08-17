# Tasks: User Profile & Daily Goal Settings

**Feature Branch**: `002-user-profile-settings`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

---

## Phase 1: Shared Types & Database Schema

- [x] **Task 1.1**: Update `apps/api/prisma/schema.prisma` with `avatarUrl String?` and regenerate Prisma client.
- [x] **Task 1.2**: Update `packages/shared-types/src/index.ts` and `packages/shared-types/src/auth.ts` with `UserProfileResponse`, `UpdateProfileDto`, and `ChangePasswordDto`.

---

## Phase 2: Backend Implementation (TDD)

- [x] **Task 2.1**: Write unit tests in `apps/api/src/modules/users/users.service.spec.ts` testing profile retrieval, update, password change, and session invalidation.
- [x] **Task 2.2**: Implement `getProfile`, `updateProfile`, and `changePassword` in `apps/api/src/modules/users/users.service.ts`.
- [x] **Task 2.3**: Create DTOs `update-profile.dto.ts` and `change-password.dto.ts` in `apps/api/src/modules/users/dto/`.
- [x] **Task 2.4**: Create and test `UsersController` with `@Get('profile')`, `@Patch('profile')`, `@Post('change-password')` in `apps/api/src/modules/users/users.controller.ts`.
- [x] **Task 2.5**: Update `apps/api/src/modules/users/users.module.ts` to export and register `UsersController`.

---

## Phase 3: Frontend Implementation (TDD)

- [x] **Task 3.1**: Create Cosmos avatar preset definitions and `UserAvatar` component in `apps/web/src/features/user-profile/`.
- [x] **Task 3.2**: Implement `userService.ts` in `apps/web/src/features/user-profile/services/userService.ts`.
- [x] **Task 3.3**: Write and integrate `SettingsModal` in `apps/web/src/features/user-profile/components/SettingsModal.tsx`.
- [x] **Task 3.4**: Implement `SettingsModal.tsx` with 3 tabs (Profile & Goal, Avatar, Security) and client validation.
- [x] **Task 3.5**: Integrate `SettingsModal` and `UserAvatar` into `DashboardPage.tsx` and top navigation bar.

---

## Phase 4: Quality Verification & Documentation

- [x] **Task 4.1**: Execute all unit and build test suites (`npm test` in api, `tsc` and `vite build` in web).
- [x] **Task 4.2**: Update `docs/PRODUCT_BACKLOG_ROADMAP.md` checking off `US-AUTH-04`.
- [x] **Task 4.3**: Create `docs/features/user-profile-settings/README.md` and update `docs/features/README.md`.
