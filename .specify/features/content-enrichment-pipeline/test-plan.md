# 🧪 Test Plan: Content Enrichment Pipeline (US-LIB-01)

- **Feature ID**: US-LIB-01
- **Test Framework**: Vitest / Jest (Node.js TypeScript Runner)
- **Target Location**: `scripts/seed/__tests__/`
- **Total Test Cases**: 10 Concrete Test Cases (TC-LIB-001 to TC-LIB-010)

---

## 1. Test Suite Matrix & Traceability

| Test Case ID | Tên bài kiểm thử | Mục tiêu kiểm thử | File test tương ứng | Ánh xạ |
| :--- | :--- | :--- | :--- | :--- |
| **TC-LIB-001** | Raw CSV Parser Test | Kiểm tra trích xuất đúng headword, POS, freqRank từ file CSV gốc | `scripts/seed/__tests__/import.spec.ts` | REQ-LIB-001 |
| **TC-LIB-002** | POS Canonical Mapping Test | Kiểm tra chuẩn hóa viết tắt `v, n, adj, adv` thành danh từ chuẩn | `scripts/seed/__tests__/normalizer.spec.ts` | REQ-LIB-002 |
| **TC-LIB-003** | Tier Stratification & Dedupe Test | Kiểm tra phân hạng T1 (1–400), T2 (401–800), T3 và dedupe chéo | `scripts/seed/__tests__/normalizer.spec.ts` | REQ-LIB-002 |
| **TC-LIB-004** | Gemini Batch Enricher Mock Test | Kiểm tra batching 10 từ và parse JSON output chuẩn schema | `scripts/seed/__tests__/gemini-batch.spec.ts` | REQ-LIB-003 |
| **TC-LIB-005** | Exponential Backoff with Jitter Test | Kiểm tra logic retry khi gặp HTTP 429 và tính ngẫu nhiên của jitter | `scripts/seed/__tests__/gemini-batch.spec.ts` | REQ-LIB-004 |
| **TC-LIB-006** | Progressive Checkpoint Persistence Test | Kiểm tra khôi phục tiến độ khi bị crash và ghi file an toàn atomic | `scripts/seed/__tests__/checkpoint.spec.ts` | REQ-LIB-003 |
| **TC-LIB-007** | Strict IPA Regex & Lemma Validation Test | Kiểm tra phát hiện lỗi IPA thiếu `/.../` và ví dụ thiếu từ | `scripts/seed/__tests__/validator.spec.ts` | REQ-LIB-005 |
| **TC-LIB-008** | Two-Way CSV Export/Import Sync Test | Kiểm tra xuất CSV đúng cột và nạp lại dữ liệu đã sửa vào checkpoint | `scripts/seed/__tests__/csv-sync.spec.ts` | REQ-LIB-006 |
| **TC-LIB-009** | Deck Sizing (25 words) & SEO Slugs Test | Kiểm tra chia đúng 25 từ/deck và định dạng slug chuẩn SEO | `scripts/seed/__tests__/deck-builder.spec.ts` | REQ-LIB-007 |
| **TC-LIB-010** | Database Upsert & Artifact Export Test | Kiểm tra upsert bảng `GlobalDictionaryCache` và xuất JSON artifact | `scripts/seed/__tests__/publish.spec.ts` | REQ-LIB-007 |

---

## 2. Concrete Test Case Specifications

### TC-LIB-001: Raw CSV Parser
- **Mục tiêu**: Đảm bảo đọc chính xác các dòng trong file `tsl-1.2.csv`.
- **Input**: Chuỗi dữ liệu mẫu:
  ```csv
  headword,pos,freq_rank,freq_value
  accommodate,v,120,45.2
  beneficial,adj,350,22.1
  ```
- **Expected Output**:
  ```typescript
  [
    { headword: 'accommodate', pos: 'v', freqRank: 120, freqValue: 45.2, listCode: 'TSL' },
    { headword: 'beneficial', pos: 'adj', freqRank: 350, freqValue: 22.1, listCode: 'TSL' }
  ]
  ```

### TC-LIB-002: POS Canonical Mapping
- **Mục tiêu**: Đảm bảo toàn bộ ký hiệu từ loại được quy đổi về chuẩn.
- **Input**: Danh sách `['v', 'n', 'adj', 'adv', 'prep', 'conj', 'pron']`.
- **Expected Output**: `['verb', 'noun', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun']`.

### TC-LIB-003: Tier Stratification & Cross Deduplication
- **Mục tiêu**: Phân loại đúng cấp độ dựa trên thứ hạng tần suất.
- **Input**:
  - Word A: `freqRank = 50` -> Level: `T1`
  - Word B: `freqRank = 600` -> Level: `T2`
  - Word C: `freqRank = 1050` -> Level: `T3`
  - Word D (trùng từ trong NGSL): được gắn `crossListRef = 'NGSL'`.

### TC-LIB-004: Gemini Batch Enricher Mock
- **Mục tiêu**: Gửi mảng 10 từ và nhận mảng 10 đối tượng làm giàu hợp lệ.
- **Setup**: Mock `fetch` hoặc Gemini SDK trả về mảng JSON chuẩn.
- **Assertion**:
  - `result.length === 10`
  - Mỗi phần tử có đủ: `phonetic`, `meaningVi`, `exampleSentence`, `collocations.length >= 2`.

### TC-LIB-005: Exponential Backoff & Jitter
- **Mục tiêu**: Xác nhận khi gặp lỗi 429, hàm thực hiện retry và tăng thời gian delay có kèm jitter.
- **Setup**: Mock hàm fetch ném lỗi 429 hai lần trước khi thành công.
- **Assertion**:
  - Số lần gọi hàm là 3.
  - Delay lần 1 nằm trong khoảng $[1000, 1500]ms$.
  - Delay lần 2 nằm trong khoảng $[2000, 2500]ms$.

### TC-LIB-006: Progressive Checkpoint Persistence
- **Mục tiêu**: Đảm bảo checkpoint không bị ghi đè mất mát và khôi phục được.
- **Setup**: Tạo checkpoint giả lập có 20 từ. Chạy hàm enrich với danh sách 30 từ.
- **Assertion**:
  - Hàm chỉ gọi enrich cho 10 từ còn lại.
  - Checkpoint cuối cùng có đủ 30 từ.

### TC-LIB-007: Strict IPA Regex & Lemma Validation
- **Mục tiêu**: Kiểm tra phát hiện thẻ lỗi và gắn cờ `FLAGGED`.
- **Cases**:
  - Case A (IPA sai format `ˈben.ɪ.fɪt` thiếu slash) -> Vi phạm `IPA_FORMAT`, status: `FLAGGED`.
  - Case B (Ví dụ không chứa lemma "accommodate": "The hotel was very nice.") -> Vi phạm `LEMMA_IN_SENTENCE`, status: `FLAGGED`.
  - Case C (Đầy đủ tiêu chuẩn `/əˈkɑː.mə.deɪt/`, ví dụ chứa từ) -> Status: `APPROVED_CANDIDATE`.

### TC-LIB-008: Two-Way CSV Export/Import Sync
- **Mục tiêu**: Kiểm tra tính toàn vẹn khi xuất và nạp lại CSV.
- **Setup**: Xuất 1 từ `FLAGGED` ra CSV. Đổi phiên âm và gán status = `APPROVED`. Nạp lại bằng `05-review-import.ts`.
- **Assertion**: Bản ghi trong checkpoint được cập nhật phiên âm mới và chuyển sang `APPROVED`.

### TC-LIB-009: Deck Sizing & SEO Slugs
- **Mục tiêu**: Gom cụm đúng 25 từ/deck và sinh slug chuẩn.
- **Input**: Danh sách 50 từ thuộc Level T1, Category "Office Communication".
- **Assertion**:
  - Sinh đúng 2 decks, mỗi deck chính xác 25 thẻ.
  - Slug deck 1: `tsl-t1-office-communication-01`.
  - Slug deck 2: `tsl-t1-office-communication-02`.

### TC-LIB-010: Database Upsert & Artifact Export
- **Mục tiêu**: Kiểm tra upsert vào Prisma Client mock/test DB và file xuất đĩa.
- **Assertion**:
  - Gọi `prisma.globalDictionaryCache.upsert()` với đúng payload.
  - File `scripts/seed/data/output/starter-library-decks.json` được tạo, đọc được bằng `JSON.parse()` và chứa cấu trúc deck hợp lệ.
