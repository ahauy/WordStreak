# Changelog: US-LIB-12 Foundation Stage Decks & Mini-lessons

## [1.0.0] - 2026-10-19
### Added
- Đóng gói 15 Foundation Decks (20 từ/chặng, 300 từ tần suất cao nhất của NGSL 1.2) trong `foundationDecks.ts`.
- Biên soạn 4 bài học ngữ pháp nền tảng cực ngắn $\le 2$ phút bằng tiếng Việt trong `foundationLessons.ts`:
  - `LESSON-01`: 4 Từ loại cốt lõi (N, V, Adj, Adv).
  - `LESSON-02`: Trật tự từ trong câu đơn (S + V + O).
  - `LESSON-03`: Dạng động từ (-ed và -ing).
  - `LESSON-04`: Số ít & Số nhiều (-s, -es).
- Xây dựng component `MiniLessonModal.tsx` đọc bài học ngắn có ví dụ và nút vào học chặng liên quan.
- Xây dựng component `FoundationPathView.tsx` hiển thị lộ trình 15 chặng bậc thang thân thiện kèm các điểm dừng bài học ngắn.
- Tích hợp vào `LibraryPage.tsx` khi người dùng chọn lộ trình `FOUNDATION`.
- Bộ unit test toàn diện `FoundationPathView.test.tsx` (4/4 passed), build thành công không lỗi typecheck.
