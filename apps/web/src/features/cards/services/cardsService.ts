import { apiClient } from "../../../common/api/axios";
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
} from "@wordstreak/shared-types";

export const cardsService = {
  async getDeckCards(deckId: string): Promise<CardResponse[]> {
    const response = await apiClient.get<CardResponse[]>(
      `/decks/${deckId}/cards`,
    );
    return response.data;
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
};
