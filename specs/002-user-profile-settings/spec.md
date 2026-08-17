# Feature Specification: User Profile, Avatar & Daily Goal Settings

**Feature Branch**: `002-user-profile-settings`  
**Created**: 2026-08-17  
**Status**: Approved  
**Input**: Signed-off Domain Decision Baseline `user-profile-settings` (`US-AUTH-04`)

---

## User Scenarios & Testing

### User Story 1 — Customize Daily Learning Goal (Priority: P1)

As an authenticated learner, I want to adjust my daily vocabulary target (5, 10, 20, 30, 50 cards per day) so that my spaced repetition review sessions match my pace and schedule.

**Acceptance Scenarios**:

1. **Given** a logged-in learner opening the Settings Modal, **When** they select a preset goal chip (e.g. 20 cards) or enter a custom integer (1–100) and click Save, **Then** `PATCH /api/v1/users/profile` updates `User.dailyGoal`, and the dashboard daily target card reflects 20 cards immediately.
2. **Given** a learner entering an invalid goal (0 or >100), **When** they attempt to save, **Then** inline validation blocks submission with "Goal must be between 1 and 100".

---

### User Story 2 — Avatar Selection & Customization (Priority: P1)

As an authenticated learner, I want to choose an avatar from curated Cosmos presets or enter a custom image URL so that my profile reflects my identity across the application.

**Acceptance Scenarios**:

1. **Given** a learner on the Avatar tab, **When** they select a Cosmos preset avatar (e.g., `preset:cosmos-1`) and click Save, **Then** `User.avatarUrl` is persisted in the database and the Top Navigation avatar updates immediately.
2. **Given** a learner entering a valid HTTPS image URL, **When** they save, **Then** the custom URL is validated and displayed as their avatar.
3. **Given** a learner entering an invalid URI scheme (e.g., `javascript:` or non-http), **When** submitted, **Then** the backend rejects the request with 400 Bad Request.

---

### User Story 3 — Change Password & Multi-Device Session Invalidation (Priority: P1)

As an authenticated learner, I want to change my password with current password verification and have all other active sessions revoked automatically.

**Acceptance Scenarios**:

1. **Given** a learner on the Security tab, **When** they enter their valid current password, a valid new password (>= 8 chars, 1 letter, 1 number), and matching confirmation, **Then** the new password is encrypted with Argon2, `Session.revokedAt` is set for all other user sessions, the current session remains active, and a success notification is shown.
2. **Given** an incorrect current password, **When** submitted, **Then** the backend returns 400 Bad Request ("Current password is incorrect") without modifying password or sessions.
3. **Given** a new password identical to the current password, **When** submitted, **Then** the backend rejects with 400 Bad Request ("New password must be different from current password").

---

### User Story 4 — Retrieve Current Profile & Client State Sync (Priority: P1)

As an authenticated learner, I want to fetch my latest profile information upon opening the app or after any update.

**Acceptance Scenarios**:

1. **Given** an authenticated request to `GET /api/v1/users/profile`, **When** the server responds with 200, **Then** the response includes `id`, `email`, `username`, `dailyGoal`, `avatarUrl`, `createdAt` and strictly excludes `passwordHash`.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide `GET /api/v1/users/profile` protected by `JwtAuthGuard` returning sanitized user details.
- **FR-002**: System MUST provide `PATCH /api/v1/users/profile` to update `dailyGoal` (1..100) and `avatarUrl` (string up to 500 chars).
- **FR-003**: System MUST provide `POST /api/v1/users/change-password` requiring `currentPassword`, `newPassword`, and `confirmPassword`.
- **FR-004**: System MUST verify `currentPassword` against `User.passwordHash` using Argon2 before allowing password update.
- **FR-005**: System MUST revoke all other active sessions (`id != currentSessionId`) in the database upon password update.
- **FR-006**: Frontend MUST provide a responsive `SettingsModal` with 3 tabs (Hồ sơ & Mục tiêu, Chọn Avatar, Bảo mật) accessible from the Top Navigation bar.
- **FR-007**: Frontend MUST synchronize updated profile info into `useAuthStore` without requiring a page reload.

### Key Entities

- `User`: `id`, `email`, `username`, `passwordHash`, `dailyGoal` (Int, default 10), `avatarUrl` (String?, nullable), `createdAt`, `updatedAt`.
- `Session`: `id`, `userId`, `hashedRefreshToken`, `expiresAt`, `revokedAt`, `createdAt`, `updatedAt`.
