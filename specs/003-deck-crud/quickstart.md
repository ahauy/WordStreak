# Quickstart: Deck CRUD & Management

Follow these instructions to verify and run the Deck CRUD module.

## 1. Database Migration

```bash
# In project root
pnpm --filter api exec prisma migrate dev --name add_deck_visual_and_archive_fields
pnpm --filter api exec prisma generate
```

## 2. Running Automated Tests

```bash
# Backend unit tests
pnpm --filter api test -- src/modules/decks

# Frontend unit tests
pnpm --filter web test -- src/features/decks
```

## 3. Manual Verification

1. Log into WordStreak (`http://localhost:5173/login`).
2. Navigate to `/decks` (or click "Bộ từ vựng" in Navigation).
3. Click **"+ Tạo Bộ Từ Mới"** -> Choose Indigo / Book icon -> Enter "IELTS Band 8 Vocabulary" -> Submit.
4. Verify Deck appears in the grid with Indigo theme badge and 0 cards.
5. Click Deck options menu -> "Chỉnh sửa" -> Change title -> Verify instant update.
6. Click "Lưu trữ bộ từ" -> Switch to "Đã lưu trữ" tab -> Verify deck is listed -> Click "Khôi phục".
7. Click "Xóa bộ từ" -> Observe danger modal with card count -> Confirm delete -> Verify deck is removed.
