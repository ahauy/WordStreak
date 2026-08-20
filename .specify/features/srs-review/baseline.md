# Domain Decision Baseline: Spaced Repetition System (SRS Review)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Signed off by**: User (2026-08-20)  
**Last Updated**: 2026-08-20

This document consolidates domain decisions for the **Spaced Repetition System & Flashcard Review Flow (SRS Review)** feature across all BA pipeline stages.

---

## 1. Business Problem & Personas

- **Problem**: Need for a scientifically scheduled review system implementing SuperMemo-2 (SM-2) to maximize retention with minimal daily review burden.
- **Personas**: Alex (Exam Prep / Deck reviews), Minh (Busy Pro / Daily global quick reviews), Linh (Casual / Multi-context reviews).
- **Success Metrics**: +30% 7-day retention rate; P95 review queue latency < 50ms.
- **Details**: See [01-elicitation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/01-elicitation.md).

---

## 2. Gap Analysis (AS-IS vs TO-BE)

- **AS-IS**: Database schema has `UserCardProgress` table with `status: NEW`, but no review module, no SM-2 engine, no `/api/v1/reviews/*` endpoints, and no review UI.
- **TO-BE**: Complete end-to-end SM-2 review system with `/review` & `/decks/:id/review` routes, 3D flip card UI, keyboard shortcuts, instant persistence, and session completion summary.
- **Details**: See [02-gap-analysis.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/02-gap-analysis.md).

---

## 3. Domain Model Summary

- **RBAC**: Authenticated learners can only access and update their own card progress.
- **State Machine**: `NEW` -> `LEARNING` -> `MASTERED` (Interval $\ge 21$d and Reps $\ge 4$).
- **Key Rules**:
  - `BR-SRS-001`: $EF' = \max(1.3, EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)))$.
  - `BR-SRS-002`: Again/Hard resets $n=0, I=1d$; Good/Easy increments $n$, exponential $I$.
  - `BR-SRS-003`: Queue prioritizes Overdue -> Due Today -> New cards (up to `dailyGoal`).
  - `BR-SRS-004`: Idempotency guard on rapid submissions (< 2s).
- **Details**: See [03-domain-model.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/03-domain-model.md).

---

## 4. Scope & Risk Summary (MoSCoW)

- **Must-Have (P0)**: SM-2 SrsService, Due queue API, Submit review API, 3D Flashcard UI, Session summary.
- **Should-Have (P1)**: Stats counter widget endpoint, Web Speech fallback.
- **Won't-Have (v1)**: Typing test in SRS, FSRS, Offline PWA.
- **Details**: See [04-risk-register.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/04-risk-register.md).

---

## 5. Specifications & User Stories

- **SRS Document**: [spec/SRS.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/spec/SRS.md) (`REQ-SRS-001` .. `REQ-SRS-005`)
- **User Stories**: [spec/user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/srs-review/spec/user-stories.md) (`US-SRS-01` .. `US-SRS-03`)
