/**
 * Contract: Export Deck Data
 * Endpoint: GET /api/v1/decks/:deckId/export
 * Access: Authenticated Deck Owner or Public Deck Reader
 */

import { z } from "zod";

export const ExportFormatQuerySchema = z.enum(["CSV", "APKG"]).default("CSV");
export const ExportMasteryFilterSchema = z
  .enum(["ALL", "MASTERED", "LEARNING", "NEW"])
  .default("ALL");

export const DeckExportQuerySchema = z.object({
  format: ExportFormatQuerySchema.optional(),
  status: ExportMasteryFilterSchema.optional(),
});

export const DeckExportCardItemSchema = z.object({
  id: z.string().uuid(),
  word: z.string(),
  meaning: z.string(),
  phonetic: z.string().nullable(),
  exampleSentence: z.string().nullable(),
  collocations: z.string().nullable(),
  mnemonic: z.string().nullable(),
  imageUrl: z.string().nullable(),
  audioUrl: z.string().nullable(),
  status: z.string(), // 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED'
});

export const DeckExportDataResponseSchema = z.object({
  deck: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    tags: z.array(z.string()).nullable(),
    isPublic: z.boolean(),
    totalCards: z.number(),
  }),
  cards: z.array(DeckExportCardItemSchema),
});

export type DeckExportQuery = z.infer<typeof DeckExportQuerySchema>;
export type DeckExportDataResponse = z.infer<
  typeof DeckExportDataResponseSchema
>;
