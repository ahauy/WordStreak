import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicWordPage } from "./PublicWordPage";
import { publicWordService } from "../services/publicWordService";
import { useAuthStore } from "../../../store/useAuthStore";
import { cardsService } from "../../cards/services/cardsService";
import { decksService } from "../../decks/services/decksService";
import type { AiGeneratedCardData } from "@wordstreak/shared-types";

vi.mock("../services/publicWordService");
vi.mock("../../cards/services/cardsService");
vi.mock("../../decks/services/decksService");

const mockWordData: AiGeneratedCardData = {
  word: "resilient",
  partOfSpeech: "adjective",
  phonetic: "/rɪˈzɪl.jənt/",
  meaningVi: "Có khả năng phục hồi nhanh chóng",
  meaningEn: "Able to recover quickly from difficult conditions",
  exampleSentence: "She is remarkably resilient in difficult situations.",
  exampleTranslation: "Cô ấy kiên cường đáng nể trong các tình huống khó khăn.",
  collocations: ["highly resilient", "remain resilient"],
  mnemonic: "Re (lại) + silent (im lặng) -> dù gặp bão táp vẫn im lặng vượt qua kiên cường.",
  audioUrl: "https://audio.example.com/resilient.mp3",
};

describe("PublicWordPage (US-GROW-01)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default mock implementation
    vi.mocked(publicWordService.getWordDetails).mockResolvedValue(mockWordData);
    vi.mocked(decksService.getDecks).mockResolvedValue([
      {
        id: "deck-1",
        name: "My Daily Vocab",
        userId: "user-1",
        totalCards: 10,
        dueCards: 2,
        createdAt: new Date().toISOString(),
      },
    ]);
    vi.mocked(cardsService.createCard).mockResolvedValue({
      id: "card-1",
      deckId: "deck-1",
      word: "resilient",
      meaning: "Có khả năng phục hồi nhanh chóng",
      phonetic: "/rɪˈzɪl.jənt/",
      collocations: ["highly resilient"],
      mnemonic: "Re (lại) + silent",
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      createdAt: new Date().toISOString(),
    });

    // Reset auth store to guest by default
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  });

  const renderComponent = (word = "resilient") => {
    return render(
      <MemoryRouter initialEntries={[`/word/${encodeURIComponent(word)}`]}>
        <Routes>
          <Route path="/word/:word" element={<PublicWordPage />} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("TC-WORD-01: renders word details, definitions, collocations and mnemonic correctly", async () => {
    renderComponent("resilient");

    expect(screen.getByText("Đang tra cứu từ điển...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "resilient" })).toBeInTheDocument();
    });

    expect(screen.getByText("adjective")).toBeInTheDocument();
    expect(screen.getByText("/rɪˈzɪl.jənt/")).toBeInTheDocument();
    expect(screen.getByText("Có khả năng phục hồi nhanh chóng")).toBeInTheDocument();
    expect(screen.getByText("Able to recover quickly from difficult conditions")).toBeInTheDocument();
    expect(screen.getByText(/She is remarkably resilient in difficult situations/)).toBeInTheDocument();
    expect(screen.getByText("highly resilient")).toBeInTheDocument();
    expect(screen.getByText("remain resilient")).toBeInTheDocument();
    expect(screen.getByText(/Re \(lại\) \+ silent/)).toBeInTheDocument();
  });

  it("TC-WORD-02: updates document title and meta description dynamically", async () => {
    renderComponent("resilient");

    await waitFor(() => {
      expect(document.title).toContain("resilient");
    });

    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute("content")).toContain("resilient");
  });

  it("TC-WORD-03: renders guest CTAs and handles adding word to guest trial storage", async () => {
    renderComponent("resilient");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Thêm vào phiên học thử/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Đăng ký để ghi nhớ vĩnh viễn/i })).toBeInTheDocument();

    // Click "Thêm vào phiên học thử"
    const addBtn = screen.getByRole("button", { name: /Thêm vào phiên học thử/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText("Đã thêm vào phiên học thử của bạn!")).toBeInTheDocument();
    });

    // Check localStorage
    const storedCustom = localStorage.getItem("wordstreak_guest_custom_cards");
    expect(storedCustom).toContain("resilient");
  });

  it("TC-WORD-04: allows authenticated user to save word to their deck", async () => {
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "test@wordstreak.app",
        username: "learner",
        dailyGoal: 10,
        createdAt: new Date().toISOString(),
      },
      accessToken: "valid-token",
      isAuthenticated: true,
    });

    renderComponent("resilient");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Lưu vào bộ từ/i })).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole("button", { name: /Lưu vào bộ từ/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(cardsService.createCard).toHaveBeenCalledWith("deck-1", expect.objectContaining({
        word: "resilient",
      }));
      expect(screen.getByText("Đã lưu từ vựng vào bộ từ của bạn!")).toBeInTheDocument();
    });
  });

  it("TC-WORD-05: handles audio pronunciation button click", async () => {
    const playMock = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.play = playMock;

    renderComponent("resilient");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nghe phát âm từ resilient/i })).toBeInTheDocument();
    });

    const audioBtn = screen.getByRole("button", { name: /Nghe phát âm từ resilient/i });
    fireEvent.click(audioBtn);

    expect(playMock).toHaveBeenCalled();
  });

  it("TC-WORD-06: copies URL to clipboard when 'Chia sẻ từ vựng' is clicked", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    renderComponent("resilient");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Chia sẻ từ vựng/i })).toBeInTheDocument();
    });

    const shareBtn = screen.getByRole("button", { name: /Chia sẻ từ vựng/i });
    fireEvent.click(shareBtn);

    expect(writeTextMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Đã sao chép liên kết vào bộ nhớ tạm!")).toBeInTheDocument();
    });
  });

  it("TC-WORD-07: renders not found error when word does not exist", async () => {
    vi.mocked(publicWordService.getWordDetails).mockRejectedValue(new Error("Word not found"));

    renderComponent("nonexistentword123");

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy từ vựng")).toBeInTheDocument();
      expect(screen.getByText(/Chúng tôi chưa có dữ liệu cho từ/)).toBeInTheDocument();
    });
  });
});
