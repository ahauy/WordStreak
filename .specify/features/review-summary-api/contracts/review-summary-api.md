# REST API Contract: Review Summary API for Extension (`US-REM-01`)

**Feature**: `US-REM-01`: API tóm tắt trạng thái học cho Extension (`GET /api/v1/reviews/summary`)  
**Slug**: `review-summary-api`  
**Version**: `1.0`  
**Protocol**: REST / JSON over HTTP/1.1 & HTTP/2  
**Base Path**: `/api/v1`  
**Controller**: [`ReviewsController`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews.controller.ts) (`@Controller('reviews')`)  
**Authentication**: Bearer JWT (`JwtAuthGuard`)

---

## 1. Endpoint Overview

| Method | Path | Auth Guard | Success Status | Conditional Status | Error Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/summary` | `JwtAuthGuard` | `200 OK` | `304 Not Modified` | `401 Unauthorized` | Returns a compact 10-field study status summary for the authenticated learner with Weak ETag caching. |

---

## 2. Request Specification

### 2.1. HTTP Request Line

```http
GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh HTTP/1.1
Host: api.wordstreak.io
Authorization: Bearer <access_token>
X-Timezone: Asia/Ho_Chi_Minh
If-None-Match: W/"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

### 2.2. Query Parameters

| Parameter | Type | Required | Default | Validation & Resolution Behavior (`BR-REM-001`) |
| :--- | :--- | :---: | :--- | :--- |
| `timezone` | `string` | No | — | Optional IANA timezone identifier (e.g., `Asia/Ho_Chi_Minh`, `America/New_York`, `Asia/Tokyo`). Highest priority when valid according to `Intl.DateTimeFormat`. If invalid or empty, falls back to `X-Timezone` header, then `'UTC'`. **Never throws `400 Bad Request`.** |

### 2.3. Request Headers

| Header | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `Authorization` | `string` | **Yes** | `Bearer <JWT>`. Validated by `JwtAuthGuard`. Extracts `user.sub` (`userId`). |
| `X-Timezone` | `string` | No | Secondary IANA timezone identifier when `?timezone=` is omitted or invalid. Falls back to `'UTC'` if invalid or omitted. |
| `If-None-Match` | `string` | No | Conditional request header containing previously received Weak ETag `W/"<sha256-hex>"` (supports single token, comma-separated token list, or `*`). |

---

## 3. Response Specification

### 3.1. Response Headers (Always Present on `200 OK` and `304 Not Modified`)

| Header | Value Format | Description |
| :--- | :--- | :--- |
| `ETag` | `W/"<64-char-sha256-hex>"` | Weak ETag computed over the canonical 10-field JSON serialization of `ReviewSummaryDto` (`BR-REM-008`). |
| `Cache-Control` | `private, must-revalidate, max-age=0` | Prevents shared proxy/CDN cross-user caching while instructing the client/extension to revalidate via `If-None-Match` on each poll (`RISK-REM-005`). |

### 3.2. `200 OK` — Summary State Changed or Initial Fetch

Returned when `If-None-Match` is absent or does not match the current Weak ETag.

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
ETag: W/"8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
Cache-Control: private, must-revalidate, max-age=0
```

```json
{
  "success": true,
  "data": {
    "dueCount": 12,
    "newAvailable": 35,
    "studiedToday": 4,
    "dailyGoal": 10,
    "goalReached": false,
    "currentStreak": 5,
    "streakAtRisk": false,
    "timezone": "Asia/Ho_Chi_Minh",
    "endOfDayAt": "2026-10-12T16:59:59.999Z",
    "nextDueAt": "2026-10-12T15:30:00.000Z"
  }
}
```

### 3.3. `304 Not Modified` — Unchanged Summary State

Returned when the incoming `If-None-Match` header matches the computed Weak ETag (`BR-REM-008`). Response body MUST be empty (`0 bytes`).

```http
HTTP/1.1 304 Not Modified
ETag: W/"8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
Cache-Control: private, must-revalidate, max-age=0
```

*(Empty response body)*

### 3.4. `401 Unauthorized` — Missing, Expired, or Invalid JWT

Returned by `JwtAuthGuard` when the `Authorization` header is missing, malformed, or expired.

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 4. Weak ETag Canonicalization & Matching Specification (`BR-REM-008`)

1. **Canonical Payload Construction**:
   Construct the `ReviewSummaryDto` object with keys in deterministic order:
   ```typescript
   const canonicalSummary: ReviewSummaryDto = {
     dueCount: summary.dueCount,
     newAvailable: summary.newAvailable,
     studiedToday: summary.studiedToday,
     dailyGoal: summary.dailyGoal,
     goalReached: summary.goalReached,
     currentStreak: summary.currentStreak,
     streakAtRisk: summary.streakAtRisk,
     timezone: summary.timezone,
     endOfDayAt: summary.endOfDayAt,
     nextDueAt: summary.nextDueAt,
   };
   const hash = createHash('sha256')
     .update(JSON.stringify(canonicalSummary))
     .digest('hex');
   const etag = `W/"${hash}"`;
   ```
2. **`If-None-Match` Comparison Rules (RFC 9110 §8.8.3.2 Weak Comparison)**:
   - If `ifNoneMatch` header is absent or empty → no match (`200 OK`).
   - If `ifNoneMatch.trim() === '*'` → match (`304 Not Modified`).
   - Split `ifNoneMatch` by `,` and trim each candidate token. Normalize weak prefix `W/` (or compare opaque-tag `"<hash>"` case-sensitively): if any candidate equals `W/"<hash>"` or `"<hash>"`, treat as a match (`304 Not Modified`).

---

## 5. OpenAPI 3.1 Specification Snippet

```yaml
openapi: 3.1.0
info:
  title: WordStreak Reviews Summary API
  version: 1.0.0
paths:
  /api/v1/reviews/summary:
    get:
      operationId: getReviewSummary
      summary: Get lightweight study status summary for Extension and Web clients
      tags:
        - Reviews
      security:
        - bearerAuth: []
      parameters:
        - name: timezone
          in: query
          required: false
          description: Optional IANA timezone identifier (takes priority over X-Timezone header). Falls back to UTC if invalid.
          schema:
            type: string
            example: Asia/Ho_Chi_Minh
        - name: X-Timezone
          in: header
          required: false
          description: Fallback IANA timezone identifier if query parameter is omitted or invalid.
          schema:
            type: string
            example: Asia/Ho_Chi_Minh
        - name: If-None-Match
          in: header
          required: false
          description: Weak ETag from previous poll for conditional 304 Not Modified caching.
          schema:
            type: string
            example: W/"8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
      responses:
        '200':
          description: Current study summary for the authenticated learner
          headers:
            ETag:
              schema:
                type: string
              description: Weak ETag hash of the canonical 10-field summary payload
            Cache-Control:
              schema:
                type: string
                example: private, must-revalidate, max-age=0
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReviewSummaryApiResponse'
        '304':
          description: Not Modified (summary state unchanged since If-None-Match ETag)
          headers:
            ETag:
              schema:
                type: string
            Cache-Control:
              schema:
                type: string
                example: private, must-revalidate, max-age=0
        '401':
          description: Unauthorized (missing or invalid Bearer JWT)
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    ReviewSummaryDto:
      type: object
      required:
        - dueCount
        - newAvailable
        - studiedToday
        - dailyGoal
        - goalReached
        - currentStreak
        - streakAtRisk
        - timezone
        - endOfDayAt
        - nextDueAt
      properties:
        dueCount:
          type: integer
          minimum: 0
          example: 12
        newAvailable:
          type: integer
          minimum: 0
          example: 35
        studiedToday:
          type: integer
          minimum: 0
          example: 4
        dailyGoal:
          type: integer
          minimum: 1
          example: 10
        goalReached:
          type: boolean
          example: false
        currentStreak:
          type: integer
          minimum: 0
          example: 5
        streakAtRisk:
          type: boolean
          example: false
        timezone:
          type: string
          example: Asia/Ho_Chi_Minh
        endOfDayAt:
          type: string
          format: date-time
          example: '2026-10-12T16:59:59.999Z'
        nextDueAt:
          type:
            - string
            - 'null'
          format: date-time
          example: '2026-10-12T15:30:00.000Z'
    ReviewSummaryApiResponse:
      type: object
      required:
        - success
        - data
      properties:
        success:
          type: boolean
          const: true
        data:
          $ref: '#/components/schemas/ReviewSummaryDto'
```
