# 📚 WordStreak — Kế hoạch Bộ từ vựng có sẵn (Starter Library) · Trọng tâm: TSL

> **Mục đích:** Biến bộ từ có sẵn thành "cửa vào" của WordStreak: người dùng mở app là có ngay thứ để học, rồi mới khám phá SRS, quiz, extension, streak.
> Tài liệu bổ sung cho `PRODUCT_BACKLOG_ROADMAP.md` và `WORDSTREAK_UPGRADE_IDEAS.md`. Phần **TSL (TOEIC Service List)** được đào sâu nhất (mục 3); các bộ khác (NGSL, NAWL, BSL, NGSL-S) có kế hoạch ngắn hơn (mục 9) nhưng vẫn dùng chung pipeline.
>
> **Ký hiệu:** `[ ]` chưa làm · `[/]` đang làm · `[x]` xong · `[!]` cần quyết định/kiểm tra · `[~]` dài hạn.

---

## 0. Tóm tắt nhanh

- **Luận điểm:** nội dung có sẵn là điểm thu hút chính. Người học muốn có ngay một kho từ phong phú, sau đó mới tìm hiểu thêm các chức năng khác.
- **Chiến lược:** "hẹp mà sâu" cho TOEIC trước. Lộ trình **NGSL (nền tảng) → TSL (từ vựng TOEIC)**, làm thật kỹ thẻ, quiz và trải nghiệm, rồi mở rộng sang IELTS (NAWL), Business (BSL), Speaking (NGSL-S).
- **Vì sao TSL:** danh sách ngắn (khoảng 1.200 từ), mục tiêu rõ (thi TOEIC), nhu cầu lớn ở Việt Nam, và là phần dễ tạo khác biệt vì có thể thêm ví dụ theo ngữ cảnh công sở và quiz kiểu đề thi.
- **Điểm khác biệt so với Quizlet/Memrise:** thẻ chất lượng cao cho người Việt (nghĩa tiếng Việt đúng ngữ cảnh, ví dụ song ngữ kiểu TOEIC, từ dễ nhầm, word family), quiz giống dạng đề, ước tính độ phủ từ vựng TOEIC, tích hợp extension nhắc học.
- **Làm sớm nhất:** "TSL Top 200" + "NGSL Top 300" (duyệt tay 100%) cùng đợt deploy Sprint 8 để soft launch.
- **Chế độ cho người mất gốc (mục 6A):** thêm lối vào riêng, Chặng Khởi động (NGSL Top 300 đóng gói lại), ví dụ kiểm soát từ vựng, audio-first, learning steps và cột mốc nhỏ, vì kế hoạch ban đầu giả định người học đã có nền.

---

## 1. Nguyên tắc thiết kế

1. **Nhiều lựa chọn, ít ép buộc.** Thư viện rộng, nhưng mỗi lần người dùng chỉ thấy một deck nhỏ (20–25 từ). Không bao giờ hiển thị "1.200 từ đang chờ bạn".
2. **Chất lượng thẻ là lợi thế cạnh tranh.** Flashcard TSL/NGSL miễn phí đã có sẵn trên nhiều nền tảng, nên chỉ "có danh sách" là chưa đủ.
3. **Từ chung dùng chung, tiến độ riêng.** Thẻ Official là dữ liệu dùng chung; mỗi người chỉ có bản ghi tiến độ SM-2 và ghi chú cá nhân (xem mục 5).
4. **Ra mắt sớm một phần nhỏ nhưng chất lượng cao**, rồi mở rộng theo dữ liệu thật.
5. **Nội dung nguyên bản.** Chỉ dùng danh sách từ; mọi ví dụ, câu hỏi do mình tự viết/sinh. Không sao chép văn bản từ đề thi hoặc sách luyện thi.
6. **Không bỏ rơi người mất gốc.** Có lối vào riêng, giảm tải nhận thức, giải thích bằng tiếng Việt, đặt nghe và phát âm làm trọng tâm (mục 6A).

---

## 2. Nguồn dữ liệu

Trang chính thức duy nhất của dự án: **https://www.newgeneralservicelist.com** (có trang khác dùng cùng tên cho mục đích không liên quan, chỉ tải từ đúng domain này).
Trang tổng hợp: https://www.newgeneralservicelist.com/word-lists

| Danh sách | Quy mô | Độ phủ (theo tác giả) | Dùng cho | Ưu tiên |
| --- | --- | --- | --- | --- |
| **TSL 1.2** (TOEIC Service List) | ~1.200 từ | ~98,5% đề TOEIC mới nhất khi cộng với NGSL | Lộ trình TOEIC | **Cao nhất** |
| **NGSL 1.2** (New General Service List) | 2.809 từ | ~92% tiếng Anh thông dụng; ~94% đề TOEIC mới nhất | Nền tảng cho mọi lộ trình | **Cao nhất** |
| NAWL (New Academic Word List) | 960 từ | ~92% văn bản học thuật (cộng NGSL) | IELTS / học thuật | Trung bình |
| BSL (Business Service List) | 1.700 từ | ~97% văn bản kinh doanh (cộng NGSL) | Tiếng Anh đi làm | Thấp hơn |
| NGSL-S (Spoken) | 721 từ | ~90% tiếng Anh nói | Giao tiếp | Thấp hơn |
| NGSL-GR | mở rộng tới 5.000 từ | — | Deck nâng cao | `[~]` |

**Các file nên tải cho TSL** (trang https://newgeneralservicelist.com/toeic-service-list):

- `TSL 1.2 with basic statistics`: **có thứ hạng tần suất**, dùng để chia deck. Dữ liệu tần suất chỉ có trong file này.
- `TSL 1.2 list with definitions in easy English`: nghĩa tiếng Anh đơn giản, dùng làm tham chiếu cho `definition_en`.
- `TSL 1.2 alphabetized and lemmatized for teaching`: dạng từ gốc, tiện cho việc dedupe.

**Với NGSL:** tải bản `NGSL 1.2 with basic statistics` (có tần suất) và bản kèm định nghĩa tiếng Anh đơn giản. NGSL còn 52 từ bổ sung (thứ trong tuần, tháng, số) không có thứ hạng tần suất; xử lý riêng hoặc đưa vào deck "Basics".

> `[!]` Số lượng từ có thể lệch giữa các file/phiên bản (ví dụ file lemmatized vs headword, hoặc bản cũ 1.1). Sau khi tải, đếm lại và ghi vào `WordList.version` + `entryCount`. Các bản cũ có thể là danh sách tổng hợp bởi bên thứ ba, nên luôn dùng bản 1.2 chính thức.

---

## 3. TSL chuyên sâu

### 3.1. TSL là gì

- **TOEIC Service List (Browne & Culligan, 2016)**, phiên bản hiện hành là **1.2**.
- Xây dựng từ một corpus khoảng **1,5 triệu từ** gồm giáo trình, đề luyện và tài liệu TOEIC từ nhiều nguồn.
- **1.200 từ**, được thiết kế để dùng **cộng thêm vào NGSL**, và cùng nhau phủ khoảng **98,5%** từ trong các đề TOEIC mới nhất theo công bố của tác giả.
- Trong bản 1.2, một số từ (ví dụ candidate, conference, website) đã được chuyển từ TSL sang NGSL, nghĩa là **TSL và NGSL được thiết kế gần như không trùng nhau**. Dù vậy vẫn nên dedupe theo headword khi nạp dữ liệu.
- Giấy phép: Creative Commons (CC BY-SA 4.0 theo các trang của dự án). Xem mục 10.

### 3.2. Giới hạn cần biết (để không nói quá về sản phẩm)

1. **Độ phủ là theo corpus của tác giả** (giáo trình, đề luyện), không phải đề ETS chính thức. Trong app dùng cách nói như "danh sách từ ưu tiên cho TOEIC", không hứa "học xong là đủ điểm".
2. **TSL không đứng một mình.** Phải có NGSL trước (NGSL đã ~94% đề TOEIC; TSL bù phần còn lại). Người học yếu nền tảng nên học NGSL trước; người đã khá có thể vào thẳng TSL (qua bước lọc từ đã biết, mục 6).
3. **Danh sách chỉ có headword và tần suất**, không có nghĩa tiếng Việt, IPA, ví dụ. Toàn bộ phần này mình tự làm (mục 4).
4. **Nhiều từ có nghĩa khác nhau tùy ngữ cảnh.** Thẻ TSL nên ưu tiên nghĩa trong ngữ cảnh công sở/kinh doanh, và chỉ một nghĩa chính mỗi thẻ (thêm nghĩa phụ chỉ khi thực sự cần).
5. **TSL tối ưu cho thi, không phải cho đi làm.** Tác giả cũng phát hành BSL riêng cho tiếng Anh kinh doanh thực tế. Hai danh sách phục vụ hai mục tiêu khác nhau, không thay thế nhau.

### 3.3. Lộ trình TOEIC trong app

```
Bước 0  Kiểm tra nhanh (20 từ trải đều NGSL + TSL)  ─► gợi ý điểm bắt đầu
Bước 1  NGSL Top 1.000   "Nền tảng TOEIC"            (~33 deck x 30 từ)
Bước 2  TSL Cấp 1 (rank 1–400)     "TOEIC cốt lõi"   (16 deck x 25 từ)
Bước 3  TSL Cấp 2 (rank 401–800)   "TOEIC nâng cao"  (16 deck x 25 từ)
Bước 4  TSL Cấp 3 (rank 801–1.200) "TOEIC hoàn thiện"(16 deck x 25 từ)
Song song: NGSL 1.001–2.809 (mở rộng nền tảng), quiz kiểu Part 5, ôn SRS hằng ngày
```

- **Không khóa cứng.** Gợi ý "deck tiếp theo" nhưng cho phép nhảy cóc.
- Người đã vững NGSL có thể bấm "Vào thẳng TSL"; hệ thống đề xuất mini-test (20 từ NGSL) để xác nhận.
- **Người mất gốc:** chèn **Chặng Khởi động** (NGSL Top 300 đóng gói lại) trước Bước 1, xem mục 6A.
- **Gợi ý mềm theo kết quả kiểm tra**, không theo thứ tự cố định: TSL được thiết kế để cộng thêm vào NGSL đầy đủ, nên người mới học xong NGSL Top 1.000 vẫn có thể chưa hiểu phần lớn từ xung quanh trong câu TOEIC. Khi kết quả cho thấy nền còn yếu, hiển thị gợi ý "nên học thêm NGSL trước khi vào TSL cấp 2–3".

### 3.4. Cách chia deck TSL

**Cấp (Level) theo tần suất, rồi gom chủ đề trong từng cấp.** Mỗi cấp ~400 từ, mỗi deck ~25 từ.

Cách làm:
1. Sắp xếp 1.200 từ theo `freqRank` (từ file "with basic statistics").
2. Cắt thành 3 cấp: 1–400, 401–800, 801–1.200.
3. Dùng AI gán **một chủ đề chính** cho từng từ (danh sách chủ đề bên dưới), duyệt lại.
4. Trong mỗi cấp, gom theo chủ đề rồi cắt thành deck 25 từ. Chủ đề nhỏ gộp thành deck "Mixed".
5. Đặt tên deck: `TSL 1A · Văn phòng & Vận hành (25 từ)`.

**Danh sách chủ đề đề xuất** (do mình đề xuất, không phải phân loại chính thức của ETS hay NGSL Project; chỉnh lại sau khi nhìn dữ liệu thật):

| # | Chủ đề | Gợi ý nội dung |
| --- | --- | --- |
| 1 | Office & Operations | Văn phòng, quy trình, thiết bị văn phòng |
| 2 | Contracts, Legal & Policy | Hợp đồng, quy định, điều khoản |
| 3 | HR: Hiring, Training, Benefits | Tuyển dụng, đào tạo, phúc lợi |
| 4 | Finance, Banking & Accounting | Tài chính, ngân hàng, hóa đơn |
| 5 | Marketing, Sales & Customer Service | Quảng cáo, bán hàng, chăm sóc khách hàng |
| 6 | Manufacturing, Inventory & Shipping | Sản xuất, kho, vận chuyển |
| 7 | Travel, Hotels & Dining | Du lịch, khách sạn, nhà hàng |
| 8 | Meetings, Events & Announcements | Họp, sự kiện, thông báo |
| 9 | Technology & Equipment | Công nghệ, thiết bị, bảo trì |
| 10 | General / Mixed | Phần còn lại |

**Quy mô:** 1.200 / 25 ≈ **48 deck TSL**; NGSL Top 1.000 / 30 ≈ **33 deck**.

### 3.5. Thiết kế thẻ TSL (khác thẻ thường)

Ngoài các trường chuẩn (IPA, nghĩa, ví dụ, collocations), thẻ TSL có thêm:

| Trường | Mô tả |
| --- | --- |
| `meaning_vi` | Nghĩa tiếng Việt **ngắn, đúng ngữ cảnh công sở**, theo từ loại |
| `definition_en` | Định nghĩa tiếng Anh đơn giản (tham chiếu file "definitions in easy English") |
| `example_en` + `example_vi` | Câu ví dụ **văn phong TOEIC** (email, thông báo, quảng cáo, thông báo nội bộ, hội thoại công sở), dùng tên công ty/nhân vật hư cấu |
| `context_type` | `email` / `notice` / `ad` / `memo` / `conversation` / `announcement` |
| `word_family` | Các dạng từ (noun/verb/adj/adv), hữu ích cho dạng bài chọn dạng từ ở Part 5 |
| `confusables` | Từ dễ nhầm (nếu có), kèm ghi chú phân biệt 1 dòng |
| `collocations` | 2–3 cụm hay đi cùng |
| `topic` | Chủ đề (mục 3.4) |
| `level` | `T1` / `T2` / `T3` |
| `freqRank` | Thứ hạng tần suất trong TSL |
| `tip_vi` (tùy chọn) | Mẹo nhớ hoặc lỗi hay gặp của người Việt (phát âm, nhầm nghĩa) |
| `example_easy_en` / `example_easy_vi` | Câu ví dụ **dễ** 5–8 từ, chỉ dùng từ trong NGSL Top 500, cho Beginner Mode (mục 6A) |
| `stress_syllable` | Vị trí âm tiết nhấn, hiển thị rõ trên thẻ |
| `ending_sound_tip_vi` | Lưu ý âm cuối người Việt hay bỏ (-s/-es, -ed, phụ âm cuối) khi từ có đặc điểm đó |

> Ví dụ thẻ đầy đủ ở Phụ lục A.

### 3.6. Quiz kiểu TOEIC

Dựa trên các thẻ TSL mà người dùng đang học/đến hạn:

1. **Mini Part 5 (điền từ vào câu):** một câu có chỗ trống, 4 đáp án. Đáp án nhiễu lấy từ cùng word family (sai dạng từ) hoặc từ dễ nhầm (`confusables`). Khớp với dạng câu hỏi chọn từ/dạng từ hay gặp ở Part 5.
2. **Chọn dạng từ đúng:** từ `word_family`, câu có chỗ trống cần noun/verb/adj/adv.
3. **Paraphrase (chọn từ đồng nghĩa trong ngữ cảnh):** luyện nhận biết diễn đạt lại, vốn phổ biến ở phần đọc.
4. **Nghe và gõ từ:** tận dụng speech synthesis có sẵn.

**Yêu cầu chất lượng cho câu hỏi AI sinh:**
- Chỉ có **đúng một** đáp án hợp lý (kiểm bằng lượt gọi AI thứ hai "giải thử", loại câu mà hai lần trả lời không khớp).
- Không dùng câu trùng với đề thật hay sách luyện thi.
- Kết quả quiz **tự quy ra rating SM-2** (đúng/sai + thời gian), không bắt người dùng tự chấm.

> Ví dụ câu Part 5 ở Phụ lục B.

### 3.7. Đo "độ phủ TOEIC" (ước tính)

Một thanh tiến độ tạo động lực: *"Bạn đã nắm khoảng X% từ vựng thường gặp trong TOEIC."*

Cách tính **thô** (chỉ để tạo động lực, không phải dự đoán điểm):

```
NGSL_part = 94%  × (Σ freq các từ NGSL đã thuộc  / Σ freq toàn bộ NGSL)
TSL_part  = 4.5% × (Σ freq các từ TSL đã thuộc   / Σ freq toàn bộ TSL)
Độ phủ ước tính = NGSL_part + TSL_part      (tối đa ~98.5%)
```

Lưu ý:
- 94% (NGSL) và 98,5% (NGSL + TSL) là số công bố của tác giả; 4,5% là chênh lệch giữa hai số đó.
- **Không trộn tần suất của NGSL và TSL** vì hai danh sách đo trên corpus khác nhau; mỗi phần tính trên tần suất của chính danh sách đó.
- Gắn nhãn rõ "ước tính theo dữ liệu của NGSL Project".
- "Đã thuộc" = thẻ có `repetitions ≥ 2` hoặc interval vượt ngưỡng (ví dụ ≥ 7 ngày). `[!]` Chốt ngưỡng cùng với logic "Mastered" trong dashboard hiện có.
- Kèm dòng nhắc cạnh thanh tiến độ: từ vựng chỉ là một trụ cột; điểm cao còn cần nghe, ngữ pháp, tốc độ đọc và kỹ thuật làm bài. Tránh để người mới hiểu nhầm "đủ độ phủ là đủ điểm".

### 3.8. Kế hoạch học mẫu

| Tốc độ | NGSL Top 1.000 | TSL 1.200 | Tổng thời gian (chưa tính từ đã biết) |
| --- | --- | --- | --- |
| 10 từ mới/ngày | 100 ngày | 120 ngày | ~7 tháng |
| 20 từ mới/ngày | 50 ngày | 60 ngày | ~3,5 tháng |

Lọc từ đã biết (mục 6) sẽ rút ngắn đáng kể với người có nền. Hiển thị "ngày hoàn thành dự kiến" dựa trên số từ chưa biết còn lại và `dailyGoal`.

---

## 4. Pipeline sản xuất nội dung (dùng chung mọi danh sách)

### 4.1. Các giai đoạn

```
[1 Import] ─► [2 Normalize] ─► [3 Enrich (AI)] ─► [4 Validate] ─► [5 Review] ─► [6 Build decks] ─► [7 Publish]
 CSV/XLSX      dedupe, lemma    JSON theo schema    luật tự động    duyệt tay      cắt deck, đặt tên   upsert DB
```

- Mỗi giai đoạn đọc/ghi file JSON riêng để **chạy lại được từng bước** và có **checkpoint**.
- Mọi bước **idempotent**: upsert theo `(listCode, headword, pos)`.
- Thử nạp trên DB phụ (nhánh/branch hoặc DB thử) **trước khi nạp production**.

### 4.2. Cấu trúc thư mục đề xuất

```
scripts/seed/
  data/raw/            # file tải về từ NGSL Project (không sửa tay)
  data/stages/         # kết quả từng giai đoạn (json)
  01-import.ts         # đọc CSV/XLSX → entries
  02-normalize.ts      # chuẩn hóa, dedupe NGSL↔TSL, gán level
  03-enrich.ts         # gọi AI theo lô, ghi checkpoint
  04-validate.ts       # luật tự động, xuất báo cáo lỗi
  05-review-export.ts  # xuất CSV cho người duyệt / nhập lại kết quả duyệt
  06-build-decks.ts    # chia deck, đặt tên, đánh số
  07-publish.ts        # upsert vào DB
  prompts/             # prompt mẫu (có version)
```

### 4.3. Schema thẻ (JSON)

```json
{
  "word": "string",
  "pos": "noun | verb | adjective | adverb | ...",
  "ipa_us": "/.../",
  "meaning_vi": "string (ngắn, đúng ngữ cảnh)",
  "definition_en": "string (tiếng Anh đơn giản)",
  "example_en": "string (8–22 từ)",
  "example_vi": "string",
  "context_type": "email | notice | ad | memo | conversation | announcement",
  "collocations": ["string"],
  "word_family": ["string"],
  "confusables": [{ "word": "string", "note_vi": "string" }],
  "topic": "string",
  "tip_vi": "string | null",
  "example_easy_en": "string | null (5–8 từ, chỉ dùng từ NGSL Top 500)",
  "example_easy_vi": "string | null",
  "stress_syllable": "number | null (âm tiết nhấn, đếm từ 1)",
  "ending_sound_tip_vi": "string | null"
}
```

### 4.4. Prompt mẫu (rút gọn, đặt trong `prompts/enrich.v1.md`)

```
Bạn là biên tập viên từ điển Anh–Việt cho người học TOEIC.
Với mỗi từ trong danh sách, trả về MỘT đối tượng JSON đúng schema, không thêm chữ nào ngoài JSON.

Quy tắc:
- Chọn nghĩa phổ biến nhất trong NGỮ CẢNH CÔNG SỞ/KINH DOANH; chỉ một từ loại chính.
- meaning_vi: tiếng Việt tự nhiên, ngắn gọn (tối đa ~8 từ), không dịch từng chữ.
- example_en: 8–22 từ, văn phong email/thông báo/quảng cáo công sở, có chứa từ mục tiêu
  (hoặc dạng biến cách của nó). Dùng tên công ty/nhân vật HƯ CẤU, không dùng thương hiệu thật.
- example_vi: dịch tự nhiên, đúng nghĩa của ví dụ.
- Không sao chép câu từ sách, đề thi, hay trang web.
- example_easy_en (chỉ khi {{needs_easy}} = true): 5–8 từ, mọi từ (trừ từ mục tiêu, tên riêng, số) thuộc danh sách cho phép {{allowed_words}} (NGSL Top 500).
- stress_syllable và ending_sound_tip_vi: chỉ điền khi chắc chắn; nếu không, để null.
- Nếu không chắc về IPA, để null thay vì đoán.
- word_family: chỉ các dạng thực sự tồn tại và thông dụng.
- confusables: chỉ khi có từ dễ nhầm thật sự; nếu không thì mảng rỗng.

Danh sách từ (kèm định nghĩa tham chiếu): {{batch}}
```

- Gọi theo **lô 10 từ**, nhiệt độ thấp, kèm retry và giới hạn tốc độ; lưu checkpoint sau mỗi lô.
- Ghi lại `promptVersion` và `model` trong từng thẻ để truy vết khi cần sinh lại.

### 4.5. Luật kiểm tra tự động (`04-validate.ts`)

- Đúng schema, không trường rỗng bắt buộc.
- `example_en` **chứa từ mục tiêu hoặc biến cách** (so khớp với `word_family`/lemma), độ dài 8–22 từ.
- **Độ phủ từ vựng của ví dụ:** `example_en` của thẻ TSL có tối thiểu 95% từ (trừ tên riêng, số) thuộc NGSL + TSL, vì các nghiên cứu về đọc hiểu thường được trích dẫn là cần biết khoảng 95–98% từ trong văn bản. `example_easy_en`: mọi từ (trừ từ mục tiêu, tên riêng, số) thuộc NGSL Top 500, so khớp qua lemma. Không đạt thì gắn cờ và sinh lại tối đa 2 lần. `[!]` Ngưỡng 95% cần thử với dữ liệu thật rồi chỉnh.
- `example_vi` có dấu tiếng Việt và không còn tiếng Anh nguyên câu.
- IPA khớp định dạng `/…/`; nếu có nguồn từ điển thì so khớp, khác thì gắn cờ.
- Không trùng `example_en` giữa các thẻ; không trùng `meaning_vi` giữa hai từ khác nhau trong cùng deck mà không có ghi chú (dễ gây nhầm).
- Không chứa tên thương hiệu/người thật phổ biến, không từ nhạy cảm.
- Gắn cờ rủi ro cao để ưu tiên duyệt: từ có nhiều từ loại, từ rất ngắn, từ đồng âm/đa nghĩa, thẻ có `confusables`.

### 4.6. Quy trình duyệt tay

- **TSL Top 200 + NGSL Top 300 (NGSL Top 300 là Chặng Khởi động, mục 6A):** duyệt **100%** (đây là ấn tượng đầu của mọi người dùng mới). Nhờ thêm 2–3 người học mới (đúng đối tượng mất gốc) đọc thử để đánh giá độ dễ hiểu.
- **Phần còn lại:** duyệt mẫu 15–20%, cộng toàn bộ thẻ bị gắn cờ rủi ro.
- Xuất CSV cho từng người duyệt với cột `OK / Sửa / Loại`, nhập lại kết quả, thẻ `status` chuyển `DRAFT → REVIEWED → PUBLISHED`.
- **Ước tính** (để lập kế hoạch): duyệt 20–30 giây/thẻ ⇒ duyệt 100% TSL ≈ 7–10 giờ; chỉ duyệt Top 200 ≈ 1–1,7 giờ.
- `[!]` Nên có ít nhất một người đọc nghĩa tiếng Việt ngoài bản thân, vì lỗi dịch khó tự nhìn ra.

### 4.7. IPA và âm thanh

- **IPA:** ưu tiên lấy từ từ điển/API đáng tin cậy; AI chỉ là dự phòng vì dễ sai.
- **Phát âm:** dùng speech synthesis của trình duyệt (như tính năng đã có) để không tốn dung lượng lưu file audio. Nếu sau này cần audio cố định cho offline/PWA, sinh và cache theo từ.
- `[!]` Chốt nguồn IPA/audio và kiểm tra điều khoản sử dụng của nguồn đó.
- Beginner Mode dùng audio-first (mục 6A.5). Giọng tổng hợp của trình duyệt phụ thuộc thiết bị và có thể không đủ đa dạng giọng để luyện nghe TOEIC. `[!]` Đánh giá trước khi dựa hoàn toàn vào nó; nếu cần nhiều giọng thì tính nguồn audio riêng.

### 4.7b. Khối lượng và chi phí (ước tính)

- 3.100 từ (NGSL 1.000 + TSL 1.200 + NAWL 960) ÷ 10 từ/lô ≈ **310 lượt gọi AI**, cộng khoảng vài trăm lượt cho lần kiểm tra giải thử câu quiz. Chi phí nhỏ so với thời gian duyệt, nhưng vẫn cần chạy qua rate limit và theo dõi hạn mức của nhà cung cấp AI đang dùng.
- Nút thắt thật sự là **thời gian duyệt**, không phải chi phí gọi AI.

---

## 5. Mô hình dữ liệu (đề xuất, đối chiếu với schema hiện có)

Vấn đề: Clone hiện là deep copy. Với deck Official, 1.200 thẻ × số người dùng sẽ làm DB phình rất nhanh, trong khi gói miễn phí của Neon có dung lượng giới hạn.

**Đề xuất:** thẻ Official là dữ liệu dùng chung, tiến độ là riêng từng người, và chỉ tạo bản ghi tiến độ **khi thẻ thực sự được đưa vào học** (lazy), không phải lúc đăng ký deck.

```prisma
model WordList {
  id          String   @id @default(cuid())
  code        String   @unique      // "TSL", "NGSL", "NAWL"...
  version     String                // "1.2"
  license     String                // "CC BY-SA 4.0"
  sourceUrl   String
  attribution String
  entryCount  Int
  entries     WordListEntry[]
}

model WordListEntry {
  id        String  @id @default(cuid())
  listId    String
  headword  String
  freqRank  Int?
  freqValue Float?
  level     String?               // T1 / T2 / T3
  topic     String?
  cardId    String?               // → OfficialCard
  @@unique([listId, headword])
}

model OfficialCard {
  id             String @id @default(cuid())
  headword       String
  pos            String
  content        Json              // theo schema thẻ (mục 4.3)
  status         String            // DRAFT | REVIEWED | PUBLISHED
  contentVersion Int    @default(1)
  promptVersion  String?
}

model OfficialDeck {
  id        String @id @default(cuid())
  slug      String @unique         // "tsl-1a-office-operations"
  title     String
  titleVi   String
  pathCode  String                 // TOEIC | CORE | ACADEMIC | BUSINESS | SPEAKING
  level     String?
  order     Int
  listCode  String                 // nguồn: "TSL"...
  cards     OfficialDeckCard[]
}

model UserDeckEnrollment {         // người dùng "thêm deck vào thư viện"
  userId    String
  deckId    String
  startedAt DateTime @default(now())
  @@id([userId, deckId])
}

model UserOfficialCardProgress {   // chỉ tạo khi thẻ vào hàng đợi học
  userId       String
  cardId       String
  // trạng thái SM-2: repetitions, easeFactor, interval, nextReviewDate...
  personalNote String?
  @@id([userId, cardId])
}
```

**Điểm cần chú ý khi triển khai:**

- Hàng đợi ôn tập phải **gộp hai nguồn**: thẻ tự tạo của người dùng và thẻ Official. Cần cập nhật truy vấn "đến hạn" và các thống kê (streak, dashboard) tương ứng.
- `contentVersion` cho phép sửa lỗi thẻ ở một chỗ và mọi người đều thấy; ghi chú cá nhân tách riêng nên không bị ghi đè.
- Cho phép người dùng "Sao chép thẻ Official thành thẻ của tôi" khi muốn chỉnh sửa nhiều (khi đó mới deep copy).
- `[!]` Đối chiếu với `GlobalDictionaryCache` hiện có: nên dùng cache làm nguồn gốc rồi nâng cấp thành `OfficialCard` đã duyệt, hay tách hẳn.

---

## 6. UX Thư viện & Onboarding

**Landing page**
- Hiển thị quy mô thư viện (số deck, số từ) và **xem thử 5 thẻ** không cần đăng ký.

**Onboarding (≈ 60 giây)**
1. Chọn mục tiêu: **TOEIC** / IELTS / Giao tiếp / Đi làm.
2. Chọn mức hiện tại (Mất gốc / Biết cơ bản / Đã khá); nếu cần, mini-test thích ứng bắt đầu từ từ dễ (mục 6A.2) → gợi ý điểm bắt đầu (Chặng Khởi động, NGSL hay vào thẳng TSL).
3. Chọn mục tiêu mỗi ngày (5 / 10 / 20 từ).
4. Tự thêm deck đầu tiên và bắt đầu học ngay (không bắt buộc đăng ký trước khi học thử).

**Lọc từ đã biết (Known-word triage)**
- Trước khi học một deck: vuốt "Biết / Chưa biết" qua 25–30 từ trong khoảng 1 phút.
- Từ đã biết đánh dấu `known`, **không vào SRS** (hoặc vào với khoảng ôn dài). Từ chưa biết vào hàng đợi.
- Đây là chi tiết giúp người trình độ khá không thấy chán.
- Với người mới: bấm "Biết" kèm một câu kiểm tra nhanh để xác nhận (mục 6A.6), vì người mất gốc hay nhầm "quen mắt" với "biết nghĩa".

**Trang Thư viện**
- Lọc: mục tiêu, cấp độ, chủ đề. Mỗi deck hiển thị: số từ, thời gian ước tính, tiến độ, nhãn nguồn.
- Trang **Lộ trình TOEIC**: 3 cấp TSL, tiến độ từng deck, thanh "độ phủ TOEIC ước tính" (mục 3.7), ngày hoàn thành dự kiến.

**Sau khi học xong deck đầu**
- Gợi ý "Deck tiếp theo", bật nhắc học (extension/PWA) và giới thiệu quiz kiểu Part 5 đúng lúc, không dồn ngay từ đầu.

---

## 6A. Chế độ cho người mất gốc (Beginner Mode)

> Phần này bổ sung sau khi đánh giá kế hoạch từ góc nhìn người học đi từ mất gốc lên điểm cao. Đây là nhận định dựa trên những vấp váp thường gặp của người tự học, **chưa được kiểm chứng** bằng người dùng thật của WordStreak; cần thử và đo (mục 11).

Kế hoạch ban đầu giả định người học đã đọc được câu tiếng Anh đơn giản, hiểu từ loại và chịu được 10–20 từ mới mỗi ngày. Người mất gốc thật sự thường vấp ở: bài kiểm tra đầu vào làm nản, ví dụ chứa quá nhiều từ lạ, nhầm "quen mắt" với "biết", đọc nhận ra nhưng không nghe được, lịch SM-2 quá thưa cho lần học đầu, và con số tổng quá lớn gây nản.

### 6A.1. Nguyên tắc

1. Giảm tải nhận thức: mỗi thẻ chỉ chứa những gì người học thực sự hiểu được.
2. Chiến thắng sớm: cột mốc nhỏ, phiên ngắn.
3. Tiếng Việt là ngôn ngữ giải thích chính; tiếng Anh đơn giản chỉ là tùy chọn.
4. Nghe và phát âm là đường học chính, không phải quiz phụ.
5. Từ vựng chỉ là một trụ cột; không hứa "đủ từ là đủ điểm".

### 6A.2. Lối vào

- Hỏi mức hiện tại bằng ba lựa chọn: **Mất gốc hoàn toàn / Biết cơ bản / Đã khá**.
- **Mất gốc hoàn toàn:** vào thẳng Chặng Khởi động, không bắt làm bài kiểm tra.
- **Biết cơ bản:** mini-test thích ứng, bắt đầu từ từ rất dễ, tăng dần, dừng sau vài câu sai liên tiếp.
- **Đã khá:** mini-test thường hoặc vào thẳng TSL (mục 3.3).
- Thông điệp sau test mang tính khích lệ và thực tế, ví dụ: "Bạn đã biết 7/20 từ, đây là điểm xuất phát tốt, mình sẽ bắt đầu từ chỗ này."

### 6A.3. Chặng Khởi động (Foundation Stage)

- **Nội dung:** dùng chính **NGSL Top 300** (không thêm danh sách mới), đóng gói lại cho người mới: 15 deck x 20 từ, ví dụ dễ, audio, mẹo phát âm. Nhóm từ sinh tồn (số, ngày, tháng, đại từ, từ hỏi...) đứng đầu; 52 từ bổ sung của NGSL (ngày, tháng, số) có thể làm thành deck "Basics". `[!]` Chốt dùng đúng NGSL Top 300 hay chọn tay.
- **Mini-lesson xen kẽ** (mỗi bài ≤ 2 phút, một màn hình): từ loại (danh từ, động từ, tính từ, trạng từ); vị trí từ trong câu; dạng động từ (V, V-ed, V-ing); số ít/số nhiều; câu cơ bản. Mỗi bài dẫn tới các thẻ liên quan. Nội dung tự biên soạn, duyệt tay 100%.
- **Sau Chặng Khởi động:** chuyển sang NGSL Top 1.000 (mục 3.3), vẫn giữ chế độ hiển thị Beginner cho tới khi người dùng tự chuyển.

### 6A.4. Thẻ ở Beginner Mode

- **Mặt trước:** audio tự phát, chữ, hình/emoji nếu là từ cụ thể.
- **Mặt sau:** nghĩa tiếng Việt, `example_easy_en` + `example_easy_vi`, mẹo âm cuối/trọng âm.
- **Ẩn** `definition_en` mặc định (bật tùy chọn); IPA là tùy chọn.
- **Hai lớp ví dụ:** `example_easy_*` (5–8 từ, chỉ dùng NGSL Top 500) cho Beginner Mode; `example_en` kiểu TOEIC cho người đã có nền. Sinh `example_easy_*` cho Chặng Khởi động, NGSL Top 1.000 và TSL cấp 1.
- Luật kiểm tra độ phủ từ vựng của ví dụ nằm ở mục 4.5.

### 6A.5. Nghe và phát âm

- **Audio-first:** nghe trước, chọn nghĩa hoặc gõ từ, rồi mới hiện chữ; là một đường học chính cho người mới.
- **Trọng âm:** hiển thị rõ âm tiết nhấn (tiếng Việt có thanh điệu nên trọng âm tiếng Anh khó cảm nhận).
- **Âm cuối:** trường `ending_sound_tip_vi` có hệ thống cho từ có -s/-es, -ed, phụ âm cuối, vì người Việt hay bỏ âm cuối.
- **Giọng:** phần nghe của TOEIC dùng nhiều giọng. `[!]` Đánh giá giọng tổng hợp của trình duyệt (mục 4.7) trước khi dựa vào nó cho luyện nghe.

### 6A.6. Học cho chắc

- **Learning steps trong phiên:** thẻ mới được hỏi lại sau vài phút (và thêm một lần nữa) trước khi vào lịch theo ngày của SM-2, vì hẹn lại sau đúng 1 ngày có thể quá thưa cho lần học đầu. `[!]` Chốt số bước và khoảng cách.
- **Tốc độ khởi đầu thấp:** mặc định 5 từ mới/ngày ở Beginner Mode; gợi ý tăng khi tỉ lệ nhớ ổn định. `[!]` Chốt điều kiện tăng.
- **Xác nhận "Biết":** ở bước lọc từ đã biết, chọn "Biết" thì hỏi một câu kiểm tra nhanh (chọn nghĩa hoặc điền từ); sai thì đưa vào hàng đợi học.
- **Phiên 5 phút:** chế độ học nhanh cho ngày bận.
- **Thẻ cụm từ và giới từ** (làm sau): các cụm cố định thường gặp (ví dụ be responsible for, look forward to + V-ing) làm thẻ riêng; chỉ tự viết/sinh, không chép từ sách luyện thi.
- **Mẹo đoán từ loại từ vị trí** (làm sau): mini-lesson gắn với `word_family`, bật khi người dùng lên TSL/Mini Part 5.
- **Deck Part 1 có hình** (làm sau): hành động và vật thể thường gặp khi mô tả ảnh.

### 6A.7. Động lực

- Cột mốc 50 / 100 / 300 / 500 từ, diễn đạt bằng lời dễ hiểu. Nếu muốn nêu tỉ lệ "những từ này chiếm bao nhiêu trong văn bản thật", chỉ dùng số **tính từ dữ liệu tần suất của NGSL** và ghi nhãn "ước tính".
- **Quay lại sau khi nghỉ:** chỉ hiện 5–10 thẻ trước, không phơi bày toàn bộ backlog; kết hợp streak freeze.
- Nói theo cột mốc gần ("100 từ đầu mất khoảng 3 tuần với 5 từ/ngày") thay vì tổng số tháng.

### 6A.8. Đo riêng cho nhóm Beginner

Xem mục 11: tỉ lệ hoàn thành deck đầu, tỉ lệ đúng ở lần ôn đầu, quay lại ngày 7, tách riêng khỏi nhóm khác để biết Beginner Mode có giúp thật không.

---

## 7. Backlog — EPIC 10: Thư viện từ vựng có sẵn

- [ ] **US-LIB-01: Pipeline nạp và làm giàu nội dung**
  - **AC:** Chạy được từ đầu đến cuối cho TSL và NGSL; mỗi giai đoạn chạy lại độc lập; có báo cáo lỗi validate; idempotent.
  - **Tasks:**
    - [ ] Tải và đối chiếu số lượng các file (mục 2); ghi `WordList.version`.
    - [ ] Viết `01-import` đến `07-publish` (mục 4.2).
    - [ ] Prompt `enrich.v1`, ghi `promptVersion`/`model` vào thẻ.
    - [ ] Luật validate (mục 4.5) + unit test cho các luật.
    - [ ] Xuất/nhập CSV cho người duyệt.

- [ ] **US-LIB-02: Mô hình dữ liệu Official + enrollment**
  - **AC:** Thẻ Official dùng chung; tiến độ riêng từng người; tiến độ chỉ được tạo khi thẻ vào hàng đợi học; hàng đợi ôn gộp được thẻ Official và thẻ tự tạo.
  - **Tasks:**
    - [ ] Migration Prisma (mục 5), `contentVersion`, `status`.
    - [ ] Cập nhật truy vấn "đến hạn", streak và thống kê.
    - [ ] Test hiệu năng với ~1.200 thẻ × nhiều người dùng giả lập.

- [ ] **US-LIB-03: Trang Thư viện và chi tiết deck**
  - **AC:** Lọc theo mục tiêu/cấp độ/chủ đề; xem trước thẻ; thêm deck bằng một chạm; hiển thị tiến độ.
  - **Tasks:** `LibraryPage`, `DeckDetailPage`, API `GET /api/v1/library/decks`, `POST /api/v1/library/decks/:id/enroll`.

- [ ] **US-LIB-04: Onboarding theo mục tiêu (TOEIC)**
  - **AC:** Người dùng mới chọn mục tiêu, làm mini-test, được gán deck đầu tiên và `dailyGoal`; học thử được không cần đăng ký.
  - **Tasks:** `OnboardingWizard`, mini-test 20 từ, lưu lựa chọn vào profile, chế độ khách (lưu tạm local).

- [ ] **US-LIB-05: Lọc từ đã biết**
  - **AC:** Vuốt Biết/Chưa biết qua một deck; từ đã biết không vào SRS; có thể hoàn tác.
  - **Tasks:** UI vuốt/phím tắt, API ghi trạng thái hàng loạt, test với bàn phím và cảm ứng.

- [ ] **US-LIB-06: Lộ trình TOEIC (TSL Path) và độ phủ ước tính**
  - **AC:** Hiển thị 3 cấp TSL, tiến độ từng deck, thanh độ phủ ước tính theo công thức mục 3.7, ngày hoàn thành dự kiến.
  - **Tasks:** Endpoint tổng hợp tiến độ, dùng `freqValue` của từng danh sách, gắn nhãn "ước tính".

- [ ] **US-LIB-07: Quiz kiểu TOEIC (Mini Part 5)**
  - **AC:** Câu điền từ 4 đáp án, đáp án nhiễu hợp lý, chỉ có một đáp án đúng; kết quả tự quy ra rating SM-2.
  - **Tasks:** Sinh câu hỏi bằng AI + bước giải thử để kiểm; lưu vào kho câu hỏi đã duyệt; UI quiz; liên kết `UserOfficialCardProgress`.

- [ ] **US-LIB-08: Ghi nguồn và giấy phép**
  - **AC:** Trang "Nguồn dữ liệu" ghi tác giả, phiên bản, giấy phép; mỗi deck có nhãn nguồn; có dòng không liên kết với ETS.
  - **Tasks:** Trang tĩnh, nhãn deck, nội dung theo mục 10.

- [ ] **US-LIB-09: Báo lỗi thẻ và cập nhật nội dung**
  - **AC:** Người dùng báo lỗi một thẻ Official bằng một chạm; admin xem hàng đợi báo lỗi; sửa xong tăng `contentVersion`.
  - **Tasks:** Bảng báo lỗi, màn hình admin tối giản hoặc xuất CSV, thông báo nhẹ cho người dùng khi thẻ được sửa.

- [ ] **US-LIB-10: Analytics cho thư viện**
  - **AC:** Ghi nhận sự kiện: xem deck, thêm deck, hoàn thành 10 thẻ đầu, hoàn thành deck, quay lại ngày 1/ngày 7 theo deck.
  - **Tasks:** Gắn công cụ analytics nhẹ, định nghĩa sự kiện, dashboard cơ bản.

- [ ] **US-LIB-11: Lối vào "mất gốc" và mini-test thích ứng** *(điều chỉnh US-LIB-04 và US-LIB-05 cho người mới)*
  - **AC:** Hỏi mức hiện tại bằng 3 lựa chọn; "Mất gốc hoàn toàn" vào Chặng Khởi động mà không phải làm bài test; mini-test thích ứng bắt đầu từ từ dễ và dừng sau vài câu sai liên tiếp; thông điệp sau test mang tính khích lệ.
  - **Tasks:** UI chọn mức, thuật toán chọn từ test theo `freqRank`, lưu `startingLevel` vào profile.

- [ ] **US-LIB-12: Chặng Khởi động (NGSL Top 300 đóng gói lại)**
  - **AC:** 15 deck x 20 từ; mỗi deck có ví dụ dễ, audio, mẹo phát âm; có 3–5 mini-lesson (từ loại, vị trí từ, dạng động từ...) xen giữa các deck.
  - **Tasks:** Dựng nội dung mini-lesson (tự biên soạn, duyệt 100%), liên kết bài học với thẻ, đánh dấu deck thuộc `pathCode = FOUNDATION`.

- [ ] **US-LIB-13: Ví dụ kiểm soát từ vựng**
  - **AC:** Thẻ có `example_easy_*` đạt luật độ phủ (mục 4.5); thẻ TSL đạt luật 95% NGSL + TSL; báo cáo validate liệt kê thẻ vi phạm.
  - **Tasks:** Tạo bảng lemma của NGSL/TSL, hàm kiểm tra độ phủ, cập nhật prompt `enrich`, test với nhiều biến cách.

- [ ] **US-LIB-14: Audio-first và mẹo phát âm cho người Việt**
  - **AC:** Chế độ nghe trước, thấy chữ sau; hiển thị trọng âm; thẻ có `ending_sound_tip_vi` khi áp dụng.
  - **Tasks:** Chế độ học mới, điền `stress_syllable` và `ending_sound_tip_vi` trong pipeline, đánh giá giọng tổng hợp (mục 4.7).

- [ ] **US-LIB-15: Learning steps, xác nhận "Biết" và tốc độ khởi đầu thấp**
  - **AC:** Thẻ mới được hỏi lại trong phiên trước khi vào lịch ngày; chọn "Biết" thì có câu kiểm tra nhanh; Beginner Mode mặc định 5 từ/ngày.
  - **Tasks:** Mở rộng bộ lập lịch SM-2 với bước học, câu kiểm tra nhanh trong luồng lọc từ, `dailyGoal` mặc định theo mức.

- [ ] **US-LIB-16: Cột mốc, phiên 5 phút và quay lại sau nghỉ**
  - **AC:** Cột mốc 50/100/300/500 từ; phiên 5 phút; sau khi nghỉ hiển thị 5–10 thẻ trước.
  - **Tasks:** UI cột mốc, chế độ phiên ngắn, logic "welcome back".

- [ ] **US-LIB-17: Thẻ cụm từ & giới từ, mẹo đoán từ loại, deck Part 1 có hình** `[~]`
  - **AC:** Deck cụm từ cố định; mini-lesson đoán từ loại từ vị trí; deck mô tả ảnh Part 1 có hình minh họa.
  - **Tasks:** Biên soạn nội dung tự viết/sinh và duyệt; nguồn hình có giấy phép rõ ràng.

---

## 8. Lộ trình triển khai nội dung

| Giai đoạn | Nội dung | Điều kiện hoàn thành |
| --- | --- | --- |
| **0. Chuẩn bị** | Tải danh sách, kiểm tra giấy phép từng trang, chốt schema thẻ và mô hình dữ liệu (mục 5), chốt các quyết định ở mục 12 | Có CSV chuẩn hóa và schema được duyệt |
| **1. Soft launch** | **TSL Top 200** + **NGSL Top 300** (đóng gói thành Chặng Khởi động, mục 6A), duyệt tay 100%; lối vào "mất gốc" (US-LIB-11 đến 13) và onboarding TOEIC; trang Thư viện; trang Nguồn dữ liệu | Triển khai cùng Sprint 8; 8–10 người dùng thử hoàn thành 10 thẻ đầu |
| **2. Mở rộng TSL** | Toàn bộ 1.200 từ TSL (48 deck), NGSL tới 1.000 từ, lọc từ đã biết (có xác nhận), quiz Mini Part 5, audio-first, learning steps, cột mốc (US-LIB-14 đến 16) | TSL đủ 3 cấp, độ phủ ước tính hoạt động |
| **3. Mở rộng lộ trình** | NAWL (IELTS), BSL, NGSL-S, deck chủ đề, word family nâng cao | Có thêm ít nhất 2 lộ trình |
| **4. Vận hành** | Xử lý báo lỗi, tăng `contentVersion`, ưu tiên cải thiện deck phổ biến nhất | Có quy trình hằng tuần |

---

## 9. Các danh sách khác (kế hoạch ngắn)

| Danh sách | Lộ trình | Cách chia | Ghi chú |
| --- | --- | --- | --- |
| **NGSL** | Nền tảng (mọi lộ trình) | 30 từ/deck theo tần suất; Top 1.000 trước | Xử lý 52 từ bổ sung (ngày, tháng, số) thành deck "Basics" |
| **NAWL** | IELTS / Học thuật | 25–30 từ/deck theo tần suất, thêm chủ đề IELTS tự biên soạn (Environment, Education, Health, Technology…) | IELTS không có danh sách từ chính thức, nên dựng thêm deck chủ đề |
| **BSL** | Đi làm | Theo chủ đề công việc | Phục vụ tiếng Anh kinh doanh thực tế, khác mục tiêu của TSL |
| **NGSL-S** | Giao tiếp | Theo tần suất, ví dụ dạng hội thoại | Hợp với quiz nghe và phát âm |

Dùng chung pipeline (mục 4); điểm khác chỉ là prompt (`context_type`, văn phong ví dụ) và cách gom chủ đề.

---

## 10. Giấy phép và ghi nguồn

- Các danh sách của NGSL Project phát hành theo **Creative Commons** (các trang NGSL/NAWL/TSL ghi **CC BY-SA 4.0**). Trước khi nạp từng danh sách, **mở lại trang chính thức của danh sách đó và đọc điều khoản**, vì giấy phép có thể khác giữa các trang.
- **ShareAlike:** sản phẩm phái sinh từ danh sách (ví dụ deck) cần ghi nguồn và giữ cùng giấy phép cho phần danh sách. Mình không phải luật sư; nếu sau này thương mại hóa mạnh thì nên nhờ tư vấn pháp lý.
- Gợi ý nội dung trang "Nguồn dữ liệu":
  > Danh sách từ dựa trên *TOEIC Service List* (TSL) và *New General Service List* (NGSL) của Browne, C., Culligan, B. (và Phillips, J. đối với NGSL), theo giấy phép CC BY-SA 4.0. Nội dung thẻ do WordStreak biên soạn. WordStreak không liên kết với và không được chứng thực bởi ETS. TOEIC là nhãn hiệu của ETS.
- **Không sao chép** danh sách Oxford 3000/5000 hoặc nội dung đề thi/sách luyện thi vào app.
- `[!]` Dùng tên "TOEIC" trong tên deck/tính năng cần thận trọng về nhãn hiệu; ưu tiên cách diễn đạt như "Từ vựng cho TOEIC" kèm dòng miễn trừ ở trên.

---

## 11. Đo lường

| Chỉ số | Câu hỏi nó trả lời |
| --- | --- |
| % người dùng mới **thêm deck trong phiên đầu** | Thư viện có thật sự kéo người vào không? |
| % **hoàn thành 10 thẻ đầu** | Trải nghiệm đầu tiên có trơn tru không? |
| Quay lại **ngày 1 / ngày 7**, tách theo deck/lộ trình | Nội dung nào giữ được người? |
| % thẻ bị **báo lỗi** theo deck | Chất lượng nội dung ở đâu cần cải thiện? |
| % từ bị đánh dấu "đã biết" ở bước lọc | Deck có quá dễ/quá khó với nhóm nào? |
| Tỉ lệ bật **nhắc học** sau deck đầu | Có chuyển từ "tò mò" sang "thói quen" không? |
| **Nhóm Beginner:** hoàn thành deck đầu, đúng ở lần ôn đầu, quay lại ngày 7 | Chế độ cho người mất gốc có thật sự giúp họ đi tiếp không? |

> Nội dung kéo người vào, còn SRS, streak và nhắc học qua extension mới giữ họ ở lại. Theo dõi cả hai chứ không chỉ riêng tỉ lệ thêm deck.

---

## 12. Rủi ro và quyết định cần chốt

- [!] **Nghĩa tiếng Việt:** AI sinh rồi tự duyệt, hay nhờ thêm người duyệt? (khuyến nghị: có ít nhất một người đọc ngoài bản thân, ưu tiên Top 200).
- [!] **Mô hình dữ liệu:** thẻ Official dùng chung + tiến độ lazy (khuyến nghị) hay giữ deep copy cho đơn giản (chỉ chấp nhận được khi quy mô người dùng còn rất nhỏ).
- [!] **Độ ràng buộc lộ trình:** gợi ý mềm (khuyến nghị) hay khóa tuần tự.
- [!] **Kích thước deck:** 25 từ (TSL) và 30 từ (NGSL), hay thống nhất một con số.
- [!] **Nguồn IPA/audio** và điều khoản sử dụng.
- [!] **Cách dùng tên "TOEIC"** trong sản phẩm (mục 10).
- [!] **Chặng Khởi động:** dùng đúng NGSL Top 300 hay chọn tay ~300 từ sinh tồn (số, ngày, tháng, đại từ, từ hỏi...).
- [!] **Tốc độ mặc định ở Beginner Mode** (5 từ/ngày), điều kiện gợi ý tăng, số bước và khoảng cách của learning steps.
- [!] **Nguồn audio nhiều giọng** nếu giọng tổng hợp của trình duyệt không đủ cho luyện nghe TOEIC.
- **Rủi ro phình phạm vi:** Beginner Mode làm tăng khối lượng nội dung (ví dụ dễ, mini-lesson, audio). Soft launch chỉ làm US-LIB-11 đến 13; US-LIB-14 đến 16 ở giai đoạn 2; US-LIB-17 sau cùng.
- **Rủi ro chất lượng AI tiếng Việt:** nghĩa sai/không tự nhiên → giảm bằng duyệt tay Top 200 + nút báo lỗi.
- **Rủi ro cạnh tranh:** danh sách miễn phí đã có trên các nền tảng khác → khác biệt phải đến từ chất lượng thẻ, quiz kiểu đề, độ phủ ước tính, extension nhắc học.
- **Rủi ro "nhiều mà không giữ chân":** hoàn thành deck đầu rồi bỏ → gắn nhắc học và streak vào luồng ngay sau deck đầu.
- **Rủi ro hứa quá lời:** tránh cam kết điểm số; dùng cách nói "ưu tiên" và "ước tính".

---

## Phụ lục A — Ví dụ thẻ TSL (minh họa cấu trúc, không nhất thiết là từ thuộc TSL)

```json
{
  "word": "reimburse",
  "pos": "verb",
  "ipa_us": "/ˌriːɪmˈbɝːs/",
  "meaning_vi": "hoàn trả (chi phí)",
  "definition_en": "to pay back money that someone has spent",
  "example_en": "The company will reimburse employees for travel expenses within two weeks.",
  "example_vi": "Công ty sẽ hoàn trả chi phí đi lại cho nhân viên trong vòng hai tuần.",
  "context_type": "notice",
  "collocations": ["reimburse expenses", "reimburse someone for something"],
  "word_family": ["reimbursement"],
  "confusables": [],
  "topic": "Finance, Banking & Accounting",
  "tip_vi": "Thường gặp trong thông báo nội bộ về chi phí công tác."
}
```

## Phụ lục B — Ví dụ câu Mini Part 5 (dạng chọn dạng từ)

> Ms. Lee gave a very ______ presentation at the sales conference.
> (A) persuade  (B) persuasion  (C) persuasive  (D) persuasively
>
> **Đáp án:** (C). Chỗ trống đứng trước danh từ "presentation" nên cần tính từ. `word_family` của thẻ "persuade" cung cấp các dạng nhiễu (A, B, D).

## Phụ lục C — Nguồn tham khảo

- TSL: https://newgeneralservicelist.com/toeic-service-list
- NGSL: https://www.newgeneralservicelist.com/new-general-service-list
- Tất cả các danh sách: https://www.newgeneralservicelist.com/word-lists
- BSL (để phân biệt mục tiêu với TSL): https://newgeneralservicelist.com/business-service-list
- Cập nhật chuyển từ giữa các danh sách (1.2): https://newgeneralservicelist.com/blog/ngsl-wordlist-update
