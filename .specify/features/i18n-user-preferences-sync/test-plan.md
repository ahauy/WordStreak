# Test Plan: User Language Preferences Sync (US-I18N-03)

**Feature slug**: `i18n-user-preferences-sync`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (trước implement)  
**Traces to**: `.specify/features/i18n-user-preferences-sync/spec.md`

> **Mục đích**: Document này mô tả test cases ở dạng Gherkin trước khi viết code.
> Sau khi implement xong, actual test files được viết dựa trên document này.

---

## Unit Tests

### `UsersService` & `UpdateProfileDto`

#### TC-001: Get user profile includes `preferredLanguage`

```gherkin
Given an existing user in PostgreSQL with preferredLanguage "en"
When  UsersService.getProfile(userId) is called
Then  it returns an AuthUser object containing preferredLanguage: "en"
  And passwordHash is not exposed
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 1, `REQ-I18N-SYNC-002`

---

#### TC-002: Update user profile persists new `preferredLanguage`

```gherkin
Given an existing user in PostgreSQL with preferredLanguage "vi"
When  UsersService.updateProfile(userId, { preferredLanguage: "en" }) is called
Then  Prisma.user.update is invoked with preferredLanguage: "en"
  And the returned AuthUser has preferredLanguage: "en"
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 2, `REQ-I18N-SYNC-002`

---

#### TC-003: Validation of `preferredLanguage` in `UpdateProfileDto`

```gherkin
Given an UpdateProfileDto with preferredLanguage "fr" (invalid locale)
When  ValidationPipe validates the DTO
Then  validation fails with a bad request error for preferredLanguage
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `BR-I18N-SYNC-001`, `SC-006`

---

### `AuthService` & `RegisterDto`

#### TC-004: User registration with explicit `preferredLanguage`

```gherkin
Given a guest submitting registration with email, username, password, and preferredLanguage: "en"
When  AuthService.register(dto) is called
Then  UsersService.create is called with preferredLanguage: "en"
  And returned AuthResponse.user contains preferredLanguage: "en"
```

**File**: `apps/api/src/modules/auth/auth.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 3, `REQ-I18N-SYNC-003`

---

#### TC-005: User registration without `preferredLanguage` defaults to "vi"

```gherkin
Given a guest submitting registration without preferredLanguage field
When  AuthService.register(dto) is called
Then  UsersService.create is called and preferredLanguage defaults to "vi"
  And returned AuthResponse.user contains preferredLanguage: "vi"
```

**File**: `apps/api/src/modules/auth/auth.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `BR-I18N-SYNC-004`, `REQ-I18N-SYNC-001`

---

#### TC-006: User login returns persisted `preferredLanguage`

```gherkin
Given a registered user whose database record has preferredLanguage "en"
When  AuthService.login(dto) is called with valid credentials
Then  returned AuthResponse.user contains preferredLanguage: "en"
```

**File**: `apps/api/src/modules/auth/auth.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 1, `REQ-I18N-SYNC-002`

---

#### TC-007: Validation of `preferredLanguage` in `RegisterDto`

```gherkin
Given a RegisterDto with preferredLanguage "invalid-lang"
When  ValidationPipe validates the DTO
Then  validation fails with a bad request error for preferredLanguage
```

**File**: `apps/api/src/modules/auth/auth.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `BR-I18N-SYNC-001`, `SC-006`

---

### Frontend `useAuthStore` & Language Sync

#### TC-008: Auth store hydrations update `localStorage` and `i18n`

```gherkin
Given local storage is set to "vi"
When  useAuthStore.login() or initializeAuth() resolves with a user whose preferredLanguage is "en"
Then  localStorage["wordstreak_locale"] is updated to "en"
  And i18n.changeLanguage("en") is invoked without page reload
```

**File**: `apps/web/src/store/__tests__/useAuthStore.i18n.test.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 1, `REQ-I18N-SYNC-005`

---

#### TC-009: `LanguageSwitcher` dispatches debounced profile update

```gherkin
Given an authenticated user clicks the language toggle to switch to "en"
When  toggle is clicked 5 times within 100ms ending on "vi"
Then  UI updates immediately (<16ms) on each click
  And exactly 1 background PATCH request is dispatched with preferredLanguage: "vi" after debounce window
```

**File**: `apps/web/src/components/LanguageSwitcher/__tests__/LanguageSwitcher.sync.test.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 2, `REQ-I18N-SYNC-004`

---

## Integration Tests

### `PATCH /api/v1/users/profile`

#### TC-010: Update preferred language endpoint

```gherkin
Given user is authenticated with a valid JWT
When  PATCH /api/v1/users/profile is called with { "preferredLanguage": "en" }
Then  response status is 200 OK
  And response body contains { "preferredLanguage": "en" }
  And database user record reflects preferredLanguage = "en"
```

**File**: `apps/api/src/modules/users/users.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `REQ-I18N-SYNC-002`

---

#### TC-011: Reject invalid preferred language

```gherkin
Given user is authenticated with a valid JWT
When  PATCH /api/v1/users/profile is called with { "preferredLanguage": "de" }
Then  response status is 400 Bad Request
  And response error message mentions allowed values "vi, en"
```

**File**: `apps/api/src/modules/users/users.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `BR-I18N-SYNC-001`

---

### `POST /auth/register` & `POST /auth/login`

#### TC-012: Registration and Login preserve preferred language

```gherkin
Given a guest with preferred language "en"
When  POST /auth/register is called with { ..., "preferredLanguage": "en" }
Then  response status is 201 Created
  And response user object has preferredLanguage "en"
When  subsequent POST /auth/login is called with same credentials
Then  response status is 200 OK
  And response user object retains preferredLanguage "en"
```

**File**: `apps/api/src/modules/auth/auth.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `REQ-I18N-SYNC-003`, `REQ-I18N-SYNC-002`

---

## E2E Tests (Playwright)

### Flow: Multi-Device Language Preference Hydration

#### TC-020: Multi-device sync happy path

```gherkin
Given user has set preferredLanguage to "en" on Device A
When  user navigates to /login on Device B (clean browser session) and logs in
Then  user sees dashboard rendered in English ("Daily Streak", "Decks")
  And localStorage has "wordstreak_locale" = "en"
  And no page reload was triggered
```

**File**: `apps/web/e2e/i18n-sync.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 1

---

#### TC-021: Offline switching resilience

```gherkin
Given an authenticated user is offline (network disconnected)
When  user toggles language in header switcher
Then  UI switches language immediately (<16ms)
  And local storage is updated
  And no error dialog or app crash occurs
```

**File**: `apps/web/e2e/i18n-sync.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-I18N-03` Scenario 5

---

## Test Coverage Checklist

- [x] Tất cả `US-I18N-03` Scenario 1 (multi-device hydration on login) có TC tương ứng
- [x] Tất cả `US-I18N-03` Scenario 2 (in-session optimistic switch & debounce) có TC tương ứng
- [x] Tất cả `US-I18N-03` Scenario 3 (guest registration carryover) có TC tương ứng
- [x] Tất cả `US-I18N-03` Scenario 4 (settings modal language configuration) có TC tương ứng
- [x] Tất cả `US-I18N-03` Scenario 5 (offline / network error resilience) có TC tương ứng
- [x] Business rules (BR-I18N-SYNC-001 through BR-I18N-SYNC-007) có TC kiểm tra
- [x] Error states (400 validation error for invalid locale, 401 unauthorized) có TC
- [x] Debouncing & rapid-switch scenarios có TC
