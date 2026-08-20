# User Stories: Card List Management & Search/Filter (US-CARD-02)

## Feature Overview

- **Epic**: EPIC-02 Deck & Vocabulary Card Management
- **Feature Slug**: `card-management`
- **Target User Story**: `US-CARD-02`

---

### US-CARD-02.1: Server-side Paginated Card List with Search & Status Filter

**As an** active learner,  
**I want to** search words and filter cards by their mastery status with server-side pagination,  
**So that** I can quickly locate specific vocabulary and study efficiently even in decks with hundreds of cards.

#### Acceptance Scenarios (Gherkin)

##### Scenario 1: Search by keyword in deck

- **Given** I am on the Deck Detail page for a deck with 50 cards
- **When** I type "serendipity" into the search input
- **Then** the system sends a request `GET /api/v1/decks/:deckId/cards?search=serendipity&page=1&limit=20`
- **And** displays only matching cards containing "serendipity" in word, meaning, or example sentence

##### Scenario 2: Filter by learning status

- **Given** I have cards in "NEW", "LEARNING", and "MASTERED" states
- **When** I click the "Learning" filter chip
- **Then** the card list updates to show only cards where `progress.status` is "LEARNING" or "REVIEW"
- **And** the pagination bar updates the total page count accordingly

##### Scenario 3: Empty search or filter results

- **Given** I search for a word that does not exist in the deck
- **When** the query returns 0 results
- **Then** an informative empty state is shown with a "Clear Search / Filter" button

---

### US-CARD-02.2: Dual View Mode (3D Grid & Data Table)

**As a** learner,  
**I want to** toggle between a visually rich 3D Cards Grid and a high-density Data Table,  
**So that** I can switch between detailed visual study and fast skimming/management.

#### Acceptance Scenarios (Gherkin)

##### Scenario 1: Switch to Table View

- **Given** I am viewing cards in Grid mode
- **When** I click the "Table View" toggle button
- **Then** cards are rendered as rows in a responsive data table showing Word, IPA, Meaning, Example, Status, and Action buttons
- **And** my preference is saved to `localStorage` so it persists on reload

##### Scenario 2: Audio playback from Table View

- **Given** I am in Table View
- **When** I click the speaker icon next to a word with an `audioUrl`
- **Then** the native pronunciation audio plays immediately without opening the card editor

---

### US-CARD-02.3: Bulk Actions (Delete, Move to Deck, Reset Progress)

**As a** deck owner,  
**I want to** select multiple cards to delete, move to another deck, or reset their progress in bulk,  
**So that** I can organize my vocabulary library quickly without repeating single-card actions.

#### Acceptance Scenarios (Gherkin)

##### Scenario 1: Bulk Delete with Confirmation

- **Given** I select 5 cards using the multi-select checkboxes
- **When** I click "Delete Selected" on the floating action bar
- **Then** a confirmation modal appears displaying "Are you sure you want to delete 5 cards?"
- **When** I confirm deletion
- **Then** the system sends `POST /api/v1/decks/:deckId/cards/bulk-action` with `{ action: 'DELETE', cardIds: [...] }`
- **And** the 5 cards are removed and deck stats are refreshed

##### Scenario 2: Bulk Move to Another Deck

- **Given** I select 3 cards
- **When** I click "Move to Deck" and select a target deck "IELTS Advanced"
- **Then** the system transfers all 3 cards to "IELTS Advanced" in an atomic transaction
- **And** their SRS progress is preserved

##### Scenario 3: Bulk Reset Progress

- **Given** I select 4 mastered cards
- **When** I click "Reset Progress" and confirm
- **Then** their `UserCardProgress` status is reset to `NEW` with `interval = 0`, `repetitions = 0`
- **And** they appear in the "New" queue for review
