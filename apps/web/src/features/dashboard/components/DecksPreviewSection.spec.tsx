import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { DecksPreviewSection } from "./DecksPreviewSection";
import type { DeckResponse } from "@wordstreak/shared-types";

const mockDecks: DeckResponse[] = [
  {
    id: "deck-1",
    userId: "user-1",
    title: "IELTS Core Vocabulary",
    description: "Essential words for IELTS",
    color: "#6366F1",
    icon: "Book",
    coverImageUrl: null,
    isPublic: true,
    cloneCount: 10,
    tags: ["ielts", "academic"],
    status: "ACTIVE",
    archivedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      totalCards: 50,
      newCards: 10,
      learningCards: 20,
      masteredCards: 20,
      dueCards: 5,
    },
  },
];

describe("DecksPreviewSection Component", () => {
  it("renders Empty State when decks list is empty for a new user", () => {
    const handleCreateDeck = vi.fn();
    render(
      <BrowserRouter>
        <DecksPreviewSection
          decks={[]}
          isLoading={false}
          onCreateDeck={handleCreateDeck}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Chưa có bộ từ vựng nào")).toBeDefined();
    expect(
      screen.getByText(
        /Bắt đầu hành trình học từ vựng bằng cách tạo bộ thẻ đầu tiên của bạn/i,
      ),
    ).toBeDefined();

    const createBtn = screen.getByRole("button", {
      name: /Tạo bộ thẻ đầu tiên/i,
    });
    expect(createBtn).toBeDefined();
    fireEvent.click(createBtn);
    expect(handleCreateDeck).toHaveBeenCalledTimes(1);

    const communityLink = screen.getByRole("link", {
      name: /Khám phá bộ thẻ cộng đồng/i,
    });
    expect(communityLink.getAttribute("href")).toBe("/community");
  });

  it("renders real user decks when decks are provided", () => {
    const handleStartPractice = vi.fn();
    render(
      <BrowserRouter>
        <DecksPreviewSection
          decks={mockDecks}
          isLoading={false}
          onStartPractice={handleStartPractice}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("IELTS Core Vocabulary")).toBeDefined();
    expect(screen.getByText("Essential words for IELTS")).toBeDefined();
    expect(screen.getByText(/5 cần ôn/i)).toBeDefined();
    expect(screen.getByText(/50/i)).toBeDefined();

    const practiceBtn = screen.getByRole("button", { name: /Ôn tập ngay/i });
    fireEvent.click(practiceBtn);
    expect(handleStartPractice).toHaveBeenCalledWith("deck-1");
  });
});
