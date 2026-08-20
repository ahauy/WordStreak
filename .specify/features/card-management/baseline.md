# Domain Decision Baseline: Card List Management & Search/Filter (US-CARD-02)

**Status**: SIGNED-OFF v1.0
**Version**: 1.0.0
**Feature Slug**: `card-management`
**Date**: 2026-08-20
**Signed-off by**: User / Lead Product Owner

## 1. Executive Summary

This feature equips `DeckDetailPage` with robust card list management capabilities:

1. **Server-side pagination and real-time query filtering**: Search by keyword and filter by SRS status (`NEW`, `LEARNING`, `MASTERED`) with pagination controls.
2. **Dual View Modes**: Seamless toggle between a visually immersive 3D Cards Grid and a high-density Data Table with persistent preference.
3. **Transactional Bulk Actions**: Bulk Delete (with confirmation), Bulk Move to Deck, and Bulk Reset Progress with atomic execution in PostgreSQL transactions.

## 2. Business Rules Summary

- **BR-CARD-001**: Paginated API endpoint `GET /api/v1/decks/:deckId/cards` with query params `page`, `limit`, `search`, `status` returning `{ data, meta }`.
- **BR-CARD-002**: Transactional bulk action endpoint `POST /api/v1/decks/:deckId/cards/bulk-action` supporting `DELETE`, `MOVE`, `RESET_PROGRESS`.
- **BR-CARD-003**: View mode preference saved to `localStorage` under `wordstreak_deck_view_mode`.

## 3. Scope & MoSCoW

- **Must-Have**: Paginated backend query, Dual view toggle (Grid/Table), Multi-select checkboxes, Bulk Delete, Bulk Move, Bulk Reset Progress.
- **Won't-Have (v1)**: Cross-deck drag & drop sorting, inline multi-cell editing.
