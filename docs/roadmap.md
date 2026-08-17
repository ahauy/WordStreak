# 🚀 WordStreak - Lộ Trình Phát Triển Dự Án (Product Roadmap)

WordStreak là ứng dụng học từ vựng tiếng Anh thông minh ứng dụng thuật toán lặp lại ngắt quãng (SRS SM-2), trí tuệ nhân tạo (AI), Gamification và Chrome Extension.

> 📖 **Tài liệu đặc tả nghiệp vụ & Checklist chi tiết:** Xem tại [docs/PRODUCT_BACKLOG_ROADMAP.md](./PRODUCT_BACKLOG_ROADMAP.md)

---

## 🎯 Phase 1: Nền móng & Core MVP (Vòng lặp học tập cốt lõi)

- [x] Khởi tạo Monorepo (`pnpm workspace`, NestJS API, React Web, Shared Types).
- [x] Cấu hình Database Schema (Prisma: User, Session, Deck, Card, UserCardProgress, UserStreak).
- [x] Xây dựng Module Authentication (JWT, Refresh Token, Session DB, Login, Register, Protection Guards).
- [x] Xây dựng Giao diện Landing Page & Auth Screens (Cosmos theme).
- [ ] Xây dựng Module Decks & Cards (CRUD bộ từ vựng & thẻ từ vựng ngữ cảnh).
- [ ] Triển khai thuật toán SuperMemo-2 (SM-2) cho SRS Review Engine.
- [ ] Giao diện lật thẻ Flashcard 3D (IPA, Audio, Ví dụ) + Đánh giá độ khó (Again / Hard / Good / Easy).
- [ ] Bài tập kiểm tra cơ bản (Trắc nghiệm 4 đáp án & Điền từ vào câu ví dụ).
- [ ] Hệ thống Streak (Chuỗi ngày học) & Daily Goals.

## 🤖 Phase 2: AI Automation, Analytics & Gamification nâng cao

- [ ] Tự động điền dữ liệu từ vựng bằng AI (OpenAI / Gemini) & Lưu cache DB chung (Shared Dictionary Cache).
- [ ] Cơ chế bảo lưu chuỗi học tập (Streak Freeze) & Hệ thống điểm kinh nghiệm XP/Levels.
- [ ] Biểu đồ thống kê Dashboard (Mastered / Learning / New, GitHub-style Activity Heatmap, Dự báo hoàn thành).
- [ ] Đa dạng hóa chế độ bài tập (Luyện nghe gõ từ, Nối từ vựng).
- [ ] Kiểm tra phát âm người dùng qua `Web Speech API`.

## 🌐 Phase 3: Cộng đồng, Di chuyển dữ liệu & Hệ sinh thái

- [ ] Nhập / Xuất dữ liệu bộ từ (CSV, Excel, Anki `.apkg`).
- [ ] Chia sẻ bộ từ cộng đồng (Public Decks Marketplace & 1-Click Clone).
- [ ] Khởi tạo Chrome Extension (Manifest V3 - Highlight từ trên web để lưu vào Deck).
- [ ] Hỗ trợ PWA (Progressive Web App - Học Offline & Tự động đồng bộ).
