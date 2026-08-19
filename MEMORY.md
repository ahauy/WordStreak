# WordStreak Design & Engineering Memory

Tài liệu đúc kết các quy tắc cốt lõi, bài học thiết kế giao diện, chuyển động vật lý (animation physics), và sở thích sản phẩm đã được thống nhất để luôn tuân thủ trong mọi lần phát triển tiếp theo.

---

## 1. Bản chất Sản phẩm & Mô hình Hoạt động

- **Sản phẩm**: WordStreak là ứng dụng học từ vựng tiếng Anh theo phương pháp lặp lại ngắt quãng (Spaced Repetition - SM-2), Flashcards ngữ cảnh, bài tập Active Recall, và biểu đồ chuỗi Streak (theo tài liệu [`vocabulary-app-feature-ideas.md`](vocabulary-app-feature-ideas.md)).
- **Mô hình**: **100% Hoàn toàn Miễn phí & Open-Source**, không yêu cầu đăng ký trả phí, không tạo bảng giá (Pricing Tables), không dùng lệnh terminal giả lập như `npx wordstreak learn`.
- **Dữ liệu**: Hỗ trợ xuất dữ liệu ra Anki (.apkg), CSV, JSON bất cứ lúc nào, lưu trữ Local-First không bị phụ thuộc.

---

## 2. Nhận diện Thương hiệu & Linh vật Ngọn lửa (Purple Streak Flame)

- **Linh vật Ngọn lửa Streak**: Luôn là **Ngọn lửa Tím bốc cháy (Electric Violet Flame)**:
  - Thân lửa đa tầng: tím đậm (`#4c1d95` / `#7e22ce`), tím điện (`#9333ea` / `#c084fc`), và lõi trắng sáng (`#ffffff`).
  - Hoạt họa sống động: 2 lưỡi lửa nhấp nháy so le (`flame-flicker-1`, `flame-flicker-2`), hào quang tím tỏa sáng (`flame-pulse-glow`), và các hạt tàn lửa tím bay lên (`flame-ember-1`, `flame-ember-2`).
- **Hero Section**: Thiết kế ngắn gọn, súc tích, trực diện vào thói quen duy trì ngọn lửa học tập hàng ngày, tích hợp khung tra nhanh từ vựng với phiên âm IPA.

---

## 3. Hệ thống Thiết kế & Typography ([apps/web/DESIGN.md](apps/web/DESIGN.md))

- **Màu sắc nền & viền**:
  - Nền Canvas: Trắng tinh (`#ffffff`).
  - Viền: Hairline thanh mảnh (`#e5e5e5` / `#d4d4d4`).
  - Nút bấm chính (CTA): Hình viên thuốc màu đen tuyền (`#000000`, `btn-primary`) bo tròn tuyệt đối (`rounded-full`).
  - Màu điểm nhấn (Accent): Tím hoàng gia (`#9333ea`, `#7e22ce`, `#c084fc`).
- **Phông chữ (Typography Tokens)**:
  - Heading hiển thị: `Nunito` (500/600/700/800).
  - Thân văn bản (Body): `Inter` (400/500/600).
  - Code, nhãn, dữ liệu đo đạc (Telemetry): `JetBrains Mono` (400/500/600).

---

## 4. Các Quy tắc Hoạt họa & Vật lý Thẻ Card (Card Animation Physics)

### 📌 Bài học 1: Tránh triệt để Lỗi nháy chập chờn khi Hover (Stable Anchor Wrapper)

- **Vấn đề**: Không bao giờ gắn sự kiện `onMouseEnter`/`onMouseLeave` trực tiếp vào phần tử tự dịch chuyển lên trên khi hover. Khi chuột ở mép dưới, thẻ nhảy lên sẽ khiến chuột rơi ra ngoài $\rightarrow$ thẻ hạ xuống $\rightarrow$ chuột lại vào thẻ $\rightarrow$ tạo vòng lặp chớp nháy 60Hz.
- **Giải pháp chuẩn**:
  - Tách thành **Vùng neo bên ngoài cố định (Stable Outer Anchor)**: Giữ nguyên vị trí cuộn, mở rộng vùng bắt chuột (`pt-14 -mt-14 pb-6 -mb-6`) và chứa sự kiện hover.
  - **Thẻ hiển thị bên trong (Inner Visual Card)**: Thực hiện chuyển động nhấc lên bằng Spring Physics (`stiffness: 360, damping: 24`).
  - Chuột của người dùng luôn nằm trọn trong vùng bắt chuột cố định $\rightarrow$ **Triệt tiêu 100% hiện tượng chớp nháy**.

### 📌 Bài học 2: Rút thẻ bài theo đúng Vector góc nghiêng (Radial Card Pull-Out)

- Khi người dùng hover/rút một lá bài ra khỏi bộ bài đang xòe, **KHÔNG xếp thẳng thẻ lại về $0^\circ$**.
- Giữ nguyên góc nghiêng $\theta$ của thẻ và trượt thẻ chéo ra ngoài theo đúng hướng vector góc nghiêng:
  $$\Delta x = D \cdot \sin(\theta)$$
  $$\Delta y = -D \cdot \cos(\theta)$$
  $$\text{Rotation} = \theta \quad (\text{Giữ nguyên góc nghiêng ban đầu})$$

### 📌 Bài học 3: Xòe và Gộp thẻ theo Tiến độ cuộn trang (Scroll-Driven Decks)

- Áp dụng cho các phần như _How WordStreak builds retention_ và _Your words stay yours_:
  - Ban đầu xếp chồng khít lên nhau ở giữa.
  - Sử dụng Framer Motion `useScroll` + `useTransform`: Khi cuộn tới, thẻ từ từ xòe ra hình cánh quạt theo tốc độ cuộn của người dùng; khi cuộn qua, thẻ tự động gộp dần lại về trạng thái xếp chồng.
  - Thẻ ở giữa đỉnh vòm được nâng cao hơn (`y: -28px`) tạo đỉnh vòm cánh quạt thanh thoát.
  - Khi hover vào bất kỳ thẻ nào, thẻ phản hồi lập tức (Zero Delay) với `z-index: 60`.

### 📌 Bài học 4: Dải thẻ trượt vòng cung liên tục (Pure Continuous Arc Stream)

- Áp dụng cho phần _Engineered for effortless retention_:
  - 12 thẻ tính năng di chuyển liên tục, mượt mà 60fps từ **Trái sang Phải** dọc theo quỹ đạo vòng cung parabol ($x, y = (x/R)^2 \times 36\text{px}, \text{rotate} = (x/R) \times 9.5^\circ$).
  - Là dòng chảy trượt thuần túy không hover/pause, tối ưu bằng GPU transform (`translate3d`) trực tiếp trên `requestAnimationFrame`.

---

## 5. Quy tắc Git & Commit

- Luôn ưu tiên viết commit message súc tích trên **đúng 1 dòng duy nhất** theo chuẩn Conventional Commits (ví dụ: `feat(landing): redesign landing page with animated purple streak flame and interactive card decks`).
- Đảm bảo kiểm tra chất lượng `pnpm --filter web build` & `pnpm --filter web lint` đạt **0 lỗi** trước khi commit/push.
