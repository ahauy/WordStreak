# Risk Register & Scope: User Profile & Daily Goal Settings (US-AUTH-04)

- **Feature Slug**: `user-profile-settings`
- **Protocol**: Bounded Task
- **Date**: 2026-08-17

---

## 1. Contradiction Scan

- **Logic Contradictions**: None detected. Daily goal boundaries (1–100) and preset options (5, 10, 20, 30, 50) align with dashboard review logic.
- **State Deadlocks**: None. Profile update is stateless; password update maintains active current session and invalidates stale sessions.
- **Backward Compatibility**: Nullable `avatarUrl` field in Prisma schema ensures 100% backward compatibility with existing users and sessions.

---

## 2. Risk Register

| ID                     | Risk                                                                      | Prob. |  Impact  | Mitigation                                                                                           |
| :--------------------- | :------------------------------------------------------------------------ | :---: | :------: | :--------------------------------------------------------------------------------------------------- |
| **`RISK-PROFILE-001`** | Inadvertent leakage of `passwordHash` in profile endpoints                |  Low  | Critical | Strict Prisma field selection and output DTO transformation excluding `passwordHash`.                |
| **`RISK-PROFILE-002`** | User accidentally logged out of current device upon password change       |  Low  |  Medium  | Query excludes current session ID (`Session.id != currentSessionId`) during session revocation.      |
| **`RISK-PROFILE-003`** | XSS or malicious payload in `avatarUrl`                                   |  Low  |   High   | Validation regex enforcing `https://` protocols or `preset:` URI scheme; max length 500 chars.       |
| **`RISK-PROFILE-004`** | Desynchronization between client auth store and backend after goal update |  Low  |   Low    | Backend returns updated user DTO; client store updates immediately and triggers reactive re-renders. |

---

## 3. Assumptions & Constraints (Consolidated)

- **`ASM-PROFILE-001`**: `avatarUrl` is stored as an optional nullable string (`String?`) on the `User` model.
- **`ASM-PROFILE-002`**: Preset daily goals are `5`, `10`, `20`, `30`, `50` cards (custom integer 1–100 supported).
- **`ASM-PROFILE-003`**: Password change requires verification of `currentPassword` with Argon2 before hashing `newPassword`.
- **`ASM-PROFILE-004`**: Successful profile/password update syncs `useAuthStore` in frontend without requiring full page reload.

---

## 4. MoSCoW Scope Table

- **Must-Have (P0)**:
  - Backend `GET /api/v1/users/profile` (retrieves current authenticated user profile).
  - Backend `PATCH /api/v1/users/profile` (updates `dailyGoal`, `avatarUrl`).
  - Backend `POST /api/v1/users/change-password` (verifies current password, updates password, revokes other sessions).
  - Frontend `SettingsModal` component with 3 tabs:
    - Tab 1: Profile & Daily Goal (Daily goal selection chips 5/10/20/30/50 + custom input, username/email display).
    - Tab 2: Avatar Selection (Cosmos preset grid + custom URL option).
    - Tab 3: Security & Password Change (Current password, new password, confirm password).
  - Top Navigation integration (clicking user avatar or "Settings" menu item opens the `SettingsModal`).
  - Unit tests for Backend User Controller/Service and Frontend Settings Modal.

- **Should-Have (P1)**:
  - Visual toast alerts on successful save.
  - Keyboard accessibility (Escape to close, Tab navigation).

- **Could-Have (P2)**:
  - DiceBear avatar seed generator.

- **Won't-Have (v1 / Out of Scope)**:
  - Local/S3 binary file upload for avatars (deferred to media asset sprint).
  - Email address change / verification workflow (requires separate email verification sprint).
