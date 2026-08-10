# 📂 Cấu trúc Mã nguồn Chi tiết (Detailed Code Structure & Conventions)

Tài liệu này mô tả chi tiết quy chuẩn phân chia thư mục, quy tắc đặt tên và vai trò của từng thành phần trong codebase dự án **WordStreak**.

---

## 1. Cấu trúc Backend (`apps/api/src/`) - NestJS Modular Architecture

Mã nguồn Backend tuân theo kiến trúc **Domain Driven Modules** của NestJS:

```text
apps/api/src/
├── main.ts                      # Entry point: Cấu hình ValidationPipe, CORS, Swagger
├── app.module.ts                # Root Module kết nối tất cả Feature Modules
│
├── config/                      # Cấu hình môi trường (JWT, Database, Storage)
│   ├── configuration.ts
│   └── database.config.ts
│
├── common/                      # Thành phần dùng chung toàn Backend
│   ├── decorators/              # Custom decorators (e.g., @GetUser(), @Public())
│   ├── dto/                     # Global DTOs (PaginationQueryDto, ApiResponseDto)
│   ├── filters/                 # Exception Filters xử lý lỗi toàn cục
│   ├── guards/                  # Auth Guards, Roles Guard
│   ├── interceptors/            # Transform Response & Logging Interceptors
│   └── utils/                   # Hàm phụ trợ (Date helpers, String formatters)
│
└── modules/                     # CÁC FEATURE MODULES ĐỘC LẬP
    ├── auth/                    # Đăng nhập, Đăng ký, Refresh Token, Passport Strategies
    ├── users/                   # Hồ sơ cá nhân, Cài đặt người dùng
    ├── decks/                   # Quản lý Bộ từ vựng (Vocabulary Decks)
    ├── cards/                   # Quản lý Thẻ từ vựng (Flashcards)
    ├── reviews/                 # 🔴 Logic Ôn tập SRS & Thuật toán SuperMemo 2 (srs.engine.ts)
    ├── exercises/               # 🟠 Engine sinh bài tập Quiz (Trắc nghiệm, Điền từ, Nghe, Nối từ)
    ├── gamification/            # 📊 Logic đếm Streak & Daily Goals
    ├── analytics/               # 📈 Thống kê số từ Mastered/Learning/New & Biểu đồ
    ├── extension/               # 🧩 APIs phục vụ riêng cho Chrome Extension
    ├── integrations/            # 🤖 Tích hợp Dịch vụ bên ngoài (OpenAI/Gemini & Free Dictionary)
    └── uploads/                 # 📁 Upload ảnh minh họa Mnemonic & Audio phát âm
```

### Quy tắc trong NestJS Modules:
- Mỗi module có thư mục riêng chứa: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, `dto/`, và `entities/`.
- **Controller** chỉ làm nhiệm vụ nhận request và trả response, không chứa business logic.
- **Service** chứa toàn bộ business logic và tương tác với Database.

---

## 2. Cấu trúc Frontend (`apps/web/src/`) - Feature-Based Architecture

Mã nguồn Frontend tuân theo cấu trúc **Feature-Based Architecture (FBA)**, giúp nhóm code theo chức năng nghiệp vụ tương ứng 1-1 với Backend:

```text
apps/web/src/
├── main.tsx                     # Render React Root Node
├── App.tsx                      # Main Layout & Global Providers
├── router.tsx                   # Khai báo React Router & Protected Route Guards
│
├── assets/                      # Static Assets (Images, SVG Icons, Global Styles)
├── config/                      # Constants, Enums, Environment variables
├── store/                       # Global State Management (Zustand / Redux)
│
├── common/                      # Components & Utilities dùng chung
│   ├── api/                     # Axios instance & Endpoints mapping
│   ├── components/              # UI Primitives (Button, Modal, Card, Badge, Table, Layout)
│   ├── hooks/                   # Custom Hooks (useAudio, useSpeechRecognition)
│   └── utils/                   # Audio player, Formatters
│
└── features/                    # CÁC FEATURE MODULES HỌC TỪ
    ├── auth/                    # Form Đăng nhập, Đăng ký, OAuth
    ├── dashboard/               # Trang chủ Dashboard, Biểu đồ tiến trình, Streak widget
    ├── decks/                   # Danh sách & Quản lý Bộ từ vựng
    ├── cards/                   # Danh sách Thẻ từ vựng & Form Modal có AI Auto-Fill 🤖
    ├── reviews/                 # 🔴 Màn hình lật thẻ Flashcard SRS (Dễ, Khó, Lặp lại)
    ├── practice/                # 🟠 Engine làm bài tập Quiz & Kiểm tra phát âm 🎙️
    └── user-profile/            # Cài đặt cá nhân & Mục tiêu hàng ngày
```

---

## 3. Cấu trúc Package dùng chung (`packages/shared-types/`)

Package này chứa toàn bộ định nghĩa TypeScript dùng chung cho cả `api`, `web`, và `extension`:

```text
packages/shared-types/
├── package.json                 # Name: "@wordstreak/shared-types"
├── tsconfig.json
└── src/
    ├── index.ts                 # Export toàn bộ DTOs & Interfaces
    ├── user.ts                  # User, UserProfile, UserStreak interfaces
    ├── deck.ts                  # Deck, CreateDeckDto interfaces
    ├── card.ts                  # Card, CreateCardDto, AiGeneratedCardResponse interfaces
    ├── srs.ts                   # SrsRating, SrsProgress, ReviewSubmitDto
    └── api.ts                   # ApiResponse<T>, PaginatedResponse<T>
```

---

## 📏 4. Quy tắc đặt tên (Naming Conventions)

1. **File & Folder Name:**
   - Dùng **kebab-case** cho tất cả file và folder: `app.controller.ts`, `user-card-progress.entity.ts`, `use-audio.ts`, `deck-card.tsx`.

2. **Class & Interface Name:**
   - Dùng **PascalCase**: `AppController`, `UserCardProgress`, `CreateCardDto`, `SrsEngine`.

3. **Variables & Functions:**
   - Dùng **camelCase**: `calculateSm2`, `getUserStreak`, `nextReviewDate`.

4. **Constants & Enums:**
   - Dùng **UPPER_SNAKE_CASE** hoặc `as const` object: `API_BASE_URL`, `SRS_RATING_LABELS`.
