import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { WordMatchingPage } from "./WordMatchingPage";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";

const mockQuizData = {
  deckId: "deck_abc",
  deckTitle: "IELTS Core Vocabulary",
  totalCards: 10,
  totalRounds: 2,
  rounds: [
    {
      roundIndex: 0,
      totalRounds: 2,
      wordTiles: [
        { id: "w_1", cardId: "c_1", text: "ubiquitous", type: "WORD" as const },
        { id: "w_2", cardId: "c_2", text: "ephemeral", type: "WORD" as const },
        {
          id: "w_3",
          cardId: "c_3",
          text: "serendipity",
          type: "WORD" as const,
        },
        { id: "w_4", cardId: "c_4", text: "resilient", type: "WORD" as const },
        { id: "w_5", cardId: "c_5", text: "tenacious", type: "WORD" as const },
      ],
      meaningTiles: [
        {
          id: "m_1",
          cardId: "c_1",
          text: "phổ biến khắp nơi",
          type: "MEANING" as const,
        },
        {
          id: "m_2",
          cardId: "c_2",
          text: "phù du, ngắn ngủi",
          type: "MEANING" as const,
        },
        {
          id: "m_3",
          cardId: "c_3",
          text: "may mắn bất ngờ",
          type: "MEANING" as const,
        },
        {
          id: "m_4",
          cardId: "c_4",
          text: "kiên cường phục hồi",
          type: "MEANING" as const,
        },
        {
          id: "m_5",
          cardId: "c_5",
          text: "kiên trì bền bỉ",
          type: "MEANING" as const,
        },
      ],
    },
    {
      roundIndex: 1,
      totalRounds: 2,
      wordTiles: [
        { id: "w_6", cardId: "c_6", text: "pragmatic", type: "WORD" as const },
        { id: "w_7", cardId: "c_7", text: "meticulous", type: "WORD" as const },
        { id: "w_8", cardId: "c_8", text: "eloquent", type: "WORD" as const },
        { id: "w_9", cardId: "c_9", text: "lucid", type: "WORD" as const },
        { id: "w_10", cardId: "c_10", text: "candid", type: "WORD" as const },
      ],
      meaningTiles: [
        { id: "m_6", cardId: "c_6", text: "thực tế", type: "MEANING" as const },
        {
          id: "m_7",
          cardId: "c_7",
          text: "tỉ mỉ, cẩn thận",
          type: "MEANING" as const,
        },
        {
          id: "m_8",
          cardId: "c_8",
          text: "hùng hồn",
          type: "MEANING" as const,
        },
        { id: "m_9", cardId: "c_9", text: "rõ ràng", type: "MEANING" as const },
        {
          id: "m_10",
          cardId: "c_10",
          text: "thẳng thắn",
          type: "MEANING" as const,
        },
      ],
    },
  ],
};

describe("WordMatchingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(decksService, "getDeck").mockResolvedValue({
      id: "deck_abc",
      title: "IELTS Core Vocabulary",
      description: "Core words",
      stats: { totalCards: 10, newCards: 0, dueCards: 0, learnedCards: 10 },
      isOwner: true,
      cardCount: 10,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });

    vi.spyOn(practiceService, "getMatchingQuiz").mockResolvedValue(
      mockQuizData,
    );
  });

  it("loads quiz data and renders the matching board", async () => {
    render(
      <MemoryRouter
        initialEntries={["/decks/deck_abc/practice/matching?limit=10"]}
      >
        <Routes>
          <Route
            path="/decks/:id/practice/matching"
            element={<WordMatchingPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Đang chuẩn bị phiên nối từ/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ubiquitous")).toBeInTheDocument();
      expect(screen.getByText("phổ biến khắp nơi")).toBeInTheDocument();
      expect(screen.getByText(/Vòng 1\/2/i)).toBeInTheDocument();
    });
  });

  it("renders error state when deck has insufficient cards or request fails", async () => {
    vi.spyOn(practiceService, "getMatchingQuiz").mockRejectedValue(
      new Error("INSUFFICIENT_CARDS_FOR_MATCHING"),
    );

    render(
      <MemoryRouter
        initialEntries={["/decks/deck_abc/practice/matching?limit=10"]}
      >
        <Routes>
          <Route
            path="/decks/:id/practice/matching"
            element={<WordMatchingPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Unable to Start Practice/i)).toBeInTheDocument();
    });
  });
});
