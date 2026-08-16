# ✅ Delivered Features

Danh sách tất cả các tính năng đã được deliver (code hoàn chỉnh, review pass, tests xanh, docs cập nhật).

> **Quy tắc:** Mỗi feature sau khi hoàn thành Phase 6 (Quality Verification & Delivery) phải tạo file `docs/features/<feature-slug>/README.md` trước khi đóng task.

---

## 📋 Danh sách tính năng

| Feature                              | Slug | Version | Trạng thái | Ngày ship |
| ------------------------------------ | ---- | ------- | ---------- | --------- |
| _(Chưa có feature nào được deliver)_ | —    | —       | —          | —         |

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
