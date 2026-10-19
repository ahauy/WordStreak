import { apiClient } from "../../../common/api/axios";
import type {
  GetOfficialDecksQuery,
  PaginatedOfficialDecksResponse,
  OfficialDeckDetailResponse,
  EnrollOfficialDeckResponse,
} from "@wordstreak/shared-types";

export const libraryService = {
  async getOfficialDecks(
    query?: GetOfficialDecksQuery,
  ): Promise<PaginatedOfficialDecksResponse> {
    const params = new URLSearchParams();
    if (query?.pathCode && query.pathCode !== "ALL") {
      params.append("pathCode", query.pathCode);
    }
    if (query?.level && query.level !== "ALL") {
      params.append("level", query.level);
    }
    if (query?.topic) {
      params.append("topic", query.topic);
    }
    if (query?.page) {
      params.append("page", String(query.page));
    }
    if (query?.limit) {
      params.append("limit", String(query.limit));
    }

    const queryString = params.toString();
    const url = `/library/decks${queryString ? `?${queryString}` : ""}`;
    const response = await apiClient.get<PaginatedOfficialDecksResponse>(url);
    return response.data;
  },

  async getOfficialDeckBySlug(
    slug: string,
  ): Promise<OfficialDeckDetailResponse> {
    const response = await apiClient.get<OfficialDeckDetailResponse>(
      `/library/decks/${slug}`,
    );
    return response.data;
  },

  async enrollOfficialDeck(
    deckId: string,
  ): Promise<EnrollOfficialDeckResponse> {
    const response = await apiClient.post<EnrollOfficialDeckResponse>(
      `/library/decks/${deckId}/enroll`,
    );
    return response.data;
  },
};
