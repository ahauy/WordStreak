# 🚀 WordStreak — Gợi ý nâng cấp & Kế hoạch Extension Nhắc học

> **Mục đích:** Bổ sung cho `PRODUCT_BACKLOG_ROADMAP.md`. Tập trung vào 3 câu hỏi: (1) làm sao app dễ đến tay người dùng hơn, (2) dễ dùng hơn mà vẫn hiệu quả, (3) có nên thêm bộ từ có sẵn không, kèm kế hoạch chi tiết cho **Extension nhắc học**.
>
> **Ký hiệu trạng thái:** dùng cùng quy ước với roadmap — `[ ]` chưa làm, `[/]` đang làm, `[x]` xong, `[!]` cần làm rõ, `[~]` dài hạn.

---

## 0. Nhận định & thứ tự ưu tiên

WordStreak đã có gần như đủ tính năng (SRS, 4 quiz, voice, extension, PWA, i18n, community). Phần còn thiếu không phải thêm tính năng, mà là:

1. **Người dùng mới có học được ngay trong ~60 giây không?** (onboarding, nội dung có sẵn)
2. **Người dùng có quay lại mỗi ngày không?** (nhắc học)
3. **Người dùng mới biết đến app bằng cách nào?** (phân phối)

| #   | Hạng mục                                           | Tác động      | Công sức | Ghi chú                               |
| --- | -------------------------------------------------- | ------------- | -------- | ------------------------------------- |
| 1   | Hoàn thành Sprint 8 (deploy)                       | Rất cao       | Nhỏ      | Cần dữ liệu người dùng thật để quyết định tiếp |
| 2   | Bộ từ có sẵn (Starter Decks) + Onboarding          | Rất cao       | Vừa      | Giải quyết "app trống" lúc đăng ký    |
| 3   | **Extension nhắc học** (badge + thông báo)         | Cao           | Nhỏ–vừa  | Xem mục 5                             |
| 4   | Nút "Học hôm nay" + quiz tự chấm vào SRS           | Cao           | Vừa      | Giảm số lần phải chọn/bấm             |
| 5   | Web Push / Email nhắc học (mobile, PWA)            | Cao           | Vừa      | Extension không chạy trên mobile      |
| 6   | Trang từ vựng công khai (SEO)                      | Dài hạn       | Vừa–lớn  | Cần prerender                         |
| 7   | AI nâng cao (đoạn văn, tự đặt câu, leech)          | Vừa           | Vừa      | Tận dụng Gemini + cache sẵn có        |

---

## 1. Bộ từ có sẵn (Starter Decks) — nên làm

**Vấn đề:** người dùng mới đăng ký xong gặp app trống, phải tự tạo deck và tự thêm từ → dễ bỏ ngay.

**Giải pháp:** cung cấp các deck "Official" để Clone một chạm.

- [ ] **Chọn nguồn từ:** NGSL, NAWL, AWL (Academic Word List), hoặc tự biên soạn theo chủ đề (TOEIC office, IELTS topics, giao tiếp hằng ngày).
  - ⚠️ Kiểm tra giấy phép từng danh sách trước khi dùng. Danh sách Oxford 3000/5000 thuộc bản quyền nhà xuất bản — không copy nguyên.
- [ ] **Sinh nội dung thẻ bằng script một lần:** gọi AI sinh nghĩa/IPA/ví dụ/collocations → lưu vào `GlobalDictionaryCache` → duyệt mẫu vài chục từ để kiểm chất lượng.
- [ ] **Publish thành deck Official** trong Community (huy hiệu "Official", `isPublic = true`), người dùng bấm Clone (đã có sẵn cơ chế deep copy + khởi tạo SM-2 `NEW`).
- [ ] **Chia nhỏ:** mỗi deck 20–50 từ theo cấp độ/chủ đề. Không đổ cả nghìn từ vào hàng đợi; để `dailyGoal` điều tiết tốc độ.
- [ ] **Trường "Word family"** trên thẻ (act → action, active, activity) nếu muốn hỗ trợ học theo gốc từ (root/prefix/suffix). Làm trường trên thẻ trước, chưa cần deck riêng.

---

## 2. Làm cho dễ dùng hơn

- [ ] **Onboarding 60 giây:** hỏi mục tiêu (IELTS / TOEIC / giao tiếp / công việc), trình độ (mini test 8–10 câu), số phút mỗi ngày → tự gán deck phù hợp và `dailyGoal`.
- [ ] **Học thử trước khi đăng ký:** cho học ~5 từ ngay trên landing, lưu tạm ở local; đăng ký sau để giữ streak.
- [ ] **Đăng nhập Google một chạm** để giảm ma sát đăng ký.
- [ ] **Nút "Học hôm nay":** gộp ôn đến hạn + từ mới + quiz thành một phiên; người mới không phải chọn giữa 4 chế độ.
- [ ] **Quiz tự chấm vào SRS:** kết quả đúng/sai + thời gian trả lời tự quy ra rating để cập nhật lịch SM-2.
  - [!] Cần kiểm tra: kết quả các quiz hiện tại đã cập nhật `UserCardProgress` chưa?
- [ ] **Chống ngợp (backlog guard):** khi số thẻ tồn đọng vượt ngưỡng thì tạm ngưng thẻ mới; có chế độ "quay lại sau vài ngày nghỉ" xử lý backlog dần.

---

## 3. Tăng hiệu quả học

- [ ] **Đoạn văn ngắn từ chính các từ đang học:** AI viết đoạn 80–100 từ chứa 5–8 từ đến hạn (đọc từ trong ngữ cảnh nhớ tốt hơn thẻ đơn lẻ). Có thể cache theo tập từ.
- [ ] **Tự đặt câu:** người học viết câu với từ, AI nhận xét ngắn. Chủ động sản xuất ngôn ngữ hiệu quả hơn chỉ nhận diện. Dùng chung rate limit AI hiện có.
- [ ] **Phát hiện "leech":** từ sai nhiều lần thì gắn cờ, gợi ý đổi mẹo nhớ hoặc câu ví dụ (có thể để AI sinh mẹo mới).
- [ ] **Xen kẽ định dạng theo độ thuộc:** thẻ mới dùng flashcard, từ đã quen chuyển sang điền từ / nghe gõ.

---

## 4. Phân phối & tăng trưởng

- [ ] **Trang từ vựng công khai** (ví dụ `/word/serendipity`) sinh từ `GlobalDictionaryCache`, có nút "Thêm vào WordStreak". Hợp với kiểu tìm kiếm "X nghĩa là gì".
  - [!] SPA React thuần kém cho SEO → cần prerender hoặc tạo trang tĩnh cho phần này.
- [ ] **Nhắc học** (xem mục 5 và US-ECO-09): roadmap hiện chưa có mục thông báo.
- [ ] **Chia sẻ:** thẻ ảnh streak/heatmap để khoe; lời mời bạn bè (cùng giữ streak hoặc thách đấu tuần).
- [ ] **Đưa Chrome Extension lên Chrome Web Store.**
- [ ] **Đo đạc:** gắn analytics nhẹ (ví dụ PostHog free tier) — theo dõi tỉ lệ hoàn thành phiên học đầu tiên, quay lại ngày 1 / ngày 7.

---

## 5. Extension nhắc học (Manifest V3)

### 5.1. Mục tiêu & nguyên tắc

_Mục tiêu: người dùng đang lướt web vẫn được nhắc ôn đúng lúc, và có thể ôn nhanh ngay tại chỗ — mà không bị làm phiền._

- **Nhắc có điều kiện, không nhắc theo giờ cứng:** chỉ nhắc khi thực sự có việc (có thẻ đến hạn, chưa đạt mục tiêu ngày, hoặc streak sắp mất).
- **Ít nhưng đúng lúc:** tối đa vài thông báo/ngày, có giờ yên tĩnh, tự giảm tần suất nếu người dùng bỏ qua.
- **Giảm ma sát:** bấm thông báo mở thẳng phiên ôn; hoặc ôn nhanh ngay trong popup.
- **Gọn quyền:** chỉ xin thêm `alarms` và `notifications` (cùng `storage` và host permission tới API đã có).

### 5.2. Luồng hoạt động

```
[chrome.alarms]  ── đánh thức service worker (định kỳ / đúng giờ nhắc)
        │
        ▼
[Service Worker]  GET /api/v1/reviews/summary
        │            (dueCount, studiedToday, goalReached, streakAtRisk, timezone...)
        ▼
  Cập nhật badge (số thẻ đến hạn)
        │
        ▼
  Đánh giá luật nhắc (5.3) ──► chrome.notifications.create(...)
                                      │
                      ┌───────────────┴───────────────┐
                 [Học ngay]                        [Để sau]
        tabs.create(WEB_URL/review)         alarm snooze +1 giờ
```

**Lưu ý kỹ thuật bắt buộc với MV3:**

- Service worker bị tắt khi nhàn rỗi → **không dùng `setInterval`/`setTimeout`**, chỉ dùng `chrome.alarms`.
- Trạng thái (`lastNotifiedAt`, số lần bỏ qua, số thông báo hôm nay) lưu ở `chrome.storage.local`, **không giữ trong biến bộ nhớ**.
- Đăng ký listener ở top-level của service worker (`onAlarm`, `onInstalled`, `onStartup`, `notifications.onClicked`, `notifications.onButtonClicked`).
- Access token JWT sống ngắn (15 phút): service worker phải tự refresh token; nếu refresh thất bại → badge `!` và thông báo "Đăng nhập lại để tiếp tục nhắc".
- Nút trên thông báo hiển thị khác nhau tùy hệ điều hành → luôn xử lý cả `onClicked` (bấm vào thân thông báo = "Học ngay").

### 5.3. Luật nhắc (đề xuất)

| Điều kiện                                                                   | Hành động                                              |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| Đến giờ nhắc, có thẻ đến hạn, chưa học hôm nay                              | Thông báo: "Có N thẻ đang chờ ôn"                      |
| Đã đạt `dailyGoal` hôm nay                                                  | Không thông báo; badge ẩn hoặc màu xám                 |
| Streak ≥ 3 ngày, chưa học, còn ≤ 3 giờ tới hết ngày (theo timezone người dùng) | Thông báo khẩn 1 lần: "Chuỗi N ngày sắp mất"        |
| Đang trong giờ yên tĩnh (quiet hours)                                       | Bỏ qua thông báo, vẫn cập nhật badge                   |
| Bấm "Để sau"                                                                | Nhắc lại sau 1 giờ (tối đa 2 lần/ngày)                 |
| Bỏ qua/đóng 3 lần liên tiếp                                                 | Giảm còn tối đa 1 thông báo/ngày; gợi ý đổi giờ nhắc   |
| Trần mỗi ngày                                                               | Tối đa 3 thông báo/ngày                                |

### 5.4. Backlog (đánh số tiếp theo EPIC 09)

- [ ] **US-REM-01: API tóm tắt trạng thái học cho extension (Backend)**
  - **AC:** Endpoint nhẹ, chỉ đếm (không trả danh sách thẻ), trả `dueCount`, `newAvailable`, `studiedToday`, `dailyGoal`, `goalReached`, `currentStreak`, `streakAtRisk`, `timezone`, `endOfDayAt`, `nextDueAt`. Hỗ trợ `ETag`/`304`.
  - **Tasks:**
    - [ ] Backend: `GET /api/v1/reviews/summary` (JwtAuthGuard), tái dùng `StreakService` để tính ngày theo múi giờ người dùng.
    - [ ] Backend: Unit test cho các nhánh `goalReached` / `streakAtRisk`.
    - [ ] Shared: thêm `ReviewSummaryDto` vào `packages/shared-types`.

- [ ] **US-ECO-05: Badge số thẻ đến hạn trên icon extension**
  - **AC:** Icon hiển thị số thẻ đến hạn; tự cập nhật khi mở trình duyệt, khi mở popup, và theo chu kỳ alarm. Ẩn khi `dueCount = 0`.
  - **Tasks:**
    - [ ] Extension: thêm `alarms` vào `manifest.json`; alarm làm mới badge (khuyến nghị 30–60 phút, không cần quá dày).
    - [ ] Extension: `chrome.runtime.onStartup` + `onInstalled` làm mới badge ngay.
    - [ ] Extension: dùng `nextDueAt` để đặt alarm đúng lúc có thẻ mới đến hạn thay vì poll liên tục.
    - [ ] Extension: khi người dùng ôn xong trên web app, tin nhắn qua kênh Web SSO Auth Sync hiện có để extension làm mới badge.

- [ ] **US-ECO-06: Thông báo nhắc học theo luật (5.3)**
  - **AC:** Thông báo hệ thống có nút **Học ngay** / **Để sau**; bấm "Học ngay" mở `/review` ở tab mới (hoặc focus tab WordStreak đang mở). Tuân thủ giờ yên tĩnh, trần 3 thông báo/ngày và logic giảm tần suất.
  - **Tasks:**
    - [ ] Extension: thêm `notifications` vào `manifest.json`.
    - [ ] Extension: module `reminderRules.ts` (hàm thuần, dễ unit test) nhận `summary + settings + state` → quyết định có nhắc hay không và nội dung.
    - [ ] Extension: alarm `daily-reminder` đặt theo giờ người dùng chọn; sau mỗi lần chạy tự tính lại lần kế tiếp.
    - [ ] Extension: xử lý `onClicked` / `onButtonClicked`, snooze bằng alarm một lần.
    - [ ] Extension: lưu trạng thái nhắc vào `chrome.storage.local`.
    - [ ] i18n: chuỗi thông báo EN/VI theo `preferredLanguage`.

- [ ] **US-ECO-07: Cài đặt nhắc học (Options page)**
  - **AC:** Bật/tắt nhắc, chọn giờ nhắc, giờ yên tĩnh (bắt đầu–kết thúc), bật/tắt "nhắc khi streak sắp mất", bật/tắt badge.
  - **Tasks:**
    - [ ] Extension: trang options/popup tab cài đặt, lưu bằng `chrome.storage.sync` (MVP).
    - [ ] [~] Giai đoạn sau: đồng bộ cài đặt lên profile người dùng (`reminderEnabled`, `reminderTime`, `quietHoursStart/End`) để web app, PWA và extension dùng chung; thêm mục trong `SettingsModal`.

- [ ] **US-ECO-08: Ôn nhanh trong popup (Micro-review)**
  - **AC:** Từ popup, người dùng ôn tối đa 5 thẻ đến hạn với 4 nút Again/Hard/Good/Easy, kết quả gửi qua `POST /api/v1/reviews/submit` (cập nhật SM-2 và streak). Cuối phiên hiển thị tiến độ và nút "Mở app để học tiếp".
  - **Tasks:**
    - [ ] Extension: UI thẻ mini (lật thẻ, phát âm), tái dùng component/logic có sẵn nếu được.
    - [ ] Extension: gọi `GET /api/v1/reviews/due?limit=5` (kiểm tra endpoint đã hỗ trợ `limit` chưa).
    - [ ] Extension: sau khi ôn xong làm mới badge.

- [ ] **US-ECO-09: Web Push & Email nhắc học (mobile / PWA)** `[~]`
  - **AC:** Người dùng mobile (Chrome Android không hỗ trợ extension) vẫn nhận nhắc qua Web Push từ PWA; có email dự phòng khi streak sắp mất.
  - **Tasks:**
    - [ ] Backend: bảng `PushSubscription`, VAPID keys, gửi bằng thư viện `web-push`.
    - [ ] Backend: cron (`@nestjs/schedule`) quét người dùng đến giờ nhắc theo timezone. Koyeb free chạy một instance always-on nên cron đơn giản là đủ.
    - [ ] Frontend: xin quyền thông báo đúng lúc (sau khi người dùng hoàn thành phiên học đầu tiên, không xin ngay khi vào).
    - [ ] Dùng chung luật nhắc với extension để tránh nhắc trùng (ví dụ: nếu đã nhắc ở một kênh thì kênh khác bỏ qua trong 1 giờ).

### 5.5. Lưu ý & rủi ro

- **Tải server:** poll 15 phút/lần là ~96 request/người/ngày — đáng kể với Koyeb free (0.1 vCPU). Giảm bằng chu kỳ 30–60 phút, `ETag`/`304`, endpoint chỉ đếm, và làm mới theo sự kiện (mở popup, vừa ôn xong, `nextDueAt`).
- **Extension chỉ chạy khi Chrome đang mở** và không có trên mobile → cần Web Push/Email (US-ECO-09) để phủ thêm.
- **Mệt mỏi vì thông báo:** thông báo spam sẽ bị gỡ extension. Luật giảm tần suất và giờ yên tĩnh là bắt buộc, không phải tùy chọn.
- **Chrome Web Store:** mô tả rõ mục đích xin quyền `notifications` và `alarms` khi nộp duyệt.
- **Kiểm thử:** inspect service worker tại `chrome://extensions`; khi dev (unpacked) có thể rút ngắn chu kỳ alarm để thử nhanh; viết unit test cho `reminderRules.ts` với nhiều tổ hợp điều kiện (timezone, streak, quiet hours).

### 5.6. Thứ tự làm đề xuất cho Extension

1. US-REM-01 (API summary) → US-ECO-05 (badge) — xong là đã có giá trị nhìn thấy được.
2. US-ECO-06 (thông báo) + US-ECO-07 (cài đặt) — hoàn thiện vòng nhắc.
3. US-ECO-08 (ôn nhanh trong popup) — tăng tỉ lệ chuyển từ "được nhắc" sang "học thật".
4. US-ECO-09 (Web Push/Email) — phủ mobile.

---

## 6. Gợi ý chốt

> Sau khi deploy (Sprint 8), làm theo thứ tự: **Starter Decks + Onboarding → Extension nhắc học → Nút "Học hôm nay"**, đo tỉ lệ quay lại ngày 1/ngày 7, rồi mới quyết định đầu tư vào SEO và các tính năng AI nâng cao.
