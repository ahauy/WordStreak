# User Stories: Community Decks Marketplace (US-ECO-02)

- **Date**: 2026-08-22
- **Feature Slug**: `community-decks`
- **User Story ID**: `US-ECO-02`
- **Status**: APPROVED

---

## User Story: `US-ECO-02` — Chia sẻ & Khám phá Bộ từ vựng Cộng đồng (Community Decks Marketplace)

> **As a** WordStreak learner and vocabulary enthusiast,  
> **I want to** discover, preview, rate, and clone curated public vocabulary decks created by the community,  
> **So that** I can immediately study high-quality specialized vocabulary lists (IELTS, Business, Oxford 3000) without manually typing every card.

---

### Scenario 1: Browse Public Decks with Categories & Sorting (Happy Path)

- **Given** an authenticated or unauthenticated user visiting the `/community` route
- **When** the page loads
- **Then** the system displays a curated grid of public decks (`isPublic = true`, `isArchived = false`)
- **And** each deck card shows: Title, Category pill, Creator avatar & name, Total cards count, Average star rating (`★ 4.8 (24)`), and Clone count (`📥 142`)
- **When** the user clicks the "IELTS" category chip
- **Then** the deck grid filters to show only decks tagged or categorized with "IELTS"
- **When** the user selects the "Phổ biến nhất" (Most Cloned) sorting option
- **Then** the list is ordered by descending `cloneCount`.

---

### Scenario 2: Preview Deck Cards in Modal (Happy Path)

- **Given** a user viewing a community deck card on `/community`
- **When** the user clicks on the deck card or the "Xem trước" (Preview) button
- **Then** a modal opens displaying the deck's description, tags, author details, and a scrollable table of all cards in the deck
- **And** the user can listen to the audio pronunciation and view IPA/meanings
- **And** a sticky "Sao chép vào Bộ từ của tôi" (Clone to My Decks) CTA button is clearly visible.

---

### Scenario 3: 1-Click Clone Deck (Happy Path)

- **Given** an authenticated learner viewing a public deck with 50 cards
- **And** the learner is NOT the author of this deck
- **When** the learner clicks "Sao chép vào Bộ từ của tôi" (Clone to My Decks)
- **Then** the system sends `POST /api/v1/community/decks/:id/clone`
- **And** an atomic transaction creates a new `Deck` in the learner's personal library containing exact copies of all 50 `Card` entities
- **And** `UserCardProgress` records are initialized in `NEW` status (`interval = 0`, `repetitions = 0`, `easeFactor = 2.5`) for all cloned cards
- **And** the source deck's `cloneCount` increases by 1
- **And** a success toast notification appears with a direct link to "Mở Bộ từ vừa sao chép" or "Bắt đầu học ngay".

---

### Scenario 4: Anti-Abuse on Self-Cloning (Edge Case)

- **Given** an author who created a public deck
- **When** the author navigates to `/community` and attempts to clone their own deck
- **Then** the clone button shows "Bộ từ của bạn" (Your Deck) in a disabled state
- **And** if an API call `POST /api/v1/community/decks/:id/clone` is sent directly, the backend returns `400 Bad Request` with message `"Bạn không thể sao chép bộ từ của chính mình"`.

---

### Scenario 5: 5-Star Rating Submission & Average Recalculation (Happy Path)

- **Given** an authenticated learner who has previously cloned or studied deck `D-101`
- **When** the learner opens the rating dialog for `D-101` and selects 5 stars with comment `"Bộ từ IELTS rất chất lượng, ví dụ rõ ràng!"`
- **Then** the system records the rating in `DeckRating`
- **And** recalculates `Deck.averageRating` and `Deck.totalRatings` atomically in the database
- **And** updates the UI to reflect the user's rating and the new aggregate score.

---

### Scenario 6: Anti-Abuse on Rating (Edge Cases)

- **Case A (Author Self-Rating)**:
  - **Given** the author of deck `D-101`
  - **When** the author attempts to rate `D-101`
  - **Then** the backend rejects the request with `403 Forbidden` (`"Tác giả không thể tự đánh giá bộ từ của mình"`).
- **Case B (Unauthenticated User)**:
  - **Given** a guest / anonymous user
  - **When** the user clicks the "Đánh giá" button
  - **Then** the system displays a login prompt modal.
