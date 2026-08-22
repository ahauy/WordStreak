# API Contract: User Language Preferences Sync (US-I18N-03)

**Feature**: `US-I18N-03`: Cài đặt tùy chọn ngôn ngữ & Đồng bộ hồ sơ người dùng (User Language Preferences Sync)  
**Slug**: `i18n-user-preferences-sync`  
**Protocol**: REST / JSON over HTTP  
**Authentication**: Bearer JWT (Access Token)  
**Date**: 2026-08-22

---

## 1. Type Definitions & Enums

```typescript
export type AppLanguage = "vi" | "en";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  dailyGoal: number;
  avatarUrl?: string | null;
  preferredLanguage?: AppLanguage;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  preferredLanguage?: AppLanguage;
}

export interface UpdateProfileDto {
  dailyGoal?: number;
  avatarUrl?: string;
  preferredLanguage?: AppLanguage;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
```

---

## 2. Endpoints Specification

### 2.1. Update User Profile (`PATCH /api/v1/users/profile`)

Updates the authenticated user's profile settings, including daily goal, avatar, and preferred language.

- **Method**: `PATCH`
- **Path**: `/api/v1/users/profile`
- **Auth**: Required (`Bearer <JWT>`)
- **Headers**: `Content-Type: application/json`

#### Request Body

```json
{
  "preferredLanguage": "en"
}
```

#### Request Validation Rules

| Field               | Type      | Required | Allowed Values                | Error Condition             | Error Code        |
| ------------------- | --------- | -------- | ----------------------------- | --------------------------- | ----------------- |
| `preferredLanguage` | `string`  | No       | `'vi'`, `'en'`                | Value not in `['vi', 'en']` | `400 Bad Request` |
| `dailyGoal`         | `integer` | No       | `1` to `100`                  | Value < 1 or > 100          | `400 Bad Request` |
| `avatarUrl`         | `string`  | No       | `preset:...` or `https://...` | Invalid URL format          | `400 Bad Request` |

#### Success Response (`200 OK`)

```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "email": "learner@wordstreak.io",
  "username": "vocab_master",
  "dailyGoal": 15,
  "avatarUrl": "preset:stellar-voyager",
  "preferredLanguage": "en",
  "createdAt": "2026-08-01T10:00:00.000Z",
  "updatedAt": "2026-08-22T09:30:00.000Z"
}
```

#### Error Response (`400 Bad Request`)

```json
{
  "statusCode": 400,
  "message": ["preferredLanguage must be one of the following values: vi, en"],
  "error": "Bad Request"
}
```

#### Error Response (`401 Unauthorized`)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 2.2. Get Current User Profile (`GET /auth/me` & `GET /api/v1/users/profile`)

Fetches the profile for the currently authenticated session.

- **Method**: `GET`
- **Path**: `/auth/me` / `/api/v1/users/profile`
- **Auth**: Required (`Bearer <JWT>`)

#### Success Response (`200 OK` for `/auth/me`)

```json
{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "learner@wordstreak.io",
    "username": "vocab_master",
    "dailyGoal": 10,
    "avatarUrl": "preset:stellar-voyager",
    "preferredLanguage": "en",
    "createdAt": "2026-08-01T10:00:00.000Z"
  }
}
```

---

### 2.3. User Registration (`POST /auth/register`)

Registers a new user account and inherits the guest's active language preference.

- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth**: None (Public)
- **Headers**: `Content-Type: application/json`

#### Request Body

```json
{
  "email": "newlearner@wordstreak.io",
  "username": "streak_champ",
  "password": "SecurePassword123!",
  "preferredLanguage": "en"
}
```

#### Success Response (`201 Created`)

```json
{
  "user": {
    "id": "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "email": "newlearner@wordstreak.io",
    "username": "streak_champ",
    "dailyGoal": 10,
    "avatarUrl": null,
    "preferredLanguage": "en",
    "createdAt": "2026-08-22T09:35:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2.4. User Login (`POST /auth/login`)

Authenticates an existing user and returns their persisted `preferredLanguage`.

- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: None (Public)

#### Request Body

```json
{
  "identifier": "learner@wordstreak.io",
  "password": "SecurePassword123!"
}
```

#### Success Response (`200 OK`)

```json
{
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "email": "learner@wordstreak.io",
    "username": "vocab_master",
    "dailyGoal": 10,
    "avatarUrl": "preset:stellar-voyager",
    "preferredLanguage": "en",
    "createdAt": "2026-08-01T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
