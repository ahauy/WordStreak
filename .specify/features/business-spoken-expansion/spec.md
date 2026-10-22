# Feature Specification: Business & Spoken Expansion (Sprint 12 - US-LIB-14 & US-LIB-15)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-14` & `US-LIB-15`
- **Title:** Business Service List (BSL) & Spoken English (NGSL-S) Expansion
- **Goal:** Đóng gói và enrich danh mục 1.700 từ vựng tiếng Anh thương mại BSL (Business Service List) và 721 từ vựng giao tiếp NGSL-S (Spoken English) của Browne, Culligan & Phillips, xây dựng 2 bản đồ lộ trình học tập chuyên biệt phục vụ người đi làm và người luyện giao tiếp tự nhiên.

### Acceptance Criteria (`REQ-LIB-14-xxx` & `REQ-LIB-15-xxx`):
- `REQ-LIB-14-001`: Đóng gói danh mục 1.700 từ vựng kinh doanh BSL 1.2 gán mã `pathCode = "BUSINESS"` và `listCode = "BSL"`, chia thành 50 chặng (34 từ/chặng) theo các lĩnh vực: Quản trị Doanh nghiệp, Tài chính Ngân hàng, Marketing & Bán hàng, Nhân sự & Tuyển dụng, Chuỗi Cung ứng & Vận hành.
- `REQ-LIB-14-002`: Enrich đầy đủ thông tin từ vựng BSL: phiên âm IPA, nghĩa tiếng Việt thương mại, định nghĩa tiếng Anh, ví dụ ngữ cảnh công sở song ngữ, collocations kinh doanh và mẹo nhớ `mnemonic`.
- `REQ-LIB-14-003`: Trang Bản đồ Lộ trình Tiếng Anh Thương mại (`/paths/business`) hiển thị 50 Chặng, thanh đo độ phủ kinh doanh 97%, và bộ lọc theo 5 chuyên ngành kinh tế.
- `REQ-LIB-15-001`: Đóng gói danh mục 721 từ vựng đàm thoại NGSL-S gán mã `pathCode = "COMMUNICATION"` và `listCode = "NGSL-S"`, chia thành 24 chặng (30 từ/chặng) với các chủ đề giao tiếp đời sống và tình huống giao tiếp thường nhật.
- `REQ-LIB-15-002`: Enrich đoạn hội thoại ngữ cảnh 2 câu (Speaker A & Speaker B song ngữ) giúp người học nắm bắt ngữ điệu và phản xạ đàm thoại tự nhiên.
- `REQ-LIB-15-003`: Trang Bản đồ Lộ trình Giao tiếp (`/paths/spoken`, alias `/paths/communication`) hiển thị 24 Chặng, thanh đo độ phủ đàm thoại 90%, và bộ lọc ngữ cảnh giao tiếp.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Datasets:**
  - `apps/web/src/features/business/data/bslDecks.ts`: Catalog 50 chặng BSL và các bộ từ vựng thương mại mẫu phong phú.
  - `apps/web/src/features/spoken/data/spokenDecks.ts`: Catalog 24 chặng NGSL-S kèm hội thoại 2 chiều thực tế.
- **Pages & Components:**
  - `apps/web/src/features/business/pages/BusinessPathPage.tsx`
  - `apps/web/src/features/spoken/pages/SpokenPathPage.tsx`
- **Routing & Integration:**
  - `apps/web/src/App.tsx`: Routes `/paths/business`, `/paths/spoken`, `/paths/communication`.
  - `apps/web/src/features/library/pages/LibraryPage.tsx`: Hỗ trợ lộ trình `BUSINESS` và `COMMUNICATION`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-14-001`: Dataset BSL có đầy đủ metadata, từ loại, IPA chuẩn, nghĩa tiếng Việt thương mại và collocations.
- `TC-LIB-14-002`: `BusinessPathPage` render đầy đủ 50 chặng kinh doanh, thanh đo độ phủ 97% và lọc theo lĩnh vực.
- `TC-LIB-15-001`: Dataset NGSL-S có cấu trúc hội thoại song ngữ (Speaker A/B), phiên âm IPA và danh mục 24 chặng.
- `TC-LIB-15-002`: `SpokenPathPage` render đầy đủ 24 chặng giao tiếp, thanh đo độ phủ 90% và lọc theo chủ đề hội thoại.
