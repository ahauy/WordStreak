# Test Plan: User Profile & Daily Goal Settings

**Feature slug**: `user-profile-settings`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (before implement)  
**Traces to**: `.specify/features/user-profile-settings/spec/user-stories.md`

---

## Unit Tests

### `UsersService`

#### TC-001: Get user profile successfully

```gherkin
Given a valid user id in the database
When UsersService.getProfile(userId) is called
Then it returns sanitized user data (id, email, username, dailyGoal, avatarUrl)
  And passwordHash is not included
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-004` Scenario 1

---

#### TC-002: Update profile daily goal and avatar

```gherkin
Given a valid user id
When UsersService.updateProfile(userId, { dailyGoal: 20, avatarUrl: "preset:cosmos-1" }) is called
Then the database record is updated
  And it returns the updated profile
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-001` Scenario 1, `US-PROFILE-002` Scenario 1

---

#### TC-003: Change password successfully and revoke other sessions

```gherkin
Given a user with existing password and multiple active sessions
When UsersService.changePassword(userId, currentSessionId, { currentPassword, newPassword }) is called with correct current password
Then the password is encrypted with Argon2 and updated
  And all other active sessions for that user are revoked (revokedAt is set)
  And the current session remains active
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-003` Scenario 1

---

#### TC-004: Reject password change with incorrect current password

```gherkin
Given a user
When UsersService.changePassword(userId, currentSessionId, { currentPassword: "wrong", newPassword: "new" }) is called
Then it throws BadRequestException("Current password is incorrect")
  And no password or session is altered
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-003` Scenario 2

---

#### TC-005: Reject password change when new password equals current password

```gherkin
Given a user
When UsersService.changePassword is called with newPassword identical to currentPassword
Then it throws BadRequestException("New password must be different from current password")
```

**File**: `apps/api/src/modules/users/users.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-003` Scenario 3

---

## Integration Tests / Controller Tests

### `UsersController`

#### TC-010: GET /api/v1/users/profile returns authenticated user profile

```gherkin
Given an authenticated user request with JWT bearer token
When GET /api/v1/users/profile is called
Then response status is 200
  And response payload matches UserProfileResponse
```

**File**: `apps/api/src/modules/users/users.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-004` Scenario 1

---

#### TC-011: PATCH /api/v1/users/profile updates and returns profile

```gherkin
Given an authenticated user request
When PATCH /api/v1/users/profile is called with valid UpdateProfileDto
Then response status is 200
  And dailyGoal / avatarUrl are updated
```

**File**: `apps/api/src/modules/users/users.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-001`, `US-PROFILE-002`

---

#### TC-012: POST /api/v1/users/change-password changes password

```gherkin
Given an authenticated user request with valid ChangePasswordDto
When POST /api/v1/users/change-password is called
Then response status is 200
  And response contains success message
```

**File**: `apps/api/src/modules/users/users.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-003`

---

## Component Tests (Frontend)

### `SettingsModal`

#### TC-020: Render tabs and default values

```gherkin
Given an authenticated user with dailyGoal 10
When SettingsModal is opened
Then it shows 3 tabs: "Hồ sơ & Mục tiêu", "Avatar", "Bảo mật"
  And the 10-card daily goal chip is active by default
```

**File**: `apps/web/src/features/user-profile/components/SettingsModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-001`

---

#### TC-021: Switch daily goal and submit update

```gherkin
Given the user is on the Profile tab
When user clicks "20 Cards" and clicks "Lưu thay đổi"
Then userService.updateProfile({ dailyGoal: 20 }) is called
  And auth store is updated
```

**File**: `apps/web/src/features/user-profile/components/SettingsModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-001` Scenario 1

---

#### TC-022: Select cosmos avatar preset and submit

```gherkin
Given the user is on the Avatar tab
When user clicks a cosmos avatar preset and clicks "Lưu Avatar"
Then userService.updateProfile({ avatarUrl: "preset:cosmos-1" }) is called
```

**File**: `apps/web/src/features/user-profile/components/SettingsModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-002` Scenario 1

---

#### TC-023: Change password form validation & submission

```gherkin
Given the user is on the Security tab
When user fills current, new, and confirmation password and submits
Then userService.changePassword is called
  And success alert is displayed
```

**File**: `apps/web/src/features/user-profile/components/SettingsModal.spec.tsx`  
**Priority**: Must-Have  
**Traces to**: `US-PROFILE-003` Scenario 1
