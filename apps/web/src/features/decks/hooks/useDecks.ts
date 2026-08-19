import { useState, useEffect, useCallback } from "react";
import { decksService } from "../services/decksService";
import type {
  DeckResponse,
  CreateDeckDto,
  UpdateDeckDto,
  QueryDecksDto,
} from "@wordstreak/shared-types";

export function useDecks(initialStatus: "active" | "archived" = "active") {
  const [decks, setDecks] = useState<DeckResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<"active" | "archived">(
    initialStatus,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "cardCount">(
    "createdAt",
  );

  const fetchDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const query: QueryDecksDto = {
        status: statusTab,
        search: searchQuery.trim() || undefined,
        sortBy,
        sortOrder: sortBy === "title" ? "asc" : "desc",
      };
      const data = await decksService.getDecks(query);
      setDecks(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách bộ từ vựng";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusTab, searchQuery, sortBy]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const createDeck = async (dto: CreateDeckDto): Promise<DeckResponse> => {
    const newDeck = await decksService.createDeck(dto);
    if (statusTab === "active") {
      setDecks((prev) => [newDeck, ...prev]);
    }
    return newDeck;
  };

  const updateDeck = async (
    id: string,
    dto: UpdateDeckDto,
  ): Promise<DeckResponse> => {
    const updated = await decksService.updateDeck(id, dto);
    setDecks((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  };

  const archiveDeck = async (id: string): Promise<DeckResponse> => {
    const archived = await decksService.archiveDeck(id);
    if (statusTab === "active") {
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } else {
      setDecks((prev) => prev.map((d) => (d.id === id ? archived : d)));
    }
    return archived;
  };

  const restoreDeck = async (id: string): Promise<DeckResponse> => {
    const restored = await decksService.restoreDeck(id);
    if (statusTab === "archived") {
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } else {
      setDecks((prev) => prev.map((d) => (d.id === id ? restored : d)));
    }
    return restored;
  };

  const deleteDeck = async (id: string): Promise<void> => {
    await decksService.deleteDeck(id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  return {
    decks,
    isLoading,
    error,
    statusTab,
    setStatusTab,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    fetchDecks,
    createDeck,
    updateDeck,
    archiveDeck,
    restoreDeck,
    deleteDeck,
  };
}
