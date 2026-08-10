# 🏗️ Sơ đồ Kiến trúc Hệ thống (System Architecture Overview)

Tài liệu này mô tả tổng quan kiến trúc hệ thống của ứng dụng **WordStreak** theo mô hình pnpm Monorepo.

---

## 📊 1. Sơ đồ Luồng Hoạt động (System Component Diagram)

```mermaid
graph TD
    subgraph Clients["📱 Clients Layer"]
        WEB["React Web App (apps/web)<br/>Vite + React + TS"]
        EXT["Chrome Extension (apps/extension)<br/>Manifest V3"]
    end

    subgraph Shared["📦 Shared Packages Layer"]
        TYPES["@wordstreak/shared-types<br/>(DTOs, Enums, Interfaces)"]
    end

    subgraph Backend["⚙️ Backend Layer (apps/api)"]
        API["NestJS Backend Server"]
        AUTH_M["Auth & Guards"]
        SRS_M["Reviews & SRS Engine (SM-2)"]
        AI_M["AI & Dictionary Integration"]
        EXERCISE_M["Quiz & Exercise Engine"]
    end

    subgraph External["🌐 External Services"]
        OPENAI["OpenAI / Gemini API"]
        FREE_DICT["Free Dictionary API"]
        S3["Cloud Storage (Audio/Images)"]
    end

    subgraph Data["💾 Persistence Layer"]
        DB[("PostgreSQL / MySQL Database")]
    end

    WEB -->|Imports Types| TYPES
    EXT -->|Imports Types| TYPES
    API -->|Uses Types| TYPES

    WEB -->|HTTPS / REST API| API
    EXT -->|HTTPS / REST API| API

    API --> AUTH_M
    API --> SRS_M
    API --> AI_M
    API --> EXERCISE_M

    AI_M -->|Fetch IPA & Examples| OPENAI
    AI_M -->|Fetch Audio & Phonetics| FREE_DICT

    API -->|Prisma / TypeORM| DB
```

---

## 🧩 2. Các thành phần chính trong Monorepo

| Component | Đường dẫn | Công nghệ | Vai trò chính |
| :--- | :--- | :--- | :--- |
| **Backend API** | `apps/api` | NestJS, TypeScript, Node.js | Cung cấp RESTful APIs, xử lý authentication, thuật toán SRS, bài tập quiz, tích hợp AI. |
| **Web App** | `apps/web` | React 19, Vite, TypeScript | Giao diện người dùng học flashcard, làm bài tập, theo dõi biểu đồ tiến trình và streak. |
| **Chrome Extension** | `apps/extension` | React, Vite, Manifest V3 | Tiện ích duyệt web: bôi đen từ mới trên bất kỳ trang web nào -> Lưu nhanh vào bộ từ vựng. |
| **Shared Types** | `packages/shared-types` | TypeScript | Package lưu trữ các Interfaces, DTOs và Enums dùng chung cho cả Web, API và Extension. |

---

## 🔒 3. Cơ chế Bảo mật & Xác thực (Authentication Flow)

1. **Xác thực JWT (JSON Web Token):**
   - User đăng nhập thành công ➔ Backend cấp cặp token: `accessToken` (thời hạn ngắn, e.g. 15m) và `refreshToken` (thời hạn dài, e.g. 7d).
   - Frontend `apps/web` và `apps/extension` tự động gắn `Authorization: Bearer <accessToken>` trong các HTTP request.

2. **Cơ chế Guards trong NestJS:**
   - Tất cả các endpoint riêng tư đều được bảo vệ bởi `@UseGuards(JwtAuthGuard)`.
   - Đối với các endpoint công khai (e.g. login, register, public decks), sử dụng decorator `@Public()`.
