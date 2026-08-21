# Data Model: AI-Assisted Vocabulary Generator & Global Dictionary Cache

- **Feature Slug**: `ai-vocabulary-generator`
- **Epics**: `EPIC-07` (US-AI-01 & US-AI-02)

---

## 1. Prisma Schema Changes

Add the `GlobalDictionaryCache` entity to `apps/api/prisma/schema.prisma`:

```prisma
model GlobalDictionaryCache {
  id                 String   @id @default(uuid())
  word               String   @unique
  partOfSpeech       String?
  phonetic           String?
  meaningVi          String
  meaningEn          String?
  exampleSentence    String?
  exampleTranslation String?
  collocations       String?  // Stored as JSON stringified array or delimited
  mnemonic           String?
  audioUrl           String?
  source             String   @default("GEMINI_FLASH") // GEMINI_FLASH | FREE_DICTIONARY | MANUAL_CURATED
  hitCount           Int      @default(1)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([word])
  @@map("global_dictionary_cache")
}
```

---

## 2. Entity Attribute Definitions

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key UUID |
| `word` | `String` | `@unique`, indexed | Normalized lowercased, trimmed word/phrase |
| `partOfSpeech` | `String?` | Optional | Part of speech (`noun`, `verb`, `adj`, etc.) |
| `phonetic` | `String?` | Optional | International Phonetic Alphabet (IPA) |
| `meaningVi` | `String` | Required | Vietnamese translation/definition |
| `meaningEn` | `String?` | Optional | Nuanced English definition |
| `exampleSentence` | `String?` | Optional | Natural context sentence in English |
| `exampleTranslation`| `String?` | Optional | Vietnamese translation of example sentence |
| `collocations` | `String?` | Optional | JSON stringified list of collocations (`string[]`) |
| `mnemonic` | `String?` | Optional | Vietnamese memory hook / etymology |
| `audioUrl` | `String?` | Optional | Audio pronunciation URL |
| `source` | `String` | `@default("GEMINI_FLASH")` | Provider identifier |
| `hitCount` | `Int` | `@default(1)` | Number of times this word was retrieved |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last updated timestamp |

---

## 3. Daily User Quota Tracking

Quota tracking is stored in-memory (or in a lightweight Redis / DB log) keyed by `ai_quota:${userId}:${YYYY-MM-DD}`:
- **Max limit**: 30 new uncached requests / UTC day
- **Burst limit**: 5 requests / minute
- **Cache hits**: 0 decrement to quota

---

## 4. Migration & Rollback Strategy

- **Forward Migration**:
  `pnpm --filter api prisma migrate dev --name add_global_dictionary_cache`
- **Rollback Strategy**:
  Drop table `global_dictionary_cache` if rolled back. Existing `Card`, `Deck`, and `User` tables remain 100% unaffected.
