# Feature: Daily Streak Engine & Timezone Logic (US-GAME-01)

**Slug**: `daily-streak-engine`  
**Version**: 1.0  
**Ship date**: 2026-08-20  
**Spec**: [.specify/features/daily-streak-engine/](../../.specify/features/daily-streak-engine/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/daily-streak-engine/baseline.md)

---

## 1. Mô tả ngắn (Overview)

Tính năng **Daily Streak Engine & Timezone Logic** là động cơ gamification cốt lõi giúp hình thành và duy trì thói quen học từ vựng hàng ngày của người học WordStreak. Hệ thống theo dõi chuỗi ngày học liên tục (streak) theo múi giờ địa phương (IANA timezone) của người dùng một cách chính xác tuyệt đối, ngăn chặn lỗi nhảy ngày qua nửa đêm, xử lý lặp lại tác vụ trong ngày (idempotent), và nâng tầm trải nghiệm thị giác với linh vật ngọn lửa **Electric Violet Flame** tiến hóa theo các mốc streak (1–6, 7–14, 15–29, 30+ ngày) kèm hiệu ứng chúc mừng sinh động.

---

## 2. Phạm vi tính năng (MoSCoW In-Scope)

- [x] **US-GAME-01 Scenario 1 (Start Streak)**: Bắt đầu chuỗi học tập mới ($1$ ngày) ngay khi người dùng hoàn thành hoạt động học đầu tiên (ôn tập flashcard SRS hoặc làm bài quiz).
- [x] **US-GAME-01 Scenario 2 (Idempotent Same-Day)**: Người dùng học nhiều lần trong cùng 1 ngày lịch địa phương sẽ duy trì trạng thái `isActiveToday = true` mà không làm tăng streak nhiều lần (`streakIncreased = false`).
- [x] **US-GAME-01 Scenario 3 (Consecutive Day Increment)**: Người dùng học vào ngày kế tiếp liên tục (`yesterday -> today`) được cộng chuỗi $+1$ ngày và cập nhật kỷ lục `bestStreak = max(bestStreak, currentStreak)`.
- [x] **US-GAME-01 Scenario 4 (Broken Streak Reset)**: Khi gián đoạn học tập $>1$ ngày, streak hiện tại được reset về $1$ khi có hoạt động mới (hoặc tính lazy về $0$), đồng thời giữ nguyên kỷ lục cao nhất `bestStreak`.
- [x] **US-GAME-01 Scenario 5 (Timezone Awareness)**: Tự động phát hiện và tính toán mốc ngày theo múi giờ IANA của client (thông qua Header `x-timezone` hoặc query param), fallback an toàn về `UTC` nếu timezone không hợp lệ.
- [x] **US-GAME-01 Scenario 6 (Visual Gamification & Flame Mascot)**: Linh vật ngọn lửa Electric Violet đa tầng (SVG Layered Gradient + Glow Aura + Dancing Sparks) biến đổi màu sắc theo các bậc mốc ngày.
- [x] **US-GAME-01 Scenario 7 (Celebration Modal)**: Modal chúc mừng `StreakCelebrationModal` kèm pháo hoa giấy confetti và highlight kỷ lục mới khi chuỗi tăng.
- [x] **Tích hợp liền mạch**: Tự động kích hoạt khi nộp đánh giá thẻ SM-2 (`POST /api/v1/reviews/submit`), nộp kết quả Quiz (`POST /api/v1/practice/submit-quiz`), hoặc gọi trực tiếp API `POST /api/v1/streaks/record-activity`.

---

## 3. Ngoài phạm vi (Won't-Have v1)

- **Paid Streak Freeze / Restores**: Không bán tính năng khôi phục chuỗi bằng tiền; WordStreak cam kết 100% miễn phí trọn đời cho tính năng học tập.
- **Social Leaderboards**: Bảng xếp hạng thi đua bạn bè toàn cầu (dự kiến thuộc Epic 06: Social & Community).
- **Client-calculated Streaks**: Tuyệt đối không cho phép client tự tính streak; toàn bộ tính toán chuẩn xác diễn ra tại backend.

---

## 4. Kiến trúc Kỹ thuật (Technical Architecture)

### 4.1. Data Model (Prisma ORM)

Mô hình dữ liệu `UserStreak` lưu trữ trạng thái chuỗi của mỗi người dùng:

```prisma
model UserStreak {
  id             String    @id @default(uuid())
  userId         String    @unique
  currentStreak  Int       @default(0)
  bestStreak     Int       @default(0)
  lastActiveDate DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 4.2. Shared Types (`packages/shared-types`)

File: [`packages/shared-types/src/streaks.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/streaks.ts)

- `UserStreakDto`:
  - `userId: string`
  - `currentStreak: number`
  - `bestStreak: number`
  - `lastActiveDate: string | null`
  - `isActiveToday: boolean`
  - `isPendingToday: boolean`
  - `timezone: string`
  - `flameTier: 1 | 2 | 3 | 4`
- `RecordStreakActivityDto`:
  - `timezone?: string`
- `StreakActivityResponseDto`:
  - `currentStreak: number`
  - `bestStreak: number`
  - `streakIncreased: boolean`
  - `isActiveToday: boolean`
  - `flameTier: 1 | 2 | 3 | 4`
  - `message: string`

### 4.3. Backend (`apps/api`)

- **`StreakModule`** ([`apps/api/src/modules/streaks/streak.module.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/streaks/streak.module.ts)): Đăng ký `StreakService`, `StreakController` và export `StreakService` cho các module khác.
- **`StreakService`** ([`apps/api/src/modules/streaks/streak.service.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/streaks/streak.service.ts)):
  - `formatDateInTimezone(date: Date, timezone: string): string`: Định dạng ngày theo chuẩn `YYYY-MM-DD` tại múi giờ được chỉ định.
  - `getStreak(userId: string, clientTimezone?: string): Promise<UserStreakDto>`: Khởi tạo lười (lazy initialization) và tính toán trạng thái `isActiveToday` / `isPendingToday` theo thời gian thực.
  - `recordActivity(userId: string, dto?: RecordStreakActivityDto): Promise<StreakActivityResponseDto>`: Ghi nhận hoạt động, thực hiện logic tăng chuỗi liên tiếp hoặc reset khi quá hạn.
- **`StreakController`** ([`apps/api/src/modules/streaks/streak.controller.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/streaks/streak.controller.ts)):
  - `GET /api/v1/streaks/me`: Lấy thông tin streak của user hiện tại (hỗ trợ Header `x-timezone` hoặc query param).
  - `POST /api/v1/streaks/record-activity`: Ghi nhận hoạt động học tập thủ công/tự động.
- **SRS Reviews Hook** ([`apps/api/src/modules/reviews/reviews.service.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews.service.ts)):
  - Trong phương thức `submitReview`, hệ thống tự động gọi `streakService.recordActivity(userId)` và trả về thông tin streak kèm kết quả SM-2.

### 4.4. Frontend (`apps/web`)

- **`streakService`** ([`apps/web/src/features/dashboard/services/streakService.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/services/streakService.ts)):
  - Gọi API backend với header `x-timezone` tự động lấy từ `Intl.DateTimeFormat().resolvedOptions().timeZone`.
  - Phát sự kiện tùy biến toàn cục `wordstreak:streak-updated` (CustomEvent) để đồng bộ trạng thái giữa tất cả component.
- **`useStreak` hook** ([`apps/web/src/features/dashboard/hooks/useStreak.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/hooks/useStreak.ts)):
  - Quản lý reactive state cho streak (`streak`, `currentStreak`, `bestStreak`, `isActiveToday`, `isPendingToday`, `flameTier`, `isLoading`, `recordActivity`, `refetchStreak`).
  - Lắng nghe event `wordstreak:streak-updated` để đồng bộ UI tức thì khi hoàn thành bài tập ở bất kỳ trang nào.
- **`StreakFlame`** ([`apps/web/src/features/dashboard/components/StreakFlame.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/components/StreakFlame.tsx)):
  - Component linh vật ngọn lửa SVG với 3 lớp chuyển sắc (`outer`, `inner`, `hotspot`), hiệu ứng phát sáng mờ ảo `Aura Glow` và các tia lửa `Flying Embers` bay lượn bằng Framer Motion.
  - Hỗ trợ các kích cỡ: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.
- **`StreakHeroBanner`** ([`apps/web/src/features/dashboard/components/StreakHeroBanner.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/components/StreakHeroBanner.tsx)):
  - Banner trang chủ chào đón người học, hiển thị chuỗi hiện tại, badge trạng thái SM-2, thanh lịch 7 ngày trong tuần (`This Week`), và nút CTA vào phiên ôn tập.
- **`DashboardNavbar`** ([`apps/web/src/features/dashboard/components/DashboardNavbar.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/components/DashboardNavbar.tsx)):
  - Huy hiệu ngọn lửa mini tích hợp trên thanh điều hướng đầu trang, hiển thị số ngày streak và trạng thái rực sáng hôm nay.
- **`StreakCelebrationModal`** ([`apps/web/src/features/dashboard/components/StreakCelebrationModal.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/dashboard/components/StreakCelebrationModal.tsx)):
  - Modal chúc mừng toàn màn hình hiển thị pháo hoa Confetti ngẫu nhiên, ngọn lửa phóng to, thống kê chuỗi và kỷ lục mới khi `streakIncreased = true`.

---

## 5. Thuật toán & Công thức Tính toán (Algorithms & Formulas)

### 5.1. Chuyển đổi ngày theo Múi giờ Địa phương (Timezone Localization)

Hệ thống dùng chuẩn quốc tế `Intl.DateTimeFormat` với locale `en-CA` để định dạng ngày theo định dạng ISO chuẩn `YYYY-MM-DD`:

$$\text{formattedDate} = \text{Intl.DateTimeFormat}(\text{'en-CA'}, \{\text{timeZone}, \text{year}: \text{'numeric'}, \text{month}: \text{'2-digit'}, \text{day}: \text{'2-digit'}\}).\text{format}(\text{date})$$

- Nếu client cung cấp chuỗi timezone không hợp lệ (ví dụ `"Invalid/TZ"`), hệ thống tự động fallback về `"UTC"`.
- Ngày hôm trước ($\text{yesterdayStr}$) được tính chính xác bằng cách lùi 1 ngày theo lịch UTC:
  $$\text{yesterday} = \text{Date.UTC}(\text{year}, \text{month} - 1, \text{day} - 1)$$

### 5.2. Thuật toán Ghi nhận Hoạt động Streak (Streak Evaluation Algorithm)

Khi nhận được yêu cầu ghi nhận hoạt động học tại thời điểm hiện tại $\text{now}$ với múi giờ $\text{tz}$:

```mermaid
flowchart TD
    A[Bắt đầu recordActivity] --> B[Lấy todayStr và yesterdayStr trong múi giờ user]
    B --> C{Đã có bản ghi UserStreak?}
    C -- Chưa có --> D[Tạo mới UserStreak: current=1, best=1, streakIncreased=true]
    C -- Đã có --> E[Tính lastActiveDay từ lastActiveDate trong múi giờ user]
    E --> F{lastActiveDay == todayStr?}
    F -- Đúng --> G[Idempotent No-op: streakIncreased=false, giữ nguyên streak]
    F -- Sai --> H{lastActiveDay == yesterdayStr?}
    H -- Đúng (Liên tiếp) --> I[currentStreak += 1, bestStreak = max(bestStreak, currentStreak), streakIncreased=true]
    H -- Sai (Đứt chuỗi) --> J[currentStreak = 1, bestStreak = max(bestStreak, 1), streakIncreased=true]
    I --> K[Update Database & Trả về kết quả]
    J --> K
    D --> K
    G --> L[Trả về kết quả]
```

1. **Chưa có chuỗi trước đó**:
   - `currentStreak = 1`, `bestStreak = 1`, `streakIncreased = true`.
2. **Học lại trong cùng ngày** ($\text{lastActiveDay} == \text{todayStr}$):
   - `streakIncreased = false`, `isActiveToday = true`, không sửa đổi bộ đếm.
3. **Học liên tiếp ngày hôm sau** ($\text{lastActiveDay} == \text{yesterdayStr}$):
   - $\text{currentStreak}_{\text{new}} = \text{currentStreak}_{\text{old}} + 1$
   - $\text{bestStreak}_{\text{new}} = \max(\text{bestStreak}_{\text{old}}, \text{currentStreak}_{\text{new}})$
   - `streakIncreased = true`.
4. **Bị đứt quãng** ($\text{lastActiveDay} < \text{yesterdayStr}$):
   - $\text{currentStreak}_{\text{new}} = 1$
   - $\text{bestStreak}_{\text{new}} = \max(\text{bestStreak}_{\text{old}}, 1)$
   - `streakIncreased = true`.

### 5.3. Bảng Phân cấp Linh vật Ngọn lửa (Flame Mascot Tiers)

| Bậc (Tier) | Tên Linh vật        | Tên tiếng Việt       | Chuỗi ngày       | Dải màu sắc chủ đạo                                                                |
| :--------- | :------------------ | :------------------- | :--------------- | :--------------------------------------------------------------------------------- |
| **Tier 0** | Ashen Ember         | Tro Tàn Âm Ỉ         | $0$ ngày         | Xám tro than (`#525252` $\rightarrow$ `#d4d4d4`)                                   |
| **Tier 1** | Violet Spark        | Tia Lửa Tím          | $1 - 6$ ngày     | Tím Điện Electric Violet (`#581c87` $\rightarrow$ `#c084fc`)                       |
| **Tier 2** | Azure Blaze         | Lửa Lam Plasma       | $7 - 14$ ngày    | Xanh lam Plasma (`#0369a1` $\rightarrow$ `#38bdf8`)                                |
| **Tier 3** | Emerald Flame       | Lửa Lục Bảo          | $15 - 29$ ngày   | Xanh ngọc lục bảo (`#047857` $\rightarrow$ `#34d399`)                              |
| **Tier 4** | Royal Fusion        | Lửa Tím Hoàng Gia    | $30 - 59$ ngày   | Tím đậm Hoàng Gia (`#4c1d95` $\rightarrow$ `#d8b4fe`)                              |
| **Tier 5** | Solar Gold          | Lửa Thái Dương       | $60 - 99$ ngày   | Vàng ánh dương (`#b45309` $\rightarrow$ `#fde047`)                                 |
| **Tier 6** | Crimson Nova        | Lửa Hồng Ngọc        | $100 - 199$ ngày | Đỏ hồng ngọc (`#9f1239` $\rightarrow$ `#fda4af`)                                   |
| **Tier 7** | Cosmic Void         | Lửa Tinh Vân         | $200 - 364$ ngày | Chàm vũ trụ (`#312e81` $\rightarrow$ `#a5b4fc`)                                    |
| **Tier 8** | Celestial Prismatic | Lửa Kim Cương Bất Tử | $365+$ ngày      | Đa sắc quang phổ (Cyan $\rightarrow$ Violet $\rightarrow$ Pink $\rightarrow$ Gold) |

---

## 6. Test Coverage & Quality Verification

Toàn bộ test suite liên quan đến Daily Streak Engine đạt **100% tỷ lệ pass**:

### 6.1. Backend Unit Tests (`apps/api`)

- **`apps/api/src/modules/streaks/streak.service.spec.ts`** (9 tests):
  - Kiểm tra định dạng ngày múi giờ và fallback UTC.
  - Khởi tạo lười (lazy creation) `UserStreak`.
  - Trạng thái `isActiveToday = true` khi đã học hôm nay.
  - Trạng thái `isPendingToday = true` khi học từ hôm qua.
  - Trạng thái lazy reset khi đứt chuỗi $>1$ ngày.
  - Phân loại chính xác các bậc Flame Tier ($1 \rightarrow 4$).
  - Ghi nhận hoạt động: tạo mới, no-op trong ngày, tăng chuỗi liên tiếp, reset chuỗi quá hạn.
  - Kiểm tra chuyển giao múi giờ qua nửa đêm (Tokyo vs UTC).
- **`apps/api/src/modules/streaks/streak.controller.spec.ts`** (4 tests):
  - Ưu tiên header `x-timezone` hơn query params.
  - Fallback query param khi thiếu header.
  - Ghi nhận hoạt động qua controller.
- **`apps/api/src/modules/reviews/reviews.service.spec.ts`** (6 tests):
  - Tích hợp gọi `streakService.recordActivity` khi nộp kết quả ôn tập flashcard.

```bash
# Kết quả thực thi
pnpm --filter api test -- src/modules/streaks src/modules/reviews
# Tests: 35 passed, 35 total
# Time:  1.276 s
```

### 6.2. Frontend Unit Tests (`apps/web`)

- **`apps/web/src/features/dashboard/hooks/useStreak.spec.ts`** (5 tests):
  - Tự động fetch streak khi mount (`enabled = true`).
  - Không gọi API khi `enabled = false`.
  - Gọi `recordActivity` và cập nhật reactive state.
  - Bắt sự kiện `wordstreak:streak-updated` và đồng bộ UI.
  - Xử lý lỗi kết nối nhẹ nhàng.
- **`apps/web/src/features/dashboard/components/StreakFlame.spec.tsx`** (6 tests):
  - Render bậc 0 (Ashen Ember) khi `streakDays = 0`.
  - Render bậc Tia Lửa Tím (Violet Spark) cho 3 ngày.
  - Render bậc Lửa Lam Plasma (Azure Blaze) cho 10 ngày.
  - Render bậc chỉ định qua prop `tier`.
  - Hiển thị nhãn số lượng ngày `showCount`.
  - Render không lỗi trên tất cả kích cỡ (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`).

```bash
# Kết quả thực thi
pnpm --filter web test -- useStreak StreakFlame
# Test Files: 4 passed (4)
# Tests:      20 passed (20)
# Duration:   1.29s
```

---

## 7. Tác giả & Phê duyệt

- **Implemented by**: AI Pair Programmer (Antigravity)
- **Reviewed & Signed-off by**: Product Owner & Lead Architect
- **Date**: 2026-08-20
- **Status**: Hoàn thành (`Delivered`)
