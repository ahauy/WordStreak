<!--
Sync Impact Report
===================
Version change: N/A (initial) → 1.0.0
Added principles:
  - I. Code Quality First
  - II. Testing Standards (NON-NEGOTIABLE)
  - III. User Experience Consistency
  - IV. Performance Requirements
Added sections:
  - Technology Constraints
  - Development Workflow & Quality Gates
Removed sections: none
Follow-up TODOs: none
-->

# WordStreak Constitution

## Core Principles

### I. Code Quality First

All code across the monorepo MUST adhere to the following non-negotiable standards:

- **Strict TypeScript**: The `strict` compiler flag MUST remain enabled. Usage of `any` is
  forbidden unless explicitly justified in a code comment with rationale and a TODO for removal.
- **Linting & Formatting**: Every workspace package MUST pass `pnpm lint` with zero warnings
  before merge. ESLint and Prettier configurations MUST be consistent across `apps/api`,
  `apps/web`, and `packages/shared-types`.
- **Single Responsibility**: Each module, service, controller, and component MUST have one
  clearly defined responsibility. If a description requires "and", the unit MUST be split.
- **Shared Contracts**: All DTOs, enums, and interfaces shared between `apps/api` and `apps/web`
  MUST reside in `packages/shared-types`. Direct cross-app type imports are forbidden.
- **No Dead Code**: Unreachable code, unused imports, and commented-out blocks MUST be removed
  before merge. Feature-flagged code MUST reference a tracked issue.

**Rationale**: A vocabulary learning app depends on long-term maintainability. Strict typing
catches SM-2 algorithm edge cases at compile time rather than at runtime in user study sessions.

### II. Testing Standards (NON-NEGOTIABLE)

Every code change MUST be accompanied by tests that verify correctness:

- **Unit Tests**: All business logic — including SM-2 interval calculations, review scheduling,
  and streak tracking — MUST have unit tests with ≥ 80% branch coverage.
- **API Integration Tests**: Every NestJS controller endpoint MUST have integration tests that
  validate request/response contracts, authentication guards, and error responses.
- **Frontend Component Tests**: Interactive React components (review cards, streak displays,
  daily goal progress) MUST have component-level tests verifying user-facing behavior.
- **Test Isolation**: Tests MUST NOT depend on external services, network, or shared mutable
  state. Database tests MUST use transactions or test-scoped instances.
- **CI Gate**: The full test suite MUST pass before any PR can be merged. No test skip
  annotations (`xtest`, `xit`, `.skip`) are permitted in the main branch.

**Rationale**: The SM-2 algorithm has precise mathematical invariants (interval calculations,
easiness factor bounds). A single regression can corrupt a user's entire review schedule,
making untested changes unacceptably risky.

### III. User Experience Consistency

The user interface MUST deliver a cohesive, predictable experience across all features:

- **Design System**: All UI components MUST use a shared set of design tokens (colors, spacing,
  typography, border-radius) defined in a single source of truth. Ad-hoc inline styles for
  visual properties covered by tokens are forbidden.
- **Interaction Patterns**: Similar actions MUST behave identically across the app. Card flipping,
  answer submission, navigation gestures, and feedback animations MUST follow documented
  interaction specifications.
- **Loading & Error States**: Every data-fetching view MUST handle loading, empty, error, and
  success states explicitly. Blank screens and unhandled promise rejections are forbidden.
- **Responsive Layout**: All views MUST be functional and visually coherent from 320px
  (mobile) to 1440px (desktop) viewport widths.
- **Accessibility Baseline**: Interactive elements MUST be keyboard-navigable, have sufficient
  color contrast (WCAG AA), and include meaningful ARIA labels where semantic HTML is
  insufficient.

**Rationale**: Vocabulary learning requires daily habit formation. Inconsistent UI breaks user
trust and disrupts the streak-based engagement model that drives retention.

### IV. Performance Requirements

The application MUST meet the following measurable performance targets:

- **API Response Time**: All authenticated API endpoints MUST respond within 200ms at p95 under
  normal load. The SM-2 review calculation endpoint MUST respond within 50ms at p95.
- **Frontend Bundle Size**: The initial JavaScript bundle for `apps/web` MUST NOT exceed 200KB
  gzipped. Code splitting MUST be used for routes and heavy dependencies.
- **Time to Interactive**: The web app MUST reach interactive state within 3 seconds on a
  simulated 4G connection (Lighthouse CI).
- **Database Queries**: No single database query MUST exceed 100ms under normal data volumes.
  N+1 query patterns are forbidden; Prisma queries MUST use `include` or batch strategies.
- **Memory & Leaks**: The frontend MUST NOT accumulate detached DOM nodes or uncleared
  intervals/timeouts across navigation. React components MUST clean up subscriptions in
  unmount/cleanup handlers.

**Rationale**: Users review vocabulary in short, frequent sessions (often on mobile with
variable connectivity). Slow responses directly reduce cards reviewed per session and break
the spaced repetition schedule.

## Technology Constraints

The following technology decisions are binding across the monorepo:

- **Runtime**: Node.js (LTS) with TypeScript (ES2023 target, `strict` mode).
- **Backend**: NestJS framework with Prisma ORM. JWT-based authentication.
- **Frontend**: React 19 with Vite. Styling via Tailwind CSS or vanilla CSS (no CSS-in-JS
  runtime libraries).
- **Shared Package**: `@wordstreak/shared-types` for cross-app contracts. MUST be built before
  dependent apps.
- **Package Manager**: pnpm with workspace protocol. No npm or yarn usage.
- **AI Integration**: OpenAI API for AI-powered features. API keys MUST be managed via
  environment variables and MUST NOT appear in source code or logs.
- **Database**: PostgreSQL. Schema changes MUST go through Prisma migrations with descriptive
  migration names.

## Development Workflow & Quality Gates

All code changes MUST pass through the following quality gates:

- **Pre-commit**: Linting and formatting checks MUST run before commit (enforced via Git hooks
  or CI).
- **Pull Request Requirements**:
  - All CI checks (lint, type-check, test) MUST pass.
  - At least one approval from a code owner is REQUIRED for merge.
  - PR descriptions MUST reference the relevant issue or spec.
- **Branch Strategy**: Feature branches MUST branch from and merge back to `main`. Long-lived
  feature branches (> 5 days) MUST be rebased regularly to avoid drift.
- **Deployment**: Production deployments MUST only originate from the `main` branch after all
  quality gates pass.

## Governance

This constitution is the highest-authority document governing WordStreak development practices.
All other guidelines, patterns, and conventions MUST be consistent with these principles.

- **Amendment Process**: Any change to this constitution MUST be proposed as a PR with clear
  rationale, reviewed by at least one maintainer, and accompanied by a migration plan for
  existing code that conflicts with the new principle.
- **Versioning**: This constitution follows semantic versioning. MAJOR for principle removals
  or redefinitions, MINOR for additions or material expansions, PATCH for clarifications.
- **Compliance Review**: All PRs and code reviews MUST verify compliance with these principles.
  Deviations MUST be explicitly justified and tracked as technical debt with a linked issue.

**Version**: 1.0.0 | **Ratified**: 2026-08-11 | **Last Amended**: 2026-08-11
