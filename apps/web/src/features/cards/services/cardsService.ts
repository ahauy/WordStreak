import { apiClient } from "../../../common/api/axios";
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
  QueryCardsDto,
  PaginatedCardsResponse,
  BulkCardActionDto,
  BulkCardActionResult,
  BulkImportCardsDto,
  ImportBatchResult,
} from "@wordstreak/shared-types";

export const cardsService = {
  async getDeckCards(
    deckId: string,
    query?: QueryCardsDto,
  ): Promise<PaginatedCardsResponse> {
    const response = await apiClient.get<PaginatedCardsResponse>(
      `/decks/${deckId}/cards`,
      { params: query },
    );
    return response.data;
  },

  async getAllDeckCards(deckId: string): Promise<CardResponse[]> {
    const allCards: CardResponse[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) {
      const res = await this.getDeckCards(deckId, { page, limit: 100 });
      allCards.push(...res.data);
      hasMore = res.meta.hasNextPage;
      page += 1;
    }

    return allCards;
  },

  async getCard(id: string): Promise<CardResponse> {
    const response = await apiClient.get<CardResponse>(`/cards/${id}`);
    return response.data;
  },

  async createCard(deckId: string, dto: CreateCardDto): Promise<CardResponse> {
    const response = await apiClient.post<CardResponse>(
      `/decks/${deckId}/cards`,
      dto,
    );
    return response.data;
  },

  async updateCard(id: string, dto: UpdateCardDto): Promise<CardResponse> {
    const response = await apiClient.patch<CardResponse>(`/cards/${id}`, dto);
    return response.data;
  },

  async deleteCard(
    id: string,
  ): Promise<{ message: string; deletedCardId: string }> {
    const response = await apiClient.delete<{
      message: string;
      deletedCardId: string;
    }>(`/cards/${id}`);
    return response.data;
  },

  async bulkAction(
    deckId: string,
    dto: BulkCardActionDto,
  ): Promise<BulkCardActionResult> {
    const response = await apiClient.post<BulkCardActionResult>(
      `/decks/${deckId}/cards/bulk-action`,
      dto,
    );
    return response.data;
  },

  async bulkImport(
    deckId: string,
    dto: BulkImportCardsDto,
  ): Promise<ImportBatchResult> {
    try {
      const response = await apiClient.post<ImportBatchResult>(
        `/decks/${deckId}/cards/bulk`,
        dto,
      );
      return response.data;
    } catch {
      // Client-side fallback if backend bulk endpoint is not yet deployed
      const result: ImportBatchResult = {
        totalSubmitted: dto.cards.length,
        imported: 0,
        overwritten: 0,
        skipped: 0,
        errors: [],
      };

      const existingCards = await this.getAllDeckCards(deckId);
      const existingMap = new Map<string, CardResponse>();
      for (const card of existingCards) {
        existingMap.set(card.word.trim().toLowerCase(), card);
      }

      for (const item of dto.cards) {
        const key = item.word.trim().toLowerCase();
        const existing = existingMap.get(key);
        const action = item.conflictAction || dto.defaultStrategy || "SKIP";

        if (existing) {
          if (action === "SKIP") {
            result.skipped += 1;
            continue;
          }
          if (action === "OVERWRITE") {
            try {
              await this.updateCard(existing.id, {
                meaning: item.meaning,
                phonetic: item.phonetic,
                exampleSentence: item.exampleSentence,
                collocations: item.collocations,
                mnemonic: item.mnemonic,
                imageUrl: item.imageUrl,
                audioUrl: item.audioUrl,
              });
              result.overwritten += 1;
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              result.errors?.push(`Lỗi cập nhật từ "${item.word}": ${msg}`);
            }
            continue;
          }
        }

        try {
          await this.createCard(deckId, {
            word: item.word,
            meaning: item.meaning,
            phonetic: item.phonetic,
            exampleSentence: item.exampleSentence,
            collocations: item.collocations,
            mnemonic: item.mnemonic,
            imageUrl: item.imageUrl,
            audioUrl: item.audioUrl,
          });
          result.imported += 1;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors?.push(`Lỗi tạo từ "${item.word}": ${msg}`);
        }
      }

      return result;
    }
  },
};
