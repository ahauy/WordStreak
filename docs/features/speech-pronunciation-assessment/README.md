# Feature: Speech Recognition & Pronunciation Assessment (US-VOICE-01 & US-VOICE-02)

**Slug**: `speech-pronunciation-assessment`  
**Version**: 1.0  
**Ship date**: 2026-08-21  
**Spec**: [.specify/features/speech-pronunciation-assessment/](../../.specify/features/speech-pronunciation-assessment/)  
**Baseline**: [SIGNED-OFF v1.0](../../.specify/features/speech-pronunciation-assessment/baseline.md)  
**Epic**: `EPIC-08` (Speech Recognition & Pronunciation Assessment)

---

## 1. Mô tả ngắn (Overview & Value Proposition)

Tính năng **Nhận diện giọng nói & Chấm điểm phát âm (Speech Recognition & Pronunciation Assessment)** mang đến phòng luyện âm chuẩn bản xứ trực tiếp trong trình duyệt cho người học WordStreak. Khắc phục hạn chế của việc học từ vựng thụ động qua việc chỉ đọc chữ và nghe phát âm đơn chiều, tính năng này giúp người học tự tin nói tiếng Anh, chuẩn hóa ngữ âm IPA, nắm vững trọng âm từ và kiểm tra độ chính xác phát âm tức thì mà không cần cài đặt phần mềm ngoài hay trả phí cho các dịch vụ đám mây đắt đỏ.

### Điểm nổi bật kỹ thuật:

- **Bộ nhận diện giọng nói Web Speech API chuẩn hóa ngữ cảnh (Locale-Aware Speech Recognition)**: Nhận diện giọng nói tiếng Anh thời gian thực với độ trễ phản hồi $< 100\text{ms}$, tự động đồng bộ theo phương ngữ đang chọn (`en-US` cho giọng Mỹ hoặc `en-GB` cho giọng Anh).
- **Bộ hiển thị sóng âm phổ động (Web Audio AnalyserNode Dynamic Waveform)**: Lấy mẫu âm thanh từ micro ở tần số 60 FPS thông qua thuật toán Fast Fourier Transform (FFT) trên Web Audio API, hiển thị thanh sóng âm sống động thể hiện năng lượng giọng nói.
- **Thuật toán chấm điểm Levenshtein & So khớp ký tự trực quan (LCS Character Diff)**: Chuẩn hóa chuỗi (bỏ dấu câu, chuyển chữ thường, lọc khoảng trắng), tính toán độ tương đồng khoảng cách Levenshtein chia thành 3 phân hạng: **Exact** ($100\%$), **Close** ($80\text{--}99\%$), và **Retry** ($<80\%$), kèm phân tích trực quan ký tự thiếu (`MISSING`), thừa (`EXTRA`), sai (`WRONG`) hoặc khớp (`MATCH`).
- **Trình phát âm thanh đa phương ngữ & Bảo toàn cao độ (Dual Accent & Pitch Preservation)**: Cho phép chuyển đổi linh hoạt giữa giọng bản xứ Anh-Mỹ (`en-US`) và Anh-Anh (`en-GB`), hỗ trợ làm chậm $0.75\times$ nhưng bảo toàn trọn vẹn cao độ (`preservesPitch = true`) giúp phân biệt rõ từng âm tiết mà không bị biến dạng giọng trầm.
- **Tự động chuyển đổi mượt Web Speech Synthesis (Seamless Fallback)**: Tự động tổng hợp giọng đọc trình duyệt khi tệp âm thanh CDN bị lỗi mạng hoặc HTTP 404, không làm gián đoạn trải nghiệm học.
- **Phân tách âm tiết IPA tương tác (Interactive IPA Syllable Segmentation)**: Phân tách chuỗi ngữ âm IPA thành các âm tiết độc lập, gắn cờ trọng âm chính (`ˈ`) và trọng âm phụ (`ˌ`), hỗ trợ bấm vào từng âm tiết để nghe phát âm mẫu riêng lẻ.
- **Cơ chế Gamification & Hàng rào bảo mật chống lạm dụng**: Thưởng $+10\text{ XP}$ cho mỗi lượt phát âm đạt chuẩn ($\ge 80\%$), duy trì chuỗi Streak hàng ngày, bảo vệ bởi bộ đệm cooldown $1500\text{ms}$, trần tích lũy $500\text{ XP/ngày}$ và kiểm tra quyền sở hữu bộ từ.
- **Bảo mật tuyệt đối & Không lưu trữ âm thanh (Zero Server Audio Retention)**: $100\%$ quá trình xử lý tín hiệu âm thanh và nhận diện giọng nói diễn ra trực tiếp tại client. Không có bất kỳ byte dữ liệu âm thanh nào được lưu trữ hay truyền tải qua máy chủ backend.

---

## 2. Phạm vi tính năng (MoSCoW In-Scope)

### User Stories & Tiêu chí chấp thuận (Acceptance Criteria)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              USER STORIES & SCENARIOS                                  │
├────────────────────┬───────────────────────────────────────────────────────────────────┤
│ Story ID           │ Tiêu chí chấp thuận (Acceptance Criteria)                         │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ **US-VOICE-01**    │ - Khởi tạo Web Speech Recognition với locale `en-US` hoặc `en-GB`.│
│ Voice Recognition  │ - Banner xin quyền micro thân thiện, hướng dẫn mở chặn khi từ chối│
│ & Pronunciation    │ - Sóng âm AnalyserNode 60 FPS phản hồi độ lớn giọng nói thời gian │
│ Assessment         │   thực (5-7 dynamic bars).                                        │
│                    │ - Tự động dừng ghi âm sau 2500ms im lặng hoặc tối đa 8000ms.      │
│                    │ - Chấm điểm Levenshtein: Exact (100%), Close (80-99%), Retry (<80%)│
│                    │ - Hiển thị visual diff ký tự (Match, Missing, Extra, Wrong).      │
│                    │ - Thưởng +10 XP cho kết quả >= 80%, ghi nhận chuỗi Daily Streak.  │
│                    │ - Cooldown 1500ms giữa các lần nộp và trần 500 XP/ngày.          │
├────────────────────┼───────────────────────────────────────────────────────────────────┤
│ **US-VOICE-02**    │ - Bộ chọn phương ngữ kép: Tab US (`en-US`) và UK (`en-GB`).       │
│ Native Audio &     │ - Tốc độ đọc chậm 0.75x với `preservesPitch = true`.              │
│ Pronunciation      │ - Tự động fallback sang Web Speech Synthesis khi audio URL lỗi.   │
│ Guide              │ - Phân tách IPA thành các chip âm tiết tương tác với trọng âm     │
│                    │   chính (`ˈ`) màu tím nổi bật và trọng âm phụ (`ˌ`).              │
│                    │ - Hỗ trợ phím tắt: `Space` (thu âm), `R` (nghe), `S` (chỉnh tốc). │
└────────────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 3. Ngoài phạm vi (Won't-Have v1)

- **Lưu trữ tệp âm thanh người học trên máy chủ**: Không lưu file thu âm người dùng vào cơ sở dữ liệu hoặc S3 nhằm đảm bảo tối đa quyền riêng tư (Privacy-by-Design) và tối ưu chi phí lưu trữ.
- **Tích hợp Cloud AI Speech APIs trả phí**: Không phụ thuộc vào các dịch vụ trả phí từ bên thứ ba như OpenAI Whisper API hay Google Cloud Speech-to-Text ở phiên bản v1.
- **So sánh biểu đồ cao độ thời gian thực (Pitch Contour Matching)**: Chưa hiển thị đồ thị tần số F0 (Pitch curve) so khớp với người bản xứ.
- **Biến động chu kỳ SM-2**: Luyện tập phát âm tự do không làm thay đổi các chỉ số Spaced Repetition (`easeFactor`, `interval`, `repetitions`, `nextReviewDate`) trong `UserCardProgress`.

---

## 4. Kiến trúc Kỹ thuật & Luồng Dữ liệu (Architecture & Pipeline)

### 4.1. Sơ đồ Luồng Dữ liệu Toàn hệ thống (System Data Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Người học (Browser)
    participant Modal as PronunciationPracticeModal
    participant Hook as useVoicePracticeEngine
    participant Visualizer as useAudioVisualizer (AnalyserNode)
    participant Speech as Web Speech API (SpeechRecognition)
    participant Scorer as pronunciationScorer (Levenshtein/LCS)
    participant API as NestJS PracticeController
    participant Svc as PracticeService
    participant DB as PostgreSQL (Prisma)

    Learner->>Modal: Mở Modal Luyện phát âm (từ Flashcard / Deck / Review)
    Modal->>Hook: initialize(card, accent = 'en-US')

    opt Người học bấm nghe mẫu
        Learner->>Hook: playReferenceAudio(speed = 0.75x)
        Hook->>Hook: HTMLAudioElement (preservesPitch = true) -> Fallback SpeechSynthesis
    end

    Learner->>Modal: Nhấp nút Mic hoặc nhấn phím Space
    Modal->>Hook: startListening()
    Hook->>Visualizer: startVisualization(mediaStream)
    Visualizer-->>Modal: Cập nhật volume bars 60 FPS (AnalyserNode FFT)
    Hook->>Speech: start({ lang: 'en-US', interimResults: true })

    Speech-->>Modal: Stream interim transcript ("elo...")
    Learner->>Speech: Dứt lời nói ("eloquent")
    Speech-->>Hook: onresult final transcript ("eloquent")
    Hook->>Visualizer: stopVisualization() (Giải phóng tracks)

    Hook->>Scorer: computePronunciationScore(targetWord, spokenTranscript)
    Scorer-->>Hook: { score: 100, tier: 'EXACT', isPassed: true, diffSpans: [...] }
    Hook->>Modal: Hiển thị kết quả chấm điểm & phát âm thanh Chime

    Hook->>API: POST /api/v1/practice/voice/submit (Bearer JWT)
    Note over Hook,API: Payload: { cardId, spokenTranscript, accuracyScore, accent }
    API->>Svc: submitVoicePronunciation(userId, dto)
    Svc->>Svc: Kiểm tra Anti-Abuse (Cooldown 1500ms)
    Svc->>DB: Xác thực quyền sở hữu Card / Deck
    Svc->>Svc: Tính toán lại Levenshtein & LCS diff trên server
    Svc->>DB: Kiểm tra trần 500 XP/ngày (UserActivityLog)
    Svc->>DB: Ghi nhận Streak (StreakService.recordActivity)
    Svc->>DB: Lưu UserActivityLog (VOICE_PRONUNCIATION) & cộng XP
    Svc-->>API: Trả về VoicePronunciationResultDto
    API-->>Hook: 200 OK + { isPassed, xpAwarded, streakAdvanced, isDailyCapped }
    Hook-->>Modal: Đồng bộ trạng thái XP & Streak
```

---

### 4.2. State Machine Quản lý Trạng thái Thu âm & Đánh giá (FSM)

```mermaid
stateDiagram-v2
    [*] --> IDLE: Khởi tạo Modal

    IDLE --> PRE_PROMPT: Chưa cấp quyền Micro
    IDLE --> REQUESTING: Đã có quyền / Bấm nút Mic
    PRE_PROMPT --> REQUESTING: Người dùng đồng ý cấp quyền

    state REQUESTING {
        [*] --> CallGetUserMedia: navigator.mediaDevices.getUserMedia()
        CallGetUserMedia --> LISTENING: Cấp quyền thành công
        CallGetUserMedia --> PERMISSION_DENIED: Từ chối / NotAllowedError
    }

    state PERMISSION_DENIED {
        [*] --> RenderTroubleshooting: Hiển thị hướng dẫn mở quyền theo trình duyệt
        RenderTroubleshooting --> REQUESTING: Bấm "Thử lại quyền micro"
    }

    state LISTENING {
        [*] --> SampleAudioFrequency: AnalyserNode lấy mẫu 60 FPS (FFT 32)
        SampleAudioFrequency --> RenderWaveform: Cập nhật 5-7 visual bars
        [*] --> StreamSpeechRecognition: Web Speech API nhận diện luồng âm
        StreamSpeechRecognition --> InterimDisplay: Cập nhật interim transcript

        StreamSpeechRecognition --> PROCESSING: Nhận kết quả cuối cùng (onresult final)
        SampleAudioFrequency --> PROCESSING: Watchdog 2500ms im lặng / 8000ms max timeout
    }

    state PROCESSING {
        [*] --> ReleaseAudioStream: Ngắt microphone tracks & giải phóng AudioContext
        ReleaseAudioStream --> CalculateScore: Tính Levenshtein Distance & LCS Diff
        CalculateScore --> SubmitBackend: Gửi POST /api/v1/practice/voice/submit
    }

    PROCESSING --> EVALUATED: Nhận kết quả thành công
    PROCESSING --> ERROR: Lỗi mạng hoặc lỗi hệ thống

    state EVALUATED {
        [*] --> RenderBadge: Hiển thị Badge (Exact / Close / Retry)
        RenderBadge --> RenderDiff: Hiển thị Diff Spans (Match / Missing / Extra / Wrong)
        RenderDiff --> PlaySoundEffect: Phát âm thanh Chime / Tone
        PlaySoundEffect --> SyncRewards: Cập nhật Streak & XP toast
    }

    EVALUATED --> LISTENING: Bấm "Nói lại" (Try Again)
    ERROR --> IDLE: Bấm "Thử lại"
    EVALUATED --> [*]: Đóng Modal
```

---

### 4.3. Pipeline Xử lý Âm thanh & Thuật toán Đánh giá

#### 1. Lấy mẫu sóng âm qua Web Audio AnalyserNode (60 FPS FFT)

```
Microphone Stream (MediaStream)
         │
         ▼
┌──────────────────┐     createMediaStreamSource()
│   AudioContext   │ ─────────────────────────────────┐
└──────────────────┘                                  │
                                                      ▼
                                            ┌──────────────────┐
                                            │   AnalyserNode   │ (fftSize = 32, smoothing = 0.8)
                                            └──────────────────┘
                                                      │
                                                      ▼ requestAnimationFrame
                                            ┌──────────────────┐
                                            │ getByteFrequency │ ──> Chuẩn hóa 5-7 thanh sóng âm
                                            └──────────────────┘     (AcousticSoundwave UI)
```

- **Cấu hình AnalyserNode**: `fftSize = 32`, `smoothingTimeConstant = 0.8`, `minDecibels = -90`, `maxDecibels = -10`.
- **Tối ưu hiệu năng**: Chạy hoàn toàn trên vòng lặp `requestAnimationFrame`, ngắt toàn bộ track khi chuyển trạng thái hoặc unmount, tiêu thụ $< 2\%$ CPU trên thiết bị tầm trung.

#### 2. Thuật toán Chấm điểm Phát âm Levenshtein & Phân hạng (Grading Tiers)

Chuỗi ký tự được chuẩn hóa bằng hàm `normalizePronunciationText`: chuyển chữ thường, loại bỏ khoảng trắng thừa và toàn bộ dấu câu `[.,/#!$%^&*;:{}=\-_`~()?"'’]`.

Khoảng cách chỉnh sửa Levenshtein được tính toán bằng quy hoạch động 2 dòng bộ nhớ $O(\min(N, M))$:

$$\text{distance} = \text{Levenshtein}(\text{target}, \text{spoken})$$

$$\text{accuracyScore} = \max\left(0, \min\left(100, \text{round}\left(\left(1 - \frac{\text{distance}}{\max(\text{len}(\text{target}), \text{len}(\text{spoken}))}\right) \times 100\right)\right)\right)$$

Phân loại kết quả:

| Điểm số (\%)            | Phân hạng (`tier`) | Trạng thái (`isPassed`) | Màu sắc chủ đạo               | Phản hồi âm thanh               | Phần thưởng              |
| :---------------------- | :----------------- | :---------------------- | :---------------------------- | :------------------------------ | :----------------------- |
| **$100\%$**             | `EXACT`            | `true`                  | Xanh ngọc lục bảo (`#10B981`) | Success Chime (D5 $\to$ A5)     | $+10\text{ XP}$ + Streak |
| **$80\%\text{--}99\%$** | `CLOSE`            | `true`                  | Tím hoàng gia (`#8B5CF6`)     | Encouraging Chime (E5 $\to$ G5) | $+10\text{ XP}$ + Streak |
| **$< 80\%$**            | `RETRY`            | `false`                 | Cam ấm (`#F59E0B`)            | Neutral Retry Tone (C4)         | $0\text{ XP}$ (Thử lại)  |

#### 3. Thuật toán Phân tích Ký tự Khác biệt (LCS Character Diff)

Sử dụng thuật toán chuỗi con chung dài nhất (**Longest Common Subsequence - LCS**) để so khớp từng ký tự giữa từ mục tiêu và từ được nhận diện, phân tách thành 4 loại nhãn trực quan:

- `MATCH`: Ký tự phát âm chính xác (chữ màu xanh lục / nền trong suốt).
- `MISSING`: Ký tự bị nuốt hoặc phát âm thiếu trong từ gốc (chữ gạch chân màu đỏ / nhạt).
- `EXTRA`: Ký tự bị phát âm thừa (chữ gạch ngang màu xám).
- `WRONG`: Ký tự bị biến âm hoặc thay thế sai (chữ màu đỏ viền cam).

#### 4. Phân tách Âm tiết IPA Tương tác (IPA Syllable Parser)

Hàm [`parseIpaSyllables`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/utils/ipaSyllableParser.ts) phân tách các chuỗi phiên âm quốc tế như `"/ˈel.ɪ.kwənt/"` hoặc `"/ˌʌn.dərˈstænd/"`:

1. Loại bỏ các ký tự bao quanh `/` hoặc `[` `]`.
2. Tách chuỗi theo dấu chấm phân cách âm tiết (`.`) hoặc khoảng trắng.
3. Nhận diện ký tự trọng âm chính (`ˈ` - Primary Stress) và trọng âm phụ (`ˌ` - Secondary Stress).
4. Tạo danh sách `IpaSyllableToken[]` để render thành các chip bấm phát âm độc lập.

---

## 5. Danh mục Quy tắc Nghiệp vụ (Business Rules BR-VOICE-001 .. BR-VOICE-015)

| Mã quy tắc         | Tên quy tắc                                     | Mô tả chi tiết & Công thức tính toán                                                                                                                                                       |
| :----------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`BR-VOICE-001`** | **Ngữ cảnh nhận diện theo phương ngữ**          | Trình nhận diện Web Speech API phải được khởi tạo với mã ngôn ngữ tương ứng với giọng đọc được chọn (`en-US` cho US Accent, `en-GB` cho UK Accent).                                        |
| **`BR-VOICE-002`** | **Lấy mẫu sóng âm thời gian thực**              | Hệ thống phải lấy mẫu năng lượng âm thanh qua Web Audio `AnalyserNode` ở tần số 60 FPS và hiển thị tối thiểu 5–7 thanh sóng âm trực quan trong suốt thời gian micro mở.                    |
| **`BR-VOICE-003`** | **Chuẩn hóa chuỗi trước khi so sánh**           | Văn bản người dùng nói và từ vựng mục tiêu phải được chuyển thành chữ thường, loại bỏ toàn bộ ký tự đặc biệt, dấu câu và rút gọn khoảng trắng thừa trước khi tính khoảng cách Levenshtein. |
| **`BR-VOICE-004`** | **Ngưỡng đạt tiêu chuẩn (Pass Threshold)**      | Lượt phát âm được tính là đạt yêu cầu (`isPassed = true`) khi độ chính xác $\ge 80\%$.                                                                                                     |
| **`BR-VOICE-005`** | **Thang điểm phân hạng 3 bậc**                  | Độ chính xác được xếp loại thành 3 bậc: `EXACT` ($100\%$), `CLOSE` ($80\text{--}99\%$), và `RETRY` ($<80\%$).                                                                              |
| **`BR-VOICE-006`** | **Cơ chế thưởng điểm kinh nghiệm (XP)**         | Mỗi lượt phát âm đạt chuẩn ($\ge 80\%$) được thưởng cố định $+10\text{ XP}$. Các lượt $<80\%$ nhận $0\text{ XP}$.                                                                          |
| **`BR-VOICE-007`** | **Trần kinh nghiệm hàng ngày (Daily Cap)**      | Tổng điểm XP nhận từ các hoạt động luyện phát âm bị giới hạn tối đa **$500\text{ XP/ngày}$**. Khi vượt trần, `isDailyCapped` trả về `true` và `xpAwarded` trả về `0`.                      |
| **`BR-VOICE-008`** | **Hàng rào thời gian chống Spam (Cooldown)**    | Người dùng phải đợi tối thiểu **$1500\text{ms}$** giữa 2 lần nộp bài phát âm liên tiếp. Nộp nhanh hơn sẽ bị từ chối với mã lỗi HTTP 429.                                                   |
| **`BR-VOICE-009`** | **Ghi nhận chuỗi học tập (Streak Integration)** | Khi hoàn thành ít nhất một lượt phát âm đạt chuẩn ($\ge 80\%$) trong ngày, hệ thống tự động ghi nhận hoạt động vào chuỗi học tập (`StreakService.recordActivity`).                         |
| **`BR-VOICE-010`** | **Bộ chọn âm thanh phương ngữ kép**             | Người học có thể chuyển đổi giữa giọng Anh-Mỹ (`audioUrlUS`) và Anh-Anh (`audioUrlUK`). Nếu thẻ chỉ có 1 URL, hệ thống ưu tiên phát URL có sẵn.                                            |
| **`BR-VOICE-011`** | **Bảo toàn cao độ khi làm chậm (0.75x)**        | Khi kích hoạt chế độ nghe chậm $0.75\times$, cờ `preservesPitch` của thẻ Audio phải được đặt thành `true` để chống méo tiếng và vỡ âm vực.                                                 |
| **`BR-VOICE-012`** | **Tự động chuyển đổi Web Speech Synthesis**     | Khi đường dẫn CDN audio bị thiếu (null) hoặc trả về mã lỗi HTTP 404/500, trình duyệt tự động phát âm từ bằng `window.speechSynthesis` theo đúng locale đã chọn.                            |
| **`BR-VOICE-013`** | **Phân tách âm tiết & Trọng âm IPA**            | Chuỗi phiên âm IPA phải được tách thành các âm tiết tương tác. Âm tiết mang trọng âm chính (`ˈ`) hiển thị viền nổi bật màu tím.                                                            |
| **`BR-VOICE-014`** | **Cơ chế giám sát im lặng & Thời gian tối đa**  | Tự động kết thúc thu âm và giải phóng micro nếu không phát hiện tiếng nói sau **$2500\text{ms}$** hoặc thời gian thu âm vượt quá **$8000\text{ms}$**.                                      |
| **`BR-VOICE-015`** | **Bảo mật âm thanh & Không lưu trữ máy chủ**    | Dữ liệu âm thanh thô chỉ được xử lý tạm thời trong bộ nhớ RAM của trình duyệt người học và bị hủy bỏ ngay khi phiên kết thúc; không truyền tải qua mạng.                                   |

---

## 6. Đặc tả REST API (REST API Specifications)

### Nộp kết quả chấm điểm phát âm: `POST /api/v1/practice/voice/submit`

- **Mô tả**: Tiếp nhận kết quả nhận diện giọng nói từ client, xác thực quyền sở hữu thẻ từ, kiểm tra cooldown chống spam, tính toán lại độ chính xác Levenshtein trên máy chủ, áp trần XP ngày và cập nhật chuỗi Streak.
- **Bảo mật**: Yêu cầu `Bearer Token` (`JwtAuthGuard`).
- **Headers**:
  - `Authorization: Bearer <jwt-token>`
  - `Content-Type: application/json`

#### Request Body (`SubmitVoiceDto` / `VoicePronunciationSubmitDto`):

```json
{
  "cardId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "spokenTranscript": "eloquent",
  "targetWord": "eloquent",
  "accuracyScore": 100,
  "accent": "en-US",
  "timeSpentMs": 1820,
  "evaluationMode": "STRICT"
}
```

#### Ràng buộc dữ liệu (Validation Rules):

| Trường             | Kiểu dữ liệu | Bắt buộc | Ràng buộc validation                                          |
| :----------------- | :----------- | :------- | :------------------------------------------------------------ |
| `cardId`           | `string`     | Có       | Phải là định dạng UUID v4 hợp lệ (`@IsUUID('4')`).            |
| `spokenTranscript` | `string`     | Có       | Chuỗi không được để trống (`@IsNotEmpty()`, `@IsString()`).   |
| `accuracyScore`    | `number`     | Không    | Số nguyên từ 0 đến 100 (`@Min(0)`, `@Max(100)`).              |
| `targetWord`       | `string`     | Không    | Chuỗi ký tự từ vựng mục tiêu.                                 |
| `accent`           | `string`     | Không    | Chỉ chấp nhận `'en-US'` hoặc `'en-GB'` (`@IsIn`).             |
| `timeSpentMs`      | `number`     | Không    | Số dương đại diện thời gian phát âm tính bằng ms (`@Min(0)`). |
| `evaluationMode`   | `string`     | Không    | Giá trị `'STRICT'` hoặc `'LENIENT'` (`@IsIn`).                |

#### Phản hồi thành công (HTTP 200 OK):

```json
{
  "success": true,
  "data": {
    "isPassed": true,
    "accuracyScore": 100,
    "tier": "EXACT",
    "xpAwarded": 10,
    "isDailyCapped": false,
    "streakAdvanced": true,
    "diffSpans": [
      { "char": "e", "type": "MATCH" },
      { "char": "l", "type": "MATCH" },
      { "char": "o", "type": "MATCH" },
      { "char": "q", "type": "MATCH" },
      { "char": "u", "type": "MATCH" },
      { "char": "e", "type": "MATCH" },
      { "char": "n", "type": "MATCH" },
      { "char": "t", "type": "MATCH" }
    ]
  },
  "message": "Voice pronunciation evaluated successfully"
}
```

#### Phản hồi khi đạt trần XP ngày (HTTP 200 OK):

```json
{
  "success": true,
  "data": {
    "isPassed": true,
    "accuracyScore": 91,
    "tier": "CLOSE",
    "xpAwarded": 0,
    "isDailyCapped": true,
    "streakAdvanced": true,
    "diffSpans": [
      { "char": "p", "type": "MATCH" },
      { "char": "r", "type": "MATCH" },
      { "char": "e", "type": "MATCH" },
      { "char": "l", "type": "MATCH" },
      { "char": "i", "type": "MATCH" },
      { "char": "m", "type": "MATCH" },
      { "char": "i", "type": "MATCH" },
      { "char": "n", "type": "MATCH" },
      { "char": "a", "type": "MISSING" },
      { "char": "r", "type": "MATCH" },
      { "char": "y", "type": "MATCH" }
    ]
  },
  "message": "Voice pronunciation evaluated successfully"
}
```

#### Mã lỗi thường gặp (Error Status Codes):

- `400 Bad Request`: Payload không hợp lệ (sai định dạng UUID, thiếu `spokenTranscript`).
- `403 Forbidden`: Người dùng không sở hữu bộ thẻ và bộ thẻ không ở chế độ công khai (`isPublic = false`).
- `404 Not Found`: Không tìm thấy thẻ từ vựng với `cardId` tương ứng.
- `429 Too Many Requests`: Gửi yêu cầu quá nhanh ($< 1500\text{ms}$ giữa 2 lần nộp liên tiếp).

---

## 7. Cấu trúc Kiểu dữ liệu (`packages/shared-types`)

Tất cả các giao diện dữ liệu của tính năng được định nghĩa tập trung trong [`packages/shared-types/src/practice.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/practice.ts):

```typescript
export const VoicePronunciationTier = {
  EXACT: "EXACT",
  CLOSE: "CLOSE",
  RETRY: "RETRY",
} as const;

export type VoicePronunciationTier =
  (typeof VoicePronunciationTier)[keyof typeof VoicePronunciationTier];

export const VoiceEvaluationMode = {
  STRICT: "STRICT",
  LENIENT: "LENIENT",
} as const;

export type VoiceEvaluationMode =
  (typeof VoiceEvaluationMode)[keyof typeof VoiceEvaluationMode];

export type VoicePracticeState =
  | "IDLE"
  | "PRE_PROMPT"
  | "REQUESTING"
  | "LISTENING"
  | "PROCESSING"
  | "EVALUATED"
  | "PERMISSION_DENIED"
  | "ERROR";

export interface IpaSyllableToken {
  syllable: string;
  isPrimaryStress: boolean;
  isSecondaryStress: boolean;
  rawIpa?: string;
}

export type DiffSpanType = "MATCH" | "MISSING" | "EXTRA" | "WRONG";

export interface DiffSpan {
  char: string;
  type: DiffSpanType;
}

export interface VoicePronunciationSubmitDto {
  cardId: string;
  spokenTranscript: string;
  targetWord?: string;
  accuracyScore?: number;
  accent?: "en-US" | "en-GB" | string;
  timeSpentMs?: number;
  evaluationMode?: VoiceEvaluationMode;
}

export interface VoicePronunciationResultDto {
  isPassed: boolean;
  accuracyScore: number;
  tier: VoicePronunciationTier;
  xpAwarded: number;
  isDailyCapped: boolean;
  streakAdvanced: boolean;
  diffSpans?: DiffSpan[];
}

export interface VoicePracticeAttempt {
  id?: string;
  userId?: string;
  cardId: string;
  targetWord: string;
  recognizedText: string;
  accuracyScore: number;
  isPassed: boolean;
  xpAwarded: number;
  accentUsed?: string;
  createdAt?: Date | string;
}
```

---

## 8. Các thay đổi Kỹ thuật trong Mã nguồn (Codebase Changes)

### 8.1. Shared Types (`packages/shared-types`)

- [`packages/shared-types/src/practice.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/practice.ts): Bổ sung các kiểu dữ liệu `VoicePronunciationTier`, `VoiceEvaluationMode`, `VoicePracticeState`, `IpaSyllableToken`, `VoicePronunciationSubmitDto`, `VoicePronunciationResultDto`, `VoicePracticeAttempt`.
- [`packages/shared-types/src/gamification-xp.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/gamification-xp.ts): Bổ sung hằng số hoạt động `VOICE_PRONUNCIATION` (+10 XP).

### 8.2. Backend NestJS (`apps/api`)

- [`apps/api/src/modules/practice/utils/pronunciation-scoring.util.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/practice/utils/pronunciation-scoring.util.ts): Cài đặt thuật toán Levenshtein distance 2 dòng bộ nhớ, chuẩn hóa chuỗi `normalizePronunciationText`, và thuật toán LCS diff `computeDiffSpans`.
- [`apps/api/src/modules/practice/dto/submit-voice.dto.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/practice/dto/submit-voice.dto.ts): DTO validate dữ liệu nộp bài với các decorators `class-validator` (@IsUUID, @IsNotEmpty, @IsIn).
- [`apps/api/src/modules/practice/practice.service.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/practice/practice.service.ts): Xử lý nghiệp vụ `submitVoicePronunciation`, kiểm tra cooldown $1500\text{ms}$ (`checkVoiceCooldown`), xác thực quyền truy cập bộ thẻ, kiểm tra trần $500\text{ XP/ngày}$, ghi log hoạt động `VOICE_PRONUNCIATION` và cập nhật chuỗi streak.
- [`apps/api/src/modules/practice/practice.controller.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/practice/practice.controller.ts): Đăng ký endpoint `POST /api/v1/practice/voice/submit`.
- [`apps/api/src/modules/practice/practice.module.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/practice/practice.module.ts): Đăng ký module và các providers.

### 8.3. Frontend React 19 (`apps/web`)

- [`apps/web/src/features/practice/utils/pronunciationScorer.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/utils/pronunciationScorer.ts): Thuật toán client-side chấm điểm Levenshtein và sinh diff spans phục vụ phản hồi tức thì $< 100\text{ms}$.
- [`apps/web/src/features/practice/utils/ipaSyllableParser.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/utils/ipaSyllableParser.ts): Bộ phân tích cú pháp chuỗi ký tự ngữ âm IPA thành các thẻ âm tiết độc lập và nhận diện trọng âm.
- [`apps/web/src/features/practice/hooks/useSpeechRecognition.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/hooks/useSpeechRecognition.ts): Custom hook đóng gói Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), hỗ trợ interim streaming, tự động hủy và watchdog im lặng 2500ms / tối đa 8000ms.
- [`apps/web/src/features/practice/hooks/useAudioVisualizer.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/hooks/useAudioVisualizer.ts): Custom hook quản lý Web Audio `AnalyserNode` FFT 60 FPS, chuyển đổi tín hiệu micro thành mảng cường độ sóng âm.
- [`apps/web/src/features/practice/hooks/useAudioSynthesizer.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/hooks/useAudioSynthesizer.ts): Custom hook phát âm thanh bản xứ với cờ `preservesPitch = true`, toggle tốc độ $0.75\times$, và tự động fallback sang `window.speechSynthesis`.
- [`apps/web/src/features/practice/hooks/useWebAudioSynthesizer.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/hooks/useWebAudioSynthesizer.ts): Bộ phát âm thanh dao động sóng (Sine Chime / Neutral Tone) thông báo kết quả chấm điểm.
- [`apps/web/src/features/practice/hooks/useVoicePracticeEngine.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/practice/hooks/useVoicePracticeEngine.ts): State machine điều phối toàn diện phiên luyện phát âm: từ cấp quyền micro, ghi âm, tính điểm, gọi API nộp bài đến cập nhật phần thưởng.
- [`apps/web/src/components/voice/AcousticSoundwave.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/AcousticSoundwave.tsx): Giao diện hiển thị sóng âm phổ động 5–7 thanh với hiệu ứng chuyển động mượt mà.
- [`apps/web/src/components/voice/PronunciationScoreBadge.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/PronunciationScoreBadge.tsx): Huy hiệu hiển thị điểm số và phân hạng kết quả (Exact, Close, Retry) cùng icon sinh động.
- [`apps/web/src/components/voice/AccentAudioSelector.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/AccentAudioSelector.tsx): Bộ nút chuyển đổi phương ngữ US/UK, nút phát âm thanh và nút toggle tốc độ 0.75x.
- [`apps/web/src/components/voice/PhoneticWordBreakdown.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/PhoneticWordBreakdown.tsx): Giao diện hiển thị âm tiết IPA có thể nhấp để phát âm từng đoạn độc lập.
- [`apps/web/src/components/voice/MicPermissionBanner.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/MicPermissionBanner.tsx): Khung thông báo và hướng dẫn mở khóa micro khi bị trình duyệt chặn.
- [`apps/web/src/components/voice/PronunciationPracticeModal.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/components/voice/PronunciationPracticeModal.tsx): Modal phòng luyện âm hoàn chỉnh tích hợp toàn bộ các thành phần trên, hỗ trợ phím tắt và hiệu ứng UI lỏng kính (Liquid Glass).
- **Tích hợp giao diện người dùng**:
  - [`apps/web/src/features/decks/pages/DeckDetailPage.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/decks/pages/DeckDetailPage.tsx): Nút Mic luyện phát âm trong bảng từ vựng và chi tiết thẻ.
  - [`apps/web/src/features/reviews/pages/ReviewSessionPage.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/reviews/pages/ReviewSessionPage.tsx): Nút Mic luyện phát âm trong phiên ôn tập Flashcard lặp lại ngắt quãng.
  - [`apps/web/src/features/cards/components/CardDataTable.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/cards/components/CardDataTable.tsx) & [`CardItemCard.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/web/src/features/cards/components/CardItemCard.tsx): Tích hợp trigger kích hoạt Modal luyện phát âm trực tiếp.

---

## 9. Ma trận Kiểm thử & Độ bao phủ (Testing Matrix & Coverage)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATED TEST SUITES SUMMARY (100% PASS)                       │
├─────────────────────────────────────────────────────────────┬───────────┬──────────────┤
│ Test Suite File                                             │ Số lượng  │ Trạng thái   │
├─────────────────────────────────────────────────────────────┼───────────┼──────────────┤
│ **Backend Suites (NestJS / Jest)**                          │           │              │
│ - `utils/pronunciation-scoring.util.spec.ts`                 │ 15 tests  │ ✅ 100% Pass │
│ - `dto/submit-voice.dto.spec.ts`                            │ 7 tests   │ ✅ 100% Pass │
│ - `practice.service.spec.ts` (Voice pronunciation scenarios)│ 11 tests  │ ✅ 100% Pass │
│ - `practice.controller.spec.ts` (Voice endpoint scenarios)  │ 13 tests  │ ✅ 100% Pass │
├─────────────────────────────────────────────────────────────┼───────────┼──────────────┤
│ **Frontend Suites (React 19 / Vitest)**                     │           │              │
│ - `utils/pronunciationScorer.spec.ts`                       │ 4 tests   │ ✅ 100% Pass │
│ - `utils/ipaSyllableParser.spec.ts`                         │ 2 tests   │ ✅ 100% Pass │
│ - `hooks/useSpeechRecognition.spec.ts`                      │ 4 tests   │ ✅ 100% Pass │
│ - `hooks/useAudioVisualizer.spec.ts`                        │ 2 tests   │ ✅ 100% Pass │
│ - `hooks/useAudioSynthesizer.spec.ts`                       │ 4 tests   │ ✅ 100% Pass │
│ - `hooks/useWebAudioSynthesizer.spec.ts`                    │ 8 tests   │ ✅ 100% Pass │
│ - `hooks/useVoicePracticeEngine.spec.ts`                    │ 3 tests   │ ✅ 100% Pass │
│ - `components/AccentAudioSelector.spec.tsx`                 │ 3 tests   │ ✅ 100% Pass │
│ - `components/AcousticSoundwave.spec.tsx`                   │ 3 tests   │ ✅ 100% Pass │
│ - `components/MicPermissionBanner.spec.tsx`                 │ 2 tests   │ ✅ 100% Pass │
│ - `components/PhoneticWordBreakdown.spec.tsx`               │ 2 tests   │ ✅ 100% Pass │
│ - `components/PronunciationScoreBadge.spec.tsx`             │ 4 tests   │ ✅ 100% Pass │
│ - `components/PronunciationPracticeModal.spec.tsx`          │ 5 tests   │ ✅ 100% Pass │
├─────────────────────────────────────────────────────────────┼───────────┼──────────────┤
│ **TỔNG CỘNG KIỂM THỬ VOICE PRONUNCIATION FEATURE**          │ **92 tests**│ ✅ **100% PASS**│
└─────────────────────────────────────────────────────────────┴───────────┴──────────────┘
```

### Các ca kiểm thử biên tiêu biểu đã được xác minh:

1. **Chuẩn hóa chuỗi & Khớp chính xác 100%**: Xử lý dấu câu, chữ hoa/thường, khoảng trắng thừa giữa `"  Eloquent! "` và `"eloquent"`, trả về $100\%$ và phân hạng `EXACT`.
2. **So khớp gần đúng (80–99%)**: Phát hiện ký tự thiếu trong `"preliminry"` so với `"preliminary"`, tính toán $\approx 91\%$ và gắn nhãn `CLOSE`.
3. **Cần thử lại (<80%)**: Phát âm sai lệch nhiều (`"ep-tomb"` so với `"epitome"`), tính điểm $< 80\%$, xếp hạng `RETRY` và trao $0\text{ XP}$.
4. **Hàng rào thời gian Cooldown 1500ms**: Gửi 2 lượt nộp bài cách nhau $< 1500\text{ms}$ trả về mã lỗi HTTP 429 `Too Many Requests`.
5. **Trần kinh nghiệm ngày 500 XP**: Người dùng đã đạt trần $500\text{ XP}$ hôm nay vẫn hoàn thành đánh giá và thăng tiến streak nhưng nhận $0\text{ XP}$ với cờ `isDailyCapped: true`.
6. **Bảo toàn cao độ âm thanh**: Đảm bảo thuộc tính `preservesPitch = true` luôn được thiết lập khi chuyển đổi tốc độ phát $0.75\times$.
7. **Tự động chuyển đổi SpeechSynthesis**: Giả lập lỗi tải audio hoặc URL rỗng, xác minh `window.speechSynthesis.speak` được gọi đúng giọng đọc `en-US` hoặc `en-GB`.
8. **Watchdog giám sát thời gian thu âm**: Tự động kích hoạt kết thúc thu âm sau 2500ms im lặng hoặc 8000ms tối đa, giải phóng an toàn tất cả audio tracks.

---

## 10. Tác giả & Phê duyệt (Authors & Sign-off)

- **Technical Documentation Architect**: AI (Antigravity)
- **Specification**: [.specify/features/speech-pronunciation-assessment/spec.md](../../.specify/features/speech-pronunciation-assessment/spec.md)
- **Test Plan**: [.specify/features/speech-pronunciation-assessment/test-plan.md](../../.specify/features/speech-pronunciation-assessment/test-plan.md)
- **Traceability Matrix**: [.specify/features/speech-pronunciation-assessment/traceability-matrix.md](../../.specify/features/speech-pronunciation-assessment/traceability-matrix.md)
- **Validation Report**: [IEEE 29148 Compliance Report (100% Pass)](../../.specify/features/speech-pronunciation-assessment/validation-report.md)
- **Reviewed & Approved by**: User (Approved Implementation Plan)
- **Ship Date**: 2026-08-21
- **Status**: Hoàn thành (`Delivered`)
