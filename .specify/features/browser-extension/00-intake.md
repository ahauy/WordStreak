# Intake: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

- **Feature Slug**: `browser-extension`
- **Target User Story**: `US-ECO-03`
- **Date**: 2026-08-23
- **Requested by**: Learner / WordStreak Core User
- **Classification**: Full Feature
- **Classification signals**:
  - New domain entities: 0–1 (Card quick capture metadata / sync tokens)
  - Existing DB schema change required: No / Maybe additive (Capture source URL)
  - Screens/flows touched: 3 (Web In-Page Floating Tooltip via Shadow DOM, Extension Popup Window, Options/Settings Page)
  - User roles affected: 1 (Authenticated Learner)
  - Cross-cutting: Yes (Cross-origin Auth Sync, Token Lifecycle, Browser Extension Manifest V3 Service Worker)
  - Reversibility: High (Standalone extension client)
- **Protocol selected**: Full BA Pipeline (Stages 1–8: Intake -> Elicitation Interview -> Gap Analysis -> Domain Modeling -> Risk/Contradiction Scanner -> Spec Writer -> Spec Validator -> Handover)
- **Override**: None

## One-line problem statement

Người học gặp từ mới khi duyệt web (tin tức, tài liệu, blog) nhưng việc chuyển tab để mở WordStreak web app tạo ra ma sát lớn (friction); cần một tiện ích mở rộng (Manifest V3) cho phép bôi đen tra cứu nhanh và lưu trực tiếp thẻ từ vựng vào Bộ từ WordStreak chỉ với 1 cú click kèm ngữ cảnh câu.
