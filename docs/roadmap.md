# 🚀 WordStreak - Lộ Trình Phát Triển Dự Án (Product Roadmap)

WordStreak là ứng dụng học từ vựng tiếng Anh thông minh ứng dụng thuật toán lặp lại ngắt quãng (SRS SM-2), trí tuệ nhân tạo (AI), Gamification và Chrome Extension.

---

## 🎯 Phase 1: Nền móng & Core MVP (Học từ vựng & SRS)
- [x] Khởi tạo Monorepo (`pnpm workspace`, NestJS API, React Web, Shared Types).
- [ ] Cấu hình Database Schema (Prisma/TypeORM: User, Deck, Card, UserCardProgress).
- [ ] Xây dựng Module Authentication (JWT, Login, Register, Protection Guards).
- [ ] Xây dựng Module Decks & Cards (CRUD bộ từ vựng & thẻ từ vựng).
- [ ] Triển khai thuật toán SuperMemo-2 (SM-2) cho Module Reviews.
- [ ] Giao diện lật thẻ Flashcard (IPA, Audio, Ví dụ) + Bấm nút đánh giá độ khó (Easy/Good/Hard/Again).

## 🤖 Phase 2: Tích hợp AI, Quiz & Gamification
- [ ] Tích hợp OpenAI / Gemini API (Tự động điền phiên âm IPA, câu ví dụ, collocations khi nhập từ mới).
- [ ] Xây dựng Engine Bài tập kiểm tra (Trắc nghiệm, Điền từ, Nghe gõ từ, Nối từ).
- [ ] Kiểm tra phát âm người dùng qua `Web Speech API`.
- [ ] Hệ thống Streak (Chuỗi ngày học) & Daily Goals.
- [ ] Biểu đồ thống kê Dashboard (Số từ Mastered, Learning, New & Dự đoán hoàn thành).

## 🧩 Phase 3: Hệ sinh thái Chrome Extension & Tối ưu hóa
- [ ] Khởi tạo ứng dụng `apps/extension` (Manifest V3).
- [ ] Tính năng bôi đen từ trên mọi website -> Click lưu trực tiếp vào Deck mặc định.
- [ ] Tối ưu hóa hiệu năng, PWA (Progressive Web App - Học Offline).
- [ ] Triển khai CI/CD, Docker Container & Deploy sản phẩm.
