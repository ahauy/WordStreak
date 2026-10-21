# Feature Specification: Vocabulary Control Engine for Examples (US-LIB-13)

## 1. Requirements & Acceptance Criteria

- **User Story ID:** `US-LIB-13`
- **Title:** Động cơ kiểm soát độ phủ từ vựng trong ví dụ (Vocabulary Control Engine)
- **Goal:** Đảm bảo toàn bộ câu ví dụ tiếng Anh trong hệ thống thẻ từ vựng chuẩn hóa không vượt quá trình độ người học, tránh hiện tượng câu ví dụ chứa từ quá khó gây nản lòng (đặc biệt cho người mất gốc / Beginner Mode).

### Acceptance Criteria (`REQ-LIB-13-xxx`):
- `REQ-LIB-13-001`: Câu ví dụ dễ (`example_easy_en`) cho Beginner Mode:
  - Độ dài chuẩn: 5–8 từ (đủ ngữ cảnh nhưng không gây ngợp).
  - Độ phủ từ vựng: 100% các từ phụ trợ (ngoài từ mục tiêu / target headword) phải nằm trong danh mục **NGSL Top 500** hoặc các từ ngữ pháp cơ bản (đại từ, mạo từ, trợ động từ).
- `REQ-LIB-13-002`: Câu ví dụ chuẩn (`example_en` / `exampleSentence`) cho trình độ TOEIC / General:
  - Độ phủ từ vựng: $\ge 95\%$ số lượng từ trong câu phải nằm trong tập hợp hợp nhất **NGSL 1.2 + TSL 1.2**.
- `REQ-LIB-13-003`: Hàm kiểm tra độ phủ câu `checkSentenceVocabularyCoverage`:
  - Nhận vào câu ví dụ, tập từ cho phép (`allowedWordSet`), và từ mục tiêu (`targetWord`).
  - Phân tích tách từ (tokenization), loại bỏ dấu câu, chuẩn hóa dạng số ít/số nhiều, thì quá khứ/tiếp diễn cơ bản.
  - Trả về: `totalWords`, `coveredWords`, `coveragePct` (tỷ lệ %), và danh sách từ ngoài danh mục `outOfVocabWords`.
- `REQ-LIB-13-004`: Tích hợp vào quy trình kiểm duyệt (Stage 4 Validate):
  - Tích hợp luật kiểm tra vào `validateEnrichedWord()` trong `scripts/seed/lib/validation-rules.ts`.
  - Gắn mã lỗi tường minh: `EASY_EXAMPLE_INVALID_LENGTH`, `EASY_EXAMPLE_OUT_OF_NGSL_500`, `EXAMPLE_LOW_COVERAGE`.
  - Báo cáo `04-validation-report.json` liệt kê chi tiết các thẻ vi phạm để kích hoạt cơ chế AI sinh lại hoặc duyệt thủ công.

---

## 2. Technical Approach (`ponytail` Simplicity)

- **Engine:** `scripts/seed/lib/vocabulary-control.ts`
  - Chứa bộ từ vựng chuẩn NGSL Top 500 và tập hợp NGSL + TSL.
  - Hàm `cleanToken`, `stemToken`, `checkSentenceVocabularyCoverage`.
  - Hàm `validateSentenceDifficulty`.
- **Integration:** `scripts/seed/lib/validation-rules.ts` & `scripts/seed/04-validate.ts`.
- **Tests:** `scripts/seed/__tests__/vocabulary-control.spec.ts`.

---

## 3. Test Cases (`TC-###`)

- `TC-LIB-13-001`: Câu ví dụ dễ đạt chuẩn (5–8 từ, 100% từ thuộc NGSL Top 500) được đánh giá hợp lệ (`isValid: true`).
- `TC-LIB-13-002`: Câu ví dụ dễ có độ dài ngoài khoảng 5–8 từ bị gắn cờ `EASY_EXAMPLE_INVALID_LENGTH`.
- `TC-LIB-13-003`: Câu ví dụ dễ chứa từ ngoài NGSL Top 500 bị gắn cờ `EASY_EXAMPLE_OUT_OF_NGSL_500` kèm danh sách `outOfVocabWords`.
- `TC-LIB-13-004`: Câu ví dụ chuẩn TOEIC đạt $\ge 95\%$ từ vựng thuộc NGSL+TSL được thông qua.
- `TC-LIB-13-005`: Câu ví dụ chuẩn TOEIC có độ phủ $< 95\%$ bị gắn cờ `EXAMPLE_LOW_COVERAGE`.
- `TC-LIB-13-006`: Tích hợp vào `validateEnrichedWord` phát hiện đúng lỗi trên thẻ dữ liệu.
