# User Stories: Contextual Card Creation (US-CARD-01)

### US-CARD-001: Tạo thẻ từ vựng với trường giàu ngữ cảnh (Rich Context Card Creation)

**As a** Authenticated Learner (Deck Owner)  
**I want to** create vocabulary cards with rich multimodal context (word, IPA, meaning, example sentence, collocations, mnemonic, image, audio)  
**So that** I have rich cognitive cues to encode and retain vocabulary effectively into long-term memory.  
**Derived from**: BR-CARD-001, BR-CARD-002, BR-CARD-003, ASM-CARD-001, ASM-CARD-002, ASM-CARD-003

**Acceptance Criteria**:

- **Scenario 1 (Happy Path - Create card with full context)**
  - **Given** I am logged in and viewing my deck at `/decks/:deckId`
  - **When** I click "Thêm thẻ mới" (+ Add Card), enter `word: "ephemeral"`, `meaning: "phù du, chóng tàn"`, `phonetic: "/ɪˈfem.ər.əl/"`, `exampleSentence: "Fame in the world of pop is largely ephemeral."`, `collocations: "ephemeral pleasure, ephemeral nature"`, `mnemonic: "E-fem-eral -> giống như phim (film) ngắn trôi qua nhanh"`
  - **And** I click "Lưu thẻ" (Save Card)
  - **Then** the card is created in the database via `POST /api/v1/decks/:deckId/cards` (201 Created)
  - **And** an associated `UserCardProgress` record is automatically initialized with `status: "NEW"`, `interval: 0`, `repetitions: 0`, `easeFactor: 2.5`
  - **And** the modal closes and the deck's card count updates.

- **Scenario 2 (Happy Path - Quick continuous addition)**
  - **Given** I am entering vocabulary in `AddCardModal`
  - **When** I fill in `word` and `meaning` and click "Lưu & Thêm từ tiếp" (Save & Add Another)
  - **Then** the card is saved to DB and a success toast appears
  - **And** the modal stays open with form fields reset and the cursor automatically focused on the `word` input.

- **Scenario 3 (Validation Error - Missing required fields)**
  - **Given** I have `AddCardModal` open
  - **When** I leave `word` or `meaning` empty and click Save
  - **Then** the form prevents submission and highlights the missing required fields with clear validation messages.

- **Scenario 4 (Soft Warning - Duplicate word in deck)**
  - **Given** my deck already contains the card `"serendipity"`
  - **When** I type `"serendipity"` (or `"Serendipity"`) into the `word` input
  - **Then** a non-blocking informational badge appears: _"Từ này đã có trong bộ từ"_
  - **And** I can still submit and save the card if I intend to.

- **Scenario 5 (Deck Ownership Authorization)**
  - **Given** user B attempts to send `POST /api/v1/decks/:deckId/cards` to a deck owned by user A
  - **Then** the backend rejects the request with `404 Not Found` (or `403 Forbidden`).

---

### US-CARD-002: Xem trước Flashcard 3D và Nghe thử phát âm (Live 3D Preview & Audio)

**As a** Authenticated Learner  
**I want to** see an interactive 3D preview of the card (front and back) and listen to pronunciation while composing  
**So that** I can verify exactly how the flashcard will look and sound before saving.  
**Derived from**: BR-CARD-004, BR-CARD-005, ASM-CARD-004, ASM-CARD-005

**Acceptance Criteria**:

- **Scenario 1 (Real-time live preview update)**
  - **Given** `AddCardModal` is open with the 3D preview panel visible
  - **When** I type or edit `word`, `phonetic`, `meaning`, or `exampleSentence`
  - **Then** the front and back card preview updates synchronously in real time.

- **Scenario 2 (Audio pronunciation via Web Speech API fallback)**
  - **Given** I typed `word: "ubiquitous"` without specifying an `audioUrl`
  - **When** I click the 🔊 audio button in the preview or form
  - **Then** the browser synthesizes pronunciation using `window.speechSynthesis` with `en-US` voice.

- **Scenario 3 (Audio pronunciation via custom audioUrl)**
  - **Given** I entered a valid audio URL in `audioUrl`
  - **When** I click the 🔊 audio button
  - **Then** the audio stream from the URL is played.

---

### US-CARD-003: Chỉnh sửa và Xóa thẻ từ vựng (Card Edit & Cascade Deletion)

**As a** Authenticated Learner (Deck Owner)  
**I want to** update or delete existing cards in my deck  
**So that** I can fix typos, update mnemonics, or remove obsolete cards.  
**Derived from**: BR-CARD-001, BR-CARD-002, BR-CARD-006, ASM-CARD-001, ASM-CARD-006

**Acceptance Criteria**:

- **Scenario 1 (Edit Card)**
  - **Given** I own a card in my deck
  - **When** I update its meaning or mnemonic via `PATCH /api/v1/cards/:id`
  - **Then** the card is updated in the database and reflects immediately on the UI.

- **Scenario 2 (Delete Card with cascade progress removal)**
  - **Given** a card exists with an associated `UserCardProgress`
  - **When** I delete the card via `DELETE /api/v1/cards/:id`
  - **Then** the card and its linked `UserCardProgress` are deleted atomically (200 OK)
  - **And** the deck's card counter decrements.
