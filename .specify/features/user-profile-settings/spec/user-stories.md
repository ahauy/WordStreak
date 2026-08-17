# User Stories: User Profile & Daily Goal Settings (US-AUTH-04)

- **Feature Slug**: `user-profile-settings`
- **Protocol**: Bounded Task
- **Date**: 2026-08-17

---

### US-PROFILE-001: Customize Daily Learning Goal

**As an** authenticated learner  
**I want to** adjust my daily vocabulary target (e.g., 5, 10, 20, 30, 50 words per day)  
**So that** my spaced repetition review sessions match my daily study pace and schedule  
**Traces to**: `BR-PROFILE-001`, `ASM-PROFILE-002`

**Acceptance Criteria**:

- **Scenario 1 (Happy path - Select preset goal)**
  - Given the learner is logged in and opens the Settings Modal
  - When the learner selects the "20 Cards" preset chip and clicks "Save Changes"
  - Then the system sends `PATCH /api/v1/users/profile` with `{ dailyGoal: 20 }`
  - And the database updates `User.dailyGoal = 20`
  - And the Dashboard Daily Goal counter reflects 20 Cards immediately without page reload.
- **Scenario 2 (Validation - Invalid custom goal)**
  - Given the learner opens the Settings Modal
  - When the learner enters `0` or `150` in the custom goal field
  - Then the client displays an inline validation error "Goal must be between 1 and 100"
  - And the save button is disabled.

---

### US-PROFILE-002: Select and Customize Avatar

**As an** authenticated learner  
**I want to** choose an avatar from curated Cosmos presets or provide a custom image URL  
**So that** my profile visually represents me in the dashboard, reviews, and leaderboard  
**Traces to**: `BR-PROFILE-002`, `ASM-PROFILE-001`

**Acceptance Criteria**:

- **Scenario 1 (Happy path - Select curated preset avatar)**
  - Given the learner is on the "Avatar" tab of the Settings Modal
  - When the learner clicks on the "Stellar Voyager" preset icon and clicks "Save Avatar"
  - Then the backend updates `User.avatarUrl` with the preset identifier
  - And the top navigation bar and profile view instantly render the selected avatar image/icon.
- **Scenario 2 (Happy path - Custom HTTPS avatar URL)**
  - Given the learner enters a valid HTTPS image URL in the custom URL field
  - When the learner submits the update
  - Then the avatar preview renders the custom image and persists to the backend.
- **Scenario 3 (Edge case - Invalid avatar URL)**
  - Given the learner enters an invalid URL (e.g. `javascript:alert(1)`)
  - When the form is submitted
  - Then the backend rejects with `400 Bad Request` and the frontend shows an error message.

---

### US-PROFILE-003: Change Account Password & Invalidate Other Sessions

**As an** authenticated learner  
**I want to** securely change my account password by confirming my current password  
**So that** I can protect my account while automatically logging out other potentially compromised sessions  
**Traces to**: `BR-PROFILE-003`, `BR-PROFILE-004`, `ASM-PROFILE-003`

**Acceptance Criteria**:

- **Scenario 1 (Happy path - Successful password change)**
  - Given the learner is on the "Security" tab of the Settings Modal
  - When the learner enters the valid current password, a strong new password (>= 8 chars, 1 letter, 1 number), and matching confirmation
  - And clicks "Update Password"
  - Then the system hashes the new password with Argon2 and updates the database
  - And all other active sessions in the `Session` table for this user are marked as revoked (`revokedAt = now()`)
  - And the current session remains active and valid
  - And a success notification "Password updated successfully" is displayed.
- **Scenario 2 (Error case - Incorrect current password)**
  - Given the learner enters an incorrect current password
  - When the form is submitted
  - Then the backend returns `400 Bad Request` with "Current password is incorrect"
  - And the password is not changed and no sessions are revoked.
- **Scenario 3 (Validation - New password matches current password)**
  - Given the learner enters the same password in both current and new fields
  - When submitting
  - Then the system rejects the request with "New password must be different from current password".

---

### US-PROFILE-004: Retrieve Profile & Sync Client State

**As an** authenticated learner  
**I want to** retrieve my current profile information upon loading the app  
**So that** my settings, avatar, and daily goals are always up to date across all pages  
**Traces to**: `BR-PROFILE-005`, `ASM-PROFILE-004`

**Acceptance Criteria**:

- **Scenario 1 (Happy path - Profile fetch)**
  - Given an authenticated request to `GET /api/v1/users/profile`
  - When the backend responds with status 200
  - Then the response payload contains `id`, `email`, `username`, `dailyGoal`, `avatarUrl`, `createdAt`
  - And the `passwordHash` field is strictly omitted from the response.
