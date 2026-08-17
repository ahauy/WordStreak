# Elicitation: User Profile & Daily Goal Settings (US-AUTH-04)

- **Feature Slug**: `user-profile-settings`
- **Protocol**: Bounded Task
- **Date**: 2026-08-17

---

## Stage 1 — Business Value

### 1. Problem & Pain Point

Currently, learners have fixed default daily study targets (`dailyGoal = 10`) and basic initial avatars. They cannot customize their daily learning pace (e.g., lighter 5 words/day for busy professionals or intensive 30-50 words/day for exam preppers), choose an avatar reflecting their identity, or update their password directly within the app. Without this, learners experience friction in tailoring their daily habit loop and securing their accounts.

### 2. Target Personas

- **Learner (Primary)**: Authenticated user wanting to adjust daily study targets, select a custom/preset avatar, and maintain account security.

### 3. Success Metrics

- **Primary**: 100% self-service capability to adjust learning goals, avatar, and password without admin intervention.
- **Operational**: P95 API response time < 100ms for profile updates; 0 security leaks during password change; instant client state synchronization across UI components.

---

## Elicited Decisions & Pillars

### Q1: Avatar Customization Mechanism

- **Decision**: Curated avatar presets (sleek Cosmos/Cyberpunk themed avatars) with optional DiceBear / custom avatar URL.
- **Rationale**: Immediate, visually cohesive with the Cosmos UI theme, zero storage infrastructure overhead, with flexibility for custom URLs.

### Q2: Password Change & Session Security Policy

- **Decision**: Change password successfully and automatically revoke all other active sessions in the database (keeping only the current user session active).
- **Rationale**: High security against stolen sessions while preventing frustrating logout of the user actively making the change on their current device.

### Q3: User Interface & Presentation

- **Decision**: Interactive Settings Modal with clear tabs:
  - Tab 1: **Hồ sơ & Mục tiêu** (Username, Email, Daily Goal selector: 5, 10, 20, 30, 50 cards).
  - Tab 2: **Chọn Avatar** (Grid of curated Cosmos presets + custom avatar URL preview).
  - Tab 3: **Bảo mật** (Current password, New password, Confirm new password).
- **Rationale**: Frictionless access directly from the Navbar avatar dropdown without navigating away from the current learning flow or dashboard.

---

## Documented Assumptions

- **ASM-PROFILE-001**: `avatarUrl` is stored as an optional string on the `User` model (`String?`).
- **ASM-PROFILE-002**: Valid preset daily goals are 5, 10, 20, 30, 50 cards (custom integer between 1 and 100 is supported with validation).
- **ASM-PROFILE-003**: Password changes require verifying the user's current password using Argon2/Bcrypt before applying the new hashed password.
- **ASM-PROFILE-004**: Updating profile info instantly updates the client Zustand `useAuthStore` state so the navbar, welcome banners, and statistics refresh without page reload.
