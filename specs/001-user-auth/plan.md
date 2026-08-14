# Implementation Plan: User Authentication & Multi-Session Management

**Branch**: `001-user-auth` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

Implement a full-stack, multi-device authentication system across the WordStreak monorepo. The backend (`apps/api`) uses NestJS with Passport JWT, Argon2id password hashing, and PostgreSQL persistence via Prisma with dedicated multi-session rotation. The frontend (`apps/web`) provides validated, accessible login/registration interfaces using React Hook Form + Zod, global auth state via Zustand, and automatic token refresh interceptors with Axios. Shared contracts and DTOs reside in `@wordstreak/shared-types`.

## Technical Context

**Language/Version**: TypeScript 5.7+ (strict mode enabled across all packages, Node.js LTS)

**Primary Dependencies**:

- Backend (`apps/api`): `@nestjs/common`, `@nestjs/core`, `@nestjs/passport`, `@nestjs/jwt`, `passport`, `passport-jwt`, `argon2`, `cookie-parser`, `@prisma/client`, `class-validator`, `class-transformer`
- Frontend (`apps/web`): `react` 19, `react-dom`, `react-router-dom`, `axios`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`
- Shared (`packages/shared-types`): TypeScript interfaces & DTOs

**Storage**: PostgreSQL with Prisma ORM (`users` and `sessions` tables)

**Testing**:

- Backend: Jest unit tests for `AuthService`, `UsersService`, `JwtStrategy`, `RefreshTokenStrategy` + NestJS Supertest e2e tests
- Frontend: Vitest + React Testing Library for Auth forms and ProtectedRoute
- E2E: Playwright test suite for registration, login, token refresh, and logout

**Target Platform**: Modern Web Browsers (Chrome, Firefox, Safari, Edge), Node.js server environment

**Performance Goals**:

- Auth API endpoints response time < 150ms p95
- Token refresh < 200ms p95
- Zero UI jank during silent background token refresh

**Constraints**:

- Access Token: 15 min lifespan in-memory / Bearer
- Refresh Token: 7 days lifespan in HttpOnly, Secure, SameSite=Strict cookie
- Refresh Token Rotation & Multi-session database tracking

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle / Rule          | Compliance Status | Rationale                                                                                                               |
| ------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **I. Code Quality First** | ✅ PASS           | Strict TypeScript throughout; shared DTOs in `@wordstreak/shared-types`; zero `any` usage.                              |
| **II. Testing Standards** | ✅ PASS           | Unit tests for password hashing & token issuance; integration tests for auth guards; component tests for auth forms.    |
| **III. UX Consistency**   | ✅ PASS           | Standardized form styling, clear loading spinners, accessible inputs with ARIA attributes and inline validation errors. |
| **IV. Performance**       | ✅ PASS           | Token refresh < 200ms; lean Zustand state; lazy-loaded auth pages.                                                      |
| **Tech Constraints**      | ✅ PASS           | NestJS + Prisma + PostgreSQL + React 19 + Vite + pnpm workspace.                                                        |

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Technical research & decisions
├── data-model.md        # Database schema & entity models
├── quickstart.md        # Validation & test execution guide
├── contracts/
│   └── auth.json        # OpenAPI 3.0 specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
packages/shared-types/
└── src/
    ├── auth.ts          # Auth DTOs (RegisterDto, LoginDto, TokenPayload, AuthResponse)
    ├── user.ts          # User entity interface & profile types
    └── index.ts         # Central export

apps/api/
├── prisma/
│   └── schema.prisma    # User + Session models
└── src/
    ├── common/
    │   ├── decorators/
    │   │   ├── public.decorator.ts
    │   │   └── current-user.decorator.ts
    │   └── guards/
    │       └── jwt-auth.guard.ts
    ├── config/
    │   └── auth.config.ts
    └── modules/
        ├── auth/
        │   ├── dto/
        │   │   ├── register.dto.ts
        │   │   └── login.dto.ts
        │   ├── strategies/
        │   │   ├── jwt.strategy.ts
        │   │   └── refresh-token.strategy.ts
        │   ├── auth.controller.ts
        │   ├── auth.service.ts
        │   └── auth.module.ts
        ├── users/
        │   ├── users.service.ts
        │   └── users.module.ts
        └── prisma/
            ├── prisma.service.ts
            └── prisma.module.ts

apps/web/
└── src/
    ├── api/
    │   ├── axios.ts         # Configured Axios instance with 401 refresh interceptor
    │   └── auth.api.ts      # API call functions (login, register, logout, getMe)
    ├── store/
    │   └── useAuthStore.ts  # Zustand authentication store
    ├── components/
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   └── ProtectedRoute.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       └── Input.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── RegisterPage.tsx
    │   └── DashboardPage.tsx
    └── App.tsx
```

## Complexity Tracking

_No constitution violations identified. Architecture follows standard NestJS modular patterns and React modular architecture._
