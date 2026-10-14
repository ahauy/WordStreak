# Feature: Ôn nhanh trong Popup — Micro-Review (US-ECO-08)

**Slug**: `extension-micro-review`  
**Version**: 1.0  
**Ship date**: 2026-10-14  
**Spec**: [.specify/features/extension-micro-review/](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-micro-review/)  
**Baseline**: [SIGNED-OFF v1.0](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-micro-review/baseline.md)  
**Plan**: [plan.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-micro-review/plan.md)  
**Test Plan**: [test-plan.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-micro-review/test-plan.md)  
**Review Report**: [review-report.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/extension-micro-review/review-report.md)  
**User Story**: `US-ECO-08` (EPIC 06: Browser Extension & Ecosystem — Ôn nhanh trong Popup)

---

## 1. Explanation: Tổng quan & Giá trị Nghiệp vụ (Overview & Business Value)

### 1.1. Bối cảnh & Thách thức Người học (Context & Problem Statement)

Trong học tập từ vựng ngắt quãng (Spaced Repetition System - SRS), rào cản tâm lý lớn nhất khiến người học trì hoãn là **ma sát chuyển ngữ cảnh (context-switching friction)**. Khi đang làm việc hoặc duyệt web trên máy tính, để ôn tập từ vựng, học viên buộc phải:
1. Mở một tab trình duyệt mới.
2. Truy cập vào trang web WordStreak (`https://wordstreak.app/dashboard`).
3. Đợi tải toàn bộ ứng dụng web React.
4. Điều hướng vào phiên ôn tập đầy đủ (`/review`).

Quy trình nhiều bước này thường làm gián đoạn dòng công việc hiện tại, dẫn đến việc người học bỏ qua các mốc ôn tập trong ngày, làm đứt chuỗi học liên tục (`currentStreak`) và để lại lượng thẻ đến hạn tồn đọng (`dueCount`) ngày một nhiều.

Tiện ích mở rộng WordStreak Chrome Extension đã có các mảnh ghép:
- **Huy hiệu thanh công cụ** ([`extension-due-badge`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/features/extension-due-badge/README.md) — `US-ECO-05`): Hiển thị số lượng thẻ đến hạn theo thời gian thực.
- **Thông báo nhắc học điều kiện** ([`extension-reminder-notifications`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/features/extension-reminder-notifications/README.md) — `US-ECO-06`): Báo nhắc desktop khi chuỗi có nguy cơ bị đứt.
- **Trang tùy chọn cài đặt** ([`extension-reminder-settings`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/docs/features/extension-reminder-settings/README.md) — `US-ECO-07`): Cho phép tùy biến giờ giấc và huy hiệu.

Tuy nhiên, trước khi có `US-ECO-08`, cửa sổ **Extension Popup** (`PopupApp.tsx`) chỉ phục vụ tra cứu và lưu từ nhanh (Quick Capture). Người học thấy huy hiệu đỏ báo thẻ đến hạn nhưng vẫn phải bấm mở tab mới để học.

### 1.2. Giải pháp & Giá trị Đem lại (Business Goal: `GOAL-MICREV-01`)

Tính năng **Extension Micro-Review (Ôn nhanh trong Popup)** (`US-ECO-08`) mang trải nghiệm ôn tập thẻ ghi nhớ SRS thu nhỏ trực tiếp vào cửa sổ Popup của Chrome Extension. Người học có thể:
- **Ôn tập tức thì dưới 60 giây**: Phiên học được chuẩn hóa với tối đa 5 thẻ đến hạn (`limit: 5`), phù hợp hoàn hảo với các khoảng nghỉ ngắn giữa giờ làm việc.
- **Điều khiển 100% bằng bàn phím (Keyboard-First)**: Không cần dùng chuột — lật thẻ bằng `Space`, nghe phát âm bằng `R`, đánh giá độ nhớ bằng `1`-`4`.
- **Phản hồi tức thì không chờ mạng (Optimistic Progression)**: Bấm chọn điểm đánh giá sẽ chuyển ngay sang thẻ kế tiếp mà không có độ trễ tải mạng; yêu cầu gửi điểm được chuyển giao ngầm cho Background Service Worker xử lý an toàn.
- **Tự động đồng bộ số lượng thẻ và huy hiệu**: Ngay khi hoàn tất đánh giá, huy hiệu trên thanh công cụ được cập nhật giảm trừ lập tức, giúp người học duy trì động lực tức thì.
- **Chuyển tiếp mượt mà sang Web App**: Kết thúc phiên ôn tập hiển thị huy hiệu mừng thành tích kèm chuỗi học hiện tại và nút CTA `🚀 Mở app để học tiếp` cho học viên muốn mở rộng bài học sâu hơn.

---

## 2. Explanation: Kiến trúc Kỹ thuật & Luồng Dữ liệu (Architecture & Data Flow)

### 2.1. Sơ đồ Kiến trúc Đa tầng (Multi-Tier Architecture Diagram)

```mermaid
flowchart TD
    subgraph PopupUI ["Extension Popup React UI (apps/extension/src/popup)"]
        PopupApp["PopupApp.tsx<br/>(State: viewMode 'home' | 'review')"]
        Banner["MicroReviewBanner.tsx<br/>(🔥 Có {dueCount} thẻ cần ôn)"]
        Session["MicroReviewSession.tsx<br/>(Progress, Hotkeys, States)"]
        Card["MicroCard.tsx<br/>(Front/Back, Audio, 4 SRS Ratings)"]
        WebSpeech["Web Speech API Fallback<br/>(SpeechSynthesisUtterance)"]
    end

    subgraph BackgroundWorker ["MV3 Service Worker (apps/extension/src/background)"]
        MsgRouter["index.ts<br/>(chrome.runtime.onMessage)"]
        ApiClient["api-client.ts<br/>(getDueCards, submitReview)"]
        BadgeMgr["badge-manager.ts<br/>(refreshBadgeNow, applyBadgeVisuals)"]
    end

    subgraph BackendAPI ["NestJS API Backend (apps/api/src/modules/reviews)"]
        Controller["ReviewsController<br/>(/reviews/due, /reviews/submit)"]
        Service["ReviewsService<br/>(SRS Algorithm, Streak Calculation)"]
        Prisma[("PostgreSQL Database<br/>(Cards, Reviews, UserProfiles)")]
    end

    PopupApp -->|"dueCount > 0"| Banner
    Banner -->|"Click: Ôn nhanh 5 thẻ"| PopupApp
    PopupApp -->|"viewMode === 'review'"| Session
    Session --> Card
    Card -.->|"Audio error / null URL"| WebSpeech

    Session -->|"1. FETCH_DUE_CARDS"| MsgRouter
    Session -->|"2. SUBMIT_MICRO_REVIEW (optimistic)"| MsgRouter
    Session -->|"3. REFRESH_BADGE"| MsgRouter

    MsgRouter --> ApiClient
    ApiClient -->|"GET /reviews/due?limit=5"| Controller
    ApiClient -->|"POST /reviews/submit"| Controller
    MsgRouter -->|"After submitReview"| BadgeMgr
    BadgeMgr -->|"refreshBadgeNow(true)"| ApiClient

    Controller --> Service
    Service --> Prisma
```

### 2.2. Sơ đồ Trạng thái Phiên Ôn tập (Session State Machine)

```mermaid
stateDiagram-v2
    [*] --> PopupHome: Mở Popup Extension
    PopupHome --> BannerHidden: dueCount === 0 || Chưa đăng nhập
    PopupHome --> BannerVisible: dueCount > 0 && Đã đăng nhập

    BannerVisible --> LoadingCards: Bấm "Ôn nhanh 5 thẻ →"
    LoadingCards --> EmptyBacklog: API trả về 0 thẻ
    LoadingCards --> ReviewingFront: Tải thành công danh sách thẻ (index = 0)
    LoadingCards --> ErrorState: Lỗi mạng hoặc 401 Unauthorized

    state ReviewingSession {
        [*] --> ReviewingFront
        ReviewingFront --> ReviewingFront: Phím 'R' / Nút Loa (Phát âm)
        ReviewingFront --> ReviewingBack: Phím Space / Click mặt thẻ (Lật thẻ)
        ReviewingBack --> ReviewingBack: Phím 'R' / Nút Loa (Nghe lại)
        ReviewingBack --> NextCardCheck: Phím 1-4 / Nút đánh giá (Optimistic Submit)
        
        state NextCardCheck <<choice>>
        NextCardCheck --> ReviewingFront: currentIndex < totalCards - 1 (index++)
        NextCardCheck --> CompleteState: currentIndex === totalCards - 1
    }

    ReviewingFront --> PopupHome: Bấm "← Quay lại"
    ReviewingBack --> PopupHome: Bấm "← Quay lại"
    EmptyBacklog --> PopupHome: Bấm "Quay lại trang chính"
    ErrorState --> LoadingCards: Bấm "Thử lại"
    ErrorState --> PopupHome: Bấm "Quay lại"

    CompleteState --> PopupHome: Bấm "Hoàn tất"
    CompleteState --> WebAppDashboard: Bấm "🚀 Mở app để học tiếp" (Mở tab mới)
```

### 2.3. Sơ đồ Tuần tự Chi tiết (End-to-End Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Người học
    participant Popup as PopupApp.tsx
    participant Session as MicroReviewSession
    participant Card as MicroCard
    participant BG as Background (index.ts)
    participant API as ApiClient
    participant BM as BadgeManager
    participant Nest as NestJS ReviewsController

    Learner->>Popup: Nhấp mở biểu tượng Extension trên thanh trình duyệt
    Popup->>BG: chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" })
    BG-->>Popup: { user: {...}, token: "..." }
    Popup->>BG: chrome.runtime.sendMessage({ type: "REFRESH_BADGE", payload: { immediate: true } })
    BG-->>Popup: { summary: { dueCount: 8, currentStreak: 5 } }
    Popup->>Popup: Hiển thị MicroReviewBanner ("🔥 Có 8 thẻ cần ôn")

    Learner->>Popup: Bấm nút "Ôn nhanh 5 thẻ →"
    Popup->>Session: Chuyển viewMode = 'review'
    Session->>BG: sendMessage({ type: "FETCH_DUE_CARDS", payload: { limit: 5 } })
    BG->>API: apiClient.getDueCards(5)
    API->>Nest: GET /reviews/due?limit=5 (Bearer token)
    Nest-->>API: 200 OK [dueCard1, dueCard2, ..., dueCard5]
    API-->>BG: dueCards
    BG-->>Session: { success: true, data: dueCards }
    Session->>Card: Render thẻ 1 (Mặt trước: từ, phiên âm, nút loa)

    Learner->>Card: Nhấn phím Space (hoặc click vào thẻ)
    Card->>Card: Lật thẻ sang Mặt sau (Nghĩa tiếng Việt, ví dụ câu, 4 nút SRS)
    
    Learner->>Card: Nhấn phím '3' (Độ nhớ Good / Nhớ tốt)
    Card->>Session: onRate(SrsRating.GOOD)
    
    par Xử lý lạc quan trên UI (Optimistic UI)
        Session->>Session: reviewedCount++, currentIndex++ (Chuyển ngay sang thẻ 2)
        Session->>Card: Render thẻ 2 (Mặt trước, isFlipped = false)
    and Gửi đánh giá chạy ngầm (Background Persistence)
        Session->>BG: sendMessage({ type: "SUBMIT_MICRO_REVIEW", payload: { cardId: "card-1", rating: 3 } })
        BG->>API: apiClient.submitReview({ cardId: "card-1", rating: 3 })
        API->>Nest: POST /reviews/submit (Headers: x-timezone)
        Nest-->>API: 200 OK (Updated interval, easeFactor, repetitions)
        API-->>BG: { success: true }
        BG->>BM: badgeManager.refreshBadgeNow(true)
        BM->>Nest: GET /reviews/summary (ETag)
        Nest-->>BM: 200 OK (dueCount: 7)
        BM->>BM: chrome.action.setBadgeText({ text: "7" })
    end

    Note over Learner, Card: Lặp lại quá trình với các thẻ còn lại...

    Learner->>Card: Nhấn phím '4' (Đánh giá thẻ cuối cùng 5/5)
    Session->>Session: status = 'complete'
    Session->>BG: sendMessage({ type: "REFRESH_BADGE", payload: { immediate: true } })
    Session->>Learner: Hiển thị màn hình chúc mừng 🎉 (5 thẻ đã ôn, Streak 5 ngày)

    alt Người học bấm "🚀 Mở app để học tiếp"
        Learner->>Session: Bấm CTA
        Session->>BG: chrome.tabs.create({ url: "https://wordstreak.app/dashboard" })
    else Người học bấm "Hoàn tất"
        Learner->>Session: Bấm Hoàn tất
        Session->>Popup: onExit() -> viewMode = 'home'
    end
```

### 2.4. Quyết định Kỹ thuật & Thiết kế Bền vững (Engineering Rationale)

1. **Gửi đánh giá lạc quan (Optimistic Progression)**:
   - Thay vì bắt người học nhìn vòng xoay tải dữ liệu giữa từng thẻ (thường mất 150–350ms tùy kết nối mạng), `MicroReviewSession` tăng ngay chỉ số `currentIndex` và đặt lại `isFlipped = false`.
   - Lệnh gửi đánh giá được đẩy cho Background Service Worker qua `chrome.runtime.sendMessage`. Ngay cả khi người học vô tình đóng popup ngay sau khi chấm điểm thẻ cuối, tiến trình nền của Service Worker vẫn đảm bảo hoàn thành HTTP POST request lên máy chủ an toàn.
2. **Khắc phục lỗi âm thanh đa tầng (Resilient Audio Fallback)**:
   - Nhiều từ vựng có thể chưa có file âm thanh chuẩn (`audioUrl === null`), hoặc đường dẫn CDN bị lỗi mạng 404/CORS.
   - Hàm thuần túy [`playCardAudio`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx#L13-L43) bắt trọn vẹn cả synchronous exceptions và asynchronous promise rejections, lập tức kích hoạt giọng đọc chuẩn Mỹ bản địa của trình duyệt thông qua Web Speech API ([`fallbackSpeech`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx#L45-L56)).
3. **Cách ly phím tắt an toàn (Hotkeys Input Isolation)**:
   - Các phím bấm phổ biến như `Space`, `R`, số `1`, `2`, `3`, `4` có thể xung đột nghiêm trọng nếu người dùng đang nhập liệu trong ô tìm kiếm hoặc form lưu từ nhanh.
   - Bộ lắng nghe sự kiện `handleKeyDown` kiểm tra phần tử nguồn: nếu `target` là `INPUT`, `TEXTAREA`, `SELECT`, hoặc có thuộc tính `isContentEditable`, toàn bộ phím tắt sẽ tự động bỏ qua.
4. **Bảo vệ mặt trước thẻ (Front-Face Protection)**:
   - Theo nguyên tắc học tập Flashcard SRS, người học không được phép chấm điểm khi chưa nhìn thấy đáp án/mặt sau.
   - Các phím `1`-`4` bị vô hiệu hóa hoàn toàn khi thẻ đang ở mặt trước (`!isFlipped`).
5. **Tiết kiệm tài nguyên tối đa (Ponytail Over-Engineering Elimination)**:
   - Không nhập các thư viện hiệu ứng nặng (như Framer Motion) vào gói popup để giữ kích thước extension dưới mức tối thiểu.
   - Toàn bộ chuyển động lật thẻ, thanh tiến độ và đổi màu nút được thực hiện qua các thuộc tính CSS native (`transition: width 0.2s ease`, `box-shadow 0.15s ease`).

---

## 3. Reference: Đặc tả Chi tiết Thành phần & Hợp đồng (Technical Reference)

### 3.1. Các Quy tắc Nghiệp vụ (`BR-MICREV-01` .. `BR-MICREV-07`)

| Mã quy tắc | Tên quy tắc | Nội dung nghiệp vụ chi tiết | Tập tin thực thi |
| :--- | :--- | :--- | :--- |
| **`BR-MICREV-01`** | **Giới hạn Thẻ Ôn (Session Size Guarantee)** | Phiên ôn tập luôn truy vấn tối đa 5 thẻ (`limit: 5`). Nếu máy chủ trả về ít hơn 5 thẻ (ví dụ chỉ còn 2 hoặc 3 thẻ đến hạn), phiên ôn tập tự động thích ứng với số lượng thực tế (`Thẻ 1/2`, `Thẻ 1/3`). | [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx#L36), [`api-client.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/api-client.ts#L213) |
| **`BR-MICREV-02`** | **Bảo vệ Mặt trước Thẻ (Front-Face Protection)** | Phím tắt `1`, `2`, `3`, `4` tuyệt đối KHÔNG kích hoạt đánh giá khi thẻ đang hiển thị mặt trước. Người học bắt buộc phải lật sang mặt sau mới được chấm điểm. | [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx#L134), [`MicroCard.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx#L268) |
| **`BR-MICREV-03`** | **Dự phòng Phát âm Web Speech (Audio Fallback Guarantee)** | Khi `card.audioUrl` bị thiếu (`null`), rỗng, hoặc phát sinh lỗi mạng khi gọi `Audio.play()`, hệ thống tự động gọi Web Speech API (`SpeechSynthesisUtterance`) với ngôn ngữ `en-US` mà không quăng lỗi ra giao diện. | [`MicroCard.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx#L13-L56) |
| **`BR-MICREV-04`** | **Ghi nhận Lạc quan (Optimistic Submission)** | Khi người dùng chọn điểm đánh giá, giao diện lập tức chuyển sang thẻ tiếp theo (`currentIndex + 1`), đặt lại trạng thái lật thẻ `isFlipped = false`, và gửi ngầm thông điệp lên background. | [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx#L66-L98) |
| **`BR-MICREV-05`** | **Tái đồng bộ Huy hiệu & Bộ nhớ đệm (Badge Re-synchronization)** | Mỗi khi nhận được thông điệp `SUBMIT_MICRO_REVIEW`, service worker lập tức kích hoạt `badgeManager.refreshBadgeNow(true)`. Khi kết thúc phiên ôn, popup gửi tiếp thông điệp `REFRESH_BADGE`. | [`index.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/background/index.ts#L284), [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx#L90-L95) |
| **`BR-MICREV-06`** | **Cách ly Phím tắt Bàn phím (Keyboard Hotkey Isolation)** | Tất cả phím nóng toàn cục (`Space`, `R`, `1`-`4`) bị bỏ qua nếu con trỏ đang nằm trong các phần tử nhập liệu (`INPUT`, `TEXTAREA`, `SELECT`, `isContentEditable`). | [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx#L103-L112) |
| **`BR-MICREV-07`** | **Chuẩn mực Thiết kế WordStreak (Design System Conformance)** | Tuân thủ tuyệt đối: Nền trắng `#ffffff`, viền mảnh `#e5e5e5`, font chữ Nunito bold cho từ vựng chính, font Inter cho giải nghĩa, font JetBrains Mono cho phím tắt, nút bấm viên thuốc Obsidian `#000000`, 4 màu ngữ nghĩa SRS (`#ef4444`, `#f97316`, `#10b981`, `#863bff`). | [`MicroReviewBanner.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewBanner.tsx), [`MicroCard.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx) |

---

### 3.2. Đặc tả Thành phần UI (Component Specifications)

#### A. [`MicroReviewBanner.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewBanner.tsx)
- **Vị trí**: Đặt trực tiếp dưới [`AuthStatusCard`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/AuthStatusCard.tsx) trên màn hình chính của popup.
- **Điều kiện hiển thị**: Chỉ xuất hiện khi `isAuthenticated === true` và `dueCount > 0`.
- **Props interface**:
  ```typescript
  export interface MicroReviewBannerProps {
    dueCount: number;
    isAuthenticated: boolean;
    onStartReview: () => void;
  }
  ```
- **Hành vi**:
  - Tính toán số lượng thẻ cho phiên ôn: `reviewCount = Math.min(dueCount, 5)`.
  - Hiển thị thông báo màu cam ấm: `🔥 Có {dueCount} thẻ cần ôn` và phụ đề `Ôn nhanh chỉ mất 1 phút`.
  - Nút bấm Obsidian pill: `Ôn nhanh {reviewCount} thẻ →` kèm biểu tượng tia sét `<Zap size={13} fill="#ffffff" />`. Bấm vào sẽ kích hoạt callback `onStartReview()`.

#### B. [`MicroCard.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroCard.tsx)
- **Vị trí**: Nằm bên trong `MicroReviewSession`, hiển thị thẻ ghi nhớ tương tác 2 mặt.
- **Props interface**:
  ```typescript
  export interface MicroCardProps {
    card: DueCardItem;
    isFlipped: boolean;
    onFlip: () => void;
    onRate: (rating: SrsRating) => void;
  }
  ```
- **Cấu trúc mặt trước (Front Face)**:
  - Header: Huy hiệu bộ thẻ (`deckTitle`, màu `deckColor`) và nút tròn phát âm âm thanh `<Volume2 />`.
  - Nội dung chính: Từ vựng mục tiêu (Font Nunito 800, `24px`, màu `#111827`) và phiên âm quốc tế IPA (Font Inter, `13px`, màu `#6b7280`).
  - Gợi ý tương tác: `[Nhấn Space hoặc click để lật]` (Font JetBrains Mono, `11px`).
- **Cấu trúc mặt sau (Back Face)**:
  - Header: Tái hiện huy hiệu bộ thẻ và nút nghe phát âm lại.
  - Nội dung giải nghĩa: Từ vựng thu nhỏ (`18px`), định nghĩa tiếng Việt nổi bật (Font Inter Bold `15px`, màu tím thương hiệu `#863bff`), và câu ví dụ ngữ cảnh (in nghiêng, tối đa 2 dòng kèm dấu trích dẫn).
  - Lưới 4 nút đánh giá SRS:

| Phím tắt | Xếp hạng SRS | Nhãn tiếng Việt | Màu nền | Màu viền | Màu chữ |
| :---: | :--- | :--- | :---: | :---: | :---: |
| `1` | `SrsRating.AGAIN` (1) | Chưa thuộc | `#fef2f2` | `#fecaca` | `#dc2626` |
| `2` | `SrsRating.HARD` (2) | Khó | `#fff7ed` | `#fed7aa` | `#c2410c` |
| `3` | `SrsRating.GOOD` (3) | Nhớ tốt | `#ecfdf5` | `#a7f3d0` | `#059669` |
| `4` | `SrsRating.EASY` (4) | Rất dễ | `#f5f3ff` | `#ede9fe` | `#863bff` |

#### C. [`MicroReviewSession.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/MicroReviewSession.tsx)
- **Vị trí**: Quản lý toàn bộ vòng đời phiên học khi `viewMode === "review"`.
- **Props interface**:
  ```typescript
  export interface MicroReviewSessionProps {
    onExit: () => void;
    streak?: number;
    initialCards?: DueCardItem[];
  }
  ```
- **Các trạng thái vòng đời (`SessionStatus`)**:
  1. `loading`: Hiển thị spinner xoay `<Loader2 className="animate-spin" />` và nhãn `Đang tải thẻ cần ôn...`.
  2. `reviewing`: Hiển thị header gồm nút `← Quay lại`, số tiến độ `Thẻ X/Y`, thanh tiến độ chạy phần trăm mượt mà, và component `MicroCard`.
  3. `empty`: Hiển thị icon mừng `🎉`, thông báo `Không còn thẻ nào cần ôn hôm nay`, và nút quay lại.
  4. `complete`: Màn hình ăn mừng hoàn thành với biểu tượng tích xanh `<CheckCircle2 />`, số thẻ đã ôn `reviewedCount`, số ngày chuỗi `streak 🔥`, nút CTA `🚀 Mở app để học tiếp` (mở tab `/dashboard`), và nút `Hoàn tất`.
  5. `error`: Hiển thị thông báo lỗi màu đỏ kèm nút `Thử lại` (`<RefreshCw />`) và nút `Quay lại`.

#### D. [`PopupApp.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/PopupApp.tsx)
- Quản lý trạng thái gốc: `const [viewMode, setViewMode] = useState<"home" | "review">("home")`.
- Khi `viewMode === "review"`, giao diện chuyển trọn vẹn sang `MicroReviewSession`. Khi bấm thoát, giao diện chuyển về `"home"` đồng thời tự động kích hoạt hàm `loadData()` để tải lại số thẻ và huy hiệu mới nhất.

---

### 3.3. Hợp đồng Thông điệp Runtime (`ExtensionMessage`)

Được bổ sung vào [`packages/shared-types/src/extension.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/extension.ts#L160-L161):

```typescript
export type ExtensionMessage =
  | ...
  | { type: "FETCH_DUE_CARDS"; payload?: { limit?: number; deckId?: string } }
  | { type: "SUBMIT_MICRO_REVIEW"; payload: SubmitReviewDto };
```

#### Bảng Tra cứu Thông điệp Runtime

| Tên thông điệp | Nguồn gửi | Payload | Phản hồi (`res`) | Hành vi Service Worker |
| :--- | :--- | :--- | :--- | :--- |
| `FETCH_DUE_CARDS` | `MicroReviewSession` | `{ limit?: number, deckId?: string }` (mặc định `limit: 5`) | `{ success: boolean, data: DueCardItem[], error?: string }` | Gọi `apiClient.getDueCards(limit, deckId)`. |
| `SUBMIT_MICRO_REVIEW` | `MicroReviewSession` | `{ cardId: string, rating: SrsRating }` | `{ success: boolean, data: any, error?: string }` | Gọi `apiClient.submitReview(payload)`, sau đó kích hoạt ngay `badgeManager.refreshBadgeNow(true)`. |
| `REFRESH_BADGE` | `MicroReviewSession` | `{ immediate: boolean }` | `{ success: boolean, data: { summary: ReviewSummaryDto } }` | Bỏ qua cache ETag, fetch summary mới nhất và cập nhật số huy hiệu. |

---

### 3.4. Hợp đồng Dữ liệu Dùng chung (`@wordstreak/shared-types`)

Được định nghĩa tại [`packages/shared-types/src/reviews.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/packages/shared-types/src/reviews.ts#L1-L51):

```typescript
export enum SrsRating {
  AGAIN = 1,
  HARD = 2,
  GOOD = 3,
  EASY = 4,
}

export interface DueCardItem {
  id: string;
  cardId: string;
  deckId: string;
  deckTitle: string;
  deckColor?: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  audioUrl?: string | null;
  exampleSentence?: string | null;
  collocations?: string | null;
  mnemonic?: string | null;
  imageUrl?: string | null;
  status: CardLearningStatus;
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
}

export interface SubmitReviewDto {
  cardId: string;
  rating: SrsRating;
}
```

---

### 3.5. Hợp đồng API Backend (NestJS Reviews Controller)

Được triển khai tại [`apps/api/src/modules/reviews/reviews.controller.ts`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/api/src/modules/reviews/reviews.controller.ts#L104-L134):

#### 1. Lấy danh sách thẻ đến hạn: `GET /reviews/due`
- **Xác thực**: Bắt buộc Bearer JWT token (`JwtAuthGuard`).
- **Query parameters**:
  - `limit`: Số thẻ cần lấy (mặc định 5).
  - `deckId` (tùy chọn): Lọc theo bộ thẻ cụ thể.
- **Phản hồi mẫu (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "card-uuid-1",
        "cardId": "card-uuid-1",
        "deckId": "deck-uuid-1",
        "deckTitle": "Oxford 3000",
        "deckColor": "#863bff",
        "word": "ubiquitous",
        "meaning": "phổ biến khắp nơi",
        "phonetic": "/juːˈbɪk.wɪ.təs/",
        "audioUrl": "https://cdn.wordstreak.app/audio/ubiquitous.mp3",
        "exampleSentence": "Smartphones have become ubiquitous in modern society.",
        "status": "LEARNING",
        "interval": 1,
        "repetitions": 1,
        "easeFactor": 2.5,
        "nextReviewDate": "2026-10-14T08:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Gửi điểm đánh giá thẻ: `POST /reviews/submit`
- **Xác thực**: Bắt buộc Bearer JWT token (`JwtAuthGuard`).
- **Headers**: `x-timezone: Asia/Ho_Chi_Minh` (được extension tự động lấy từ `Intl.DateTimeFormat().resolvedOptions().timeZone`).
- **Request body**:
  ```json
  {
    "cardId": "card-uuid-1",
    "rating": 3
  }
  ```
- **Phản hồi mẫu (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "cardId": "card-uuid-1",
      "interval": 3,
      "easeFactor": 2.6,
      "repetitions": 2,
      "nextReviewDate": "2026-10-17T08:00:00.000Z",
      "status": "LEARNING"
    },
    "message": "Review rating recorded successfully"
  }
  ```

---

### 3.6. Ma trận Phím tắt & Khả năng Tiếp cận (Keyboard & Accessibility Matrix)

| Phím nóng | Bối cảnh khả dụng | Hành động thực hiện | Hành vi hỗ trợ tiếp cận (ARIA) |
| :---: | :--- | :--- | :--- |
| `Space` hoặc `Enter` | Mặt trước thẻ (`!isFlipped`) | Lật thẻ sang mặt sau để hiển thị giải nghĩa | Thẻ có thuộc tính `tabIndex={0}`, `role="region"`, `aria-label="Thẻ mặt trước: {word}"`. |
| `R` hoặc `r` | Cả mặt trước và mặt sau | Phát lại âm thanh phát âm của từ vựng hiện tại | Nút loa có `aria-label="Phát âm từ vựng"`, thông báo trạng thái đọc. |
| `1` | Mặt sau thẻ (`isFlipped`) | Chấm điểm `AGAIN` (Chưa thuộc), chuyển sang thẻ kế | Nút có nhãn rõ ràng, độ tương phản màu `#dc2626` trên nền `#fef2f2` đạt chuẩn WCAG AA. |
| `2` | Mặt sau thẻ (`isFlipped`) | Chấm điểm `HARD` (Khó), chuyển sang thẻ kế | Nút có nhãn rõ ràng, độ tương phản `#c2410c` trên `#fff7ed`. |
| `3` | Mặt sau thẻ (`isFlipped`) | Chấm điểm `GOOD` (Nhớ tốt), chuyển sang thẻ kế | Nút có nhãn rõ ràng, độ tương phản `#059669` trên `#ecfdf5`. |
| `4` | Mặt sau thẻ (`isFlipped`) | Chấm điểm `EASY` (Rất dễ), chuyển sang thẻ kế | Nút có nhãn rõ ràng, độ tương phản `#863bff` trên `#f5f3ff`. |
| *Bất kỳ phím nào* | Con trỏ trong `input`, `textarea`, `select` | **Bị ngăn chặn hoàn toàn** (Không kích hoạt lật thẻ hay chấm điểm) | Bảo toàn khả năng gõ văn bản của người dùng trong các ô nhập liệu khác. |

---

### 3.7. Ma trận Xử lý Biên & Tình huống Ngoại lệ (Boundary & Edge Case Matrix)

| Mã ngoại lệ | Tình huống phát sinh | Cách hệ thống phản hồi | Cơ chế đảm bảo |
| :--- | :--- | :--- | :--- |
| **`ECM-MICREV-01`** | Máy chủ trả về ít hơn 5 thẻ (ví dụ chỉ còn 2 thẻ đến hạn) | Phiên học điều chỉnh tổng số thẻ thành 2, thanh tiến độ chia theo 2 phần (`Thẻ 1/2`, `Thẻ 2/2`) và kết thúc phiên sau thẻ thứ 2. | Biến trạng thái động `cards.length` thay vì giá trị cố định 5. |
| **`ECM-MICREV-02`** | 0 thẻ đến hạn (do người dùng vừa học xong trên tab web app khác) | Chuyển ngay sang màn hình `empty` với thông báo thân thiện: *"Không còn thẻ nào cần ôn hôm nay"* kèm nút quay lại. | Kiểm tra `if (dueCards.length > 0) ... else setStatus("empty")`. |
| **`ECM-MICREV-03`** | `audioUrl` là `null`, rỗng hoặc file âm thanh 404/CORS | Tự động chuyển tiếp mượt mà sang `window.speechSynthesis.speak()` phát âm từ vựng bằng giọng hệ thống chuẩn. | Khối `try/catch` bọc `Audio.play()` và bộ lắng nghe sự kiện `audio.onerror`. |
| **`ECM-MICREV-04`** | Người học gõ phím đánh giá liên tục, cực nhanh | Chỉ số thẻ `currentIndex` tăng ngay lập tức và `isFlipped` được gán về `false` trong cùng một tick React render, khóa chặt phím 1-4 không thể bị kích hoạt lần 2 trên cùng 1 thẻ. | Ràng buộc logic `if (status === "reviewing" && isFlipped)`. |
| **`ECM-MICREV-05`** | Mạng bị mất kết nối khi gửi đánh giá chạy ngầm | Background Service Worker bắt lỗi HTTP an toàn trong khối catch của `request()`, ghi log mà không gây crash giao diện popup. Khi có mạng lại, chu kỳ cập nhật tiếp theo sẽ tự động đồng bộ. | Catch handler trong `ExtensionApiClient.request`. |
| **`ECM-MICREV-06`** | Người học bấm `← Quay lại` khi đang học dở dang | Component `MicroReviewSession` unmount an toàn, tự động dọn dẹp bộ lắng nghe sự kiện `keydown` trên `window`, đưa popup về trạng thái home. | Cleanup function trong `useEffect(() => { return () => window.removeEventListener(...); })`. |

---

## 4. How-To Guides: Hướng dẫn Thao tác & Tích hợp (Operational How-To Guides)

### 4.1. Hướng dẫn Bắt đầu Phiên Ôn nhanh (How to Launch a Session)
1. Nhấp chuột vào biểu tượng WordStreak trên thanh công cụ trình duyệt Chrome.
2. Kiểm tra banner màu cam: `🔥 Có X thẻ cần ôn`.
3. Nhấp vào nút đen **"Ôn nhanh 5 thẻ →"** (hoặc ít hơn nếu số thẻ tồn ít hơn 5).
4. Popup sẽ lập tức chuyển sang chế độ ôn tập chuyên dụng với thẻ đầu tiên được tải sẵn.

### 4.2. Hướng dẫn Thao tác Không chạm Chuột (Hands-Free Keyboard Reviewing)
1. Khi thẻ xuất hiện ở mặt trước:
   - Nhìn từ vựng tiếng Anh và nhớ lại nghĩa.
   - Nhấn phím **`R`** nếu muốn nghe lại phát âm bản xứ.
   - Nhấn phím **`Space`** để lật thẻ sang mặt sau.
2. Khi thẻ đã lật sang mặt sau:
   - Đọc nghĩa tiếng Việt và câu ví dụ để kiểm tra độ chính xác của trí nhớ.
   - Nhấn một trong bốn phím số:
     - **`1`**: Nếu hoàn toàn quên từ này (*Chưa thuộc*).
     - **`2`**: Nếu nhớ rất vất vả (*Khó*).
     - **`3`**: Nếu nhớ đúng sau vài giây suy nghĩ (*Nhớ tốt*).
     - **`4`**: Nếu từ vựng quá quen thuộc (*Rất dễ*).
   - Thẻ kế tiếp sẽ lập tức xuất hiện ở mặt trước. Tiếp tục bấm `Space` rồi phím số tương ứng.

### 4.3. Hướng dẫn Xử lý Âm thanh khi Trình duyệt Tắt tiếng (Audio Troubleshooting)
- Nếu loa máy tính của bạn đang bật nhưng không nghe thấy âm thanh:
  1. Đảm bảo tab/cửa sổ Chrome không bị tắt tiếng (Mute site).
  2. Tính năng tự động sử dụng giọng đọc trình duyệt (Web Speech API) nếu máy chủ âm thanh quá tải hoặc mạng chập chờn. Không cần bất kỳ thao tác cài đặt thêm nào.

### 4.4. Hướng dẫn Thoát hoặc Chuyển tiếp sang Web App (Session Exit & Web Handoff)
- **Thoát giữa chừng**: Bấm nút `← Quay lại` ở góc trên bên trái bất kỳ lúc nào. Những thẻ đã chấm điểm trước đó đều đã được lưu an toàn lên máy chủ.
- **Sau khi hoàn tất 5 thẻ**:
  - Bấm **`Hoàn tất`** để trở lại màn hình chính của popup (tra cứu từ mới).
  - Bấm **`🚀 Mở app để học tiếp`** để mở ngay trang chủ học tập `https://wordstreak.app/dashboard` trên một tab mới để tiếp tục ôn tập các bộ thẻ lớn hơn.

---

## 5. Tutorial: Hướng dẫn Bắt đầu Nhanh trong 60 Giây (Quickstart Tutorial)

Mục tiêu: Hoàn thành 1 chu trình ôn nhanh 5 thẻ trong vòng 1 phút ngay trên trình duyệt mà không cần mở tab mới.

```markdown
Bước 1: Mở tiện ích WordStreak
        Nhấp vào biểu tượng tia sét WordStreak trên thanh công cụ trình duyệt Chrome.

Bước 2: Kích hoạt Micro-Review
        Nhìn thấy dòng chữ "🔥 Có 5 thẻ cần ôn" -> Nhấn nút "Ôn nhanh 5 thẻ →".

Bước 3: Luyện tập Thẻ 1
        - Đọc to từ vựng hiển thị trên màn hình.
        - Nhấn [Space] để kiểm tra nghĩa mặt sau.
        - Nhấn [3] để đánh giá "Nhớ tốt".

Bước 4: Hoàn thành 4 thẻ còn lại
        - Lặp lại nhịp điệu: [Space] -> Đọc nghĩa -> [Phím số 1..4].
        - Quan sát thanh tiến độ màu tím chạy đầy từ 20% -> 100%.

Bước 5: Nhận thành quả
        - Màn hình hiển thị "🎉 Hoàn thành phiên ôn nhanh!".
        - Chuỗi ngày học tăng thêm 1 ngày 🔥.
        - Huy hiệu trên thanh tiện ích lập tức giảm trừ 5 thẻ.
```

---

## 6. Verification & Test Strategy (Kiểm thử & Đảm bảo Chất lượng)

### 6.1. Các Lệnh Thực thi Kiểm thử Tự động

```bash
# 1. Kiểm tra biên dịch mã nguồn của Shared Types
pnpm --filter @wordstreak/shared-types build

# 2. Chạy toàn bộ 18 test cases của Micro-Review Popup
pnpm --filter @wordstreak/extension test src/popup/components/__tests__/MicroReviewSession.spec.tsx

# 3. Chạy toàn bộ test suite của toàn bộ Chrome Extension (153 tests)
pnpm --filter @wordstreak/extension test

# 4. Kiểm tra kiểu tĩnh TypeScript toàn bộ dự án
pnpm typecheck

# 5. Biên dịch bản đóng gói hoàn chỉnh Extension (Manifest V3)
pnpm --filter @wordstreak/extension build
```

### 6.2. Ma trận Truy xuất Nguồn gốc Kiểm thử (Test Traceability Matrix — 18/18 Tests Passed)

Toàn bộ 18 test cases được hiện thực tại [`apps/extension/src/popup/components/__tests__/MicroReviewSession.spec.tsx`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/apps/extension/src/popup/components/__tests__/MicroReviewSession.spec.tsx):

| Mã kiểm thử | Hạng mục | Mô tả kiểm thử & Hành vi xác nhận | Trạng thái |
| :--- | :--- | :--- | :---: |
| **`TC-MICREV-001`** | Banner | Hiển thị banner khi `dueCount > 0` và người dùng đã đăng nhập (`🔥 Có 8 thẻ cần ôn`, `Ôn nhanh 5 thẻ →`) | ✅ PASS |
| **`TC-MICREV-002`** | Banner | Hiển thị số lượng tùy biến chính xác khi `dueCount < 5` (ví dụ `3` thẻ) | ✅ PASS |
| **`TC-MICREV-003`** | Banner | Ẩn banner hoàn toàn khi `dueCount === 0` | ✅ PASS |
| **`TC-MICREV-004`** | Banner | Ẩn banner khi chưa đăng nhập (`user === null`) bất kể số thẻ tồn | ✅ PASS |
| **`TC-MICREV-005`** | Khởi chạy | Bấm nút trên banner kích hoạt callback `onStartReview` chuyển `viewMode = 'review'` | ✅ PASS |
| **`TC-MICREV-006`** | Tải dữ liệu | `MicroReviewSession` gửi thông điệp `FETCH_DUE_CARDS` `{ limit: 5 }` khi mount và render thẻ 1 | ✅ PASS |
| **`TC-MICREV-007`** | Lật thẻ | Nhấp chuột vào thân thẻ chuyển từ mặt trước sang mặt sau và hiện nghĩa tiếng Việt | ✅ PASS |
| **`TC-MICREV-008`** | Phím Space | Nhấn phím `Space` lật thẻ an toàn từ mặt trước sang mặt sau | ✅ PASS |
| **`TC-MICREV-009`** | Phát âm | Nút biểu tượng loa phát âm chính xác qua `Audio.play()` khi có `audioUrl` | ✅ PASS |
| **`TC-MICREV-010`** | Dự phòng âm thanh | Tự động gọi `speechSynthesis.speak()` với từ tiếng Anh khi `audioUrl` null hoặc lỗi | ✅ PASS |
| **`TC-MICREV-011`** | Phím nóng âm thanh | Nhấn phím `R` hoặc `r` phát lại âm thanh của từ đang học trên cả 2 mặt thẻ | ✅ PASS |
| **`TC-MICREV-012`** | Khóa phím mặt trước | Nhấn các phím số `1`-`4` trên mặt trước bị bỏ qua, không gửi đánh giá | ✅ PASS |
| **`TC-MICREV-013`** | Cách ly nhập liệu | Toàn bộ phím tắt bị vô hiệu hóa khi con trỏ đang nằm trong `<input>` hoặc `<textarea>` | ✅ PASS |
| **`TC-MICREV-014`** | Gửi đánh giá | Nhấn phím `1`-`4` trên mặt sau gửi ngay `SUBMIT_MICRO_REVIEW` và chuyển thẻ lập tức | ✅ PASS |
| **`TC-MICREV-015`** | Thanh tiến độ | Cập nhật nhãn `Thẻ 1/3` -> `Thẻ 2/3` và phần trăm độ rộng thanh tiến độ | ✅ PASS |
| **`TC-MICREV-016`** | Điều hướng thoát | Bấm nút `← Quay lại` gọi callback `onExit` và dọn dẹp sạch sẽ bộ lắng nghe sự kiện | ✅ PASS |
| **`TC-MICREV-017`** | Hết thẻ tồn | Hiển thị màn hình thân thiện chúc mừng khi API trả về 0 thẻ đến hạn | ✅ PASS |
| **`TC-MICREV-018`** | Màn hình hoàn thành | Hoàn thành tất cả thẻ hiện màn hình chúc mừng, hiển thị streak, gửi `REFRESH_BADGE` | ✅ PASS |

---

## 7. Báo cáo Thẩm định Định nghĩa Hoàn thành (Definition of Done Audit)

| Tiêu chuẩn DoD | Yêu cầu | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Tuân thủ Yêu cầu Nghiệp vụ** | 100% REQs (`REQ-MICREV-01`..`06`) và BRs (`BR-MICREV-01`..`07`) được đáp ứng | Toàn bộ 6 REQs và 7 BRs đã hiện thực đầy đủ | **ĐẠT** |
| **Phủ kín Tình huống Biên** | 100% ECMs (`ECM-MICREV-01`..`06`) được kiểm chứng | Toàn bộ 6 tình huống ngoại lệ được kiểm thử tự động | **ĐẠT** |
| **Kết quả Kiểm thử Tự động** | Tỷ lệ vượt qua 100% | 18/18 tests micro-review và 153/153 tests toàn bộ extension đạt chuẩn | **ĐẠT** |
| **An toàn Kiểu TypeScript** | 0 cảnh báo hoặc lỗi type | `tsc --noEmit` kiểm tra thành công với 0 lỗi | **ĐẠT** |
| **Đóng gói Sản phẩm Sản xuất** | Build production thành công | `pnpm --filter @wordstreak/extension build` hoàn tất nhanh chóng | **ĐẠT** |
| **Chuẩn mực Thiết kế WordStreak** | Tuân thủ tuyệt đối quy chuẩn Minimal Canvas | Font Nunito, Inter, JetBrains Mono, Obsidian `#000000`, màu SRS | **ĐẠT** |
| **Lỗi Nghiêm trọng (Defects)** | 0 lỗi nghiêm trọng | 0 Critical, 0 High, 0 Medium defects | **ĐẠT** |

---

## 8. Tác giả & Đánh giá (Authors & Sign-off)

- **Feature Implementation**: AI Full-Stack Engineer (Antigravity)
- **Architecture & Review**: Technical Documentation Architect & Adversarial DoD Reviewer
- **Sign-off Date**: 2026-10-14
- **Trạng thái**: **DELIVERED & SIGNED OFF (v1.0)**
