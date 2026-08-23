# Test Plan: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Feature slug**: `browser-extension`  
**Baseline version**: 1.0 (SIGNED-OFF)  
**Written by**: AI (Antigravity) — Stage TDD (trước implement)  
**Traces to**: `.specify/features/browser-extension/spec/user-stories.md`

> **Mục đích**: Document này mô tả test cases ở dạng Gherkin trước khi viết code.
> Sau khi implement xong, actual test files được viết dựa trên document này.

---

## Unit Tests

### 1. `CardsService.quickCapture`

#### TC-EXT-001: Tạo thẻ mới thành công với tự động làm giàu dữ liệu (AI auto-fill) & SM-2 NEW state

```gherkin
Given người dùng đã đăng nhập với userId hợp lệ
  And Deck đích tồn tại
When  gọi CardsService.quickCapture với word = "ubiquitous", contextSentence = "Smartphones are ubiquitous in modern life."
Then  thẻ từ được tạo mới trong cơ sở dữ liệu
  And front = "ubiquitous"
  And example = "Smartphones are ubiquitous in modern life."
  And phonetic được tự động điền (e.g. /juːˈbɪk.wə.təs/)
  And state = "NEW", easeFactor = 2.50, interval = 0, repetitions = 0
  And isDuplicate = false
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-001` Scenario 1, `US-EXT-002` Scenario 2

---

#### TC-EXT-002: Phát hiện từ vựng đã tồn tại trong Deck (Duplicate Card Detection)

```gherkin
Given Deck đích đã chứa thẻ có front = "ubiquitous"
When  gọi CardsService.quickCapture với word = "Ubiquitous" (khác hoa thường)
Then  hệ thống phát hiện trùng lặp
  And isDuplicate = true
  And trả về thông tin thẻ hiện có mà không tạo thêm bản ghi mới trong database
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-001` Scenario 2

---

#### TC-EXT-003: Tự động tạo Deck "Inbox / Thu thập Web" nếu người dùng chưa có Deck nào

```gherkin
Given người dùng mới chưa có bất kỳ Deck nào trong tài khoản
When  gọi CardsService.quickCapture với word = "ephemeral" và không truyền deckId
Then  hệ thống tự động tạo một Deck mới mang tên "Inbox / Thu thập Web"
  And gán thẻ mới vào Deck này
  And trả về thông tin Deck và Thẻ vừa tạo
```

**File**: `apps/api/src/modules/cards/cards.service.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-001` Scenario 1, `US-EXT-003` Scenario 1

---

### 2. `SentenceExtractor` (Content Script)

#### TC-EXT-004: Trích xuất câu ngữ cảnh chính xác quanh từ bôi đen trong đoạn văn

```gherkin
Given đoạn văn bản "First sentence. Economic resilience is crucial for long-term growth. Third sentence."
When  người dùng bôi đen từ "resilience"
Then  hàm extractSentence trả về chính xác "Economic resilience is crucial for long-term growth."
```

**File**: `apps/extension/src/content/sentence-extractor.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-002` Scenario 1

---

#### TC-EXT-005: Giới hạn độ dài câu tối đa 250 ký tự và xử lý an toàn xuống dòng

```gherkin
Given một đoạn văn bản rất dài hơn 300 ký tự không có dấu chấm
When  người dùng bôi đen một từ bên trong đoạn văn đó
Then  hàm extractSentence cắt ngắn câu ngữ cảnh tối đa 250 ký tự kèm dấu "..."
```

**File**: `apps/extension/src/content/sentence-extractor.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-002` Scenario 1

---

## Integration Tests

### `POST /api/v1/cards/quick-capture`

#### TC-EXT-010: Gọi endpoint Quick Capture thành công khi có JWT hợp lệ

```gherkin
Given user is authenticated with valid JWT bearer token
When  POST /api/v1/cards/quick-capture is called with payload:
      {
        "word": "serendipity",
        "contextSentence": "Finding this book was pure serendipity."
      }
Then  response status is 201 Created
  And response body contains { "message": "...", "card": { "front": "serendipity", "state": "NEW" }, "isDuplicate": false }
```

**File**: `apps/api/src/modules/cards/cards.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-001` Scenario 1, `US-EXT-002` Scenario 2

---

#### TC-EXT-011: Chặn truy cập khi không có JWT bearer token

```gherkin
Given client does not send Authorization header
When  POST /api/v1/cards/quick-capture is called
Then  response status is 401 Unauthorized
```

**File**: `apps/api/src/modules/cards/cards.controller.spec.ts`  
**Priority**: Must-Have  
**Traces to**: `US-EXT-001` Scenario 3
