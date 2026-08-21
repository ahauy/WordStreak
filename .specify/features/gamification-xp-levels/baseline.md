# Domain Decision Baseline: Gamification XP & Learner Levels System (US-GAME-03)

- **Status**: **SIGNED-OFF v1.0**
- **Version**: `1.0`
- **Feature Slug**: `gamification-xp-levels`
- **Target Backlog Item**: `US-GAME-03`
- **Target Branch**: `feat/gamification-xp-levels`
- **Date**: 2026-08-21
- **Signed-Off Date**: 2026-08-21
- **Lead Business Analyst & Domain Architect**: WordStreak BA Engine

---

## 1. Executive Business Summary & Problem Statement

Learning vocabulary requires consistent daily effort over months. WordStreak currently provides spaced repetition (SM-2) and daily streaks, but lacks granular micro-reinforcement for individual review actions and a long-term progression ladder.

The **Gamification XP & Learner Levels System** introduces an immutable XP transaction ledger and a 5-tier mastery hierarchy (**Bronze -> Silver -> Gold -> Diamond -> Master**) across 50+ levels. It rewards flashcard reviews (+10/+5/0 XP), daily goal completions (+50 XP), streak milestones (+100/+500 XP), and quiz completions (+30 XP), driving a **+25% increase in 14-day retention** and **+38% increase in daily review activity**.

_For complete intake signals and classification, see [00-intake.md](./00-intake.md)._

---

## 2. Gap Analysis Summary

- **AS-IS**: Flashcard reviews update card SRS intervals and streak days, but award 0 XP; no `totalXp`, `level`, or `tier` exists on the user model; no activity transaction ledger table exists.
- **TO-BE**: Every review grants instant XP with floating animations; daily goals award +50 XP bonuses; streak milestones award +100/+500 XP; topbar displays active level crest and progress bar; level-ups trigger celebration modals with confetti; all awards are backed by immutable ledger rows in `user_activity_logs`.
- **Transition Strategy**: Backward-compatible API response extension, Prisma schema migration, and an idempotent historical backfill script crediting past reviews and streaks to existing active users.

_For detailed AS-IS/TO-BE and the 4 gap categories, see [02-gap-analysis.md](./02-gap-analysis.md)._

---

## 3. Approved Domain Architecture & Business Rules

### 3.1 Role-Based Access Control (RBAC)

- **Learners / Pro Subscribers**: Full ownership over personal XP accrual, level progression, and activity history viewing. Server-authoritative calculations only (no direct XP client injection).
- **System Admin**: Platform analytics, economy audit, and administrative adjustment capabilities.
- **Guest**: Unauthenticated users cannot earn or store XP.

### 3.2 Key Business Rules

- **BR-XP-001 / 002 (Card Review XP)**: Good/Easy = +10 XP; Hard = +5 XP; Again = 0 XP (no negative XP).
- **BR-XP-003 / 004 (Daily Goal Bonus)**: Reaching `user.dailyGoal` on local calendar date grants +50 XP (strictly once per local date).
- **BR-XP-005 / 006 (Streak Milestone Bonuses)**: Every 7-day multiple awards +100 XP; every 30-day multiple awards +500 XP.
- **BR-XP-007 / 008 (Level & Tier Formula)**: Threshold curve $\text{floor}(50 \times (L-1)^{1.5} + 50 \times (L-1))$ across 5 Tiers (Bronze, Silver, Gold, Diamond, Master).
- **BR-XP-009 (Monotonic Progression)**: XP and Levels are cumulative lifetime metrics and never degrade or reset.
- **BR-XP-010 / 011 / 012 (Anti-Abuse & Atomicity)**: Rate limit of 500 XP/hr and 2,000 XP/24h; server-verified IANA timezone resolution; atomic DB write with `$transaction`.

_For complete Mermaid state diagrams, ERD, and rules, see [03-domain-model.md](./03-domain-model.md)._

---

## 4. Risk Register & MoSCoW Scope

### 4.1 Risk Mitigations

- **RISK-XP-001 (Script Farming)**: Mitigated by 500 XP/hr velocity rate limiting.
- **RISK-XP-002 (Clock Tampering)**: Mitigated by server-enforced UTC/IANA timezone conversion.
- **RISK-XP-003 (Network Flakiness / Replay)**: Mitigated by 2-second sliding window review deduplication.
- **RISK-XP-004 (Legacy User Disenchantment)**: Mitigated by automated historical backfill from `review_logs`.
- **RISK-XP-005 (Review Latency Overhead)**: Mitigated by single indexed DB transaction (P95 < 50ms).

### 4.2 MoSCoW Scope Summary

- **Must-Have (P0)**: Review XP calculation (+10/+5/0), Daily Goal +50 XP bonus, Streak 7/30 day milestone XP, deterministic Level (1-50+) & Tier engine, `user_activity_logs` table, topbar level badge & progress bar, study floating `+XP` animation, level-up modal with confetti, velocity rate limits.
- **Should-Have (P1)**: Practice quiz completion XP (+30 XP), historical XP backfill script, user profile gamification tab.
- **Could-Have (P2)**: Weekly XP summary email, customizable avatar tier frames.
- **Won't-Have (Out of Scope)**: Real-money rewards/NFTs, paid XP boosts, multiplayer wagering, negative XP demotions.

_For full risk register and consolidated assumptions (`ASM-XP-001` to `010`), see [04-risk-register.md](./04-risk-register.md)._

---

## 5. Specification Document Index & Traceability

- **Product Requirements Document**: [spec/PRD.md](./spec/PRD.md)
- **Software Requirements Specification (SRS)**: [spec/SRS.md](./spec/SRS.md) (`REQ-XP-001` to `REQ-XP-012`)
- **User Stories & Scenarios (Gherkin)**: [spec/user-stories.md](./spec/user-stories.md) (`US-XP-001` to `US-XP-006`)
- **Requirement Traceability Matrix**: [traceability-matrix.md](./traceability-matrix.md)
- **ISO/IEC/IEEE 29148 Audit Report**: [validation-report.md](./validation-report.md) (**Result: 100% PASS**)

---

## 6. Sign-off Gate 1 Status

| Gate Dimension                | Requirement                                                         |               Status                |
| ----------------------------- | ------------------------------------------------------------------- | :---------------------------------: |
| **Problem & Metrics Defined** | Clear business value and success metrics in `01-elicitation.md`     |            ✅ Confirmed             |
| **6 Domain Pillars Modeled**  | RBAC, state machines, rules, workflows, data, UX modeled            |            ✅ Confirmed             |
| **Gaps & Migration Analyzed** | AS-IS, TO-BE, 4 gaps, and backfill plan in `02-gap-analysis.md`     |            ✅ Confirmed             |
| **Contradictions Scanned**    | Zero unresolved contradictions in `04-risk-register.md`             |            ✅ Confirmed             |
| **Traceability Established**  | 100% unbroken chain from Goals to Acceptance Criteria               |            ✅ Confirmed             |
| **IEEE 29148 Audit**          | Verified against all 8 quality dimensions in `validation-report.md` |            ✅ Confirmed             |
| **User Sign-Off Gate**        | Signed-off Gate 1 Approval for Technical Planning Pipeline          | ✅ **SIGNED-OFF v1.0 (2026-08-21)** |
