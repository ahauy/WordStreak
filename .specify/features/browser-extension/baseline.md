# Domain Decision Baseline: Tiện ích mở rộng trình duyệt (Chrome Extension Manifest V3)

**Status**: DRAFT_READY_FOR_CONFIRMATION
**Version**: 1.0
**Feature Slug**: `browser-extension`
**Target User Story**: `US-ECO-03`
**Date**: 2026-08-23

---

## 1. Executive Summary

WordStreak Chrome Extension (chuẩn Manifest V3) là giải pháp mở rộng hệ sinh thái học tập giúp người dùng thu thập và ghi nhớ từ vựng mới tức thì khi đang đọc báo, nghiên cứu tài liệu trên các trình duyệt Chromium (Chrome, Brave, Edge, Arc...). Tính năng loại bỏ hoàn toàn ma sát chuyển tab thông qua cơ chế 1-Click Fast Save, tự động trích xuất câu ngữ cảnh thực tế trên web, tự động điền phiên âm/nghĩa bằng AI, và đồng bộ nguyên tử vào thuật toán Spaced Repetition (SM-2).

---

## 2. Pipeline Stage Deliverables Index

- **Stage 0 — Intake**: Phân loại Full Feature, lưu tại [00-intake.md](./00-intake.md)
- **Stage 1 & 2 — Elicitation**: Kết quả phỏng vấn 6 trụ cột & giả định, lưu tại [01-elicitation.md](./01-elicitation.md)
- **Stage 3 — Gap Analysis**: Phân tích hiện trạng AS-IS / TO-BE và khoảng cách chuyển đổi, lưu tại [02-gap-analysis.md](./02-gap-analysis.md)
- **Stage 4 — Domain Modeling**: RBAC, State Machines, Quy tắc nghiệp vụ (`BR-EXT-001` - `007`), lưu tại [03-domain-model.md](./03-domain-model.md)
- **Stage 5 — Risk & Contradiction Scanner**: Ma trận rủi ro & MoSCoW, lưu tại [04-risk-register.md](./04-risk-register.md)
- **Stage 6 — Specification**:
  - SRS Technical Specs: [spec/SRS.md](./spec/SRS.md) (`REQ-EXT-001` đến `REQ-EXT-007`)
  - User Stories: [spec/user-stories.md](./spec/user-stories.md) (`US-EXT-001` đến `US-EXT-004`)
- **Stage 7 — Spec Validation**: Báo cáo kiểm định chất lượng IEEE 29148 (100% Pass), lưu tại [05-spec-validation.md](./05-spec-validation.md)

---

## 3. Handover Brief cho Phase 2 (Technical Architecture & Planning)

- **Workspace Target**: Tạo ứng dụng mới tại `apps/extension` trong pnpm monorepo (Vite + CRXJS/WebExtension plugin + React + Tailwind + TypeScript).
- **Backend API Additions**:
  - Thêm endpoint `POST /api/v1/cards/quick-capture` trong `apps/api/src/modules/cards/` (hỗ trợ auto-enrich IPA/nghĩa và duplicate check).
  - Khai báo DTOs tại `packages/shared-types`.
- **Content Script Architecture**:
  - Tiêm Shadow DOM cho Floating Flame Icon & In-page Toast để cô lập style 100%.
- **Security & Storage**:
  - JWT lưu trong `chrome.storage.local`.
  - Service Worker background quản lý message passing và API calls.
- **Design System Mandate**:
  - Nút Obsidian Pill `#000000`, viền `1px solid #e5e5e5`, Mascot ngọn lửa tím, typography Nunito/Inter.
