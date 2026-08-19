import { useState, useEffect, useCallback } from "react";
import { cardsService } from "../services/cardsService";
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
} from "@wordstreak/shared-types";

export function useCards(deckId: string) {
  const [cards, setCards] = useState<CardResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchCards = useCallback(async () => {
    if (!deckId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await cardsService.getDeckCards(deckId);
      setCards(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách thẻ từ vựng";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const createCard = async (dto: CreateCardDto): Promise<CardResponse> => {
    const newCard = await cardsService.createCard(deckId, dto);
    setCards((prev) => [newCard, ...prev]);
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
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const filteredCards = cards.filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.word.toLowerCase().includes(q) ||
      card.meaning.toLowerCase().includes(q) ||
      (card.phonetic && card.phonetic.toLowerCase().includes(q)) ||
      (card.exampleSentence && card.exampleSentence.toLowerCase().includes(q))
    );
  });

  return {
    cards,
    filteredCards,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
  };
}
