# 📝 Change Log: Content Enrichment Pipeline

Tất cả các thay đổi về mặt kiến trúc, đặc tả và kế hoạch thực thi của tính năng Content Enrichment Pipeline được theo dõi tại đây.

---

## [v1.1-verified] - 2026-10-15
### Added
- Hoàn thành triển khai trọn vẹn 7 giai đoạn ETL của Content Enrichment Pipeline (`scripts/seed/01-import.ts` đến `07-publish.ts`) và bộ điều phối `run-pipeline.ts`.
- Bổ sung các thư viện dùng chung: `file-utils.ts` (ghi tệp nguyên tử POSIX qua file `.tmp` và rename, parser CSV an toàn), `gemini-batch-client.ts` (xử lý gọi lô 10 từ/request, header `x-goog-api-key`, thuật toán Exponential Backoff kèm Random Jitter cho HTTP 429 và mạng gián đoạn), `validation-rules.ts` (chuẩn hóa POS, kiểm định IPA `/^\/[^\/]+\/$/`, đối sánh ngữ nghĩa lemma trong câu).
- Bộ kiểm thử tự động toàn diện với 10 Test Cases (`TC-LIB-001` đến `TC-LIB-010`) trong 8 test suite (`scripts/seed/__tests__/`), đạt tỷ lệ vượt qua 100% (27/27 passed).
- Tạo tài liệu kỹ thuật hoàn chỉnh theo chuẩn Diataxis tại `docs/features/content-enrichment-pipeline/README.md`.

### Changed
- Cập nhật chỉ mục tính năng tại `docs/features/README.md` và lộ trình backlog tại `docs/PRODUCT_BACKLOG_ROADMAP.md` (đánh dấu hoàn tất US-LIB-01).

### Security & Robustness Hardening
- Khắc phục `SEC-MED-01`: Chuyển API Key của Gemini từ URL query parameter sang request header chính thức `x-goog-api-key`.
- Khắc phục `ROB-MED-01`: Bổ sung nhận diện lỗi mạng native fetch của Node.js 18+ (`TypeError: fetch failed`, `ETIMEDOUT`, `ECONNRESET`, `ENOTFOUND`) vào vòng lặp retry tự phục hồi.
- Khắc phục `SEC-LOW-01`: Loại bỏ chuỗi kết nối cơ sở dữ liệu hardcoded trong `07-publish.ts`, chuyển sang sử dụng biến môi trường `DATABASE_URL` kèm chế độ dry-run an toàn.
- Khắc phục `ARCH-LOW-01`: Thống nhất logic tách dòng CSV có dấu ngoặc kép qua hàm dùng chung `parseCsvLine` trong `lib/file-utils.ts`.

### Verified
- Điểm kiểm toán Definition of Done (DoD): **98.7% (APPROVED)**.
- Kiểm tra toàn diện hệ thống: 0 lỗi TypeScript across 4 workspaces, 0 cảnh báo ESLint, 428/428 tests passing trong `apps/api` và `apps/web`.

---

## [v0.1-draft] - 2026-10-14
### Added
- Khởi tạo bộ tài liệu lập kế hoạch tinh gọn (Lean Canonical Artifact Set) cho User Story US-LIB-01.
- Ghi nhận 3 quyết định làm rõ nghiệp vụ tại Gate 1: `ASM-LIB-001` (Mô hình đích lai DB + JSON), `ASM-LIB-002` (Batch 10 từ + Checkpoint đĩa + Jitter backoff), `ASM-LIB-003` (Quy trình duyệt CSV hai chiều).
- Thiết lập cỗ máy trạng thái 7 giai đoạn (`01-import` -> `07-publish`).
- Định nghĩa 8 quy tắc nghiệp vụ (`BR-LIB-001` đến `BR-LIB-008`) bao gồm: Idempotency Key, Khử trùng lặp chéo NGSL/TSL, Chuẩn hóa POS, Phân tầng T1/T2/T3, Cắt deck 25 từ, Kiểm định IPA regex và tối ưu chi phí token LLM.
- Xây dựng bảng rủi ro `RISK-LIB-001` đến `004` và chiến lược giảm thiểu.
- Hoàn thiện đặc tả chuẩn IEEE 29148 với 7 System Requirements (`REQ-LIB-001` đến `007`) và Ma trận truy vết Traceability Matrix.
- Thiết kế kiến trúc kỹ thuật theo nguyên lý tối giản `ponytail` (Tái sử dụng monorepo types, stdlib first, zero unnecessary wrappers).
- Xây dựng Test Plan hoàn chỉnh với 10 Test Cases cụ thể (`TC-LIB-001` đến `TC-LIB-010`).
- Sẵn sàng trình nộp **GATE 2: UNIFIED SPEC & TECHNICAL PLAN SIGN-OFF** cho người dùng.
