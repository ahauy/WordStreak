# Intake: Progressive Web App (PWA) & Chế độ học Offline (PWA & Offline Study Mode)

- **Feature Slug**: `pwa-offline-mode`
- **Target User Story**: `US-ECO-04`
- **Date**: 2026-08-24
- **Requested by**: Product Roadmap (Sprint 5 — ECOSYSTEM EPIC: US-ECO-04)
- **Classification**: Full Feature
- **Classification signals**:
  - **New or changed domain entities**: 3+ (`PwaInstallPrompt`, `OfflineCacheSync`, `LocalCardReviewQueue`, `OfflineDeckSnapshot`)
  - **Existing DB schema change / Local Storage / IndexedDB architecture**: Yes (Client IndexedDB Schema for Offline Cache/Queues + Backend sync timestamps/idempotency keys)
  - **Screens/flows touched**: 4+ (Global PWA Install Banner/Prompt, Topbar Offline Indicator Pill, Offline Flashcard Review & Quiz Flow, Background Sync Engine)
  - **User roles affected**: 2 (Authenticated Learner, Guest/Unauthenticated Explorer)
  - **Cross-cutting impact**: Yes (Service Worker lifecycle & Workbox precaching, IndexedDB storage quotas, offline-first SM-2 spaced repetition queue, background reconciliation with `/api/v1/reviews/submit` & `/api/v1/practice/submit`, offline streak protection)
  - **Reversible without user-facing consequence**: No (Client IndexedDB data, cached service workers, and offline sync queues directly impact user review history and streak integrity)
- **Protocol selected**: Full Feature Pipeline (Stages 1–8: Intake → Elicitation Interview → Gap Analysis → Domain Modeling → Risk/Contradiction Scanner → Spec Writer → Spec Validator → Handover)
- **Override**: None

## One-line problem statement

Người học ngoại ngữ thường xuyên di chuyển hoặc gặp tình trạng mất mạng/mạng yếu (trên máy bay, tàu điện ngầm, vùng sóng yếu) khiến trải nghiệm học ngắt quãng và có nguy cơ đứt chuỗi Streak; giải pháp PWA kết hợp Offline-First Architecture (Service Worker + IndexedDB) cho phép cài đặt app trực tiếp lên HomeScreen và tiếp tục ôn tập Flashcard/Quiz mượt mà, sau đó tự động đồng bộ nguyên tử kết quả khi có kết nối trở lại.
