/**
 * Contract: Bulk Import Cards
 * Endpoint: POST /api/v1/decks/:deckId/cards/bulk
 * Access: Authenticated Deck Owner
 */

import { z } from "zod";

export const ConflictStrategySchema = z.enum([
  "SKIP",
  "OVERWRITE",
  "KEEP_BOTH",
]);
export const RowConflictActionSchema = z.enum([
  "DEFAULT",
  "SKIP",
  "OVERWRITE",
  "KEEP_BOTH",
]);

export const CardBatchItemSchema = z.object({
  word: z.string().min(1).max(200).trim(),
  meaning: z.string().min(1).max(2000).trim(),
  phonetic: z.string().max(100).trim().nullable().optional(),
  exampleSentence: z.string().max(2000).trim().nullable().optional(),
  collocations: z.string().max(1000).trim().nullable().optional(),
  mnemonic: z.string().max(1000).trim().nullable().optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
  audioUrl: z.string().url().max(500).nullable().optional(),
  rowConflictAction: RowConflictActionSchema.optional(),
});

export const BulkImportCardsRequestSchema = z.object({
  cards: z.array(CardBatchItemSchema).min(1).max(2000),
  conflictStrategy: ConflictStrategySchema.default("SKIP"),
  createAsNewDeck: z.boolean().optional(),
  newDeckTitle: z.string().min(1).max(100).optional(),
});

export const BulkImportErrorItemSchema = z.object({
  index: z.number(),
  word: z.string(),
  reason: z.string(),
});

export const BulkImportCardsResponseSchema = z.object({
  success: z.boolean(),
  deckId: z.string().uuid(),
  totalSubmitted: z.number(),
  imported: z.number(),
  skipped: z.number(),
  overwritten: z.number(),
  errors: z.array(BulkImportErrorItemSchema).optional(),
  message: z.string(),
});

export type CardBatchItem = z.infer<typeof CardBatchItemSchema>;
export type BulkImportCardsRequest = z.infer<
  typeof BulkImportCardsRequestSchema
>;
export type BulkImportCardsResponse = z.infer<
  typeof BulkImportCardsResponseSchema
>;
