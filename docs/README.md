# 📚 WordStreak Documentation

Tài liệu kỹ thuật và sản phẩm của dự án WordStreak — ứng dụng học từ vựng tiếng Anh thông minh với SRS SM-2, AI, Gamification và Chrome Extension.

> **Cho người mới**: Bắt đầu từ [docs/setup/](./setup/) để cài đặt môi trường, sau đó đọc [docs/architecture/system-overview.md](./architecture/system-overview.md) để hiểu tổng thể hệ thống.

---

## 📂 Cấu trúc tài liệu

| Thư mục                            | Nội dung                                       |
| ---------------------------------- | ---------------------------------------------- |
| [`architecture/`](./architecture/) | System design, database schema, code structure |
| [`features/`](./features/)         | Tài liệu từng tính năng sau khi deliver        |
| [`algorithms/`](./algorithms/)     | Thuật toán SM-2, Streak, XP/Gamification       |
| [`setup/`](./setup/)               | Hướng dẫn cài đặt và chạy local                |

---

## 🏗️ Architecture

- [System Overview](./architecture/system-overview.md) — Tổng quan kiến trúc monorepo
- [Database Schema](./architecture/database-schema.md) — Prisma schema và quan hệ giữa các entity
- [Code Structure](./architecture/code-structure.md) — Folder structure và conventions

---

## ✅ Delivered Features

Mỗi tính năng sau khi hoàn thành review và merge sẽ có một README trong `docs/features/<feature-slug>/`.

→ Xem [docs/features/README.md](./features/README.md) để duyệt danh sách tính năng đã ship.

---

## 🧪 TDD Test Plans

Test specification documents được lưu trong `.specify/features/<feature-slug>/test-plan.md` — viết **trước khi code**, theo format Gherkin Given-When-Then.

Sau khi implement và review, bộ test có thể tham khảo tại:

- Unit/Integration tests: `apps/api/src/**/*.spec.ts` và `apps/web/src/**/*.test.tsx`
- E2E tests: `apps/web/e2e/**/*.spec.ts`

---

## 🗺️ Roadmap

- [Product Roadmap](./roadmap.md) — Phase 1, 2, 3

---

_Cập nhật lần cuối: 2026-08-16. Tài liệu này được cập nhật sau mỗi lần deliver tính năng mới._
