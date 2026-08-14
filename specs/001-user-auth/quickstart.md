# Quickstart & Validation Guide: User Authentication

**Feature**: `001-user-auth` | **Date**: 2026-08-14

## Prerequisites

1. PostgreSQL instance running and configured in `apps/api/.env`.
2. Workspace dependencies installed (`pnpm install`).
3. Shared package built (`pnpm --filter @wordstreak/shared-types build`).

## Setup & Migration

```bash
# 1. Generate & Apply Prisma Migration
cd apps/api
pnpm prisma migrate dev --name add_user_sessions

# 2. Start Backend API
pnpm start:dev

# 3. Start Frontend Web
cd ../web
pnpm dev
```

## API Validation Scenarios (cURL)

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wordstreak.app","username":"streakmaster","password":"Password123"}' \
  -c cookies.txt
```

_Expected: 201 Created with `{ user: { id, email, username }, accessToken }` and `Set-Cookie: refreshToken`._

### 2. User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wordstreak.app","password":"Password123"}' \
  -c cookies.txt
```

_Expected: 200 OK with new `accessToken` and updated refresh token cookie._

### 3. Get Current User (`/auth/me`)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

_Expected: 200 OK with `{ success: true, data: { id, email, username } }`._

### 4. Refresh Token Rotation

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

_Expected: 200 OK with new `accessToken` and rotated `Set-Cookie: refreshToken`._

### 5. Logout & Revocation

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -b cookies.txt \
  -c cookies.txt
```

_Expected: 200 OK, session marked revoked in database, and refresh cookie cleared._

## Frontend Validation Scenarios

1. Navigate to `http://localhost:5173/register`. Submit valid form data, confirm redirect to dashboard and display of username in header.
2. Open DevTools Network tab: Verify short-lived access token sent in `Authorization: Bearer` and `refreshToken` stored in HttpOnly cookie.
3. Open a second incognito window/browser to `http://localhost:5173/login`: Log in with the same user, verify both sessions remain independently active.
4. Click "Log out": Confirm redirect to `/login` and attempt to navigate back to `/dashboard` redirects to `/login`.
