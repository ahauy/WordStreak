import { useState, useEffect, useCallback } from "react";
import { cardsService } from "../services/cardsService";
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
  PaginationMeta,
  CardStatusFilter,
  BulkCardActionDto,
  BulkCardActionResult,
} from "@wordstreak/shared-types";

export function useCards(deckId: string) {
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination States
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<CardStatusFilter>("ALL");

  // Multi-select State for Bulk Actions
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // Debounce search query changes (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search query
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((status: CardStatusFilter) => {
    setStatusFilter(status);
    setPage(1); // Reset to page 1 on filter change
    setSelectedCardIds([]);
  }, []);

  const fetchCards = useCallback(async () => {
    if (!deckId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await cardsService.getDeckCards(deckId, {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter,
      });

      setCards(res.data);
      setPaginationMeta(res.meta);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách thẻ từ vựng";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    let ignore = false;
    if (deckId) {
      cardsService
        .getDeckCards(deckId, {
          page,
          limit,
          search: debouncedSearch.trim() || undefined,
          status: statusFilter,
        })
        .then((res) => {
          if (!ignore) {
            setCards(res.data);
            setPaginationMeta(res.meta);
            setError(null);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            const message =
              err instanceof Error
                ? err.message
                : "Không thể tải danh sách thẻ từ vựng";
            setError(message);
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [deckId, page, limit, debouncedSearch, statusFilter]);

  const createCard = async (dto: CreateCardDto): Promise<CardResponse> => {
    const newCard = await cardsService.createCard(deckId, dto);
    await fetchCards();
    return newCard;
  };

  const updateCard = async (
    id: string,
    dto: UpdateCardDto,
  ): Promise<CardResponse> => {
    const updated = await cardsService.updateCard(id, dto);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  };

  const deleteCard = async (id: string): Promise<void> => {
    await cardsService.deleteCard(id);
    setSelectedCardIds((prev) => prev.filter((item) => item !== id));
    await fetchCards();
  };

  // Selection helpers
  const toggleSelectCard = useCallback((cardId: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId],
    );
  }, []);

  const selectAllCards = useCallback(() => {
    if (selectedCardIds.length === cards.length && cards.length > 0) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(cards.map((c) => c.id));
    }
  }, [cards, selectedCardIds]);

  const clearSelection = useCallback(() => {
    setSelectedCardIds([]);
  }, []);

  const executeBulkAction = async (
    dto: BulkCardActionDto,
  ): Promise<BulkCardActionResult> => {
    try {
      setIsBulkLoading(true);
      const result = await cardsService.bulkAction(deckId, dto);
      clearSelection();
      await fetchCards();
      return result;
    } finally {
      setIsBulkLoading(false);
    }
  };

  return {
    cards,
    filteredCards: cards,
    paginationMeta,
    isLoading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    selectedCardIds,
    toggleSelectCard,
    selectAllCards,
    clearSelection,
    isAllSelected: cards.length > 0 && selectedCardIds.length === cards.length,
    isBulkLoading,
    executeBulkAction,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
  };
}
