# Tasks Breakdown: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)
- **Status**: DRAFT (Awaiting Confirmation Gate 2 Approval)

---

## Phase 1: Shared Types & DTO Contracts (Slice 1)
- [ ] `T1.1`: Create `packages/shared-types/src/ai-vocabulary.ts` with `GenerateCardRequestDto`, `AiGeneratedCardData`, `GenerateCardResponseDto`, `AiCardSource`, and `GlobalDictionaryCacheRecord`.
- [ ] `T1.2`: Export AI vocabulary types from `packages/shared-types/src/index.ts` and verify build with `pnpm --filter @wordstreak/shared-types build`.

## Phase 2: Database Schema & Migration (Slice 2)
- [ ] `T2.1`: Add `GlobalDictionaryCache` model to `apps/api/prisma/schema.prisma` with `@unique` indexed `word`.
- [ ] `T2.2`: Generate Prisma client (`pnpm --filter api prisma generate`).
- [ ] `T2.3`: Apply migration `add_global_dictionary_cache` (`pnpm --filter api prisma migrate dev --name add_global_dictionary_cache`).

## Phase 3: Backend AI Vocabulary Module & TDD (Slice 3)
- [ ] `T3.1`: Implement `AiQuotaService` for 30 calls/day daily quota and 5 req/min burst limiter.
- [ ] `T3.2`: Implement `DictionaryCacheRepository` for Prisma CRUD, atomic upsert, and hit counter increments.
- [ ] `T3.3`: Implement `GeminiProvider` using Google Gemini Flash SDK / REST API with structured JSON output and 5s timeout.
- [ ] `T3.4`: Implement `FreeDictionaryProvider` calling `api.dictionaryapi.dev` for zero-cost fallback.
- [ ] `T3.5`: Implement `AiVocabularyService` orchestrating cache check $\rightarrow$ quota check $\rightarrow$ Gemini $\rightarrow$ fallback $\rightarrow$ cache persistence.
- [ ] `T3.6`: Implement `AiVocabularyController` exposing `POST /api/v1/ai/generate-card` protected by `JwtAuthGuard`.
- [ ] `T3.7`: Wire `AiVocabularyModule` into `apps/api/src/app.module.ts`.
- [ ] `T3.8`: Write comprehensive Jest unit tests in `apps/api/src/modules/ai-vocabulary/ai-vocabulary.service.spec.ts` and `ai-vocabulary.controller.spec.ts` (100% pass on hit, miss, fallback, 404, 429).

## Phase 4: Frontend UI & Auto-Fill Integration (Slice 4)
- [ ] `T4.1`: Create `apps/web/src/features/ai-vocabulary/services/aiVocabularyApi.ts` and React hook `useAiVocabulary.ts`.
- [ ] `T4.2`: Update `AddCardModal.tsx` with `✨ Auto-Fill with AI` sparkle button, loading pulse state, and auto-population logic adhering to `DESIGN.md`.
- [ ] `T4.3`: Update `EditCardModal.tsx` with Sparkle auto-fill button.
- [ ] `T4.4`: Write Vitest component tests in `AddCardModal.spec.tsx` and hook tests.

## Phase 5: Adversarial Review, Documentation & Verification (Slice 5)
- [ ] `T5.1`: UI & Anti-AI-Slop review via `ui-design-review` against `DESIGN.md` and `MEMORY.md`.
- [ ] `T5.2`: Technical documentation in `docs/features/ai-vocabulary-generator/README.md` and index update in `docs/features/README.md`.
- [ ] `T5.3`: User Guide creation with screenshots in `docs/user-guides/ai-vocabulary-generator.md`.
- [ ] `T5.4`: Monorepo verification test run (`pnpm test`) and roadmap update in `docs/PRODUCT_BACKLOG_ROADMAP.md`.
