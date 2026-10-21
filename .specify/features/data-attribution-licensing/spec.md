# Feature Specification: Data Attribution & CC BY-SA 4.0 Licensing (US-LIB-08)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-08`
- **Title:** Ghi nhận nguồn dữ liệu & Bản quyền (Attribution & Licensing)
- **Goal:** Đảm bảo 100% tính minh bạch học thuật và tuân thủ pháp lý theo giấy phép Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) cho danh mục từ vựng NGSL & TSL, đồng thời công bố tuyên bố miễn trừ trách nhiệm nhãn hiệu với ETS và Cambridge/IDP.

### Acceptance Criteria (`REQ-LIB-08-xxx`):
- `REQ-LIB-08-001`: Trang tĩnh công khai `/sources` (`DataSourcesPage`) hỗ trợ song ngữ EN/VI:
  - Công bố đầy đủ thông tin danh mục từ vựng dựa trên NGSL 1.2 (2.809 từ) và TSL 1.2 (~1.200 từ) của nhóm nghiên cứu Dr. Charles Browne, Dr. Brent Culligan, và Joseph Phillips.
  - Cung cấp liên kết chính thức tới [newgeneralservicelist.com](https://www.newgeneralservicelist.com) và văn bản pháp lý giấy phép [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- `REQ-LIB-08-002`: Tuyên bố miễn trừ trách nhiệm thương hiệu pháp lý minh bạch (Legal Trademark Disclaimer):
  - Khẳng định rõ ràng WordStreak là nền tảng học tập độc lập, phi thương mại, không có mối liên kết, tài trợ hay được chứng thực bởi Viện Khảo thí Giáo dục Hoa Kỳ (ETS) hoặc Hội đồng Anh / IDP / Cambridge.
  - Nhắc rõ TOEIC® và IELTS® là các nhãn hiệu đã đăng ký của các tổ chức tương ứng.
- `REQ-LIB-08-003`: Thành phần UI `SourceAttributionBadge`:
  - Thiết kế chuẩn Obsidian pill (`rounded-full`, hairline border `#e5e5e5`, nhãn CC BY-SA 4.0, hover tương tác).
  - Tích hợp điều hướng trực tiếp đến trang `/sources`.
  - Hiển thị trên thẻ `OfficialDeckCard`, trang chi tiết `OfficialDeckDetailPage`, và chân trang `LibraryPage`.
- `REQ-LIB-08-004`: Tuyến đường điều hướng `/sources` trong `App.tsx` hoạt động cho cả người dùng đã đăng nhập lẫn khách vãng lai (không bị chặn bởi `ProtectedRoute`).
- `REQ-LIB-08-005`: Tích hợp đa ngôn ngữ (i18n) hoàn chỉnh với bộ khóa `sources` trong `common.json` cả 2 locale `en` và `vi`, đảm bảo 100% i18n parity.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Component:** `apps/web/src/features/library/components/SourceAttributionBadge.tsx`
  - Pill tối giản, hiển thị nhãn CC BY-SA 4.0 và liên kết trang `/sources`.
- **Page:** `apps/web/src/features/library/pages/DataSourcesPage.tsx`
  - Render thẻ nghiên cứu corpus NGSL/TSL, bảng thống kê độ phủ từ vựng, hộp điều khoản giấy phép CC BY-SA 4.0, và khối disclaimer pháp lý ETS/IELTS.
- **Routing:** Khai báo `/sources` trong `apps/web/src/App.tsx`.
- **Integration:** Gắn `SourceAttributionBadge` vào `OfficialDeckCard.tsx` và `OfficialDeckDetailPage.tsx`.
- **Translations:** Bổ sung `sources` vào `apps/web/src/locales/en/common.json` và `apps/web/src/locales/vi/common.json`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-08-001`: Render trang `/sources` hiển thị đúng tiêu đề, thông tin tác giả Browne, Culligan & Phillips, và liên kết CC BY-SA 4.0.
- `TC-LIB-08-002`: Khối tuyên bố miễn trừ trách nhiệm (ETS / TOEIC disclaimer) xuất hiện rõ ràng trên trang `/sources`.
- `TC-LIB-08-003`: `SourceAttributionBadge` render đúng định dạng pill, có thể click chuyển hướng hoặc liên kết đến `/sources`.
- `TC-LIB-08-004`: Chân trang `LibraryPage` và `OfficialDeckCard` chứa huy hiệu/liên kết điều hướng tới `/sources`.
- `TC-LIB-08-005`: Đảm bảo toàn bộ test parity i18n tiếp tục pass 100%.
