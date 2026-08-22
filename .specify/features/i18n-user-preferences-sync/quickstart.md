# Quickstart Validation Guide: User Language Preferences Sync (US-I18N-03)

**Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)  
**Slug**: `i18n-user-preferences-sync`  
**Date**: 2026-08-22

---

## 1. Prerequisites & Setup

```bash
# 1. Run database migrations to apply preferredLanguage schema update
pnpm --filter @wordstreak/api prisma migrate dev --name add_preferred_language_to_users

# 2. Build shared contracts
pnpm --filter @wordstreak/shared-types build

# 3. Start development environment
pnpm dev
```

---

## 2. Runnable Verification Scenarios

### Scenario 1: Register New User with Guest Language Selection

```bash
# Register a new user with preferredLanguage = 'en'
curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sync_test@wordstreak.io",
    "username": "sync_test",
    "password": "Password123!",
    "preferredLanguage": "en"
  }' | jq .
# Expected: Returns 201 Created with user.preferredLanguage == "en"
```

### Scenario 2: Login and Verify Hydration

```bash
# Login with created account
curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "sync_test@wordstreak.io",
    "password": "Password123!"
  }' | jq .
# Expected: Returns 200 OK with accessToken and user.preferredLanguage == "en"
```

### Scenario 3: Update Profile Language (`PATCH /users/profile`)

```bash
# Extract JWT_TOKEN from previous login step, then update to 'vi'
curl -s -X PATCH http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredLanguage": "vi"
  }' | jq .
# Expected: Returns 200 OK with preferredLanguage == "vi"
```

### Scenario 4: Reject Invalid Language (`400 Bad Request`)

```bash
# Attempt to send unsupported locale 'fr'
curl -s -X PATCH http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferredLanguage": "fr"
  }' | jq .
# Expected: Returns 400 Bad Request with validation error message
```

---

## 3. Automated Test Execution

```bash
# Run backend unit & integration tests
pnpm --filter @wordstreak/api test -- users.service.spec.ts auth.service.spec.ts

# Run frontend tests
pnpm --filter @wordstreak/web test -- LanguageSwitcher.test.tsx useAuthStore.test.ts
```
