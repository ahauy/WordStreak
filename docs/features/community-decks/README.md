# Feature: Community Decks Marketplace (US-ECO-02)

**Slug**: `community-decks`  
**Version**: 1.0  
**Ship date**: 2026-08-22  
**Spec**: [.specify/features/community-decks/](../../.specify/features/community-decks/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/community-decks/baseline.md)  
**Epic**: `EPIC-09` (Import/Export, Community & Ecosystem)

---

## 1. Mô tả ngắn (Overview & Business Value)

Tính năng **Community Decks Marketplace (US-ECO-02)** mở ra không gian chia sẻ và khám phá bộ từ vựng cộng đồng cho nền tảng WordStreak: cho phép người học tìm kiếm, xem trước chi tiết, đánh giá 5 sao và sao chép 1-click (1-Click Clone) các bộ từ vựng tiếng Anh chuyên sâu (IELTS, TOEIC, TOEFL, Tiếng Anh công sở, Giao tiếp) được biên soạn bởi giáo viên và cộng đồng người học xuất sắc.

### Vấn đề giải quyết & Giá trị mang lại:

1. **Xóa bỏ sự cô lập & Tiết kiệm thời gian tạo thẻ**: Người học không cần mất hàng giờ nhập tay từng từ vựng; có thể truy cập ngay kho từ vựng chất lượng cao được cộng đồng kiểm duyệt qua xếp hạng sao.
2. **Sao chép 1-Click với Deep Copy độc lập 100%**: Bản sao mới được tạo hoàn toàn độc lập trong thư viện cá nhân của người học, tự do thêm/bớt/sửa thẻ mà không gây ảnh hưởng tới bộ từ gốc của tác giả.
3. **Khởi tạo Spaced Repetition (SM-2) tức thì**: Tất cả các thẻ trong bộ từ sao chép đều được khởi tạo bản ghi `UserCardProgress` ở trạng thái `NEW` (`interval: 0`, `repetitions: 0`, `easeFactor: 2.5`), sẵn sàng cho chu trình học ngay lập tức.
4. **Hệ thống Đánh giá 5 sao & Phòng chống gian lận (Anti-Abuse)**:
   - Thang điểm 1–5 sao kèm nhận xét chi tiết.
   - Chặn tác giả tự đánh giá bộ từ của chính mình (`403 Forbidden`).
   - Yêu cầu người dùng phải từng học hoặc sao chép bộ từ trước khi gửi đánh giá.
   - Điểm trung bình `averageRating` và tổng lượt đánh giá `totalRatings` được tính toán lưu sẵn trên bảng `Deck` để tối ưu thời gian phản hồi P95 $< 50\text{ms}$.
5. **Bảo vệ quyền riêng tư (Privacy-First Projection)**: API công khai chỉ trả về các trường an toàn của tác giả (`id`, `name`, `username`, `avatarUrl`), tuyệt đối bảo mật địa chỉ email và thông tin cá nhân.

---

## 2. Phạm vi tính năng (MoSCoW Scope)

### Must-Have (Đã ship v1.0)

- [x] **REQ-COMM-001 (Marketplace Catalog & Search)**: Endpoint `GET /api/v1/community/decks` hỗ trợ tìm kiếm từ khóa/tác giả, lọc theo chủ đề (`IELTS`, `TOEIC`, `TOEFL`, `Business English`, v.v.), phân trang và sắp xếp (`POPULAR`, `TOP_RATED`, `NEWEST`).
- [x] **REQ-COMM-002 (Deck Detail & Card Previews)**: Endpoint `GET /api/v1/community/decks/:id` trả về danh sách thẻ xem trước đầy đủ với phiên âm IPA, câu ví dụ, và phát âm thử.
- [x] **REQ-COMM-003 (1-Click Deep Copy Clone Engine)**: Endpoint `POST /api/v1/community/decks/:id/clone` thực thi trong Prisma `$transaction` nguyên tử: nhân bản `Deck`, sao chép toàn bộ `Card`, khởi tạo `UserCardProgress` (`NEW`), tăng `cloneCount` và chặn tác giả tự clone.
- [x] **REQ-COMM-004 (5-Star Rating & Anti-Abuse System)**: Endpoint `POST /api/v1/community/decks/:id/rate` xử lý upsert đánh giá 1-5 sao, chặn tác giả tự đánh giá và tự động tính toán lại `averageRating` và `totalRatings`.
- [x] **REQ-COMM-005 (Frontend Community Marketplace Page)**: Giao diện `/community` với thanh tìm kiếm, chip danh mục, dropdown sắp xếp, lưới thẻ bộ từ, modal xem trước thẻ và modal chấm điểm sao chuẩn `DESIGN.md`.

---

## 3. Kiến trúc API & Database Schema

### 3.1. Prisma Schema Extensions

```prisma
model Deck {
  id            String       @id @default(uuid())
  userId        String
  title         String
  description   String?
  color         String       @default("#6366F1")
  icon          String       @default("Book")
  coverImageUrl String?
  category      String?
  tags          String?
  isPublic      Boolean      @default(false)
  isArchived    Boolean      @default(false)
  cloneCount    Int          @default(0)
  averageRating Float        @default(0.0)
  totalRatings  Int          @default(0)
  originalDeckId String?

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards         Card[]
  ratings       DeckRating[]
  sourceDeck    Deck?        @relation("DeckClones", fields: [originalDeckId], references: [id], onDelete: SetNull)
  clones        Deck[]       @relation("DeckClones")

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([userId, isArchived])
  @@index([isPublic, isArchived, cloneCount])
  @@index([isPublic, isArchived, averageRating])
  @@index([category])
  @@map("decks")
}

model DeckRating {
  id        String   @id @default(uuid())
  deckId    String
  userId    String
  rating    Int      // 1 to 5 stars
  comment   String?  @db.VarChar(500)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  deck      Deck     @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([deckId, userId])
  @@index([deckId])
  @@index([userId])
  @@map("deck_ratings")
}
```

### 3.2. REST API Endpoints

| Method | Endpoint                            |     Quyền truy cập     | Mô tả                                                                        |
| :----- | :---------------------------------- | :--------------------: | :--------------------------------------------------------------------------- |
| `GET`  | `/api/v1/community/decks`           | Public / Optional Auth | Lấy danh sách bộ từ công khai (tìm kiếm, lọc danh mục, sắp xếp, phân trang). |
| `GET`  | `/api/v1/community/decks/:id`       | Public / Optional Auth | Xem chi tiết bộ từ, danh sách thẻ và trạng thái đánh giá/clone của user.     |
| `POST` | `/api/v1/community/decks/:id/clone` |     Authenticated      | Sao chép 1-Click bộ từ vào thư viện cá nhân với tiến độ SM-2 `NEW`.          |
| `POST` | `/api/v1/community/decks/:id/rate`  |     Authenticated      | Đánh giá 1-5 sao kèm nhận xét cho bộ từ.                                     |

---

## 4. Kiểm thử & Bằng chứng Xác thực (Test Evidence)

- **Backend Unit & Service Tests (`apps/api`)**:
  - `community.service.spec.ts` (6 test cases bao phủ toàn bộ business rules `BR-COMM-001` đến `BR-COMM-008`).
  - `community.controller.spec.ts` (4 test cases cho controller endpoints).
  - Kết quả: **39 test suites, 297 tests PASS 100%**.
- **Frontend Component & Hook Tests (`apps/web`)**:
  - `CommunityDecksPage.spec.tsx` (Tìm kiếm, hiển thị danh mục, kích hoạt clone).
  - `RateDeckModal.spec.tsx` (Chọn sao tương tác, gửi nhận xét, xử lý lỗi).
  - Kết quả: **50 test suites, 239 tests PASS 100%**.
- **Tổng cộng**: **536 tests PASS** trên toàn bộ monorepo.
