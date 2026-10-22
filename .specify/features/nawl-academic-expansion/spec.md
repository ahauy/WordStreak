# Feature Specification: NAWL 1.2 Import & Enrichment (US-LIB-13)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-13`
- **Title:** NAWL 1.2 Import & Enrichment (960 Academic Words for IELTS)
- **Goal:** Đóng gói và enrich danh mục 960 từ vựng học thuật New Academic Word List (NAWL 1.2) của Browne, Culligan & Phillips, phân bổ vào các chủ đề học thuật và mục tiêu IELTS Band (5.5 - 6.5, 6.5 - 7.5, 7.5+), kèm ví dụ song ngữ, phát âm IPA, collocations và mẹo ghi nhớ mnemonics.

### Acceptance Criteria (`REQ-LIB-13-xxx`):
- `REQ-LIB-13-001`: Đóng gói danh mục từ vựng học thuật NAWL 1.2 theo chuẩn dữ liệu chính thức, gán mã `pathCode = "ACADEMIC"` và `listCode = "NAWL"`.
- `REQ-LIB-13-002`: Enrich đầy đủ thông tin mỗi từ vựng: Từ vựng, từ loại (`pos`), phiên âm IPA chuẩn, nghĩa tiếng Việt học thuật, định nghĩa tiếng Anh súc tích, ví dụ ngữ cảnh học thuật/IELTS song ngữ, danh sách collocations học thuật và mẹo nhớ gợi ý (`mnemonic`).
- `REQ-LIB-13-003`: Tổ chức thành các bộ thẻ chuyên đề học thuật rõ ràng (Nghiên cứu & Luận điểm, Phương pháp Luận & Dữ liệu, Xã hội & Thể chế, Môi trường & Sinh thái, v.v.) và phân cấp theo IELTS Target Band (5.5 - 6.5, 6.5 - 7.5, 7.5+).
- `REQ-LIB-13-004`: Thành phần UI `AcademicPathSection` trên Thư viện (`/library`) hiển thị bộ lọc theo chủ đề và mục tiêu Band điểm, cho phép người học lọc nhanh và truy cập xem trước thẻ từ.
- `REQ-LIB-13-005`: Trang Bản đồ Lộ trình IELTS Academic (`/paths/academic`, alias `/paths/ielts`) hiển thị đầy đủ 32 Chặng học thuật (960 từ), thanh đo độ phủ NAWL 92%, và bộ lọc theo 3 Band Tiers (Band 5.5 - 6.5, Band 6.5 - 7.5, Band 7.5+).

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Dataset:** `apps/web/src/features/academic/data/nawlDecks.ts`
  - Chứa cấu trúc các bộ thẻ học thuật NAWL chuẩn hóa và danh mục 32 Chặng IELTS Academic, typing an toàn không dùng thư viện ngoài.
- **Component:** `apps/web/src/features/academic/components/AcademicPathSection.tsx` & `apps/web/src/features/academic/pages/IeltsAcademicPathPage.tsx`
  - Render thẻ thống kê IELTS target band, filter chip tối giản (Obsidian Pill), lưới 32 deck học thuật.
- **Integration:**
  - `apps/web/src/features/library/pages/LibraryPage.tsx`: Tích hợp `AcademicPathSection` khi chọn Lộ trình `ACADEMIC`.
  - `apps/web/src/App.tsx`: Đăng ký route `/paths/academic` và redirect `/paths/ielts`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-13-001`: Dataset NAWL có đủ cấu trúc từ vựng, từ loại, IPA hợp lệ, nghĩa song ngữ và collocations học thuật.
- `TC-LIB-13-002`: Phân loại chính xác các bộ thẻ theo chủ đề và phân cấp IELTS Band.
- `TC-LIB-13-003`: `AcademicPathSection` render đầy đủ các mục tiêu Band (5.5 - 6.5, 6.5 - 7.5, 7.5+) và các bộ thẻ tương ứng.
- `TC-LIB-13-004`: Bộ lọc chủ đề hoạt động mượt mà, lọc chính xác số lượng bộ thẻ học thuật.
- `TC-LIB-13-005`: `IeltsAcademicPathPage` render đầy đủ 32 Chặng, thanh độ phủ 960 từ và lọc chính xác theo các Band Tiers.
