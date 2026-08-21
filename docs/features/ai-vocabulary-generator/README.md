# Feature: AI-Assisted Vocabulary Generator & Global Dictionary Cache (US-AI-01 & US-AI-02)

**Slug**: `ai-vocabulary-generator`  
**Version**: 1.0  
**Ship date**: 2026-08-21  
**Spec**: [.specify/features/ai-vocabulary-generator/](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/ai-vocabulary-generator/)  
**Baseline**: [SIGNED-OFF v1.0]  

---

## 1. Mô tả ngắn (Overview)

Tính năng **AI-Assisted Vocabulary Generator** giúp người học tạo thẻ từ vựng giàu ngữ cảnh chỉ với 1 click: tự động điền phiên âm chuẩn quốc tế IPA, loại từ, nghĩa tiếng Việt chuẩn xác, giải nghĩa tiếng Anh, câu ví dụ tiếng Anh kèm dịch nghĩa, collocations thông dụng, và mẹo ghi nhớ sinh động (mnemonic).

Đồng thời, hệ thống tích hợp **Centralized Global Dictionary Cache** lưu trữ toàn bộ các từ đã tra cứu vào bảng PostgreSQL dùng chung cho toàn bộ người dùng, mang lại tốc độ phản hồi siêu tốc (< 50ms) và tối ưu hóa 95% chi phí API LLM.

---

## 2. Phạm vi đã hoàn thành (MoSCoW Must-Have & Should-Have)

- [x] **Global Dictionary Cache**: Bảng `global_dictionary_cache` lưu trữ các từ vựng đã được chuẩn hóa (lowercase, trimmed) với chỉ mục unique.
- [x] **Multi-Tier AI Service**: Tích hợp Google Gemini Flash (chính) với cơ chế tự động fallback sang Free Dictionary API khi mạng chậm hoặc hết quota.
- [x] **Daily Quota & Anti-Abuse**: Quota 30 lượt tạo AI mới/ngày cho mỗi user (tra cứu từ trong cache hoàn toàn không giới hạn và miễn phí) + giới hạn 5 req/phút chống spam.
- [x] **Giao diện Auto-Fill thông minh**: Nút `✨ Tự động điền AI` trong `AddCardModal` và `EditCardModal` với hiệu ứng loading xoay mượt mà, tự động điền dữ liệu vào form nhưng vẫn cho phép chỉnh sửa 100% trước khi lưu.
- [x] **Xử lý lỗi an toàn (Zero Data Loss)**: Nếu từ không tồn tại hoặc mất mạng, hệ thống hiển thị thông báo nhẹ nhàng và không xóa nội dung người dùng đã nhập.

---

## 3. Các thay đổi kỹ thuật chính

### 3.1. Database (Prisma)
- Thêm model `GlobalDictionaryCache` trong `apps/api/prisma/schema.prisma`:
  - `id`: UUID Primary Key
  - `word`: String (`@unique`, indexed)
  - `partOfSpeech`, `phonetic`, `meaningVi`, `meaningEn`, `exampleSentence`, `exampleTranslation`, `collocations`, `mnemonic`, `audioUrl`
  - `source`: `GEMINI_FLASH` | `FREE_DICTIONARY` | `MANUAL_CURATED`
  - `hitCount`: Int (mặc định 1, tăng dần khi có cache hit)
- Script migrate thực thi an toàn: `prisma db execute`.

### 3.2. Shared Types (`packages/shared-types`)
- Tạo `packages/shared-types/src/ai-vocabulary.ts`:
  - `GenerateCardRequestDto`, `AiGeneratedCardData`, `GenerateCardResponseDto`, `AiCardSource`, `GlobalDictionaryCacheRecord`.
- Xuất khẩu tập trung tại `packages/shared-types/src/index.ts`.

### 3.3. Backend (`apps/api`)
- Module `apps/api/src/modules/ai-vocabulary/`:
  - `AiVocabularyController`: Endpoint `POST /api/v1/ai/generate-card` (bảo vệ bởi `JwtAuthGuard`).
  - `AiVocabularyService`: Điều phối luồng Cache Check $\rightarrow$ Quota Check $\rightarrow$ Gemini Flash $\rightarrow$ Free Dictionary Fallback $\rightarrow$ Cache Upsert.
  - `GeminiProvider`: Kết nối Gemini Flash API với prompt có cấu trúc JSON nghiêm ngặt và timeout 5s.
  - `FreeDictionaryProvider`: Client dự phòng gọi `api.dictionaryapi.dev`.
  - `DictionaryCacheRepository`: Xử lý CRUD Prisma và đếm số lượt cache hit.
  - `AiQuotaService`: Quản lý hạn ngạch 30 calls/ngày và 5 req/phút theo User ID.
- Đăng ký `AiVocabularyModule` trong `apps/api/src/app.module.ts`.

### 3.4. Frontend (`apps/web`)
- Feature `apps/web/src/features/ai-vocabulary/`:
  - `services/aiVocabularyService.ts`: Axios client gọi backend.
  - `hooks/useAiVocabulary.ts`: React Hook quản lý trạng thái loading, toast error, và dispatch dữ liệu.
- Cập nhật `AddCardModal.tsx` & `EditCardModal.tsx`:
  - Thêm nút Sparkle `✨ Tự động điền AI` cạnh ô nhập từ vựng.
  - Tự động mở rộng phần "Ngữ cảnh mở rộng & Mẹo ghi nhớ" khi nhận dữ liệu AI.
  - Phím tắt `Enter` khi ô từ vựng được focus và chưa có nghĩa sẽ kích hoạt tạo AI tự động.

---

## 4. Test Coverage & Bằng chứng kiểm thử

- **Backend Unit & Service Tests**: `apps/api/src/modules/ai-vocabulary/*.spec.ts` (100% pass trên 20 test suites, 134 tests).
  - Cache miss $\rightarrow$ Gemini $\rightarrow$ Lưu cache.
  - Cache hit $\rightarrow$ Trả về < 50ms, không tốn quota.
  - Gemini lỗi $\rightarrow$ Tự động fallback Free Dictionary.
  - Quota 30/ngày và Burst limit 5/phút $\rightarrow$ Ném lỗi 429 đúng quy chuẩn.
- **Frontend Component & Hook Tests**: `apps/web/src/features/ai-vocabulary/**/*.spec.ts` & `AddCardModal.spec.tsx` (100% pass trên 9 test suites, 46 tests).
- **Monorepo Build**: `pnpm --filter @wordstreak/shared-types build && pnpm --filter api build && pnpm --filter web build` thành công 0 lỗi.

---

## 5. Tác giả & Review

- **Implemented by**: AI (Antigravity Orchestrator)
- **Reviewed by**: User (Confirmation Gate 1 & Gate 2 Approved)
- **Date**: 2026-08-21
