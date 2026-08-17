# Technical Documentation: Build Playbook

Execution guide for creating or updating technical documentation surfaces.

---

## 1. Step-by-Step Flow

```
Step 1: Inventory & Scope
  - Identify target audience (Devs, External Contributors, AI Agents).
  - Select Diataxis quadrant (Tutorial, How-To, Reference, Explanation).
  ↓
Step 2: Scaffolding (Funnel Structure)
  - Title & Frontmatter / Metadata
  - Summary / What & Why (1–2 sentences orienting the reader)
  - Quickstart / Primary Workflow
  - Detailed Specifications / Deep Dive
  - Cross-References & Related Docs
  ↓
Step 3: Draft Technical Content
  - Add self-contained code examples with clear imports.
  - Insert Mermaid diagrams for data flows, entity relationships, or state lifecycles.
  - Use exact file links and concrete CLI commands.
  ↓
Step 4: Self-Verification
  - Test all code snippets against active codebase.
  - Verify relative links and image paths.
  - Check alignment with existing architecture in `docs/architecture/`.
```

---

## 2. Feature Documentation Template (`docs/features/<feature-slug>/README.md`)

When documenting a completed WordStreak feature (Phase 6):

```markdown
# Feature: <Feature Title>

**Feature Slug**: `<feature-slug>`  
**Status**: `Implemented & Verified`  
**Last Updated**: YYYY-MM-DD

## 1. Overview & Business Value

- Brief description of the problem solved.
- Key user value and learning outcomes.

## 2. Architecture & Data Flow

- Mermaid sequence or flowchart illustrating frontend-to-backend interactions.
- Database models affected (Prisma entities).

## 3. Key Components & Endpoints

- **Frontend Components**: `apps/web/src/features/...`
- **Backend Endpoints**: `apps/api/src/...` with DTOs and HTTP status codes.

## 4. Testing & Verification

- Test Plan: Link to `.specify/features/<feature-slug>/test-plan.md`
- Test Suites: Vitest component tests, NestJS unit tests, E2E specs.

## 5. Rollback & Troubleshooting

- Database migration notes.
- Known constraints and edge-case handling.
```
