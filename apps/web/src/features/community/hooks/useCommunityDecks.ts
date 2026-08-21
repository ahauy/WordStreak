import { useState, useEffect, useCallback } from "react";
import { communityService } from "../services/communityService";
import type {
  CommunityDeckItem,
  CommunityDecksQueryDto,
  CommunityDeckSort,
} from "@wordstreak/shared-types";

export function useCommunityDecks(initialQuery?: CommunityDecksQueryDto) {
  const [decks, setDecks] = useState<CommunityDeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState(initialQuery?.search || "");
  const [category, setCategory] = useState(initialQuery?.category || "ALL");
  const [sort, setSort] = useState<CommunityDeckSort>(
    initialQuery?.sort || "POPULAR",
  );
  const [page, setPage] = useState(initialQuery?.page || 1);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await communityService.getCommunityDecks({
        search: search.trim() || undefined,
        category: category !== "ALL" ? category : undefined,
        sort,
        page,
        limit: 12,
      });
      setDecks(response.items);
      setTotalPages(response.meta.totalPages);
      setTotalItems(response.meta.totalItems);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách bộ từ vựng cộng đồng";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    void fetchDecks();
  }, [fetchDecks]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSortChange = (newSort: CommunityDeckSort) => {
    setSort(newSort);
    setPage(1);
  };

  return {
    decks,
    loading,
    error,
    totalPages,
    totalItems,
    search,
    category,
    sort,
    page,
    setPage,
    handleSearchChange,
    handleCategoryChange,
    handleSortChange,
    refetch: fetchDecks,
  };
}
