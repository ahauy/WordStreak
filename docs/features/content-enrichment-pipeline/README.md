# Feature: Pipeline nạp và làm giàu nội dung — Content Enrichment Pipeline (US-LIB-01)

**Slug**: `content-enrichment-pipeline`  
**Version**: 1.1 Verified  
**Ship date**: 2026-10-15  
**Spec**: [.specify/features/content-enrichment-pipeline/spec.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/content-enrichment-pipeline/spec.md)  
**Baseline**: [SIGNED-OFF v1.0](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/content-enrichment-pipeline/baseline.md)  
**Plan**: [plan.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/content-enrichment-pipeline/plan.md)  
**Test Plan**: [test-plan.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/content-enrichment-pipeline/test-plan.md)  
**Review Report**: [review-report.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/content-enrichment-pipeline/review-report.md)  
**User Story**: `US-LIB-01` (EPIC-13: Vocabulary Starter Library & Content Strategy — TSL/NGSL)

---

## 1. Explanation: Mục đích & Giá trị Nghiệp vụ (Purpose & Business Value)

### 1.1. Bối cảnh & Thách thức Khởi đầu (Context & Problem Statement)

Một trong những rào cản lớn nhất dẫn đến tỷ lệ rời bỏ (churn rate) cao của người học mới trên các ứng dụng Spaced Repetition (SRS) là **vấn đề "ứng dụng trống" (Empty State Problem)**. Khi mới đăng ký tài khoản, người dùng buộc phải tự tạo bộ thẻ, tự gõ từng từ vựng, tự tra cứu phiên âm hoặc tìm ví dụ. Quá trình này tạo ra ma sát cực lớn và làm triệt tiêu động lực học tập ngay trong phiên đầu tiên.

Để mang lại giá trị tức thì (Time-to-Value < 60s) và chuẩn bị cho kho bài học chính thức (*Official Library* thuộc `US-LIB-02`), WordStreak cần nạp toàn bộ hai danh mục từ vựng chuẩn hóa khoa học được cấp phép Creative Commons (CC BY-SA 4.0) của các tác giả Browne, Culligan & Phillips:
1. **TSL 1.2 (TOEIC Service List)**: ~1.200 từ vựng kinh doanh chuyên sâu, đạt độ phủ tới ~98.5% bài thi TOEIC.
2. **NGSL 1.2 (New General Service List)**: ~2.800 từ vựng giao tiếp tổng quát, nền tảng cốt lõi cho mọi người học tiếng Anh.

### 1.2. Thách thức Kỹ thuật khi Nạp Dữ liệu Quy mô lớn

Nếu thực hiện nạp dữ liệu và làm giàu từ vựng bằng cách gọi AI trực tiếp đơn lẻ trên từng thẻ (runtime on-demand):
- **Chi phí & Độ trễ**: 1.200 từ $\times$ 1 request tốn kém chi phí token rất lớn do lặp lại hệ thống prompt (system prompt overhead) và mất hàng giờ xử lý.
- **Tắc nghẽn & Gián đoạn**: Nguy cơ cao gặp lỗi giới hạn tần suất HTTP 429 (`Rate Limit Exceeded`). Khi tiến trình Node.js bị ngắt, toàn bộ tiến độ sẽ mất nếu không có cơ chế lưu trữ bền bỉ trung gian.
- **Ảo giác AI (Hallucination)**: LLM có thể trả về phiên âm IPA thiếu dấu gạch chéo, ví dụ câu không chứa từ mục tiêu, hoặc nghĩa tiếng Việt dịch máy thô cứng.
- **Rủi ro tính toàn vẹn (Data Integrity)**: Việc ghi đồng thời vào cơ sở dữ liệu production mà không qua kiểm định luật có thể làm ô nhiễm từ điển chung.

### 1.3. Giải pháp: Kiến trúc Pipeline Độc lập 7 Giai đoạn

Tính năng **Content Enrichment Pipeline (`US-LIB-01`)** cung cấp một hệ thống CLI script chuyên dụng đặt tại [`scripts/seed/`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/), hoạt động theo mô hình xử lý theo lô (batch-driven ETL) với 7 giai đoạn tách biệt.

Hệ thống triển khai mô hình xuất bản lai (**Hybrid Publishing Model - `ASM-LIB-001`**):
1. **Database Persistence**: Upsert các bản ghi từ vựng vào bảng [`GlobalDictionaryCache`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/07-publish.ts) của PostgreSQL với `source = 'TSL_OFFICIAL'`.
2. **Standard File Artifact**: Đóng gói toàn bộ bộ từ và thẻ học vào artifact JSON [`starter-library-decks.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/data/output/starter-library-decks.json) sẵn sàng làm nguồn dữ liệu nạp trực tiếp cho `US-LIB-02` (Official Decks & Cards).

---

## 2. Explanation: Kiến trúc Kỹ thuật & Luồng Dữ liệu (Architecture & Data Flow)

### 2.1. Sơ đồ Kiến trúc Pipeline (Architecture Diagram)

```mermaid
flowchart TD
    subgraph RawData ["1. Dữ liệu Nguồn (Raw Data)"]
        CSV_TSL["TSL 1.2 CSV<br/>(scripts/seed/data/raw/tsl-1.2.csv)"]
        CSV_NGSL["NGSL 1.2 CSV<br/>(scripts/seed/data/raw/ngsl-1.2.csv)"]
    end

    subgraph PipelineEngine ["WordStreak Seeding Engine (scripts/seed/)"]
        S1["Stage 1: Ingestion<br/>01-import.ts"]
        S2["Stage 2: Normalize & Tier<br/>02-normalize.ts"]
        S3["Stage 3: Gemini Batch Enrich<br/>03-enrich.ts"]
        S4["Stage 4: Validation Engine<br/>04-validate.ts"]
        S5A["Stage 5: Review Export<br/>05-review-export.ts"]
        S5B["Stage 5: Review Import<br/>05-review-import.ts"]
        S6["Stage 6: Deck Builder<br/>06-build-decks.ts"]
        S7["Stage 7: Dual Publisher<br/>07-publish.ts"]
    end

    subgraph ResilientStorage ["Cơ chế Bền bỉ & Checkpoint (scripts/seed/data/stages/)"]
        CP1[("01-raw-entries.json")]
        CP2[("02-normalized.json")]
        CP3[("03-enrichment-checkpoint.json")]
        CP4[("04-validation-report.json")]
        CSV_REV[("tsl-review-pending.csv")]
        CP5[("05-reviewed-checkpoint.json")]
        CP6[("06-built-decks.json")]
    end

    subgraph ExternalServices ["Dịch vụ Bên ngoài"]
        GeminiAPI["Google Gemini Flash API<br/>(x-goog-api-key, temp=0.2)"]
        Curator["Biên tập viên / Curator<br/>(Excel / Google Sheets)"]
    end

    subgraph Destinations ["Đích Xuất bản (Dual Channels)"]
        PostgresDB[("PostgreSQL Database<br/>GlobalDictionaryCache")]
        JsonArtifact[("starter-library-decks.json<br/>(scripts/seed/data/output/)")]
    end

    CSV_TSL & CSV_NGSL --> S1
    S1 --> CP1
    CP1 --> S2
    S2 --> CP2
    CP2 --> S3
    S3 <-->|Batch 10 words + Jitter Retry| GeminiAPI
    S3 --> CP3
    CP3 --> S4
    S4 --> CP4
    CP4 -->|"Has Flagged Words"| S5A
    S5A --> CSV_REV
    CSV_REV --> Curator
    Curator -->|Sửa & Duyệt| CSV_REV
    CSV_REV --> S5B
    S5B --> CP5
    CP5 --> S6
    CP4 -->|"100% Passed"| S6
    S6 --> CP6
    CP6 --> S7
    S7 --> PostgresDB
    S7 --> JsonArtifact
```

### 2.2. Cỗ máy Trạng thái Dữ liệu (Pipeline State Machine)

Mỗi từ vựng được quản lý trạng thái chặt chẽ từ khi là dòng thô cho đến khi được xuất bản:

```mermaid
stateDiagram-v2
    [*] --> RAW: 01-import.ts (Đọc CSV)
    RAW --> NORMALIZED: 02-normalize.ts (POS, T1/T2/T3, Dedupe)
    NORMALIZED --> PENDING_ENRICHMENT: 03-enrich.ts (Tạo checkpoint)
    
    state Stage3_Resilience {
        PENDING_ENRICHMENT --> CheckpointChecked: Kiểm tra disk checkpoint
        CheckpointChecked --> LLMBatchCall: Chưa có trong checkpoint
        LLMBatchCall --> RetryJitter: HTTP 429 / Network timeout
        RetryJitter --> LLMBatchCall: Retry <= 5
        LLMBatchCall --> AtomicSave: Nhận batch 10 từ
    }
    
    AtomicSave --> VALIDATING: 04-validate.ts
    VALIDATING --> APPROVED_CANDIDATE: 100% Luật hợp lệ (IPA, Lemma, Collocations)
    VALIDATING --> FLAGGED: Vi phạm luật (Sai IPA, Thiếu Lemma)
    
    FLAGGED --> CURATOR_REVIEW: 05-review-export.ts (Xuất CSV)
    CURATOR_REVIEW --> APPROVED: 05-review-import.ts (Biên tập viên sửa & duyệt)
    CURATOR_REVIEW --> REJECTED: Biên tập viên loại bỏ
    
    APPROVED_CANDIDATE --> DECK_PACKAGED: 06-build-decks.ts (Cắt 25 từ/deck)
    APPROVED --> DECK_PACKAGED: 06-build-decks.ts
    
    DECK_PACKAGED --> PUBLISHED: 07-publish.ts (Upsert DB + JSON Output)
    PUBLISHED --> [*]
```

### 2.3. Sơ đồ Tuần tự Xử lý Lô & Tự phục hồi (Batch Enrichment & Resilience Sequence)

```mermaid
sequenceDiagram
    autonumber
    actor Runner as CLI Operator / Runner
    participant S3 as 03-enrich.ts
    participant Disk as Checkpoint Disk (POSIX)
    participant Client as gemini-batch-client.ts
    participant Gemini as Google Gemini Flash API

    Runner->>S3: tsx scripts/seed/03-enrich.ts
    S3->>Disk: Đọc 03-enrichment-checkpoint.json (nếu có)
    Disk-->>S3: Danh sách từ đã enrich trước đó (đã lưu)
    S3->>S3: Lọc lấy các từ PENDING chưa enrich
    loop Cho từng nhóm 10 từ (Batch = 10)
        S3->>Client: callGeminiBatchWithRetry(10 words)
        Client->>Gemini: POST /models/gemini-2.5-flash:generateContent
        alt Lỗi HTTP 429 hoặc Lỗi Mạng
            Gemini-->>Client: HTTP 429 / TypeError: fetch failed
            Client->>Client: Tính Delay = 1000 * 2^attempt + random(0, 500) ms
            Client->>Client: Sleep(Delay) và thử lại (tối đa 5 lần)
            Client->>Gemini: Retry POST request
            Gemini-->>Client: HTTP 200 OK + JSON Array [10 items]
        else Thành công ngay lần đầu
            Gemini-->>Client: HTTP 200 OK + JSON Array [10 items]
        end
        Client-->>S3: parseGeminiJsonResponse (10 EnrichedWordEntries)
        S3->>Disk: atomicWriteJson (Ghi .tmp -> Rename đè checkpoint)
        Disk-->>S3: Ghi thành công nguyên tử
    end
    S3-->>Runner: Hoàn tất Stage 3 (100% từ đã enrich an toàn)
```

---

## 3. Reference: Chi tiết 7 Giai đoạn Pipeline (Pipeline Stages Breakdown)

| Giai đoạn | Script Thực thi | Tệp Đầu vào | Tệp Đầu ra | Mục tiêu & Logic cốt lõi |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1: Import** | [`01-import.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/01-import.ts) | `tsl-1.2.csv`, `ngsl-1.2.csv` | `01-raw-entries.json` | Phân tích file CSV với cơ chế nhận diện tiêu đề linh hoạt (`freqRank`/`rank`, `pos`/`partofspeech`). |
| **Stage 2: Normalize** | [`02-normalize.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/02-normalize.ts) | `01-raw-entries.json` | `02-normalized.json` | Khử trùng lặp chéo TSL/NGSL (`BR-LIB-002`), chuẩn hóa POS (`BR-LIB-003`), phân tầng T1/T2/T3 (`BR-LIB-004`) và gán 10 chủ đề TOEIC. |
| **Stage 3: Enrich** | [`03-enrich.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/03-enrich.ts) | `02-normalized.json` | `03-enrichment-checkpoint.json` | Gọi Gemini Flash theo batch 10 từ/lô (`BR-LIB-007`), kiểm soát rate limit backoff jitter, checkpoint từng batch. |
| **Stage 4: Validate** | [`04-validate.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/04-validate.ts) | `03-enrichment-checkpoint.json` | `04-validation-report.json` | Kiểm định luật: IPA regex `/^\/[^\/]+\/$/`, lemma xuất hiện trong câu ví dụ, collocations $\ge 2$, gán `APPROVED_CANDIDATE` hoặc `FLAGGED`. |
| **Stage 5A: Review Export** | [`05-review-export.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/05-review-export.ts) | `03-enrichment-checkpoint.json` | `tsl-review-pending.csv` | Lọc các từ bị `FLAGGED` và xuất CSV tiêu chuẩn để biên tập viên kiểm tra thủ công. |
| **Stage 5B: Review Import** | [`05-review-import.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/05-review-import.ts) | `tsl-review-pending.csv` | `05-reviewed-checkpoint.json` | Đọc file CSV đã duyệt bởi curator, cập nhật phiên âm/nghĩa/ví dụ và chuyển trạng thái sang `APPROVED`. |
| **Stage 6: Build Decks** | [`06-build-decks.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/06-build-decks.ts) | `03-enrichment-checkpoint.json` / `05-reviewed-checkpoint.json` | `06-built-decks.json` | Gom nhóm theo `listCode::level::topicCategory`, cắt đúng 25 từ/deck (`BR-LIB-005`), sinh slug chuẩn SEO và tiêu đề song ngữ Anh - Việt. |
| **Stage 7: Publish** | [`07-publish.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/07-publish.ts) | `06-built-decks.json` | `GlobalDictionaryCache` (DB) + `starter-library-decks.json` (Disk) | Upsert vào DB không đè bản ghi `MANUAL_CURATED` (`BR-LIB-008`), ghi artifact cuối cùng ra thư mục `scripts/seed/data/output/`. |

---

## 4. How-To: Hướng dẫn Sử dụng CLI & Vận hành (CLI Commands & Pipeline Usage)

### 4.1. Biến Môi trường Cần thiết (Environment Variables)

Trước khi chạy pipeline, cấu hình các biến môi trường trong file `.env` tại thư mục gốc dự án:

```bash
# Bắt buộc cho Stage 3 (Enrichment)
GEMINI_API_KEY="your-gemini-api-key-here"

# Tùy chọn cho Stage 7 (Nếu muốn upsert vào PostgreSQL thật)
# Nếu không cấu hình, Stage 7 tự động bỏ qua DB upsert và chỉ xuất file JSON artifact
DATABASE_URL="postgresql://postgres:password@localhost:5432/wordstreak_db?schema=public"
```

### 4.2. Chạy Toàn bộ Pipeline Bằng Một Lệnh

Lệnh chính chạy trọn gói từ Stage 1 đến Stage 7:

```bash
pnpm seed:pipeline
```

Tệp điều phối [`run-pipeline.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/run-pipeline.ts) sẽ lần lượt:
1. Nạp CSV thô.
2. Chuẩn hóa & phân tầng.
3. Làm giàu ngữ cảnh qua Gemini.
4. Kiểm định chất lượng.
5. Nếu phát hiện từ bị `FLAGGED`, tự động xuất `tsl-review-pending.csv`. Nếu 100% hợp lệ, tự động tiếp tục.
6. Đóng gói các deck 25 từ.
7. Xuất bản vào DB và ghi file `starter-library-decks.json`.

### 4.3. Chạy Từng Giai đoạn Độc lập (Stage-by-Stage Execution)

Nhờ cơ chế lưu checkpoint trung gian ra đĩa, mỗi giai đoạn có thể được chạy hoặc chạy lại riêng lẻ bằng `tsx`:

```bash
# Stage 1: Ingest CSV nguồn
npx tsx scripts/seed/01-import.ts

# Stage 2: Chuẩn hóa, POS và Tiers
npx tsx scripts/seed/02-normalize.ts

# Stage 3: Làm giàu ngữ cảnh bằng LLM (hỗ trợ ngắt/chạy lại không mất tiến độ)
npx tsx scripts/seed/03-enrich.ts

# Stage 4: Kiểm tra luật và xuất báo cáo validation
npx tsx scripts/seed/04-validate.ts

# Stage 5A: Xuất file CSV cho Curator duyệt thủ công (khi có từ FLAGGED)
npx tsx scripts/seed/05-review-export.ts

# Stage 5B: Nạp lại file CSV sau khi Curator đã chỉnh sửa
npx tsx scripts/seed/05-review-import.ts

# Stage 6: Đóng gói các bộ thẻ 25 từ với SEO slug
npx tsx scripts/seed/06-build-decks.ts

# Stage 7: Xuất bản vào GlobalDictionaryCache & ghi file starter-library-decks.json
npx tsx scripts/seed/07-publish.ts
```

### 4.4. Quy trình Biên tập & Duyệt Hai Chiều (Curator Review Workflow)

Khi Stage 4 phát hiện các từ không thỏa mãn 100% tiêu chí tự động:
1. Chạy `npx tsx scripts/seed/05-review-export.ts` để tạo file `scripts/seed/data/stages/tsl-review-pending.csv`.
2. Mở file CSV trên Microsoft Excel, Apple Numbers hoặc Google Sheets.
3. Chỉnh sửa cột `phonetic` (bổ sung dấu `/.../`), `meaningVi` (nếu cần tự nhiên hơn), hoặc `exampleSentence`.
4. Đổi giá trị cột `status` từ `FLAGGED` thành `APPROVED`.
5. Lưu file CSV với định dạng UTF-8.
6. Chạy `npx tsx scripts/seed/05-review-import.ts` để nạp dữ liệu đã duyệt vào checkpoint.
7. Tiếp tục chạy Stage 6 và Stage 7.

---

## 5. Explanation: Kỹ thuật Bền bỉ & Khả năng Chịu lỗi (Resilience Engineering)

### 5.1. Cơ chế Checkpoint Lũy tiến (Progressive Checkpoint Persistence)

- Tệp lưu trữ: `scripts/seed/data/stages/03-enrichment-checkpoint.json`.
- Khi Stage 3 khởi động, script kiểm tra tệp checkpoint trên đĩa. Nếu đã có $N$ từ được làm giàu thành công từ các phiên trước, script nạp danh sách này vào bộ nhớ và loại bỏ chúng khỏi hàng đợi.
- Sau mỗi lô 10 từ hoàn thành, toàn bộ mảng dữ liệu được lưu tức thì xuống đĩa.
- **Lợi ích**: Nếu người vận hành bấm `Ctrl + C` hoặc tiến trình bị crash giữa chừng, toàn bộ chi phí token và thời gian đã thực hiện trước đó được bảo toàn 100%. Khi chạy lại lệnh, pipeline chỉ tiếp tục xử lý các từ còn thiếu.

### 5.2. Chống Tắc nghẽn Tần suất: Exponential Backoff với Random Jitter

Khi gọi API của Google Gemini, lỗi `HTTP 429 Too Many Requests` có thể xảy ra khi vượt quá quota RPM/TPM. Để bảo vệ pipeline, module [`gemini-batch-client.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/lib/gemini-batch-client.ts) áp dụng công thức:

$$\text{Delay} = \text{BaseDelayMs} \times 2^{\text{retryCount}} + \text{random}(0, \text{jitterMaxMs})$$

Trong đó:
- `BaseDelayMs` = $1000\text{ ms}$ (1 giây)
- `jitterMaxMs` = $500\text{ ms}$
- `maxRetries` = 5 lần

Bảng chu kỳ chờ tự phục hồi:
- **Lần 1**: $1.000\text{ms} + [0..500\text{ms}] = 1.000 - 1.500\text{ms}$
- **Lần 2**: $2.000\text{ms} + [0..500\text{ms}] = 2.000 - 2.500\text{ms}$
- **Lần 3**: $4.000\text{ms} + [0..500\text{ms}] = 4.000 - 4.500\text{ms}$
- **Lần 4**: $8.000\text{ms} + [0..500\text{ms}] = 8.000 - 8.500\text{ms}$
- **Lần 5**: $16.000\text{ms} + [0..500\text{ms}] = 16.000 - 16.500\text{ms}$

> [!NOTE]
> Module xử lý toàn diện cả lỗi mạng cấp hệ thống của Node.js 18+ native fetch (`TypeError: fetch failed`, `ETIMEDOUT`, `ECONNRESET`, `ENOTFOUND`), đảm bảo không bị crash khi rớt mạng tạm thời.

### 5.3. Ghi Tệp Nguyên tử POSIX (Atomic File Writes)

Để ngăn chặn triệt để nguy cơ tệp JSON bị hỏng dở dang (`corrupted JSON`) khi hệ thống mất điện hoặc tiến trình bị ngắt đột ngột:
- Hàm [`atomicWriteFile`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/lib/file-utils.ts) ghi nội dung vào một tệp tạm thời ẩn nằm cùng thư mục: `.${filename}.${uuid}.tmp`.
- Sau khi quá trình ghi đĩa hoàn tất và buffer được xả, lệnh `fs.rename` được gọi để hoán đổi tệp tạm thời thành tệp chính thức.
- Vì tệp tạm và tệp đích nằm trên cùng một filesystem mount, thao tác `rename` là nguyên tử (atomic) ở cấp hệ điều hành POSIX. Tệp dữ liệu chính thức luôn ở trạng thái toàn vẹn 100%.

---

## 6. Reference: Hợp đồng Dữ liệu & Cấu trúc Artifacts (Data Contracts)

### 6.1. Hợp đồng Dữ liệu Giữa các Giai đoạn

#### 1. `RawWordEntry` (Stage 1)
```typescript
export interface RawWordEntry {
  headword: string;
  pos: string;
  freqRank: number;
  freqValue: number;
  listCode: 'TSL' | 'NGSL';
}
```

#### 2. `NormalizedWordEntry` (Stage 2)
```typescript
export interface NormalizedWordEntry {
  idempotencyKey: string;      // Định dạng: `${listCode}:${headword}:${pos}` (e.g. "TSL:accommodate:verb")
  word: string;                // Chữ thường, bỏ khoảng trắng
  partOfSpeech: CanonicalPOS;  // 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'phrase'
  freqRank: number;            // Thứ hạng tần suất gốc
  level: 'T1' | 'T2' | 'T3';   // T1 (1-400), T2 (401-800), T3 (801-1200+)
  topicCategory: string;       // 1 trong 10 chủ đề TOEIC
  crossListRef?: string;       // Ghi nhận "NGSL" nếu từ xuất hiện ở cả 2 danh sách
}
```

#### 3. `EnrichedWordEntry` (Stage 3 & 4)
```typescript
export interface EnrichedWordEntry extends NormalizedWordEntry {
  phonetic: string;            // Phiên âm IPA kẹp giữa dấu gạch chéo, e.g. "/əˈkɑː.mə.deɪt/"
  meaningVi: string;           // Nghĩa tiếng Việt tự nhiên
  meaningEn: string;           // Định nghĩa tiếng Anh súc tích
  exampleSentence: string;     // Câu ví dụ ngữ cảnh có chứa từ hoặc dạng chia biến thể (lemma)
  exampleTranslation: string;  // Dịch nghĩa câu ví dụ sang tiếng Việt
  collocations: string[];      // Danh sách tối thiểu 2 cụm từ hay đi kèm
  mnemonic: string;            // Mẹo nhớ trực quan cho người học Việt Nam
  audioUrl?: string | null;    // URL file âm thanh (nếu có)
  status?: 'PENDING' | 'APPROVED' | 'APPROVED_CANDIDATE' | 'FLAGGED' | 'REJECTED';
  validationErrors?: string[]; // Danh sách lỗi vi phạm (nếu bị FLAGGED)
  curatorNotes?: string;       // Ghi chú của biên tập viên
}
```

#### 4. `BuiltDeck` & `BuiltCard` (Stage 6)
```typescript
export interface BuiltCard {
  word: string;
  partOfSpeech: string;
  phonetic: string;
  meaningVi: string;
  meaningEn: string;
  exampleSentence: string;
  exampleTranslation: string;
  collocations: string[];
  mnemonic: string;
  audioUrl?: string | null;
}

export interface BuiltDeck {
  slug: string;                // Định dạng SEO: `tsl-t1-office-communication-01`
  titleEn: string;             // Tiêu đề tiếng Anh, e.g. "Office Communication 01"
  titleVi: string;             // Tiêu đề tiếng Việt, e.g. "Giao tiếp Văn phòng 01"
  topicCategory: string;       // Chủ đề
  level: 'T1' | 'T2' | 'T3';   // Phân cấp trình độ
  listCode: string;            // TSL / NGSL
  cards: BuiltCard[];          // Cố định đúng 25 thẻ/deck
}
```

### 6.2. Cấu trúc Tệp Artifact Xuất bản: `starter-library-decks.json`

Được ghi tại `scripts/seed/data/output/starter-library-decks.json`:

```json
{
  "version": "1.0.0",
  "generatedAt": "2026-10-15T09:30:00.000Z",
  "totalDecks": 8,
  "totalCards": 200,
  "decks": [
    {
      "slug": "tsl-t1-office-administration-01",
      "titleEn": "Office Communication 01",
      "titleVi": "Giao tiếp Văn phòng 01",
      "topicCategory": "Office & Administration",
      "level": "T1",
      "listCode": "TSL",
      "cards": [
        {
          "word": "accommodate",
          "partOfSpeech": "verb",
          "phonetic": "/əˈkɑː.mə.deɪt/",
          "meaningVi": "cung cấp chỗ ở, đáp ứng nhu cầu",
          "meaningEn": "to provide with a place to live or to be stored in; to consider and satisfy a need",
          "exampleSentence": "The hotel can easily accommodate up to five hundred guests for the corporate conference.",
          "exampleTranslation": "Khách sạn có thể dễ dàng đáp ứng chỗ ở cho tối đa năm trăm khách tham dự hội nghị doanh nghiệp.",
          "collocations": ["accommodate guests", "accommodate needs", "accommodate requests"],
          "mnemonic": "Từ 'accommodate' có 2 chữ 'c' và 2 chữ 'm' – giống như một căn phòng đủ rộng cho cả 2 cặp đôi lưu trú."
        }
      ]
    }
  ]
}
```

### 6.3. Mô hình Bảng PostgreSQL: `GlobalDictionaryCache`

Bảng lưu trữ từ điển tập trung trong cơ sở dữ liệu WordStreak:

```prisma
model GlobalDictionaryCache {
  id                 String   @id @default(uuid())
  word               String   @unique
  partOfSpeech       String?
  phonetic           String?
  meaningVi          String?
  meaningEn          String?
  exampleSentence    String?
  exampleTranslation String?
  collocations       String?  // JSON chuỗi hóa danh sách collocations
  mnemonic           String?
  audioUrl           String?
  source             String   @default("TSL_OFFICIAL") // 'TSL_OFFICIAL' | 'MANUAL_CURATED' | 'AI_GENERATED'
  hitCount           Int      @default(1)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([word])
  @@map("global_dictionary_cache")
}
```

> [!IMPORTANT]
> **Quy tắc bảo vệ dữ liệu biên tập (`BR-LIB-008`)**: Stage 7 thực hiện truy vấn `findUnique` trước khi `upsert`. Nếu từ vựng đã tồn tại và có `source === 'MANUAL_CURATED'`, pipeline sẽ bỏ qua bản ghi này để bảo vệ các chỉnh sửa thủ công đã được kiểm duyệt nghiêm ngặt của đội ngũ quản trị.

---

## 7. How-To & Reference: Kiểm thử & Đảm bảo Chất lượng (Testing & Verification)

### 7.1. Ma trận Kiểm thử Tự động (Test Cases Coverage)

Bộ kiểm thử được tổ chức tại [`scripts/seed/__tests__/`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/) với 8 bộ kiểm thử và 27 ca kiểm thử chuyên sâu:

| Mã Kiểm thử | Bộ Kiểm thử (Spec File) | Mô tả & Điều kiện Nghiệm thu | Trạng thái |
| :--- | :--- | :--- | :---: |
| **TC-LIB-001** | [`import.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/import.spec.ts) | Trích xuất chuẩn xác `freqRank`, `freqValue`, tiêu đề linh hoạt từ tệp CSV | ✅ PASS (3/3) |
| **TC-LIB-002** | [`normalizer.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/normalizer.spec.ts) | Sinh `idempotencyKey` và chuẩn hóa POS viết tắt thành từ đầy đủ | ✅ PASS (5/5) |
| **TC-LIB-003** | [`normalizer.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/normalizer.spec.ts) | Khử trùng lặp chéo giữa NGSL và TSL, ưu tiên TSL và lưu `crossListRef` | ✅ PASS |
| **TC-LIB-004** | [`normalizer.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/normalizer.spec.ts) | Phân tầng chính xác T1 (1–400), T2 (401–800), T3 (801+) | ✅ PASS |
| **TC-LIB-005** | [`gemini-batch.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/gemini-batch.spec.ts) | Kiểm tra lũy thừa Exponential Backoff kèm Random Jitter khi gặp HTTP 429 và mạng gián đoạn | ✅ PASS (4/4) |
| **TC-LIB-006** | [`checkpoint.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/checkpoint.spec.ts) | Khả năng tự phục hồi khi crash: tiếp tục từ checkpoint mà không gọi lại từ cũ | ✅ PASS (2/2) |
| **TC-LIB-007** | [`validator.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/validator.spec.ts) | Kiểm định IPA regex `/^\/[^\/]+\/$/` và lemma xuất hiện trong câu ví dụ | ✅ PASS (6/6) |
| **TC-LIB-008** | [`csv-sync.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/csv-sync.spec.ts) | Đồng bộ hai chiều CSV: xuất từ FLAGGED và nạp lại khi curator sửa | ✅ PASS (2/2) |
| **TC-LIB-009** | [`deck-builder.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/deck-builder.spec.ts) | Đóng gói đúng 25 từ/deck, sinh slug chuẩn SEO và tiêu đề song ngữ | ✅ PASS (3/3) |
| **TC-LIB-010** | [`publish.spec.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/__tests__/publish.spec.ts) | Upsert nguyên tử vào DB, không ghi đè `MANUAL_CURATED`, xuất artifact JSON | ✅ PASS (2/2) |

### 7.2. Lệnh Chạy Bộ Kiểm thử

```bash
# Chạy toàn bộ 27 test cases của Content Enrichment Pipeline
pnpm vitest run scripts/seed/__tests__/

# Chạy kèm chế độ theo dõi file (watch mode)
pnpm vitest scripts/seed/__tests__/
```

Kết quả nghiệm thu thực tế:
```bash
 ✓ scripts/seed/__tests__/gemini-batch.spec.ts (4 tests)
 ✓ scripts/seed/__tests__/deck-builder.spec.ts (3 tests)
 ✓ scripts/seed/__tests__/normalizer.spec.ts (5 tests)
 ✓ scripts/seed/__tests__/import.spec.ts (3 tests)
 ✓ scripts/seed/__tests__/validator.spec.ts (6 tests)
 ✓ scripts/seed/__tests__/checkpoint.spec.ts (2 tests)
 ✓ scripts/seed/__tests__/publish.spec.ts (2 tests)
 ✓ scripts/seed/__tests__/csv-sync.spec.ts (2 tests)

 Test Files  8 passed (8)
 Tests       27 passed (27)
```

---

## 8. Troubleshooting & Vận hành Sự cố (Troubleshooting & Operational Runbook)

### 8.1. Sự cố: Lỗi `GEMINI_API_KEY is not set`

- **Hiện tượng**: Chạy Stage 3 gặp lỗi hoặc trả về mock rỗng khi không có API key.
- **Khắc phục**:
  1. Lấy API key miễn phí tại Google AI Studio (`https://aistudio.google.com/`).
  2. Xuất biến môi trường:
     ```bash
     export GEMINI_API_KEY="AIzaSy..."
     ```
  3. Hoặc thêm vào tệp `.env` ở thư mục gốc và chạy lại.

### 8.2. Sự cố: Lỗi HTTP 429 Quota Exceeded liên tục

- **Hiện tượng**: Pipeline in log `[GeminiBatch] HTTP 429 Rate Limit. Retry 5/5 after 16234ms...` rồi báo lỗi vượt quá số lần retry tối đa.
- **Nguyên nhân**: Quota free-tier của Gemini Flash (15 RPM) bị vượt ngưỡng do chạy song song hoặc mạng bị nghẽn.
- **Khắc phục**:
  1. Đợi 1 phút để quota của Google reset lại.
  2. Chạy lại `npx tsx scripts/seed/03-enrich.ts`. Nhờ cơ chế checkpoint, script sẽ tự động bỏ qua toàn bộ các từ đã hoàn thành trước đó và chỉ tiếp tục xử lý các từ còn lại.

### 8.3. Sự cố: Tệp CSV Duyệt Bị Lỗi Font Tiếng Việt trên Windows Excel

- **Hiện tượng**: Mở file `tsl-review-pending.csv` trên Excel phiên bản cũ bị lỗi font hiển thị tiếng Việt (`nghĩa tiếng Việt`).
- **Khắc phục**:
  1. Khi mở bằng Excel: chọn thẻ **Data** $\to$ **From Text/CSV** $\to$ Chọn Encoding **UTF-8**.
  2. Hoặc mở và chỉnh sửa trực tiếp bằng Google Sheets (hỗ trợ UTF-8 mặc định).
  3. Đảm bảo khi lưu lại chọn định dạng **CSV UTF-8 (Comma delimited) (*.csv)**.

### 8.4. Vận hành Chế độ Dry-Run Không Cần Database

Nếu đang chạy trên máy phát triển cá nhân mà chưa khởi động PostgreSQL:
- Stage 7 được thiết kế an toàn: Khi không phát hiện biến môi trường `DATABASE_URL`, script sẽ tự động ghi log cảnh báo:
  ```text
  [Stage 7] Notice: DATABASE_URL is not set. Skipping DB upsert.
  ```
- Toàn bộ dữ liệu vẫn được đóng gói hoàn hảo ra tệp JSON artifact [`starter-library-decks.json`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/scripts/seed/data/output/starter-library-decks.json) với đầy đủ siêu dữ liệu và cấu trúc thẻ học.

---

## 9. Tác giả & Ký duyệt Nghiệm thu (Author & Sign-off)

- **Feature ID**: `US-LIB-01`
- **Lead Implementer**: AI Engineer (Antigravity)
- **DoD Auditor & Reviewer**: Adversarial Senior Code Reviewer & DoD Auditor
- **Audit Verdict**: **APPROVED (100% Tests Pass, Zero Critical/High Bugs, Full DoD Compliance)**
- **Sign-off Date**: 2026-10-15
- **Next Milestone**: Sẵn sàng tích hợp cho **US-LIB-02** (Mô hình Dữ liệu Official & Thư viện Từ vựng).
