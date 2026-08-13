# System Design Specification: User Authentication

**Feature Branch**: `001-user-auth`  
**Date**: 2026-08-13  
**Status**: Approved  

---

## 1. Overview & Architecture Strategy

The User Authentication subsystem provides secure account registration, credential login, state-less JWT API authorization, DB-backed refresh token rotation, and server-side session logout for the WordStreak application.

### Key Decisions
* **Access Tokens**: Short-lived (15 minutes) signed JWT containing `{ sub: userId, username }` passed via `Authorization: Bearer <token>` header.
* **Refresh Tokens**: Long-lived (7 days) UUID v4 string. Only its `SHA-256` hash (`tokenHash`) is persisted in PostgreSQL via Prisma.
* **Token Rotation & Security**: On `/refresh`, old refresh tokens are deleted and replaced with a new pair. Re-use of an invalid or already consumed token triggers revocation of all active refresh tokens for that user.
* **Password Hashing**: `bcrypt` with cost factor 10. Passwords must be 8–72 characters long.
* **Contracts Package**: All request/response DTOs shared between `apps/api` and `apps/web` via `@wordstreak/shared-types`.

---

## 2. Data Model & Shared Contracts

### 2.1 Database Schema (`apps/api/prisma/schema.prisma`)

```prisma
model User {
  id           String             @id @default(uuid())
  username     String             @unique
  email        String?            @unique
  passwordHash String
  dailyGoal    Int                @default(10)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  
  refreshTokens RefreshToken[]
  decks         Deck[]
  progress      UserCardProgress[]
  streaks       UserStreak[]

  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}
```

### 2.2 Shared DTOs (`packages/shared-types/src/auth.ts`)

```typescript
export interface RegisterDto {
  username: string; // 3-30 chars, alphanumeric + underscore
  password: string; // 8-72 chars
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // 900 seconds
}

export interface UserProfileDto {
  id: string;
  username: string;
  createdAt: string;
}

export interface AuthResponseDto {
  user: UserProfileDto;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
```

---

## 3. NestJS Backend Architecture (`apps/api/src/modules/auth/`)

### 3.1 Module Structure
* `auth.module.ts`: Configures `@nestjs/jwt`, `@nestjs/passport`, `PrismaModule`, registers `JwtStrategy`, and sets `JwtAuthGuard` as global `APP_GUARD`.
* `auth.controller.ts`:
  * `POST /api/v1/auth/register` (`@Public()`): Creates user, returns `201 Created` with `AuthResponseDto`.
  * `POST /api/v1/auth/login` (`@Public()`): Validates password, returns `200 OK` with `AuthResponseDto` or `401 Unauthorized`.
  * `POST /api/v1/auth/refresh` (`@Public()`): Rotates refresh token, returns `200 OK` with new tokens.
  * `POST /api/v1/auth/logout` (Protected): Deletes all refresh tokens for authenticated user.
  * `GET /api/v1/auth/me` (Protected): Returns current user profile.
* `auth.service.ts`:
  * `register()`: Validates uniqueness, hashes password with `bcrypt.hash(..., 10)`.
  * `login()`: Validates credentials with `bcrypt.compare()`. On failure, throws generic `UnauthorizedException('Invalid username or password')`.
  * `refreshToken()`: Hashes input token with `crypto.createHash('sha256')`, looks up in DB, verifies `expiresAt`. Deletes old token and creates new one.
  * `logout()`: Revokes all active refresh tokens for the user in DB.
* `guards/jwt-auth.guard.ts`: Checks `@Public()` metadata via `Reflector`.
* `strategies/jwt.strategy.ts`: Validates JWT bearer tokens.

---

## 4. React Web Frontend Architecture (`apps/web/src/features/auth/`)

* `services/authApi.ts`: Low-level HTTP fetch client wrapping auth endpoints.
* `hooks/useAuth.ts`: Custom hook managing auth state (`user`, `isAuthenticated`, `isLoading`), storing access token in memory and local session refresh state.
* `components/RegisterForm.tsx`: React 19 controlled form for user registration.
* `components/LoginForm.tsx`: React 19 controlled form for user login.

---

## 5. Testing & Security Verification

* **Unit Tests**: `apps/api/src/modules/auth/auth.service.spec.ts` testing registration, password verification, token rotation, reuse detection, and logout invalidation.
* **E2E Integration Tests**:
  * `apps/api/test/auth-register.e2e-spec.ts`
  * `apps/api/test/auth-login.e2e-spec.ts`
  * `apps/api/test/auth-refresh.e2e-spec.ts`
  * `apps/api/test/auth-logout.e2e-spec.ts`
* **Risk-Indexed Coverage Target**: ≥90% branch coverage on security-critical nodes (`AuthService`, `JwtAuthGuard`, `JwtStrategy`).
