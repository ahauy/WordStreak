# Domain Decision Baseline: User Profile & Daily Goal Settings (US-AUTH-04)

**Status**: SIGNED-OFF  
**Version**: 1.0  
**Feature Slug**: `user-profile-settings`  
**Backlog Reference**: `US-AUTH-04`  
**Signed off by**: Product Owner & BA Pipeline on 2026-08-17

---

## 1. Executive Summary

This baseline defines the business rules, data model adjustments, security behaviors, and user experience for **US-AUTH-04 (User Profile & Daily Goal Settings)**. Authenticated learners can view and modify their daily learning goals (5, 10, 20, 30, 50 cards), choose avatars from curated Cosmos presets or custom URLs, and change passwords with automated multi-device session invalidation.

---

## 2. Core Decisions & Rules

1. **Pace Customization (`BR-PROFILE-001`)**: `dailyGoal` is an integer between 1 and 100 (defaults to 10; presets 5, 10, 20, 30, 50).
2. **Avatar Customization (`BR-PROFILE-002`)**: `avatarUrl` is stored in the database (`String?`) and supports curated presets (`preset:cosmos-1`...) or HTTPS image URLs.
3. **Password Security (`BR-PROFILE-003`)**: Requires verifying `currentPassword` with Argon2, enforcing strong new password rules (>= 8 chars, 1 letter, 1 number).
4. **Session Invalidation (`BR-PROFILE-004`)**: Upon password change, all other active sessions in the database are revoked (`revokedAt = now()`), leaving only the current session active.
5. **Sanitization (`BR-PROFILE-005`)**: Profile queries strictly exclude `passwordHash`.
6. **UI Presentation**: Tabbed Settings Modal accessible directly from the Top Navbar avatar.

---

## 3. Artifact Index

- **Intake**: `00-intake.md`
- **Elicitation**: `01-elicitation.md`
- **Domain Model**: `03-domain-model.md`
- **Risk Register**: `04-risk-register.md`
- **User Stories**: `spec/user-stories.md`
- **Validation Report**: `spec/validation-report.md`
- **Handover Brief**: `handover-brief.md`
