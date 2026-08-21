import { apiClient } from "../../../common/api/axios";
import type {
  PaginatedCommunityDecksResponse,
  CommunityDeckDetailResponse,
  CommunityDecksQueryDto,
  CloneDeckResponse,
  RateDeckDto,
  RateDeckResponse,
} from "@wordstreak/shared-types";

export const communityService = {
  async getCommunityDecks(
    query?: CommunityDecksQueryDto,
  ): Promise<PaginatedCommunityDecksResponse> {
    const params = new URLSearchParams();
    if (query?.search) params.append("search", query.search);
    if (query?.category && query.category !== "ALL") {
      params.append("category", query.category);
    }
    if (query?.tag) params.append("tag", query.tag);
    if (query?.sort) params.append("sort", query.sort);
    if (query?.page) params.append("page", String(query.page));
    if (query?.limit) params.append("limit", String(query.limit));

    const queryString = params.toString();
    const url = `/community/decks${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<PaginatedCommunityDecksResponse>(url);
    return response.data;
  },

  async getCommunityDeckDetail(
    deckId: string,
  ): Promise<CommunityDeckDetailResponse> {
    const response = await apiClient.get<CommunityDeckDetailResponse>(
      `/community/decks/${deckId}`,
    );
    return response.data;
  },

  async cloneDeck(deckId: string): Promise<CloneDeckResponse> {
    const response = await apiClient.post<CloneDeckResponse>(
      `/community/decks/${deckId}/clone`,
    );
    return response.data;
  },

  async rateDeck(deckId: string, dto: RateDeckDto): Promise<RateDeckResponse> {
    const response = await apiClient.post<RateDeckResponse>(
      `/community/decks/${deckId}/rate`,
      dto,
    );
    return response.data;
  },
};
