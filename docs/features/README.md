# ✅ Delivered Features

Danh sách tất cả các tính năng đã được deliver (code hoàn chỉnh, review pass, tests xanh, docs cập nhật).

> **Quy tắc:** Mỗi feature sau khi hoàn thành Phase 6 (Quality Verification & Delivery) phải tạo file `docs/features/<feature-slug>/README.md` trước khi đóng task.

---

## 📋 Danh sách tính năng

| Feature                                                                                                        | Slug                              | Version | Trạng thái               | Ngày ship  |
| :------------------------------------------------------------------------------------------------------------- | :-------------------------------- | :------ | :----------------------- | :--------- |
| [User Profile & Daily Goal Settings (US-AUTH-04)](./user-profile-settings/README.md)                           | `user-profile-settings`           | 1.0     | Hoàn thành (`Delivered`) | 2026-08-17 |
| [Deck CRUD & Vocabulary Management (US-DECK-01)](./deck-crud/README.md)                                        | `deck-crud`                       | 1.0     | Hoàn thành (`Delivered`) | 2026-08-19 |
| [Contextual Card Creation (US-CARD-01)](./card-creation/README.md)                                             | `card-creation`                   | 1.0     | Hoàn thành (`Delivered`) | 2026-08-19 |
| [Card List Management & Search/Filter (US-CARD-02)](./card-management/README.md)                               | `card-management`                 | 1.0     | Hoàn thành (`Delivered`) | 2026-08-20 |
| [Spaced Repetition System Review (US-SRS-01..03)](./srs-review/README.md)                                      | `srs-review`                      | 1.0     | Hoàn thành (`Delivered`) | 2026-08-20 |
| [Multiple Choice Quiz Mode (US-QUIZ-01)](./quiz-multiple-choice/README.md)                                     | `quiz-multiple-choice`            | 1.0     | Hoàn thành (`Delivered`) | 2026-08-20 |
| [Fill-in-the-blank Quiz Mode (US-QUIZ-02)](./quiz-fill-in-the-blank/README.md)                                 | `quiz-fill-in-the-blank`          | 1.0     | Hoàn thành (`Delivered`) | 2026-08-20 |
| [Daily Streak Engine & Timezone Logic (US-GAME-01)](./daily-streak-engine/README.md)                           | `daily-streak-engine`             | 1.0     | Hoàn thành (`Delivered`) | 2026-08-20 |
| [Streak Freeze Protection Mechanic (US-GAME-02)](./streak-freeze/README.md)                                    | `streak-freeze`                   | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [AI Vocabulary Generator & Global Cache (US-AI-01..02)](./ai-vocabulary-generator/README.md)                   | `ai-vocabulary-generator`         | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Learning Analytics & Retention Dashboard (US-STAT-01..03)](./learning-analytics/README.md)                    | `learning-analytics`              | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Gamification XP & Learner Levels System (US-GAME-03)](./gamification-xp-levels/README.md)                     | `gamification-xp-levels`          | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Listening & Typing Practice Quiz (US-QUIZ-03)](./quiz-listening-practice/README.md)                           | `quiz-listening-practice`         | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Word Matching Game (US-QUIZ-04)](./quiz-word-matching/README.md)                                              | `quiz-word-matching`              | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Speech Recognition & Pronunciation Assessment (US-VOICE-01..02)](./speech-pronunciation-assessment/README.md) | `speech-pronunciation-assessment` | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Deck Import & Export (CSV, Excel & Anki .apkg) (US-ECO-01)](./deck-import-export/README.md)                   | `deck-import-export`              | 1.0     | Hoàn thành (`Delivered`) | 2026-08-21 |
| [Community Decks Marketplace (US-ECO-02)](./community-decks/README.md)                                         | `community-decks`                 | 1.0     | Hoàn thành (`Delivered`) | 2026-08-22 |
| [Core i18n Infrastructure & Instant Language Switcher (US-I18N-01)](./i18n-core-switcher/README.md)            | `i18n-core-switcher`              | 1.0     | Hoàn thành (`Delivered`) | 2026-08-22 |
| [Complete UI Localization & Error Mapping (US-I18N-02)](./i18n-ui-localization/README.md)                      | `i18n-ui-localization`            | 1.0     | Hoàn thành (`Delivered`) | 2026-08-22 |
| [User Language Preferences Sync (US-I18N-03)](./i18n-user-preferences-sync/README.md)                          | `i18n-user-preferences-sync`      | 1.0     | Hoàn thành (`Delivered`) | 2026-08-22 |

---

## 📝 Template cho Feature Doc

Khi deliver một feature mới, tạo file `docs/features/<feature-slug>/README.md` với cấu trúc sau:

```markdown
# Feature: <Tên tính năng>

**Slug**: `<feature-slug>`
**Version**: 1.0
**Ship date**: <YYYY-MM-DD>
**Spec**: [.specify/features/<slug>/spec/](../../.specify/features/<slug>/)
**Baseline**: [SIGNED-OFF v1.0]

## Mô tả ngắn

<2-3 câu mô tả tính năng này làm gì và giải quyết vấn đề gì>

## Phạm vi (MoSCoW Must-Have đã ship)

- ...

## Ngoài phạm vi (Won't-Have)

- ...

## Các thay đổi kỹ thuật chính

### Database

- Schema changes: ...
- Migrations: `<migration-file-name>`

### Backend (NestJS)

- Module mới / sửa: `apps/api/src/<module>/`
- API endpoints mới: `POST /api/v1/...`

### Frontend (React)

- Components mới / sửa: `apps/web/src/features/<feature>/`
- Routes mới: `/...`

## Test Coverage

- Unit tests: `apps/api/src/<module>/*.spec.ts`
- E2E tests: `apps/web/e2e/<feature>.spec.ts`
- Test plan gốc: [.specify/features/<slug>/test-plan.md](../../.specify/features/<slug>/test-plan.md)

## Known Accepted Risks / Gaps

_(từ validation-report.md — để trống nếu không có)_

## Tác giả & Review

- **Implemented by**: AI (Antigravity)
- **Reviewed by**: <tên>
- **Date**: <YYYY-MM-DD>
```
