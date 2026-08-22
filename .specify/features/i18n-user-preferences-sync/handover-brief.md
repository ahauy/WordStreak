# Developer Handover Brief: User Language Preferences Sync (US-I18N-03)

- **Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)
- **Slug**: `i18n-user-preferences-sync`
- **Baseline Version**: `1.0` (Signed off 2026-08-22)
- **Target Subsystem**: Fullstack (`apps/api`, `apps/web`, `packages/shared-types`)

---

## 1. What's Being Built

Synchronize and persist the user's selected language preference (`'vi'` / `'en'`) across frontend cache and backend database:

1. **Prisma Schema (`apps/api`)**: Add `preferredLanguage String @default("vi")` to `User` model with Prisma migration.
2. **Backend API (`apps/api`)**:
   - Update `UserResponseDto` to expose `preferredLanguage`.
   - Update `UpdateUserProfileDto` to accept optional `preferredLanguage: 'vi' | 'en'`.
   - Update `RegisterDto` to accept optional `preferredLanguage: 'vi' | 'en'` during registration.
   - Return `preferredLanguage` in `GET /auth/me` and `GET /api/v1/users/profile`.
3. **Frontend Sync & Hydration (`apps/web`)**:
   - **On Login / Boot (`GET /auth/me`)**: Synchronize DB `preferredLanguage` to `localStorage` and `i18next` runtime.
   - **On Registration (`POST /auth/register`)**: Pass current active `locale` in registration payload.
   - **On Language Switch (Obsidian Pill & Settings)**: Instant optimistic UI switch (`< 16ms`) + debounced background `PATCH /api/v1/users/profile`.
   - **Offline / Error**: Graceful local degradation without blocking UI alerts.

---

## 2. What's Explicitly Out of Scope

- Translation of user-generated deck cards or notes.
- Support for additional languages beyond `'vi'` and `'en'`.
- Complex multi-device push notification sync (WebSocket sync for open background tabs on other devices is not required).

---

## 3. Key Technical Contracts

### Prisma Migration

```prisma
model User {
  // ... existing fields
  preferredLanguage String @default("vi") // 'vi' | 'en'
}
```

### DTO Validations (`class-validator`)

```typescript
@IsOptional()
@IsEnum(['vi', 'en'], { message: 'preferredLanguage must be either vi or en' })
preferredLanguage?: 'vi' | 'en';
```

### Endpoint Contracts

- `GET /auth/me` -> returns `{ ..., preferredLanguage: 'vi' | 'en' }`
- `PATCH /api/v1/users/profile` -> body `{ preferredLanguage?: 'vi' | 'en' }`
- `POST /auth/register` -> body `{ email, password, username, preferredLanguage?: 'vi' | 'en' }`

---

## 4. Next Step

Invoke `speckit-specify` / implementation orchestrator to generate technical specification, test plan, and task breakdown for implementation.
