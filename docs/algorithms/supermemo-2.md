# 🧮 Thuật toán lặp lại ngắt quãng SuperMemo 2 (SM-2)

Dự án WordStreak áp dụng thuật toán **SuperMemo 2 (SM-2)** – thuật toán cốt lõi được sử dụng bởi phần mềm Anki nổi tiếng – để tính toán khoảng thời gian tối ưu cho việc ôn tập từ vựng.

---

## 📐 Các biến số chính trong hệ thống

Mỗi thẻ từ vựng của người dùng (`UserCardProgress`) sẽ lưu giữ 4 thông số:

1. **$I$ (Interval)**: Khoảng thời gian (tính bằng ngày) cho lần ôn tập tiếp theo.
2. **$EF$ (Ease Factor)**: Hệ số độ dễ của thẻ (mặc định ban đầu = `2.5`). Giá trị tối thiểu là `1.3`.
3. **$n$ (Repetitions)**: Số lần ôn tập thành công liên tiếp.
4. **$q$ (Quality / Rating)**: Đánh giá chất lượng của người dùng khi lật thẻ ($q \in \{1, 2, 3, 4\}$):
   - `1` (Again / Lặp lại): Không nhớ từ.
   - `2` (Hard / Khó): Nhớ nhưng gặp khó khăn.
   - `3` (Good / Tốt): Nhớ tốt sau một chút suy nghĩ.
   - `4` (Easy / Dễ): Nhớ ngay lập tức mà không tốn sức.

---

## 🔄 Công thức tính toán

### 1. Cập nhật Ease Factor ($EF$)
$$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$

*Nếu $EF' < 1.3$ thì gán $EF' = 1.3$.*

### 2. Cập nhật Số lần lặp ($n$) và Khoảng cách ($I$)

- **Nếu $q < 3$ (Lặp lại hoặc Khó):**
  - Reset $n = 0$
  - Gán $I = 1$ ngày.

- **Nếu $q \ge 3$ (Tốt hoặc Dễ):**
  - Tăng $n = n + 1$
  - Khoảng cách $I$ được tính:
    - Lần 1 ($n = 1$): $I(1) = 1$ ngày
    - Lần 2 ($n = 2$): $I(2) = 6$ ngày
    - Lần $n > 2$: $I(n) = I(n-1) \times EF'$

### 3. Tính ngày ôn tập tiếp theo ($nextReviewDate$)
$$nextReviewDate = currentDate + I \text{ (ngày)}$$

---

## 💻 Mã giả (Pseudocode TS implementation)

```typescript
export interface SrsResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: Date;
}

export function calculateSm2(
  rating: number, // 1: Again, 2: Hard, 3: Good, 4: Easy
  repetitions: number,
  easeFactor: number,
  interval: number,
): SrsResult {
  let nextEaseFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

  let nextRepetitions = repetitions;
  let nextInterval = interval;

  if (rating < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    nextRepetitions += 1;
    if (nextRepetitions === 1) {
      nextInterval = 1;
    } else if (nextRepetitions === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * nextEaseFactor);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    interval: nextInterval,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    repetitions: nextRepetitions,
    nextReviewDate,
  };
}
```
