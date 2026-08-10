# ⚡ WordStreak Monorepo

> **WordStreak** là ứng dụng học từ vựng tiếng Anh thông minh ứng dụng Thuật toán lặp lại ngắt quãng (**Spaced Repetition System - SM-2**), Trí tuệ nhân tạo (AI), Gamification (Streak & Daily Goals) và Chrome Extension.

---

## 📁 Cấu trúc Monorepo (`pnpm workspace`)

```text
WordStreak/
├── apps/
│   ├── api/                     # Backend Server (NestJS, Prisma, JWT, OpenAI API)
│   └── web/                     # Frontend App (React 19, Vite, Tailwind/CSS)
├── packages/
│   └── shared-types/            # Package chứa DTOs, Enums & Interfaces dùng chung
├── docs/                        # Tài liệu hệ thống, thuật toán SM-2 & Database schema
├── package.json                 # Cấu hình Workspace Root
└── pnpm-workspace.yaml          # Định nghĩa PNPM Workspaces
```

---

## 🚀 Quick Start (Hướng dẫn chạy nhanh)

### 1. Cài đặt Dependencies
```bash
pnpm install
```

### 2. Build Package dùng chung
```bash
pnpm --filter @wordstreak/shared-types build
```

### 3. Chạy Development Server

- **Chạy Backend NestJS API (`http://localhost:3000`)**:
  ```bash
  pnpm dev:api
  ```

- **Chạy Frontend React Web (`http://localhost:5173`)**:
  ```bash
  pnpm dev:web
  ```

- **Build tất cả ứng dụng:**
  ```bash
  pnpm build
  ```

---

## 📚 Tài liệu chi tiết (Documentation)

* 🏗️ [Sơ đồ Kiến trúc Hệ thống](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/architecture/system-overview.md)
* 📂 [Cấu trúc Mã nguồn & Quy chuẩn đặt tên](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/architecture/code-structure.md)
* 🗄️ [Thiết kế Cơ sở dữ liệu (Database ERD)](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/architecture/database-schema.md)
* 🧮 [Giải thích Thuật toán SuperMemo 2 (SM-2)](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/algorithms/supermemo-2.md)
* 🚀 [Lộ trình phát triển (Product Roadmap)](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/roadmap.md)
