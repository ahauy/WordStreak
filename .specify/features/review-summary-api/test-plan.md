# Test Plan: Review Summary API for Extension (`US-REM-01`)

**Feature slug**: `review-summary-api`
**Baseline version**: 1.0 (SIGNED-OFF)
**Written by**: Senior Backend Developer (`backend-developer`) — Stage TDD (trước implement)
**Traces to**: [spec/user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/spec/user-stories.md), [spec.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/spec.md), [plan.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/review-summary-api/plan.md)

> **Mục đích**: Document này mô tả chi tiết các test case ở dạng Gherkin trước khi viết code (TDD Red Phase).
> Toàn bộ 8 scenarios của `US-REM-01` và các edge cases `EC-REM-01`..`EC-REM-08` được map trực tiếp sang `TC-REM-001`..`TC-REM-012`.

---

## Unit Tests

### `ReviewsService.getReviewSummary` & Timezone Helpers

#### TC-REM-001: Tính toán đầy đủ tóm tắt 10 trường trạng thái học tập (Happy Path)

```gherkin
Given người dùng đã xác thực "user-uuid-1" có mục tiêu học hàng ngày dailyGoal = 10
  And chuỗi học hiện tại currentStreak = 5 và isActiveToday = false
  And có 12 thẻ thuộc các bộ thẻ active (isArchived = false) có status = 'REVIEW' và nextReviewDate <= now
  And có 35 thẻ thuộc các bộ thẻ active có status = 'NEW'
  And có 4 lượt review (ReviewLog) đã hoàn thành hôm nay trong múi giờ "Asia/Ho_Chi_Minh"
  And thẻ kế tiếp có lịch ôn tập gần nhất trong tương lai tại "2026-10-12T15:30:00.000Z"
  And thời gian hiện tại là "2026-10-12T10:00:00.000Z" (17:00:00 tại "Asia/Ho_Chi_Minh", cách nửa đêm > 3 giờ)
When gọi service reviewsService.getReviewSummary("user-uuid-1", "Asia/Ho_Chi_Minh")
Then kết quả trả về đúng đối tượng ReviewSummaryDto:
  | dueCount      | 12                       |
  | newAvailable  | 35                       |
  | studiedToday  | 4                        |
  | dailyGoal     | 10                       |
  | goalReached   | false                    |
  | currentStreak | 5                        |
  | streakAtRisk  | false                    |
  | timezone      | "Asia/Ho_Chi_Minh"       |
  | endOfDayAt    | "2026-10-12T16:59:59.999Z" |
  | nextDueAt     | "2026-10-12T15:30:00.000Z" |
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 1, `REQ-REM-001`, `REQ-REM-002`, `REQ-REM-003`, `REQ-REM-004`, `REQ-REM-005`

---

#### TC-REM-002: Đạt mục tiêu ngày khi studiedToday >= dailyGoal (Goal Reached)

```gherkin
Given người dùng đã xác thực "user-uuid-1" có dailyGoal = 10
  And người dùng đã hoàn thành 10 lượt review trong ngày hôm nay (studiedToday = 10, isActiveToday = true)
When gọi service reviewsService.getReviewSummary("user-uuid-1", "Asia/Ho_Chi_Minh")
Then trường goalReached là true
  And trường studiedToday là 10
  And trường streakAtRisk là false
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 2, `REQ-REM-004`, `REQ-REM-005`, `BR-REM-004`

---

#### TC-REM-003: Cảnh báo chuỗi học nguy cơ streakAtRisk = true trong cửa sổ 3 giờ trước nửa đêm (kể cả khi còn Streak Freezes)

```gherkin
Given người dùng đã xác thực "user-uuid-1" có currentStreak = 3 và streakFreezes = 2
  And người dùng chưa học từ nào hôm nay (studiedToday = 0 và isActiveToday = false)
  And thời điểm hiện tại tại "Asia/Ho_Chi_Minh" là "21:00:00.000" (còn đúng 3 giờ = 10,800,000 ms trước 23:59:59.999) hoặc 22:00:00.000 (còn 2 giờ = 7,200,000 ms)
When gọi service reviewsService.getReviewSummary("user-uuid-1", "Asia/Ho_Chi_Minh")
Then trường streakAtRisk trả về true
  And currentStreak trả về 3
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 3, `EC-REM-01`, `EC-REM-03`, `REQ-REM-005`, `BR-REM-006`

---

#### TC-REM-004: streakAtRisk = false khi currentStreak < 3 hoặc còn trên 3 giờ trước nửa đêm hoặc đã học hôm nay

```gherkin
Given người dùng đã xác thực "user-uuid-1"
When người dùng thỏa mãn một trong các điều kiện sau:
  1. currentStreak = 2 (< 3) dù chỉ còn 1 giờ trước nửa đêm và studiedToday = 0
  2. currentStreak = 10 nhưng còn > 3 giờ trước nửa đêm (msUntilEndOfDay = 10,800,001 ms)
  3. currentStreak = 5 nhưng studiedToday = 1 (> 0) hoặc isActiveToday = true
Then trường streakAtRisk đều trả về false
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 4, `EC-REM-01`, `EC-REM-02`, `REQ-REM-005`, `BR-REM-006`

---

#### TC-REM-005: Bộ thẻ lưu trữ (isArchived = true) bị loại trừ hoàn toàn khỏi dueCount, newAvailable và nextDueAt

```gherkin
Given người dùng "user-uuid-1" chỉ sở hữu các bộ thẻ đã lưu trữ (isArchived = true)
  And trong bộ thẻ lưu trữ có 20 thẻ REVIEW quá hạn, 15 thẻ NEW và 1 thẻ tương lai
  And người dùng không có bất kỳ bộ thẻ active nào (isArchived = false)
When gọi service reviewsService.getReviewSummary("user-uuid-1")
Then trường dueCount là 0
  And trường newAvailable là 0
  And trường nextDueAt là null
  And câu truy vấn Prisma userCardProgress áp dụng điều kiện card: { deck: { userId: "user-uuid-1", isArchived: false } }
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 5, `EC-REM-04`, `REQ-REM-001`, `REQ-REM-002`, `BR-REM-002`

---

#### TC-REM-006: Thứ tự ưu tiên timezone và fallback an toàn về 'UTC' khi timezone không hợp lệ

```gherkin
Given client gửi yêu cầu tóm tắt học tập
When timezone được cung cấp theo các trường hợp:
  1. ?timezone=Invalid/Zone và X-Timezone: Mars/Phobos -> fallback an toàn về "UTC" mà không ném lỗi 400
  2. Không truyền query timezone và không truyền X-Timezone -> fallback về "UTC"
  3. ?timezone=Asia/Tokyo và X-Timezone: America/New_York -> query timezone ưu tiên cao hơn ("Asia/Tokyo")
  4. ?timezone="" và X-Timezone: Asia/Tokyo hợp lệ -> sử dụng header timezone ("Asia/Tokyo")
  5. Múi giờ có offset lẻ nửa giờ như "Asia/Kolkata" (UTC+5:30) -> tính toán ranh giới startOfDayUtc và endOfDayUtc chính xác
Then service phân giải đúng timezone tương ứng và tính endOfDayAt khớp chính xác với lịch địa phương
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 6, `EC-REM-05`, `EC-REM-07`, `REQ-REM-003`, `BR-REM-001`

---

#### TC-REM-007: Người dùng mới đăng ký chưa có bộ thẻ và lượt học (Brand-New User Fallback)

```gherkin
Given người dùng mới đăng ký "user-uuid-new" chưa có bộ thẻ, chưa có tiến độ thẻ và chưa có streak
When gọi service reviewsService.getReviewSummary("user-uuid-new")
Then dailyGoal mặc định là 10
  And dueCount = 0, newAvailable = 0, studiedToday = 0, goalReached = false
  And currentStreak = 0, streakAtRisk = false
  And nextDueAt = null
```

**File**: `apps/api/src/modules/reviews/reviews.service.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `EC-REM-06`, `REQ-REM-001`..`005`, `BR-REM-002`..`007`

---

## Integration / Controller Tests

### `ReviewsController.getReviewSummary` (`GET /api/v1/reviews/summary`)

#### TC-REM-008: Trả về 200 OK với ApiResponse<ReviewSummaryDto>, ETag yếu và Cache-Control

```gherkin
Given người dùng đã xác thực gửi GET /api/v1/reviews/summary?timezone=Asia/Ho_Chi_Minh
  And header If-None-Match không được gửi kèm
When controller xử lý yêu cầu
Then mã trạng thái trả về là 200 OK
  And header ETag có định dạng Weak ETag W/"<64-hex-sha256>"
  And header Cache-Control là "private, must-revalidate, max-age=0"
  And body phản hồi có success = true và data chứa đầy đủ 10 trường của ReviewSummaryDto
  And reviewsService.getReviewSummary được gọi với đúng user.sub, query timezone và header timezone
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 1, `REQ-REM-006`, `BR-REM-008`

---

#### TC-REM-009: Trả về 304 Not Modified với body rỗng khi If-None-Match khớp ETag

```gherkin
Given client gửi GET /api/v1/reviews/summary kèm header If-None-Match: W/"<current-sha256>"
  And dữ liệu tóm tắt không thay đổi so với ETag hiện tại
When controller xử lý yêu cầu
Then mã trạng thái phản hồi là 304 Not Modified
  And body phản hồi là undefined (0 bytes body)
  And header ETag vẫn được đính kèm là W/"<current-sha256>"
  And header Cache-Control vẫn là "private, must-revalidate, max-age=0"
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 7, `REQ-REM-006`, `BR-REM-008`

---

#### TC-REM-010: Khớp điều kiện If-None-Match dạng danh sách phân tách bằng dấu phẩy hoặc ký tự đại diện '*'

```gherkin
Given client gửi GET /api/v1/reviews/summary kèm header If-None-Match:
  Trường hợp A: 'W/"other-hash", W/"<current-sha256>"'
  Trường hợp B: '"<current-sha256>"' (không có tiền tố W/)
  Trường hợp C: '*' (wildcard)
When controller kiểm tra điều kiện ETag
Then tất cả các trường hợp trên đều trả về 304 Not Modified với body rỗng
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 7, `EC-REM-08`, `REQ-REM-006`, `BR-REM-008`

---

#### TC-REM-011: Trả về 200 OK kèm payload mới khi If-None-Match bị lệch/cũ

```gherkin
Given client gửi GET /api/v1/reviews/summary kèm header If-None-Match: W/"stale-hash"
  And dữ liệu tóm tắt hiện tại sinh ra ETag khác W/"stale-hash"
When controller xử lý yêu cầu
Then mã trạng thái phản hồi là 200 OK
  And body phản hồi chứa dữ liệu đầy đủ ApiResponse<ReviewSummaryDto> mới nhất
  And header ETag được cập nhật thành ETag mới
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 7, `REQ-REM-006`, `BR-REM-008`

---

#### TC-REM-012: Kiểm tra RBAC và bảo vệ bảo mật bằng JwtAuthGuard

```gherkin
Given endpoint GET /api/v1/reviews/summary
When kiểm tra metadata bảo vệ trên controller và method
Then class ReviewsController được gắn decorator @UseGuards(JwtAuthGuard)
  And yêu cầu không có Bearer JWT hoặc JWT hết hạn bị chặn với 401 Unauthorized
```

**File**: `apps/api/src/modules/reviews/reviews.controller.spec.ts`  
**Priority**: Must-Have (P0)  
**Traces to**: `US-REM-01` Scenario 8, `REQ-REM-001`, `BR-REM-007`

---

## Test Coverage Checklist

- [x] Tất cả `US-REM-01` Scenario 1 (happy path) có TC tương ứng (`TC-REM-001`, `TC-REM-008`)
- [x] Tất cả `US-REM-01` Scenario 2–7 (edge cases, ETag, archived deck, daily goal) có TC tương ứng (`TC-REM-002`..`TC-REM-007`, `TC-REM-009`..`TC-REM-011`)
- [x] Business rules có anti-abuse / streak protection có TC kiểm tra (`TC-REM-003`, `TC-REM-004`)
- [x] Error states (401 Unauthorized, timezone fallback without 400) có TC (`TC-REM-006`, `TC-REM-012`)
- [x] Caching idempotency / conditional revalidation (`304 Not Modified`) có TC (`TC-REM-009`, `TC-REM-010`, `TC-REM-011`)
- [x] Concurrency / parallel aggregation (`Promise.all`) được thiết kế trong service layer
