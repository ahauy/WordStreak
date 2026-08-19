import { apiClient } from "../../../common/api/axios";
import type {
  DeckResponse,
  CreateDeckDto,
  UpdateDeckDto,
  QueryDecksDto,
} from "@wordstreak/shared-types";

export const decksService = {
  async getDecks(query?: QueryDecksDto): Promise<DeckResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append("status", query.status);
    if (query?.search) params.append("search", query.search);
    if (query?.sortBy) params.append("sortBy", query.sortBy);
    if (query?.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString();
    const url = `/decks${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<DeckResponse[]>(url);
    return response.data;
  },

  async getDeck(id: string): Promise<DeckResponse> {
    const response = await apiClient.get<DeckResponse>(`/decks/${id}`);
    return response.data;
  },

  async createDeck(dto: CreateDeckDto): Promise<DeckResponse> {
    const response = await apiClient.post<DeckResponse>("/decks", dto);
    return response.data;
  },

  async updateDeck(id: string, dto: UpdateDeckDto): Promise<DeckResponse> {
    const response = await apiClient.patch<DeckResponse>(`/decks/${id}`, dto);
    return response.data;
  },

  async archiveDeck(id: string): Promise<DeckResponse> {
    const response = await apiClient.patch<DeckResponse>(
      `/decks/${id}/archive`,
    );
    return response.data;
  },

  async restoreDeck(id: string): Promise<DeckResponse> {
    const response = await apiClient.patch<DeckResponse>(
      `/decks/${id}/restore`,
    );
    return response.data;
  },

  async deleteDeck(
    id: string,
  ): Promise<{ message: string; deletedCardsCount: number }> {
    const response = await apiClient.delete<{
      message: string;
      deletedCardsCount: number;
    }>(`/decks/${id}`);
    return response.data;
  },
};
