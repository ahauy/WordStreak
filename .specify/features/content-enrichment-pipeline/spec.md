# 📑 Functional Specification: Content Enrichment Pipeline (US-LIB-01)

- **Feature ID**: US-LIB-01
- **Status**: DRAFT v0.9 (Ready for Gate 2 Sign-Off)
- **Standard**: IEEE 29148 Compliant Specification
- **Target**: Backend Seeding Engine (`scripts/seed/`)

---

## 1. System Requirements (REQ)

- **REQ-LIB-001 (Raw Ingestion)**: Hệ thống phải đọc được file định dạng CSV hoặc XLSX từ `scripts/seed/data/raw/tsl-1.2.csv` và `ngsl-1.2.csv`, trích xuất chính xác các trường: `headword`, `pos`, `freqRank`, `freqValue`, `entryCount`.
- **REQ-LIB-002 (Data Normalization & Tiering)**: Hệ thống phải chuẩn hóa toàn bộ `headword` về chữ thường không dấu cách thừa, chuẩn hóa `pos` theo danh mục chuẩn (noun, verb, adjective, adverb...), khử trùng lặp và gắn tag cấp độ `level` (T1, T2, T3) theo `BR-LIB-004`.
- **REQ-LIB-003 (Batch AI Enrichment with Checkpoint)**: Hệ thống phải gọi LLM (Gemini 2.5 Flash) theo batch 10 từ/lô, tạo ra đầy đủ các trường: `phonetic`, `meaningVi`, `meaningEn`, `exampleSentence`, `exampleTranslation`, `collocations` (mảng >= 2 phần tử), `mnemonic`. Sau mỗi batch, hệ thống phải ghi ngay kết quả xuống file `scripts/seed/data/stages/03-enrichment-checkpoint.json`.
- **REQ-LIB-004 (Resilient Rate Limit Handling)**: Khi gặp mã lỗi HTTP 429 hoặc Network Timeout từ Gemini API, hệ thống phải thực hiện tối đa 5 lần retry theo công thức: $Delay = Base \times 2^{retryCount} + Jitter$, trong đó $Base = 1000ms$, $Jitter \in [0, 500]ms$.
- **REQ-LIB-005 (Automated Quality Validation)**: Hệ thống phải kiểm tra chất lượng của từng thẻ theo các điều kiện `BR-LIB-006`. Báo cáo kết quả phải phân loại từ thành `APPROVED_CANDIDATE` hoặc `FLAGGED` kèm mã lỗi vi phạm cụ thể.
- **REQ-LIB-006 (Two-Way CSV Review)**: Hệ thống phải hỗ trợ xuất toàn bộ từ `FLAGGED` ra file CSV `scripts/seed/data/stages/tsl-review-pending.csv` và có script đọc lại file này sau khi biên tập viên chỉnh sửa để cập nhật đè lên trạng thái trong checkpoint.
- **REQ-LIB-007 (Deck Packaging & Publishing)**: Hệ thống phải gom các từ đạt trạng thái `APPROVED` thành các deck cố định đúng 25 từ/deck, sinh mã `deckSlug`, tiêu đề song ngữ Anh/Việt, upsert vào bảng `GlobalDictionaryCache` và ghi file JSON hoàn chỉnh `starter-library-decks.json`.

---

## 2. User Stories & Given-When-Then Scenarios

### US-LIB-001: Content Enrichment Pipeline Runner

#### Scenario 1: Happy Path - Nạp, làm giàu và xuất bản thành công 10 từ đầu tiên
- **Given**: File nguồn `scripts/seed/data/raw/tsl-1.2.csv` có dữ liệu hợp lệ và API key Gemini hợp lệ.
- **When**: Kỹ sư chạy lệnh pipeline hoàn chỉnh `pnpm --filter api run seed:pipeline`.
- **Then**: 
  - File `01-raw-entries.json` được tạo chứa danh sách từ gốc.
  - File `02-normalized-entries.json` được tạo với POS chuẩn và tag T1.
  - File `03-enrichment-checkpoint.json` chứa 10 từ có đủ nghĩa tiếng Việt, phiên âm IPA, câu ví dụ và collocations.
  - File `starter-library-decks.json` được xuất tại `scripts/seed/data/output/`.
  - Database bảng `global_dictionary_cache` có 10 bản ghi với `source = 'TSL_OFFICIAL'`.

#### Scenario 2: Xử lý nghẽn mạng và Rate Limit (HTTP 429)
- **Given**: Đang chạy `03-enrich.ts` đến batch thứ 5 thì Gemini API trả về mã lỗi HTTP 429 (Too Many Requests).
- **When**: Pipeline bắt được exception HTTP 429.
- **Then**: 
  - Hệ thống không bị crash đột ngột.
  - Log cảnh báo hiển thị thời gian chờ thử lại (ví dụ: `Retry 1/5: waiting 1240ms...`).
  - Sau lần thử lại thành công, batch 5 được ghi an toàn vào file checkpoint và pipeline tiếp tục batch 6 bình thường.

#### Scenario 3: Phục hồi sau sự cố (Checkpoint Resume)
- **Given**: Tiến trình làm giàu 1.200 từ bị ngắt ở từ thứ 350 do máy tính mất kết nối mạng.
- **When**: Kỹ sư chạy lại script `03-enrich.ts`.
- **Then**:
  - Script nạp file `03-enrichment-checkpoint.json` hiện có, phát hiện đã hoàn thành 350 từ.
  - Script bỏ qua 350 từ đầu tiên và bắt đầu gọi API ngay từ từ thứ 351, không tốn thêm token cho các từ đã lưu.

#### Scenario 4: Phát hiện lỗi và xuất file CSV duyệt thủ công
- **Given**: Gemini sinh từ vựng "beneficial" nhưng trường `phonetic` bị trả về thiếu dấu `/` (ví dụ: `ˌben.ɪˈfɪʃ.əl`) hoặc câu ví dụ không chứa từ này.
- **When**: Script `04-validate.ts` thực thi.
- **Then**:
  - Từ "beneficial" được đánh dấu trạng thái `FLAGGED` kèm lý do `INVALID_IPA_FORMAT` hoặc `EXAMPLE_MISSING_HEADWORD`.
  - File `scripts/seed/data/stages/tsl-review-pending.csv` được sinh ra chứa dòng dữ liệu của từ này để Curator sửa tay.

#### Scenario 5: Nạp lại kết quả duyệt từ CSV
- **Given**: Curator đã sửa phiên âm `/ˌben.ɪˈfɪʃ.əl/` và đổi trạng thái thành `APPROVED` trong file CSV.
- **When**: Kỹ sư chạy `05-review-import.ts`.
- **Then**:
  - Dữ liệu đã sửa được cập nhật ngược vào checkpoint.
  - Tổng số từ `APPROVED` tăng lên và sẵn sàng cho `06-build-decks.ts`.

---

## 3. Edge Case Matrix

| Edge Case Code | Tình huống ngoại lệ | Hành vi hệ thống mong đợi |
| :--- | :--- | :--- |
| **EC-LIB-001** | Từ gốc chứa ký tự đặc biệt, dấu gạch ngang (ví dụ: "up-to-date", "by-product") | Chuẩn hóa giữ nguyên dấu gạch ngang hợp lệ, loại bỏ khoảng trắng thừa ở hai đầu. |
| **EC-LIB-002** | Gemini trả về markdown fenced code block (```json ... ```) thay vì plain JSON | Bộ bóc tách JSON sử dụng regex bóc tách chuỗi nằm giữa `{ ... }` trước khi `JSON.parse()`. |
| **EC-LIB-003** | Gemini bỏ sót 1 từ trong batch 10 từ (chỉ trả về 9 đối tượng) | Pipeline đối chiếu mảng kết quả với danh sách 10 từ đầu vào; từ bị thiếu được đưa vào hàng đợi retry riêng của batch tiếp theo. |
| **EC-LIB-004** | File CSV review bị lưu sai encoding (không phải UTF-8) hoặc thừa dấu phẩy | Sử dụng parser chuẩn kiểm tra BOM UTF-8, báo lỗi dòng cụ thể nếu số lượng cột không khớp tiêu đề. |
| **EC-LIB-005** | Số lượng từ còn lại ở deck cuối cùng không đủ 25 từ (ví dụ: 18 từ) | Deck cuối cùng được phép có kích thước $\ge 15$ từ hoặc gộp hợp lý vào deck liền kề để không tạo deck quá bé. |

---

## 4. IEEE 29148 Quality Verification Gate

- [x] **Necessary**: Pipeline giải quyết bài toán cốt lõi nạp dữ liệu sạch cho WordStreak.
- [x] **Unambiguous**: Các quy tắc chuẩn hóa, regex IPA và công thức retry được định lượng rõ ràng.
- [x] **Complete**: Bao phủ trọn vẹn từ file CSV raw đến bảng database và JSON artifact.
- [x] **Singular**: Từng script đảm nhận đúng một vai trò duy nhất theo nguyên lý Single Responsibility.
- [x] **Feasible**: Hoàn toàn khả thi bằng Node.js TypeScript và các thư viện sẵn có trong monorepo.
- [x] **Verifiable**: Mọi yêu cầu đều có thể kiểm thử tự động qua test case trong `test-plan.md`.
- [x] **Traceable**: Mọi REQ đều dẫn xuất từ Business Goal và ánh xạ trực tiếp sang US và TC.

---

## 5. Traceability Matrix

| Business Goal | Requirement ID | User Story ID | Test Case ID | Giai đoạn thực thi |
| :--- | :--- | :--- | :--- | :--- |
| G1: Kho từ vựng chuẩn hóa | REQ-LIB-001, REQ-LIB-002 | US-LIB-001 | TC-LIB-001, TC-LIB-002, TC-LIB-003 | Stage 1 & 2 (Import, Normalize) |
| G2: Tối ưu chi phí & ổn định | REQ-LIB-003, REQ-LIB-004 | US-LIB-001 | TC-LIB-004, TC-LIB-005 | Stage 3 (Enrich, Checkpoint) |
| G3: Kiểm định chất lượng ngữ cảnh | REQ-LIB-005, REQ-LIB-006 | US-LIB-001 | TC-LIB-006, TC-LIB-007, TC-LIB-008 | Stage 4 & 5 (Validate, Review) |
| G4: Đóng gói & kích hoạt học tập | REQ-LIB-007 | US-LIB-001 | TC-LIB-009, TC-LIB-010 | Stage 6 & 7 (Decks, Publish) |
