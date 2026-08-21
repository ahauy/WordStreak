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

  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    communityService
      .getCommunityDecks({
        search: search.trim() || undefined,
        category: category !== "ALL" ? category : undefined,
        sort,
        page,
        limit: 12,
      })
      .then((response) => {
        if (!ignore) {
          setDecks(response.items);
          setTotalPages(response.meta.totalPages);
          setTotalItems(response.meta.totalItems);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message =
            err instanceof Error
              ? err.message
              : "Không thể tải danh sách bộ từ vựng cộng đồng";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, category, sort, page, refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1);
  }, []);

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
    refetch,
  };
}
