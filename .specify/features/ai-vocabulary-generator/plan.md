# Implementation Plan: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)
- **Status**: DRAFT (Awaiting Confirmation Gate 2 Approval)
- **Date**: 2026-08-21

---

## 1. Technical Architecture & Slices

### Slice 1: Shared Types & Contracts (`packages/shared-types`)
- Create `packages/shared-types/src/ai-vocabulary.ts`:
  - `GenerateCardRequestDto`
  - `AiGeneratedCardData`
  - `GenerateCardResponseDto`
  - `AiCardSource`
  - `GlobalDictionaryCacheRecord`
- Export from `packages/shared-types/src/index.ts`.
- Build package: `pnpm --filter @wordstreak/shared-types build`.

### Slice 2: Database Schema & Migration (`apps/api`)
- Add `GlobalDictionaryCache` model in `apps/api/prisma/schema.prisma`.
- Generate Prisma Client: `pnpm --filter api prisma generate`.
- Run Migration: `pnpm --filter api prisma migrate dev --name add_global_dictionary_cache`.

### Slice 3: Backend AI Vocabulary Module & Tests (`apps/api`)
- Create `apps/api/src/modules/ai-vocabulary/`:
  - `ai-vocabulary.module.ts`
  - `ai-vocabulary.controller.ts` with `POST /api/v1/ai/generate-card` protected by `JwtAuthGuard`
  - `ai-vocabulary.service.ts`: Core orchestrator (cache check -> quota check -> Gemini -> Free Dictionary fallback -> cache save)
  - `providers/gemini.provider.ts`: Google Gemini Flash API integration using structured JSON prompt with timeout
  - `providers/free-dictionary.provider.ts`: Axios client calling `api.dictionaryapi.dev`
  - `repositories/dictionary-cache.repository.ts`: Prisma operations with upsert and hit counting
  - `services/ai-quota.service.ts`: Daily quota (30/day) and burst rate limiting (5/min)
- Unit tests in `ai-vocabulary.service.spec.ts` covering:
  - Cache hit path (instant return, 0 quota cost, hit count increment).
  - Cache miss -> Gemini success -> cache save.
  - Gemini timeout/failure -> Free Dictionary fallback -> cache save.
  - Word not found (both fail) -> HTTP 404.
  - Daily quota exceeded -> HTTP 429.
  - Burst rate limit exceeded -> HTTP 429.

### Slice 4: Frontend Sparkle Button & Auto-Fill Integration (`apps/web`)
- Create `apps/web/src/features/ai-vocabulary/`:
  - `services/aiVocabularyApi.ts`: API client for `/api/v1/ai/generate-card`.
  - `hooks/useAiVocabulary.ts`: React hook managing loading state, error toasts, and auto-fill dispatcher.
- Update `apps/web/src/features/cards/components/AddCardModal.tsx`:
  - Add `✨ Auto-Fill with AI` Sparkle button next to Word input.
  - Animated pulse spinner during generation.
  - Auto-populate all form fields while maintaining manual focus and editability.
  - Non-destructive error toasts on failure.
- Update `apps/web/src/features/cards/components/EditCardModal.tsx` with identical Sparkle auto-fill enhancement.
- Vitest component tests in `AddCardModal.spec.tsx` and `useAiVocabulary.spec.ts`.

### Slice 5: Quality Review, Documentation & Verification
- UI Visual & Anti-AI-Slop Review via `ui-design-review` against `apps/web/DESIGN.md`.
- Technical documentation in `docs/features/ai-vocabulary-generator/README.md`.
- User guide with Playwright screenshots in `docs/user-guides/ai-vocabulary-generator.md`.
- Full monorepo verification test run (`pnpm test`).
- Update `docs/PRODUCT_BACKLOG_ROADMAP.md` marking `US-AI-01` and `US-AI-02` as `[x]`.
