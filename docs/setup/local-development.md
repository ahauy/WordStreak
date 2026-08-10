# 💻 Hướng dẫn Cài đặt & Chạy Dự án Local (Local Development Guide)

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường và chạy ứng dụng WordStreak trên máy cá nhân.

---

## 🛠️ Yêu cầu Hệ thống (Prerequisites)

- **Node.js**: `v20.x` hoặc `v22.x` trở lên.
- **pnpm**: `v11.x` (`npm i -g pnpm`).
- **Git**: Quản lý mã nguồn.

---

## 🚀 Các bước Cài đặt & Chạy Ứng dụng

### 1. Cài đặt Dependencies
Tại thư mục gốc dự án (`WordStreak/`), chạy lệnh:
```bash
pnpm install
```

### 2. Khởi tạo & Build các Shared Packages
Biên dịch package `@wordstreak/shared-types`:
```bash
pnpm --filter @wordstreak/shared-types build
```

### 3. Chạy các Ứng dụng ở chế độ Development

#### Option A: Chạy Backend NestJS API (`apps/api`)
```bash
pnpm dev:api
# Hoặc: pnpm --filter api start:dev
```
* API sẽ lắng nghe tại: `http://localhost:3000`
* Swagger API Docs (nếu có): `http://localhost:3000/api/docs`

#### Option B: Chạy Frontend React Web (`apps/web`)
```bash
pnpm dev:web
# Hoặc: pnpm --filter web dev
```
* Giao diện Web sẽ chạy tại: `http://localhost:5173`

---

## 🧪 Các lệnh Kiểm thử & Build

- **Build tất cả các dự án trong Monorepo:**
  ```bash
  pnpm build
  ```

- **Kiểm tra Linting toàn bộ codebase:**
  ```bash
  pnpm lint
  ```
