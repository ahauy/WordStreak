# Handover Brief: User Profile & Daily Goal Settings (US-AUTH-04)

**Baseline version**: 1.0 (Signed off 2026-08-17)  
**Spec documents**: `spec/user-stories.md`  
**Validation status**: PASS (IEEE 29148 verified)

---

## 1. What's being built

- **Backend (NestJS)**:
  - Database schema: add `avatarUrl String?` to `User` model in `apps/api/prisma/schema.prisma` (run migration/client generation).
  - Endpoints in `UsersController`:
    - `GET /api/v1/users/profile` (Protected by `JwtAuthGuard`): returns sanitized profile.
    - `PATCH /api/v1/users/profile` (Protected by `JwtAuthGuard`): updates `dailyGoal` and/or `avatarUrl`.
    - `POST /api/v1/users/change-password` (Protected by `JwtAuthGuard`): verifies current password, updates password hash, revokes other active sessions.
  - Unit tests for `UsersService` and `UsersController`.
- **Frontend (React + Vite)**:
  - `SettingsModal` in `apps/web/src/features/user-profile/components/SettingsModal.tsx` with 3 tabs:
    1. _Profile & Learning Goal_: Edit dailyGoal (preset chips 5/10/20/30/50 + custom input).
    2. _Avatar Selection_: Curated Cosmos preset avatars + custom HTTPS URL preview.
    3. _Security_: Current password, new password, confirm new password.
  - Connect Top Navigation / Navbar in `DashboardPage` (and any other pages) to open `SettingsModal` when clicking the user avatar or settings button.
  - Integrate with `useAuthStore` to update local user state upon successful profile save.
  - Component unit tests for `SettingsModal`.

---

## 2. What's explicitly out of scope

- Binary image upload to S3/Cloudinary/Local (preset icons and URLs only for v1).
- Email update and email verification workflow.

---

## 3. Next step

Handover to Technical Planning & Implementation (Speckit / Superpowers).
