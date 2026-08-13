# Ứng Dụng Học Từ Vựng Tiếng Anh — Ý Tưởng Tính Năng & Lộ Trình Phát Triển

Bản động não (brainstorm) các tính năng cho ứng dụng học từ vựng tiếng Anh chạy trên web (NestJS backend + React frontend), được phân loại theo các cấp độ ưu tiên, kèm theo nhận xét/đánh giá và lộ trình xây dựng đề xuất.

---

## 🔴 Cấp độ 1 — Học & Ôn Tập Thông Minh (Tính Năng Cốt Lõi)

### 1. Hệ Thống Lặp Lại Ngắt Quãng (Spaced Repetition System - SRS)
- Triển khai **thuật toán SM-2** (cùng họ với Anki). Dựa trên độ khó do người dùng tự đánh giá (Dễ / Trung bình / Khó), hệ thống sẽ tự động lên lịch khi nào từ vựng xuất hiện lại (sau 1 ngày, 3 ngày, 7 ngày, v.v.).
- **Cân nhắc:** SM-2 dễ triển khai và là điểm khởi đầu an toàn. Trong các phiên bản tương lai, hãy cân nhắc **FSRS** (thuật toán mà chính Anki đã chuyển sang sử dụng) — nó mô phỏng đường cong quên (forgetting curve) chính xác hơn SM-2 vì sử dụng nhiều tham số hơn thay vì chỉ đánh giá độ khó 3 mức. Hãy phát hành với SM-2 trước, sau đó nâng cấp sau khi đã có dữ liệu lịch sử ôn tập để tinh chỉnh.

### 2. Thẻ Từ Vựng Theo Ngữ Cảnh (Contextual Flashcards)
Mỗi thẻ nên chứa nhiều thông tin hơn là chỉ gồm từ + nghĩa:
- Phiên âm IPA + âm thanh đọc từ (giọng Anh-Mỹ / Anh-Anh)
- Một câu ví dụ thực tế
- Các cụm từ thường đi kèm (collocations) và từ đồng nghĩa/trái nghĩa
- Hình ảnh minh họa hoặc ghi chú cá nhân (mẹo ghi nhớ - mnemonic)
- **Cân nhắc:** Cho phép người dùng tự thêm câu ví dụ hoặc mẹo ghi nhớ tùy chỉnh của riêng họ — ngữ cảnh cá nhân chính là yếu tố giúp từ vựng "khắc sâu" vào ghi nhớ.

### 3. Đa Dạng Hóa Dạng Bài Ôn Tập / Kiểm Tra
- Trắc nghiệm (nghĩa / phiên âm)
- Điền vào chỗ trống (hoàn thành câu ví dụ)
- Luyện nghe (nghe phát âm, gõ lại từ)
- Nối từ (nối từ vựng với định nghĩa tương ứng)
- **Bổ sung tương lai:** Sắp xếp câu (sắp xếp các từ thành câu hoàn chỉnh) khi vòng lặp cốt lõi đã ổn định.

---

## 🟠 Cấp độ 2 — Trải Nghiệm Người Dùng (UX) & Game Hóa (Gamification)

### 1. Chuỗi Ngày Học (Streaks) & Mục Tiêu Hàng Ngày
- Cho phép người dùng đặt mục tiêu hàng ngày (ví dụ: 10 từ mới/ngày).
- Theo dõi chuỗi ngày học liên tục để củng cố thói quen.
- **Cân nhắc:** Thêm tính năng **"bảo lưu chuỗi ngày học" (streak freeze)** (tương tự Duolingo). Cơ chế streak thuần túy thường khiến người dùng bỏ ứng dụng hoàn toàn chỉ sau một ngày bận rộn bị đứt chuỗi — cơ chế bảo lưu/ân hạn sẽ giúp giữ chân người dùng tốt hơn.

### 2. Bảng Thống Kê & Phân Tích (Analytics Dashboard)
- Biểu đồ theo dõi các từ đã Thành thạo (Mastered) / Đang học (Learning) / Từ mới (New).
- Ước tính thời gian hoàn thành cho một bộ từ vựng (deck) nhất định.
- **Cân nhắc:** Biểu đồ tần suất hoạt động (contribution heatmap) dạng GitHub là một cách tốn ít công sức triển khai nhưng mang lại hiệu quả cao để trực quan hóa sự kiên trì theo thời gian.

### 3. Tích Hợp Extension Trên Chrome
- Một tiện ích mở rộng trình duyệt kết nối với NestJS API: khi đang đọc bài báo hoặc xem video, bôi đen từ mới → nhấp chuột để lưu trực tiếp vào bộ từ của người dùng.
- **Cân nhắc:** Giá trị cao, nhưng khối lượng công việc không hề nhỏ (Manifest V3, content scripts, đồng bộ xác thực với ứng dụng web chính). Đề xuất thực hiện ở giai đoạn sau, khi vòng lặp học tập cốt lõi đã vững chắc — tránh làm chậm tiến độ bản MVP.

---

## 🟡 Cấp độ 3 — AI & Tự Động Hóa

### 1. Tự Động Tạo Dữ Liệu Từ Vựng Nhờ AI
- Thay vì phải gõ thủ công phiên âm IPA, ví dụ và từ đồng nghĩa cho từng từ: người dùng chỉ cần nhập từ tiếng Anh, backend NestJS sẽ gọi OpenAI API hoặc Free Dictionary API để tự động điền các thông tin còn lại.
- **Cân nhắc:**
  - Thêm luồng xem lại/báo lỗi nhẹ nhàng — các ví dụ hoặc phiên âm IPA do AI tạo đôi khi có thể bị sai hoặc không tự nhiên.
  - **Lưu bộ nhớ đệm (cache) kết quả đã tạo theo từng từ vào cơ sở dữ liệu chung** thay vì tạo lại cho từng người dùng. Điều này giúp giảm đáng kể chi phí API và tăng tốc độ tra cứu cho những từ mà người dùng khác đã thêm trước đó.
  - Thêm giới hạn tần suất gọi (rate limiting) cho endpoint tạo dữ liệu để kiểm soát rủi ro lạm dụng chi phí.

### 2. Kiểm Tra Phát Âm (Nhận Dạng Giọng Nói)
- Sử dụng Web Speech API trong React để người dùng có thể đọc to từ vựng và nhận phản hồi so với phiên âm IPA mục tiêu.
- **Cân nhắc:** Mức độ hỗ trợ Web Speech API trên các trình duyệt không đồng đều — tốt trên Chrome, nhưng yếu hoặc thiếu trên Firefox và Safari. Hoặc là giới hạn rõ ràng tính năng này cho Chrome ở giai đoạn đầu, hoặc lên kế hoạch có phương án dự phòng (fallback) sử dụng dịch vụ chuyển giọng nói thành văn bản chuyên dụng (như Whisper API) để hỗ trợ đa trình duyệt.

---

## 🟢 Các Bổ Sung Đề Xuất (Không Có Trong Danh Sách Ban Đầu)

- **Tài khoản người dùng & Xác thực (Auth)** — cần thiết trước khi triển khai lịch SRS, chuỗi ngày học hoặc lưu bộ từ cho từng người dùng.
- **Nhập/Xuất bộ từ (Import/Export decks)** — hỗ trợ định dạng CSV và/hoặc Anki (.apkg) để người dùng có thể chuyển đổi danh sách từ vựng hiện có vào hoặc ra khỏi ứng dụng.
- **Chia sẻ bộ từ / Bộ từ cộng đồng** — cho phép người dùng xuất bản hoặc sao chép các bộ từ (ví dụ: "Bộ từ vựng IELTS 7.0", "Tiếng Anh Thương Mại").
- **Chế độ ngoại tuyến (Offline) / PWA** — hữu ích cho một ứng dụng rèn luyện thói quen mà mọi người thường dùng khi di chuyển ở những nơi kết nối mạng chập chờn.
- **Nhắc nhở học tập** — thông báo đẩy (push notification) hoặc email cho người dùng có nguy cơ bị đứt chuỗi ngày học.

---

## Lộ Trình Xây Dựng Đề Xuất

**Giai đoạn 1 — MVP (Vòng lặp học tập cốt lõi)**
- Xác thực người dùng (Auth)
- Thẻ từ vựng theo ngữ cảnh (nhập thủ công trước, hỗ trợ AI có thể thêm vào sau một chút)
- Lên lịch SRS dựa trên thuật toán SM-2
- 2–3 dạng bài kiểm tra (trắc nghiệm, điền vào chỗ trống)
- Chuỗi ngày học cơ bản + Mục tiêu hàng ngày

**Giai đoạn 2 — Giữ Chân Người Dùng & Phân Tích Dữ Liệu**
- Bảng thống kê & phân tích hoàn chỉnh
- Bảo lưu chuỗi ngày học (Streak freeze)
- Tự động tạo thẻ bằng AI (có lưu cache dùng chung)
- Luyện nghe, nối từ

**Giai đoạn 3 — Mở Rộng**
- Chrome extension
- Kiểm tra phát âm / Nhận dạng giọng nói
- Nhập/xuất & chia sẻ bộ từ vựng
- Hỗ trợ PWA / Chế độ ngoại tuyến

---

*Việc ưu tiên Giai đoạn 1 giúp bạn kiểm chứng trải nghiệm học tập cốt lõi (liệu thuật toán SRS + định dạng thẻ có thực sự giúp người dùng ghi nhớ từ vựng không?) trước khi đầu tư vào các tính năng phức tạp hơn như Chrome extension hay nhận dạng giọng nói.*
