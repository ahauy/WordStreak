# 🗄️ Thiết kế Cơ sở dữ liệu (Database Schema)

Dự án WordStreak sử dụng mô hình cơ sở dữ liệu quan hệ (Relational Database - PostgreSQL/MySQL) kết hợp với Prisma ORM hoặc TypeORM.

---

## 📊 Mô hình Thực thể Quan hệ (ERD Overview)

```text
[Users] 1 --- * [Decks] 1 --- * [Cards]
   |                             |
   1                             1
   |                             |
   *                             *
[UserStreaks]             [UserCardProgress] (SRS Data)
```

---

## 📋 Chi tiết các Bảng (Tables)

### 1. `users` (Quản lý Tài khoản)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | PK, Default UUID | Khóa chính |
| `email` | String | Unique, Not Null | Email đăng nhập |
| `passwordHash` | String | Not Null | Mật khẩu đã hash (Bcrypt) |
| `username` | String | Not Null | Tên hiển thị |
| `dailyGoal` | Int | Default 10 | Mục tiêu số từ học/ngày |
| `createdAt` | DateTime | Default Now | Ngày tạo tài khoản |
| `updatedAt` | DateTime | UpdatedAt | Ngày cập nhật gần nhất |

### 2. `decks` (Bộ từ vựng)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | PK, Default UUID | Khóa chính |
| `userId` | UUID / String | FK -> users.id | Chủ sở hữu bộ từ |
| `title` | String | Not Null | Tên bộ từ (VD: "IELTS Academic Vol 1") |
| `description` | String | Nullable | Mô tả ngắn |
| `isPublic` | Boolean | Default false | Có công khai cho cộng đồng hay không |
| `createdAt` | DateTime | Default Now | Ngày tạo |

### 3. `cards` (Thẻ từ vựng)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | PK, Default UUID | Khóa chính |
| `deckId` | UUID / String | FK -> decks.id | Thuộc bộ từ nào |
| `word` | String | Not Null | Từ tiếng Anh (VD: "resilient") |
| `meaning` | String | Not Null | Nghĩa tiếng Việt |
| `phonetic` | String | Nullable | Phiên âm IPA (VD: "/rɪˈzɪl.jənt/") |
| `audioUrlUrl` | String | Nullable | Link phát âm US/UK |
| `exampleSentence`| Text | Nullable | Câu ví dụ thực tế |
| `collocations` | JSON / Text | Nullable | Cụm từ hay đi kèm |
| `mnemonic` | Text | Nullable | Ghi chú/Mẹo nhớ từ |
| `imageUrl` | String | Nullable | Link hình ảnh minh họa |
| `createdAt` | DateTime | Default Now | Ngày tạo |

### 4. `user_card_progress` (Dữ liệu SRS của người dùng)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | PK, Default UUID | Khóa chính |
| `userId` | UUID / String | FK -> users.id | Người dùng |
| `cardId` | UUID / String | FK -> cards.id | Thẻ từ |
| `interval` | Int | Default 0 | Khoảng cách ngày ôn tập tiếp theo |
| `easeFactor` | Float | Default 2.5 | Hệ số độ dễ (SM-2 EF) |
| `repetitions` | Int | Default 0 | Số lần lặp thành công liên tiếp |
| `lastReviewedAt` | DateTime | Nullable | Thời gian ôn gần nhất |
| `nextReviewDate` | DateTime | Not Null | Ngày đến hạn ôn tập tiếp theo |
| `status` | Enum | NEW / LEARNING / MASTERED | Trạng thái từ vựng |

### 5. `user_streaks` (Theo dõi Chuỗi ngày học)
| Field | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | PK, Default UUID | Khóa chính |
| `userId` | UUID / String | FK -> users.id | Người dùng |
| `currentStreak` | Int | Default 0 | Chuỗi ngày học liên tục hiện tại |
| `bestStreak` | Int | Default 0 | Kỷ lục chuỗi ngày học cao nhất |
| `lastActiveDate` | Date | Nullable | Ngày học gần nhất |
