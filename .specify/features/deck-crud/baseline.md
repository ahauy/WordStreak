# Domain Decision Baseline: Deck CRUD & Management (US-DECK-01)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: Product Owner & User, 2026-08-19

This document is the authoritative domain baseline for feature `US-DECK-01: Deck CRUD & Management`. Any subsequent modifications to scope or business rules must follow the formal change management process.

---

## 1. Business Problem & Personas

- **Problem**: Người học cần một không gian có tổ chức để phân loại từ vựng theo từng chủ đề hoặc mục tiêu học (IELTS, TOEIC, IT, Giao tiếp), đồng thời theo dõi tổng quan tiến độ của từng bộ từ.
- **Personas**: Authenticated Learner (Deck Owner).
- **Core Value**: Cá nhân hóa bộ từ, nhận diện trực quan qua Cosmos Themes/Icons, bảo vệ dữ liệu với cơ chế Archive & Cascade Delete an toàn.

---

## 2. Approved Domain Model Summary

- **RBAC**: Learner sở hữu Deck của chính mình. Chỉ Owner mới có quyền tạo, sửa, lưu trữ, khôi phục và xóa Deck.
- **State Machine**: `ACTIVE` (đang học) <--> `ARCHIVED` (lưu trữ) --> `DELETED` (xóa vĩnh viễn cascade).
- **Business Rules**:
  - `BR-DECK-001`: Title 1-100 ký tự, không rỗng.
  - `BR-DECK-002`: Description tối đa 500 ký tự.
  - `BR-DECK-003`: Hỗ trợ Preset Cosmos Palette (8 màu) + Lucide Icons (12 icons) cùng Custom Hex Color và Cover Image URL.
  - `BR-DECK-004`: Tách biệt danh sách Active và Archived.
  - `BR-DECK-005`: Xóa vĩnh viễn cascade Deck, Cards, và UserCardProgress trong 1 transaction.
  - `BR-DECK-006`: Cung cấp `stats` tóm tắt (`totalCards`, `newCards`, `learningCards`, `masteredCards`, `dueCards`).
- **Data Model**: Tham khảo chi tiết tại [`03-domain-model.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/03-domain-model.md).

---

## 3. Scope Boundaries (MoSCoW)

- **Must-Have**: Deck CRUD APIs, Decks List page, Create/Edit Modals, Preset/Custom visual styling, Archive & Restore, Cascade Delete modal cảnh báo.
- **Won't-Have (v1)**: Community Deck Sharing, Import/Export .apkg/.csv (chuyển sang `EPIC-09`).
- **Risk Register**: Tham khảo [`04-risk-register.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/04-risk-register.md).

---

## 4. Specifications & Quality Gate

- **User Stories**: [`spec/user-stories.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/spec/user-stories.md) (`US-DECK-001` đến `US-DECK-005`).
- **Traceability Matrix**: [`traceability-matrix.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/traceability-matrix.md).
- **Validation Report**: [`validation-report.md`](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/deck-crud/validation-report.md) — **Status: PASS (ISO/IEC/IEEE 29148)**.
