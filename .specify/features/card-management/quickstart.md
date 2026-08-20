# Quickstart Validation Guide: Card List Management (US-CARD-02)

## 1. Prerequisites

- Running Postgres database (`docker compose up -d`).
- Backend API running on `http://localhost:3000`.
- Frontend Web running on `http://localhost:5173`.

## 2. Test & Validation Commands

```bash
# 1. Run Backend Unit Tests
pnpm --filter api test cards.service.spec.ts cards.controller.spec.ts

# 2. Run Full API Test Suite
pnpm --filter api test

# 3. Run Frontend Unit/Component Tests
pnpm --filter web test

# 4. Build Validation
pnpm build
```

## 3. Manual E2E Flow

1. Navigate to `/decks` and open any existing Deck.
2. Verify the View Switcher (Grid vs Table) works and preserves state on browser refresh.
3. Type keyword in the search bar and select different status filter chips (New / Learning / Mastered).
4. Select 2+ cards and test Bulk Reset Progress, Bulk Move, and Bulk Delete (with confirmation modal).
