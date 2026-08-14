# Feature Specification: User Authentication and Multi-Session Management

**Feature Branch**: `001-user-auth`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Backend NestJS với JWT (Access Token + Refresh Token trong HttpOnly Cookie), hash mật khẩu bằng Argon2, lưu user trong PostgreSQL qua Prisma. Frontend form Đăng ký/Đăng nhập validate bằng Zod + React Hook Form, lưu auth state bằng Zustand, sử dụng Axios với auto refresh token. Hỗ trợ đa thiết bị (multi-session). Shared package DTO & Response types dùng chung."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - New User Registration (Priority: P1)

A new user visits WordStreak and creates an account using their email, username, and password so they can begin building personal vocabulary decks and tracking streaks.

**Why this priority**: Core entry point for all personalized features in the application.

**Independent Test**: Can be tested by filling out the registration form with valid data and verifying that an account is created and the user is automatically logged in.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit a valid email, username (min 3 characters), and strong password (min 8 chars, 1 uppercase, 1 number), **Then** their account is created, tokens are issued, and they are redirected to the main dashboard.
2. **Given** a visitor on the registration page, **When** they submit an email that is already registered, **Then** an explicit error message indicates that the email is already in use without exposing sensitive account details.
3. **Given** a visitor on the registration page, **When** they submit invalid inputs (e.g. malformed email or weak password), **Then** inline validation errors are displayed immediately before network dispatch.

---

### User Story 2 - User Login & Session Persistence (Priority: P1)

An existing user logs into their WordStreak account with email and password, receives authenticated access, and stays logged in across page reloads without entering credentials repeatedly.

**Why this priority**: Required for returning users to access their decks, study progress, and streak status.

**Independent Test**: Can be tested by submitting valid login credentials and verifying access to protected routes across page reloads.

**Acceptance Scenarios**:

1. **Given** a registered user on the login page, **When** they submit their correct email and password, **Then** they receive an access token and a secure HttpOnly refresh token cookie, and are redirected to the dashboard.
2. **Given** an authenticated user whose short-lived access token has expired, **When** they trigger a protected action, **Then** the client seamlessly requests a new access token using the HttpOnly refresh token cookie without interrupting the user workflow.
3. **Given** a visitor with incorrect credentials, **When** they submit the login form, **Then** a generic error message "Invalid email or password" is shown and no tokens are issued.

---

### User Story 3 - Multi-Device Session Management & Token Rotation (Priority: P2)

A user logs in from multiple devices (e.g. laptop and phone) and each device maintains an independent active session. When a refresh token is used, it is rotated to prevent replay attacks.

**Why this priority**: Ensures seamless multi-device usage while maintaining high security against token theft and reuse.

**Independent Test**: Can be tested by logging in from two separate browser contexts/devices, refreshing tokens independently, and verifying neither session invalidates the other.

**Acceptance Scenarios**:

1. **Given** a user logged in on Device A and Device B, **When** Device A refreshes its token, **Then** Device A receives a new token pair while Device B's session remains active and valid.
2. **Given** an attacker attempts to reuse an old/consumed refresh token, **Then** the system detects token reuse, invalidates the compromised session immediately, and requires re-authentication.

---

### User Story 4 - User Logout & Session Revocation (Priority: P3)

An authenticated user chooses to log out of the current device, revoking their active session and clearing authentication cookies.

**Why this priority**: Fundamental security feature allowing users to safely end their session on shared or public devices.

**Independent Test**: Can be tested by clicking logout, verifying that cookies are cleared, and confirming that subsequent requests with previous tokens are rejected.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the dashboard, **When** they click "Log out", **Then** the active session in the database is invalidated, the HttpOnly refresh cookie is cleared, and the user is redirected to the login page.

---

### User Story 5 - Protected Routes & Auth State Synchronization (Priority: P3)

Unauthenticated visitors attempting to access protected application routes (e.g., decks, review sessions, profile) are redirected to the login page.

**Why this priority**: Prevents unauthorized access to user-specific data and provides clean navigation flow.

**Independent Test**: Can be tested by attempting direct URL navigation to `/dashboard` or `/review` while unauthenticated.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate directly to a protected route, **Then** they are redirected to `/login` with a return URL parameter.
2. **Given** a logged-in user, **When** they visit `/login` or `/register`, **Then** they are automatically redirected to `/dashboard`.

---

### Edge Cases

- **Concurrent Refresh Requests**: When multiple API requests fail simultaneously with 401, the frontend refresh interceptor must queue pending requests and perform only a single token refresh call, avoiding race conditions.
- **Session Expiry**: When a refresh token has expired (after 7 days of inactivity), any refresh attempt must cleanly reset the client auth state and redirect the user to login with a friendly session-expired message.
- **Network Failure during Auth**: If the network fails during login or token refresh, proper retry or error feedback must be displayed without corrupting the stored authentication state.
- **Malformed or Tampered Cookies**: Incoming requests with forged or invalid refresh tokens must be rejected with 401 and the invalid cookie cleared.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow new users to register with email, username, and password.
- **FR-002**: System MUST validate email format, username uniqueness/format, and enforce password complexity (min 8 chars, 1 uppercase letter, 1 number).
- **FR-003**: System MUST hash user passwords using Argon2 with recommended memory/time parameters prior to database storage.
- **FR-004**: System MUST issue short-lived JWT Access Tokens (15 minutes) and long-lived Refresh Tokens (7 days).
- **FR-005**: Refresh Tokens MUST be delivered via HttpOnly, Secure, SameSite=Strict cookies.
- **FR-006**: System MUST maintain discrete active sessions per device/client, storing hashed refresh tokens with expiration timestamps.
- **FR-007**: System MUST implement Refresh Token Rotation, issuing a new refresh token and invalidating the old token upon each refresh.
- **FR-008**: System MUST revoke the corresponding database session upon user logout and clear the client cookie.
- **FR-009**: System MUST provide an authenticated endpoint to fetch the current user's profile (`/auth/me`).
- **FR-010**: Frontend MUST provide responsive, accessible Login and Registration forms with client-side validation using Zod and React Hook Form.
- **FR-011**: Frontend MUST maintain reactive auth state (user, isAuthenticated, isLoading) and persist across page reloads via session recovery.
- **FR-012**: Frontend HTTP client MUST automatically intercept 401 responses, refresh the access token via cookie, and retry original requests seamlessly.
- **FR-013**: DTOs and API contract interfaces MUST be defined in `@wordstreak/shared-types` and consumed by both `apps/api` and `apps/web`.

### Key Entities _(include if feature involves data)_

- **User**: Represents a registered account with unique email, username, argon2 password hash, daily goal preference, and timestamps.
- **Session**: Represents an active device login containing reference to user, hashed refresh token, user agent/device info, IP address, expiration timestamp, and revocation status.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete registration or login in under 5 seconds with valid inputs.
- **SC-002**: 100% of password hashes in the database use Argon2id with no plaintext credentials stored or logged.
- **SC-003**: Token refresh completes transparently without user interaction in under 300ms on standard broadband.
- **SC-004**: Protected route unauthorized access attempts are blocked 100% of the time with appropriate redirect.
- **SC-005**: Form validation errors provide specific, user-friendly feedback within 100ms of input change or form submission.

## Assumptions

- PostgreSQL database is accessible via the configured `DATABASE_URL`.
- HTTPS is active in production, while local development allows secure cookies over localhost.
- OAuth (Google/GitHub login) is out of scope for this initial auth feature and can be added in future iterations.
- Email verification via magic links / confirmation emails is deferred to a subsequent milestone to keep MVP scope tight.
