# Feature Specification: Hệ thống đo lường Thư viện (Library & Learning Analytics)

**Story ID:** `US-LIB-10`  
**Slug:** `library-retention-analytics`  
**Execution Tier:** Tier 1 (Fast-Track)  
**Status:** Approved & In Implementation  

---

## 1. Requirements & Acceptance Criteria

### Problem Statement
Để đo lường hiệu quả giáo trình và mức độ tương tác của người học với kho từ vựng chính thức (Official Starter Decks / TSL / NGSL / TOEIC), đội ngũ quản trị cần theo dõi các chỉ số quan trọng: Tỷ lệ thêm deck trong phiên đầu (Activation), Tỷ lệ hoàn thành 10 thẻ đầu (First Value), Tỷ lệ duy trì Day-1 / Day-7 theo từng bộ từ và lộ trình, Tỷ lệ từ đánh dấu "Đã biết" ở bước Triage, và Số lượng báo lỗi nội dung theo từng deck.

### Acceptance Criteria (AC)
- **REQ-ANL-001 (Analytics Event Taxonomy):** Định nghĩa chuẩn taxonomy sự kiện cho thư viện:
  - `library_deck_viewed` (người dùng xem chi tiết deck)
  - `library_deck_enrolled` (người dùng enroll học deck)
  - `triage_completed` (hoàn tất bước sàng lọc từ đã biết)
  - `first_10_cards_mastered` (đạt mốc giá trị đầu tiên: thuộc 10 thẻ)
  - `card_feedback_submitted` (báo lỗi nội dung thẻ)
- **REQ-ANL-002 (Backend Aggregation Service & Endpoint):**
  - Endpoint `GET /api/v1/library/admin/analytics`:
    - Tính toán tổng số lượt người dùng đăng ký học (`totalEnrolledUsers`), Tỷ lệ kích hoạt học phiên đầu (`activationRate`), Tỷ lệ đạt mốc 10 thẻ (`firstValueRate`), Tỷ lệ từ đã biết qua Triage (`avgTriageKnownRate`), và Tổng số báo lỗi (`totalFeedbacks`).
    - Phân tích chi tiết theo từng `OfficialDeck`: `totalEnrolledUsers`, `firstValueCompletionRate`, `avgTriageKnownRate`, `feedbackCount`, `day1RetentionRate`, `day7RetentionRate`.
- **REQ-ANL-003 (Admin Library Analytics Widget):**
  - Component `AdminLibraryAnalyticsWidget.tsx` hiển thị thẻ KPI tổng quan (Activation, First Value, Feedback, Avg Triage Known Rate) và bảng phân tích hiệu quả theo từng Deck / Lộ trình.
  - Tuân thủ nghiêm ngặt Design System WordStreak (`DESIGN.md`): Canvas trắng `#ffffff`, border mảnh `#e5e5e5`, Obsidian Pill typography.

---

## 2. Technical Contracts (`packages/shared-types`)

```typescript
export interface LibraryDeckAnalyticsDto {
  deckId: string;
  slug: string;
  title: string;
  pathCode: string;
  level?: string | null;
  totalEnrolledUsers: number;
  firstValueCompletionRate: number; // % users completing >= 10 cards
  avgTriageKnownRate: number; // % cards marked known
  feedbackCount: number;
  day1RetentionRate: number;
  day7RetentionRate: number;
}

export interface LibraryAnalyticsSummaryResponse {
  totalEnrolledUsers: number;
  activationRate: number;
  firstValueRate: number;
  avgTriageKnownRate: number;
  totalFeedbacks: number;
  deckStats: LibraryDeckAnalyticsDto[];
}
```

---

## 3. Test Cases (`TC-###`)

- **`TC-ANL-001` (Backend - Library Analytics Aggregation):** Gọi `getLibraryAnalytics` $\rightarrow$ Trả về đúng cấu trúc `LibraryAnalyticsSummaryResponse` với các chỉ số tính toán chính xác dựa trên database records.
- **`TC-ANL-002` (Backend - Controller Endpoint):** Endpoint `GET /library/admin/analytics` trả về HTTP 200 và dữ liệu phân tích.
- **`TC-ANL-003` (Frontend - Widget Rendering):** Component `AdminLibraryAnalyticsWidget` render đúng các thẻ KPI tổng quan và danh sách số liệu các bộ từ.
