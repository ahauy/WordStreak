# Software Requirements Specification (SRS): Spaced Repetition System (SRS Review)

## 1. Functional Requirements

### REQ-SRS-001: SuperMemo-2 Calculation Engine

- **Category**: Algorithm & Core Domain
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system must provide a pure, deterministic `SrsService` that takes current card state (`repetitions`, `easeFactor`, `interval`) and a user review rating (`1: Again`, `2: Hard`, `3: Good`, `4: Easy`), and computes the next interval in days, updated ease factor ($EF' \ge 1.3$), repetitions, and next review date.
- **Derived from**: `BR-SRS-001`, `BR-SRS-002`, `ASM-SRS-004`
- **Business Rules**: `BR-SRS-001`, `BR-SRS-002`
- **Non-Functional Requirements**: Calculation execution time < 1ms, 100% unit test branch coverage.

### REQ-SRS-002: Due Review Queue Retrieval API

- **Category**: API & Query Engine
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system must provide an endpoint `GET /api/v1/reviews/due` (with optional query parameter `deckId`) that returns up to 50 cards that are either overdue/due today (`nextReviewDate <= CURRENT_TIMESTAMP`) or new cards (`status == 'NEW'`) capped by `dailyGoal`.
- **Derived from**: `BR-SRS-003`, `ASM-SRS-001`, `WF-SRS-01`
- **Business Rules**: `BR-SRS-003`
- **Non-Functional Requirements**: P95 query response latency < 50ms.

### REQ-SRS-003: Review Rating Submission API

- **Category**: API & Data Persistence
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The system must provide an endpoint `POST /api/v1/reviews/submit` receiving `{ cardId: string, rating: 1 | 2 | 3 | 4 }`, validating ownership, executing SM-2 recalculation, atomically updating `UserCardProgress`, and returning the updated progress entity.
- **Derived from**: `BR-SRS-004`, `BR-SRS-005`, `ASM-SRS-003`, `WF-SRS-02`
- **Business Rules**: `BR-SRS-004`, `BR-SRS-005`
- **Non-Functional Requirements**: Atomic database transaction, idempotent against rapid multi-click duplicates within 2s.

### REQ-SRS-004: Interactive 3D Flashcard Review UI

- **Category**: Frontend & UX
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: The frontend must provide dedicated routes `/review` and `/decks/:deckId/review` rendering a 3D flip card component with keyboard shortcuts (`Space` to flip, `1` Again, `2` Hard, `3` Good, `4` Easy, `R` audio replay), session progress indicator, and smooth perspective animation.
- **Derived from**: `Pillar 6`, `apps/web/DESIGN.md`, `ASM-SRS-002`
- **Non-Functional Requirements**: Zero layout shift, WCAG 2.1 AA accessible keyboard navigation, stable outer hover anchor.

### REQ-SRS-005: End-of-Session Summary & Streak Integration

- **Category**: Frontend & Gamification
- **Priority**: Must-Have (P0)
- **Status**: Draft
- **Description**: Upon exhausting the review queue, the frontend must display a Session Completion Dialog with review count, retention rate breakdown, time elapsed, and action buttons to return to Dashboard or continue reviewing.
- **Derived from**: `WF-SRS-03`, `ASM-SRS-003`
