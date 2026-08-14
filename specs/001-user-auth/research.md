# Technical Research & Decisions: User Authentication & Multi-Session

**Feature**: `001-user-auth` | **Date**: 2026-08-14

## Research 1: Password Hashing with Argon2

### Decision

Use `argon2` (Argon2id variant) with parameters:

- Type: `argon2.argon2id`
- Memory cost: 65536 KB (64MB)
- Time cost: 3 iterations
- Parallelism: 4 threads

### Rationale

Argon2id is the winner of the Password Hashing Competition (PHC) and recommended by OWASP. It resists GPU-based cracking and side-channel attacks better than bcrypt or scrypt.

### Alternatives Considered

- `bcrypt`: Historically standard, but vulnerable to GPU-accelerated brute force and has a 72-byte password truncation limitation.
- `scrypt`: Strong, but Argon2id provides superior flexibility and defense against side-channel and timing attacks.

---

## Research 2: Authentication Strategy & Token Lifecycle

### Decision

- **Access Token**: JWT payload `{ sub: userId, email: string, sessionId: string }`, signed with `JWT_SECRET`, expiry 15 minutes (`15m`). Stored in memory on the frontend (Zustand auth store).
- **Refresh Token**: Random crypto-secure token (opaque UUID / signed JWT with `JWT_REFRESH_SECRET`), expiry 7 days (`7d`). Delivered in an `HttpOnly`, `Secure` (production), `SameSite=Strict`, `Path=/api/auth` Cookie.
- **Refresh Token Rotation & Revocation**: Upon each `/auth/refresh` invocation, verify the old token hash against the `Session` record in PostgreSQL. Invalidate the old token, issue a new pair, and update the session's `hashedRefreshToken`. If an already consumed/revoked token is used, trigger reuse detection and revoke the entire session.

### Rationale

Keeps the access token inaccessible to XSS attacks (held in JS closure/memory for short duration) while the refresh token cannot be accessed via `document.cookie`. Multi-session database tracking allows granular device revocation and session inspection.

---

## Research 3: NestJS Auth Module Architecture

### Decision

- Use `@nestjs/passport` + `passport-jwt` + `cookie-parser`.
- Provide `JwtStrategy` (extracts Bearer token from `Authorization` header) and `@Public()` custom metadata decorator.
- Use global `JwtAuthGuard` applied across the application, skipping routes marked with `@Public()`.
- Implement `PrismaService` connection lifecycle provider.

### Rationale

Adheres to `nestjs-patterns` where auth guards are centralized, domain logic is isolated in `AuthService` and `UsersService`, and request DTOs are validated with `class-validator`.

---

## Research 4: Frontend State & Refresh Interceptor

### Decision

- **Client**: Axios instance configured with `baseURL: import.meta.env.VITE_API_URL` and `withCredentials: true`.
- **Axios Response Interceptor**: Intercepts `401 Unauthorized` responses. Uses a promise-based mutex/queue to buffer concurrent failing requests while executing a single `/auth/refresh` call. Once refreshed, updates access token header and replays queued requests. If refresh fails, purges Zustand state and redirects to `/login`.
- **State Management**: `zustand` store `useAuthStore` exposing `user`, `accessToken`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`, `fetchMe`.

### Rationale

Prevents duplicate refresh token calls and race conditions when multiple API calls trigger at once on page load or dashboard mount.
