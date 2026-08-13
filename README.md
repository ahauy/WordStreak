# ⚡ WordStreak Monorepo

> **WordStreak** là nền tảng học từ vựng tiếng Anh thông minh ứng dụng Thuật toán lặp lại ngắt quãng (**Spaced Repetition System - SM-2**), Trí tuệ nhân tạo (AI), Gamification (Streak & Daily Goals) và Tiện ích mở rộng Chrome Extension.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![pnpm Workspace](https://img.shields.io/badge/pnpm-Workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 🔴 1. Học & Ôn Tập Thông Minh (Core Learning Engine)
* **Thuật toán Spaced Repetition (SM-2 / FSRS):** Tự động lên lịch ôn tập từ vựng ngắt quãng dựa trên mức độ đánh giá độ khó của người dùng (*Easy / Good / Hard / Again*).
* **Thẻ từ vựng ngữ cảnh (Contextual Flashcards):** Đầy đủ phiên âm IPA, phát âm Audio (Anh-Anh / Anh-Mỹ), câu ví dụ thực tế, collocations, từ đồng nghĩa/trái nghĩa và mẹo ghi nhớ (mnemonics).
* **Đa dạng hóa dạng bài ôn tập:** Trắc nghiệm, điền từ vào câu ví dụ, nghe gõ từ, nối từ với định nghĩa và xếp câu.

### 🟠 2. Game Hóa & Trải Nghiệm Người Dùng (UX & Gamification)
* **Chuỗi ngày học (Streaks) & Daily Goals:** Đặt mục tiêu học từ mới mỗi ngày, duy trì chuỗi học liên tục kèm cơ chế **Streak Freeze** (bảo lưu chuỗi khi bận rộn).
* **Bảng thống kê (Analytics Dashboard):** Biểu đồ theo dõi tiến độ (*Mastered / Learning / New*), ước tính thời gian hoàn thành bộ từ và GitHub-style contribution heatmap.
* **Tích hợp Chrome Extension:** Bôi đen tra từ nhanh trên mọi website/video và lưu trực tiếp vào bộ từ vựng cá nhân.

### 🟡 3. Trí Tuệ Nhân Tạo & Tự Động Hóa (AI & Automation)
* **Tạo dữ liệu từ vựng tự động (AI-Assisted Generation):** Nhập từ tiếng Anh, backend NestJS tự động gọi AI/Dictionary API để điền toàn bộ IPA, ví dụ, collocations (tích hợp Shared Caching giúp tối ưu chi phí API).
* **Luyện phát âm AI (Voice Recognition):** Sử dụng Web Speech API để kiểm tra phát âm người dùng so với chuẩn phiên âm IPA.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Backend:** [NestJS](https://nestjs.com/) (Node.js framework), JWT Authentication, Rate Limiting, Shared Caching.
* **Frontend:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/), Tailwind CSS / Modern Vanilla CSS, Web Speech API.
* **Database & ORM:** PostgreSQL / SQLite với [Prisma ORM](https://www.prisma.io/).
* **Extension:** Manifest V3 Chrome Extension.
* **Monorepo Tooling:** `pnpm workspace`, TypeScript project references.

---

## 📁 Cấu Trúc Monorepo (`pnpm workspace`)

```text
WordStreak/
├── apps/
│   ├── api/                     # Backend Server (NestJS, Prisma, JWT, OpenAI/Dictionary API)
│   └── web/                     # Frontend App (React 19, Vite, Tailwind/CSS)
├── packages/
│   └── shared-types/            # Package chứa DTOs, Enums & Interfaces dùng chung
├── docs/                        # Tài liệu hệ thống, Thuật toán SM-2 & Database Schema
│   ├── algorithms/              # Giải thích chi tiết thuật toán SuperMemo-2
│   ├── architecture/            # System Architecture, Code Structure & Database ERD
│   ├── roadmap.md               # Lộ trình phát triển sản phẩm
│   └── vocabulary-app-feature-ideas-vi.md # Ý tưởng tính năng chi tiết
├── package.json                 # Cấu hình Root Monorepo
└── pnpm-workspace.yaml          # Định nghĩa PNPM Workspaces
```

---

## 🚀 Hướng Dẫn Chạy Dự Án (Quick Start)

### 1. Yêu cầu môi trường
* Node.js >= 18.x
* pnpm >= 8.x

### 2. Cài đặt Dependencies
```bash
pnpm install
```

### 3. Build Package dùng chung
```bash
pnpm --filter @wordstreak/shared-types build
```

### 4. Chạy Development Server

* **Chạy Backend NestJS API (`http://localhost:3000`)**:
  ```bash
  pnpm dev:api
  ```

* **Chạy Frontend React Web (`http://localhost:5173`)**:
  ```bash
  pnpm dev:web
  ```

* **Build toàn bộ ứng dụng:**
  ```bash
  pnpm build
  ```

---

## 🗺️ Lộ Trình Phát Triển (Product Roadmap)

* **Phase 1 — MVP (Core Loop):** Auth, CRUD Decks & Cards, SM-2 SRS Engine, Basic Flashcard UI & Quizzes, Daily Streak.
* **Phase 2 — Retention & AI:** Analytics Dashboard, Streak Freeze, AI-Assisted Card Generation (Caching), Voice Pronunciation Check.
* **Phase 3 — Ecosystem:** Chrome Extension (Manifest V3), Deck Import/Export (Anki/CSV), PWA/Offline Mode & Notifications.

---

## 📚 Tài Liệu Chi Tiết (Documentation)

* 🏗️ [Sơ đồ Kiến trúc Hệ thống](./docs/architecture/system-overview.md)
* 📂 [Cấu trúc Mã nguồn & Quy chuẩn](./docs/architecture/code-structure.md)
* 🗄️ [Thiết kế Cơ sở dữ liệu (Database ERD)](./docs/architecture/database-schema.md)
* 🧮 [Giải thích Thuật toán SuperMemo 2 (SM-2)](./docs/algorithms/supermemo-2.md)
* 💡 [Ý tưởng & Phân tích tính năng chi tiết](./vocabulary-app-feature-ideas-vi.md)
* 🚀 [Lộ trình phát triển sản phẩm](./docs/roadmap.md)

---

<p center="align">Built with ❤️ for English learners worldwide.</p>
