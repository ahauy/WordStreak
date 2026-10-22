# Feature Specification: Chống ngợp Backlog (Backlog Guard)

**Story ID:** `US-UX-03`  
**Slug:** `backlog-guard`  
**Execution Tier:** Tier 1 (Fast-Track)  
**Status:** Approved & In Implementation  

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
Khi người học bận rộn hoặc gián đoạn học tập vài ngày, số lượng thẻ ôn tập đến hạn (due & overdue) có thể tích tụ lên rất lớn (hàng chục đến hàng trăm thẻ). Nếu hệ thống tiếp tục nạp thêm từ mới (new cards) vào phiên học, người dùng sẽ bị quá tải nhận thức ("cognitive overload") và dễ nản lòng bỏ cuộc. Cần có cơ chế Backlog Guard tự động phát hiện số thẻ dồn ứ vượt ngưỡng, tạm ngưng từ mới và hướng dẫn người dùng giải tỏa tồn đọng theo từng đợt nhỏ.

### Acceptance Criteria (AC)
- **REQ-BG-001 (Overwhelm Threshold Detection):** Hệ thống xác định trạng thái ngợp backlog khi tổng số thẻ đến hạn ôn tập (`dueCount = overdueCount + dueTodayCount`) vượt quá **$3 \times \text{dailyGoal}$** (ví dụ: mục tiêu 10 thẻ/ngày thì ngưỡng là $> 30$ thẻ).
- **REQ-BG-002 (Pause New Cards):** Khi phát hiện `isBacklogOverwhelmed === true`, hệ thống tạm thời không nạp thêm thẻ mới (`newCards = []`) vào hàng đợi ôn tập hàng ngày nhằm giúp người học tập trung giải quyết thẻ cũ.
- **REQ-BG-003 (Backend Contract & Metadata):**
  - Trả về đối tượng `backlogWarning` trong `meta` của `getDueCards`, trong `summary` của `TodaySessionResponse` và trong `ReviewSummaryDto`.
  - Cấu trúc `BacklogWarningDto`:
    - `isOverwhelmed: boolean`
    - `dueCount: number`
    - `threshold: number`
    - `dailyGoal: number`
    - `suggestedBatchSize: number` (thường là 5–10 thẻ).
- **REQ-BG-004 (Empathetic UI Banners):**
  - Hiển thị banner `BacklogGuardBanner` trên `DashboardPage` và `ReviewSessionPage` với thông điệp tích cực, giải thích rõ lý do tạm ngưng từ mới và khuyến khích người học giải quyết từng đợt nhỏ.
  - Tuân thủ nghiêm ngặt Design System WordStreak (`DESIGN.md`): Tông nền amber nhạt `#fffbeb`, viền mảnh `#fde68a`, icon bảo vệ `ShieldAlert`.

---

## 2. Technical Contracts (`packages/shared-types`)

```typescript
export interface BacklogWarningDto {
  isOverwhelmed: boolean;
  dueCount: number;
  threshold: number;
  dailyGoal: number;
  suggestedBatchSize: number;
}
```

---

## 3. Test Cases (`TC-###`)

- **`TC-BG-001` (Backend - Detect Backlog Overwhelm & Pause New Cards):** Khi `dueCount > 3 * dailyGoal` $\rightarrow$ `backlogWarning.isOverwhelmed === true`, hàng đợi không chứa thẻ `NEW`.
- **`TC-BG-002` (Backend - Normal Queue when Backlog is Healthy):** Khi `dueCount <= 3 * dailyGoal` $\rightarrow$ `backlogWarning.isOverwhelmed === false`, thẻ `NEW` được nạp bình thường theo `dailyGoal`.
- **`TC-BG-003` (Frontend - Render BacklogGuardBanner):** Banner hiển thị đúng số thẻ dồn ứ và lời khuyên khi `isOverwhelmed === true`, ẩn đi khi `isOverwhelmed === false`.
