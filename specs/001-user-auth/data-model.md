# Data Model: User Authentication and Multi-Session Management

**Feature**: `001-user-auth` | **Date**: 2026-08-14

## Entity Relationships

```mermaid
erDiagram
    USER ||--o{ SESSION : "has many"
    USER ||--o{ DECK : "creates"
    USER ||--o{ USER_CARD_PROGRESS : "tracks"
    USER ||--o{ USER_STREAK : "owns"

    USER {
        string id PK "uuid"
        string email UK "unique email"
        string username UK "unique username"
        string passwordHash "Argon2id hash"
        int dailyGoal "default 10"
        datetime createdAt
        datetime updatedAt
    }

    SESSION {
        string id PK "uuid"
        string userId FK "references User(id)"
        string hashedRefreshToken "Argon2/SHA-256 hash"
        string userAgent "nullable"
        string ipAddress "nullable"
        datetime expiresAt "7 days from creation"
        datetime revokedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

## Schema Details

### 1. User Model (`users` table)

| Field          | Type     | Attributes             | Description                           |
| -------------- | -------- | ---------------------- | ------------------------------------- |
| `id`           | String   | `@id @default(uuid())` | Unique user identifier                |
| `email`        | String   | `@unique`              | Case-insensitive unique email address |
| `username`     | String   | `@unique`              | Unique public display name            |
| `passwordHash` | String   | -                      | Secure Argon2id password hash         |
| `dailyGoal`    | Int      | `@default(10)`         | Daily target words to review          |
| `createdAt`    | DateTime | `@default(now())`      | Account creation timestamp            |
| `updatedAt`    | DateTime | `@updatedAt`           | Last modification timestamp           |

### 2. Session Model (`sessions` table)

| Field                | Type      | Attributes             | Description                                   |
| -------------------- | --------- | ---------------------- | --------------------------------------------- |
| `id`                 | String    | `@id @default(uuid())` | Unique session identifier                     |
| `userId`             | String    | `@db.Uuid`             | Foreign key referencing `User(id)`            |
| `hashedRefreshToken` | String    | -                      | Hashed token for rotation validation          |
| `userAgent`          | String?   | nullable               | Client User-Agent string                      |
| `ipAddress`          | String?   | nullable               | Client remote IP address                      |
| `expiresAt`          | DateTime  | -                      | Session expiration date                       |
| `revokedAt`          | DateTime? | nullable               | Timestamp when session was revoked/logged out |
| `createdAt`          | DateTime  | `@default(now())`      | Session creation timestamp                    |
| `updatedAt`          | DateTime  | `@updatedAt`           | Session update timestamp                      |

**Indexes**:

- `@@index([userId])` for rapid session lookups by user.
- `@@index([expiresAt])` for background expired-session cleanup.

## State Transitions

### Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active: Login / Register (Tokens Issued)
    Active --> Active: Token Refresh (Rotation - New Hash Stored)
    Active --> Revoked: Logout / Remote Revocation
    Active --> Expired: Expiration Time Exceeded (7 days)
    Active --> Compromised: Token Reuse Detected (Session invalidated)
    Revoked --> [*]
    Expired --> [*]
    Compromised --> [*]
```

## Validation Rules

- **Email**: Must conform to RFC 5322 format, lowercase normalized, maximum 255 characters.
- **Username**: Alphanumeric + underscores, length between 3 and 30 characters.
- **Password**: Minimum 8 characters, maximum 100 characters, containing at least 1 uppercase letter and 1 numeric digit.
