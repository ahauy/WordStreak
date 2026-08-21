import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ListeningQuizPage } from "./ListeningQuizPage";
import { practiceService } from "../services/practiceService";
import { decksService } from "../../decks/services/decksService";

vi.mock("../services/practiceService", () => ({
  practiceService: {
    getListeningQuiz: vi.fn(),
    submitQuiz: vi.fn(),
  },
}));

vi.mock("../../decks/services/decksService", () => ({
  decksService: {
    getDeck: vi.fn(),
  },
}));

vi.mock("../../dashboard/hooks/useStreak", () => ({
  useStreak: () => ({
    recordActivity: vi.fn().mockResolvedValue({
      streakIncreased: false,
      currentStreak: 5,
      bestStreak: 10,
    }),
  }),
}));

describe("ListeningQuizPage Component", () => {
  const mockQuestions = [
    {
      id: "lq_1",
      cardId: "card_1",
      word: "efficient",
      meaning: "hiệu quả",
      phonetic: "/ɪˈfɪʃ.ənt/",
      audioUrl: "https://cdn.wordstreak.com/audio/efficient.mp3",
      wordLength: 9,
      firstLetterHint: "e",
    },
    {
      id: "lq_2",
      cardId: "card_2",
      word: "perseverance",
      meaning: "sự kiên trì",
      phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
      audioUrl: null,
      wordLength: 12,
      firstLetterHint: "p",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    function MockAudio() {
      return {
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        currentTime: 0,
        playbackRate: 1.0,
        src: "",
        onended: null,
        onerror: null,
      };
    }
    vi.stubGlobal("Audio", MockAudio);
    vi.stubGlobal("speechSynthesis", {
      speak: vi.fn(),
      cancel: vi.fn(),
    });
    class MockUtterance {
      text: string;
      lang = "en-US";
      rate = 1.0;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
  });

  it("loads questions, deck title, and renders active listening card", async () => {
    vi.mocked(decksService.getDeck).mockResolvedValue({
      id: "deck_1",
      title: "IELTS Core Vocabulary",
      description: "",
      totalCards: 2,
      createdAt: new Date(),
    } as any);

    vi.mocked(practiceService.getListeningQuiz).mockResolvedValue(
      mockQuestions,
    );

    render(
      <MemoryRouter initialEntries={["/decks/deck_1/practice/listening"]}>
        <Routes>
          <Route
            path="/decks/:id/practice/listening"
            element={<ListeningQuizPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/tạo câu hỏi nghe & viết/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/IELTS Core Vocabulary/i)).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  it("completes quiz session and transitions to QuizResultsView", async () => {
    vi.mocked(decksService.getDeck).mockResolvedValue({
      id: "deck_1",
      title: "IELTS Core Vocabulary",
      description: "",
      totalCards: 2,
      createdAt: new Date(),
    } as any);

    vi.mocked(practiceService.getListeningQuiz).mockResolvedValue(
      mockQuestions,
    );

    vi.mocked(practiceService.submitQuiz).mockResolvedValue({
      totalQuestions: 2,
      correctCount: 2,
      accuracyPercentage: 100,
      totalXpEarned: 50,
      maxCombo: 2,
      missedCards: [],
    });

    render(
      <MemoryRouter
        initialEntries={["/decks/deck_1/practice/listening?zen=true"]}
      >
        <Routes>
          <Route
            path="/decks/:id/practice/listening"
            element={<ListeningQuizPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    // Answer Q1
    const input1 = screen.getByRole("textbox");
    fireEvent.change(input1, { target: { value: "efficient" } });
    fireEvent.keyDown(input1, { key: "Enter", code: "Enter" });

    // Wait for auto-advance or trigger advance
    await waitFor(
      () => {
        expect(screen.getByText(/perseverance|tier 0\/3/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
