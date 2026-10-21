# Feature Specification: Lộ trình TOEIC & Thanh độ phủ ước tính (TSL Path & Coverage Bar) (US-LIB-06)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-06`
- **Title:** Lộ trình TOEIC & Thanh độ phủ ước tính (TSL Path & Coverage Bar)
- **Goal:** Cung cấp cho người học lộ trình TOEIC hẹp-mà-sâu minh bạch với 3 cấp độ (T1, T2, T3 gồm 48 decks tương ứng 1.200 từ TSL 1.2), ngày dự kiến về đích theo mục tiêu ngày, và thanh đo lường thời gian thực "Độ phủ từ vựng TOEIC ước tính: X% (tối đa 98.5%)".

### Acceptance Criteria (`REQ-LIB-06-xxx`):
- `REQ-LIB-06-001`: Backend Endpoint `GET /api/v1/library/paths/toeic/progress`:
  - Yêu cầu xác thực JWT.
  - Tính toán độ phủ TOEIC dựa trên 2 nguồn từ vựng khoa học:
    - NGSL Nền tảng (2.809 từ): Tỷ lệ hoàn thành (`MASTERED` + `KNOWN_SKIPPED`) chiếm tối đa 94.0%.
    - TSL Chuyên sâu (1.200 từ): Tỷ lệ hoàn thành trong lộ trình TOEIC bổ sung tối đa 4.5%.
    - Tổng độ phủ ước tính tối đa là 98.5%.
  - Trả về số lượng bộ từ đã hoàn thành (`completedDecks` / `totalDecks`).
  - Dự báo số ngày về đích: `estimatedDaysRemaining = Math.ceil(remainingWords / dailyGoal)`.
  - Phân cấp 3 tầng lộ trình: T1 (1–400 từ), T2 (401–800 từ), T3 (801–1.200 từ) kèm danh sách deck con.
- `REQ-LIB-06-002`: Component giao diện `ToeicCoverageProgressBar`:
  - Thanh đo lường phân đoạn trực quan: Phân đoạn NGSL nền tảng + Phân đoạn TSL chuyên sâu + Mốc tối đa 98.5%.
  - Huy hiệu phần trăm độ phủ thời gian thực (ví dụ `88.5% / 98.5% tối đa`).
  - Hàng thống kê chi tiết đóng góp của NGSL (max 94.0%) và TSL (max 4.5%).
  - Trích dẫn minh bạch về nghiên cứu corpus của Browne, Culligan & Phillips (NGSL Project).
- `REQ-LIB-06-003`: Trang Lộ trình `ToeicPathPage` (`/paths/toeic`):
  - Hiển thị bản đồ lộ trình với 3 tab cấp độ T1, T2, T3.
  - Thẻ deck hiển thị trạng thái hoàn thành (`Đã xong ✓`, `X/25 từ`, `Chưa học`).
  - Điều hướng trực tiếp vào trang chi tiết deck `/library/decks/:slug`.
- `REQ-LIB-06-004`: Tuân thủ nghiêm ngặt Design System: Obsidian pure black pills, hairline border `#e5e5e5`, canvas `#ffffff`.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Backend:**
  - `apps/api/src/modules/library/library.service.ts`: Viết hàm `getToeicPathProgress(userId)`.
  - `apps/api/src/modules/library/library.controller.ts`: Thêm route `@Get('paths/toeic/progress')`.
- **Contracts:**
  - `packages/shared-types/src/official-library.ts`: `ToeicDeckProgressDto`, `ToeicLevelProgressDto`, `ToeicPathProgressResponse`.
- **Frontend:**
  - `apps/web/src/features/library/components/ToeicCoverageProgressBar.tsx`: Thanh đo lường phân đoạn trực quan.
  - `apps/web/src/features/library/pages/ToeicPathPage.tsx`: Trang lộ trình bản đồ học tập `/paths/toeic`.
  - `apps/web/src/features/library/services/libraryService.ts`: Thêm hàm `getToeicPathProgress()`.
  - `apps/web/src/App.tsx`: Đăng ký route `/paths/toeic`.
- **Tests:**
  - `apps/api/src/modules/library/library.service.spec.ts` & `library.controller.spec.ts`.
  - `apps/web/src/features/library/__tests__/ToeicCoverageProgressBar.spec.tsx`.
  - `apps/web/src/features/library/__tests__/ToeicPathPage.spec.tsx`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-06-001`: `getToeicPathProgress` tính toán chính xác độ phủ NGSL (max 94%), TSL (max 4.5%), số ngày dự kiến và cấp độ T1/T2/T3.
- `TC-LIB-06-002`: `ToeicCoverageProgressBar` hiển thị các phân đoạn tiến độ và ghi chú nguồn học thuật NGSL Project.
- `TC-LIB-06-003`: `ToeicPathPage` chuyển đổi tab cấp độ, hiển thị đúng danh sách deck và xử lý trạng thái lỗi mạng.
