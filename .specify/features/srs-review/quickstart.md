# Quickstart: Spaced Repetition System (SRS Review)

## 1. Prerequisites

- PostgreSQL running locally or via Docker.
- Backend API running on `http://localhost:3000`.
- Frontend Web running on `http://localhost:5173`.

## 2. Validation Scenarios

### Scenario A: Backend Unit & Integration Tests

```bash
# Run SrsService & Reviews module tests
pnpm --filter api test -- src/modules/reviews
```

### Scenario B: Frontend Component Tests & Build

```bash
# Run frontend tests & TypeScript build
pnpm --filter web test
pnpm --filter web build
```

### Scenario C: End-to-End User Flow

1. Login to `http://localhost:5173/login`.
2. Navigate to `/review` or click "Review Due Cards" from Dashboard.
3. Verify 3D card flips with `Space` key.
4. Verify rating with `1` (Again) re-queues the card at end of session.
5. Verify rating with `3` (Good) or `4` (Easy) advances to next card and persists SM-2 interval.
6. Verify completion summary appears upon reviewing all due cards.
