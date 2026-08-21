# Domain Decision Baseline: Community Decks Marketplace (US-ECO-02)

**Status**: SIGNED-OFF v1.0  
**Version**: 1.0  
**Feature Slug**: `community-decks`  
**Target Release**: Sprint 6 (EPIC-09: US-ECO-02)  
**Target User Story**: `US-ECO-02: Chia sẻ Bộ từ vựng cộng đồng (Community Decks Marketplace)`

This document consolidates the end-to-end domain analysis and formal specification compiled by the WordStreak Business Analysis Pipeline (Stages 1 through 8).

---

## Stage 0 — Intake

- **Classification**: Full Feature (EPIC-09: US-ECO-02).
- **Classification Signals**: 2 domain entities touched (`Deck` extension + `DeckRating`), 2+ screens/flows affected (Community Marketplace, Deck Preview, Clone flow), 2 roles (Guest, Learner/Author), cross-cutting deep copy cloning and anti-abuse rating algorithms.
- **Protocol**: Full Feature Pipeline (Stages 1–8).
- See [00-intake.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/00-intake.md).

## Stage 1 & 2 — Business Value & Elicitation

- **Problem Statement**: Learners study in isolated environments without an easy way to discover, rate, and study curated specialized vocabulary decks created by peers and teachers.
- **Personas**: Alex (IELTS/TOEIC candidate), Teacher Sarah (Content creator/curator), Minh (Casual explorer).
- **KPIs**: P95 marketplace browse/search response < 80ms; P95 1-Click Clone execution < 400ms; > 40% new learner clone adoption in first 7 days.
- See [01-elicitation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/01-elicitation.md).

## Stage 3 — Gap Analysis

- **AS-IS**: Siloed private decks; no public discovery endpoint; no 1-click clone; no rating or social proof; no category navigation.
- **TO-BE**: Community Marketplace page (`/community`) with search/category/sort filters, 1-Click Clone API with atomic deep copy and SM-2 initialization, 5-Star rating system with author self-rating anti-abuse and cached aggregate scores.
- See [02-gap-analysis.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/02-gap-analysis.md).

## Stage 4 — Domain Model & Rules

- **RBAC**: Guests can browse and preview; authenticated learners can clone and rate; authors cannot self-rate or self-clone.
- **Business Rules**:
  - `BR-COMM-001`: Marketplace Eligibility (`isPublic = true`, `isArchived = false`, `cards.length >= 1`).
  - `BR-COMM-002`: Deep Copy Isolation (cloned deck and cards are 100% independent copies; SM-2 initialized to `NEW`).
  - `BR-COMM-003`: Anti-Abuse Protection (blocking author self-cloning and self-rating).
  - `BR-COMM-004`: Rating Eligibility & Uniqueness (1 rating per user per deck, 1-5 stars, optional comment).
  - `BR-COMM-005`: Atomic Denormalized Rating Scores (`averageRating` and `totalRatings` cached on `Deck`).
  - `BR-COMM-006`: Marketplace Sorting (`POPULAR`, `TOP_RATED`, `NEWEST`).
  - `BR-COMM-007`: Public Projection Privacy (only safe author fields `id, name, username, avatarUrl` exposed).
  - `BR-COMM-008`: Clone Rate-Limiting (max 5 clones/min/user).
- See [03-domain-model.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/03-domain-model.md).

## Stage 5 — Risk Register & MoSCoW

- **Risks**: 4 risks identified and mitigated (spam decks filtered by quality criteria, rating manipulation prevented by anti-abuse rules, clone flooding prevented by rate-limiting, PII protected by DTO projections).
- **MoSCoW**: Must-Have (Public discovery, category chips, 1-click clone, 5-star rating, deck preview modal), Won't-Have (Paid marketplace/monetization, real-time sync across clones, flashcard git fork/merge).
- See [04-risk-contradiction.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/04-risk-contradiction.md).

## Stage 6 & 7 — Specification & Validation

- **Specifications**: [spec/user-stories.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/spec/user-stories.md) (`US-ECO-02` Scenarios 1 through 6).
- **Validation**: 100% ISO/IEC/IEEE 29148 compliance with zero traceability gaps.
- See [05-validation.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/05-validation.md).

## Stage 8 — Handover

- Ready for Technical Plan & Architecture Specification (Speckit Pipeline: `spec.md`, `plan.md`, `data-model.md`, `contracts/`, `tasks.md`).
- See [handover-brief.md](file:///Users/vutuanhau/Documents/PROJECT/WordStreak/.specify/features/community-decks/handover-brief.md).
