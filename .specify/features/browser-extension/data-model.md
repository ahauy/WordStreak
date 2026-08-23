# Data Model & Contracts: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Feature**: `browser-extension` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

---

## 1. Data Contracts & DTOs

### 1.1. Quick Capture Request DTO (`QuickCaptureCardDto`)

```typescript
export interface QuickCaptureCardDto {
  /** Từ vựng cần lưu (1-100 ký tự) */
  word: string;
  /** ID của bộ từ đích. Nếu không truyền, hệ thống tự động tìm Deck mặc định hoặc tạo mới Inbox Deck */
  deckId?: string;
  /** Câu ngữ cảnh trích xuất từ trang web (tối đa 500 ký tự) */
  contextSentence?: string;
  /** URL của trang web đang duyệt */
  sourceUrl?: string;
  /** Nghĩa tùy chỉnh (nếu người dùng tự nhập trong popup) */
  customDefinition?: string;
}
```

### 1.2. Quick Capture Response DTO (`QuickCaptureResponseDto`)

```typescript
export interface QuickCaptureResponseDto {
  /** Thông báo kết quả */
  message: string;
  /** Thẻ từ vựng được tạo hoặc thẻ đã tồn tại */
  card: CardResponse;
  /** Cờ đánh dấu từ vựng đã tồn tại trong Deck trước đó */
  isDuplicate: boolean;
  /** Bộ từ chứa thẻ này */
  deck: {
    id: string;
    title: string;
  };
}
```

### 1.3. Extension Storage & Settings State (`ExtensionSettings`)

```typescript
export interface ExtensionStorageState {
  /** JWT Access Token của WordStreak */
  token: string | null;
  /** Thông tin tóm tắt của user */
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  } | null;
  /** Cấu hình người dùng */
  settings: {
    /** Deck được ghim để lưu 1-click */
    pinnedDeckId: string | null;
    /** Tự động hiện icon ngọn lửa khi bôi đen từ */
    autoShowFloatingIcon: boolean;
    /** Phím tắt kích hoạt tra nhanh (mặc định Alt+W) */
    shortcutKey: string;
    /** Danh sách domain bị vô hiệu hóa icon */
    blacklistedDomains: string[];
  };
  /** Lịch sử 10 từ thu thập gần nhất */
  recentCaptures: Array<{
    id: string;
    word: string;
    definition: string;
    deckTitle: string;
    capturedAt: string;
    sourceUrl?: string;
  }>;
}
```

### 1.4. Extension Background Messages (`ExtensionMessage`)

```typescript
export type ExtensionMessage =
  | { type: "QUICK_CAPTURE"; payload: QuickCaptureCardDto }
  | { type: "GET_AUTH_STATUS" }
  | { type: "SET_AUTH_TOKEN"; payload: { token: string } }
  | { type: "LOGOUT" }
  | { type: "FETCH_DECKS" }
  | { type: "GET_SETTINGS" }
  | {
      type: "UPDATE_SETTINGS";
      payload: Partial<ExtensionStorageState["settings"]>;
    };
```

---

## 2. Prisma Database Mapping

Tính năng tận dụng trực tiếp các bảng hiện có trong cơ sở dữ liệu WordStreak mà không cần thay đổi cấu trúc bảng cũ:

- **Bảng `cards`**:
  - `id`: UUID (Primary Key)
  - `deckId`: UUID (Foreign Key -> `decks.id`)
  - `front`: Từ vựng (`word`)
  - `back`: Nghĩa tiếng Việt (tự động điền qua AI hoặc user nhập)
  - `phonetic`: Phiên âm IPA (tự động điền qua AI)
  - `partOfSpeech`: Loại từ (n, v, adj...)
  - `example`: Câu ngữ cảnh trích xuất (`contextSentence`)
  - `notes`: Ghi chú nguồn (`Captured from: <sourceUrl>`)
  - `state`: `'NEW'` (Khởi tạo SM-2)
  - `easeFactor`: `2.50`
  - `interval`: `0`
  - `repetitions`: `0`
  - `createdAt`: `NOW()`

- **Bảng `decks`**:
  - Tự động tạo Deck _"Inbox / Thu thập Web"_ nếu user chưa có bất kỳ Deck nào.
