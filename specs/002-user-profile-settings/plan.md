# Implementation Plan: User Profile & Daily Goal Settings

**Branch**: `002-user-profile-settings`  
**Spec**: [spec.md](./spec.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/users.json](./contracts/users.json)

---

## 1. Architecture & Design Decisions

### 1.1 Backend Architecture (NestJS)

- **Database schema update**: Add `avatarUrl String?` to `User` model in `apps/api/prisma/schema.prisma`.
- **Users Module Expansion**:
  - `UsersController`:
    - `GET /api/v1/users/profile` (`@UseGuards(JwtAuthGuard)`)
    - `PATCH /api/v1/users/profile` (`@UseGuards(JwtAuthGuard)`)
    - `POST /api/v1/users/change-password` (`@UseGuards(JwtAuthGuard)`)
  - `UsersService`:
    - `getProfile(userId: string)`
    - `updateProfile(userId: string, dto: UpdateProfileDto)`
    - `changePassword(userId: string, currentSessionId: string, dto: ChangePasswordDto)`
  - DTOs:
    - `UpdateProfileDto` (dailyGoal with min 1 max 100, avatarUrl string)
    - `ChangePasswordDto` (currentPassword, newPassword)
  - Shared types: Export `UserProfileResponse`, `UpdateProfileDto`, `ChangePasswordDto` in `packages/shared-types`.

### 1.2 Frontend Architecture (React + Vite)

- **Cosmos Curated Avatars**:
  - Define 8-12 sleek preset avatars in `apps/web/src/features/user-profile/config/avatarPresets.ts` with labels, SVG/icon combinations, and gradients.
- **Components**:
  - `SettingsModal.tsx`: Accessible dialog with 3 tabs:
    1. _Profile & Learning Goal_: Daily goal chips (5, 10, 20, 30, 50) + custom input, username/email display.
    2. _Avatar Selection_: Cosmos preset avatar grid with active state highlight + custom URL preview input.
    3. _Security_: Current password, new password, confirm password form with validation feedback.
  - `UserAvatar.tsx`: Reusable avatar component rendering preset icons, custom images, or fallback initial letter with cosmic gradients.
- **Service & Store**:
  - `userService.ts`: API client functions calling `/api/v1/users/*`.
  - `useAuthStore.ts`: Update `user` state when profile is saved.
- **Integration**:
  - Connect Top Navigation in `DashboardPage` (and header) to open `SettingsModal`.

---

## 2. Test Strategy

- **Backend Tests (Jest)**:
  - `users.service.spec.ts`: Unit test profile retrieval, profile update, password change (valid, wrong current password, same password, session revocation).
  - `users.controller.spec.ts`: Controller routing, DTO validation, and auth guard mapping.
- **Frontend Tests (Vitest + RTL)**:
  - `SettingsModal.spec.tsx`: Test tab switching, daily goal selection, avatar picking, and form submission.
