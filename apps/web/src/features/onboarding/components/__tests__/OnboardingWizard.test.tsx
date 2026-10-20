import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OnboardingWizard } from "../OnboardingWizard";
import { userService } from "../../../user-profile/services/userService";
import { useAuthStore } from "../../../../store/useAuthStore";

vi.mock("../../../user-profile/services/userService", () => ({
  userService: {
    completeOnboarding: vi.fn(),
  },
}));

vi.mock("../../../../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("OnboardingWizard Component (US-LIB-04)", () => {
  const mockUpdateUser = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateUser: mockUpdateUser,
    });
  });

  it("should not render when isOpen is false", () => {
    const { container } = render(
      <OnboardingWizard isOpen={false} onClose={mockOnClose} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render Step 1 with goal options and allow advancing", () => {
    render(
      <OnboardingWizard isOpen={true} onClose={mockOnClose} />,
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    // Default selected goal should be TOEIC
    const nextButtons = screen.getAllByRole("button");
    const nextBtn = nextButtons.find(
      (b) => b.textContent?.includes("Tiếp tục") || b.textContent?.includes("Next"),
    );
    expect(nextBtn).toBeDefined();

    if (nextBtn) {
      fireEvent.click(nextBtn);
    }

    // Should now be on Step 2 (English level selection)
    expect(
      screen.getByText(/Trình độ tiếng Anh|current English level/i),
    ).toBeDefined();
  });

  it("should navigate through all 3 steps and submit onboarding", async () => {
    const mockResponse = {
      success: true,
      enrolledDeckId: "deck-tsl-1",
      enrolledDeckTitle: "TSL 1A Office Operations",
      user: {
        id: "user-1",
        email: "test@wordstreak.com",
        username: "learner",
        dailyGoal: 10,
        learningGoal: "TOEIC",
        startingLevel: "BEGINNER",
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      },
    };

    (userService.completeOnboarding as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse,
    );

    render(
      <OnboardingWizard
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
    );

    // Step 1 -> Step 2
    let nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Tiếp tục") || b.textContent?.includes("Next"));
    if (nextBtn) fireEvent.click(nextBtn);

    // Step 2 -> Step 3
    nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Tiếp tục") || b.textContent?.includes("Next"));
    if (nextBtn) fireEvent.click(nextBtn);

    // Step 3 -> Submit
    const submitBtn = screen
      .getAllByRole("button")
      .find(
        (b) =>
          b.textContent?.includes("Hoàn tất thiết lập") ||
          b.textContent?.includes("Finish Setup"),
      );
    expect(submitBtn).toBeDefined();

    if (submitBtn) fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(userService.completeOnboarding).toHaveBeenCalledWith({
        learningGoal: "TOEIC",
        startingLevel: "BEGINNER",
        dailyGoal: 10,
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(mockResponse.user);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
    });

    // Step 4 (Success screen) should be visible
    expect(
      screen.getByText(/Chào mừng bạn đến với WordStreak!|Welcome to WordStreak!/i),
    ).toBeDefined();
    expect(screen.getByText("TSL 1A Office Operations")).toBeDefined();
  });

  it("should allow skipping onboarding directly from step 1", () => {
    render(
      <OnboardingWizard isOpen={true} onClose={mockOnClose} />,
    );

    const skipBtn = screen
      .getAllByRole("button")
      .find(
        (b) =>
          b.textContent?.includes("Bỏ qua") ||
          b.textContent?.includes("Skip"),
      );
    expect(skipBtn).toBeDefined();

    if (skipBtn) {
      fireEvent.click(skipBtn);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("should support selecting ZERO level without requiring test (US-LIB-11)", () => {
    render(
      <OnboardingWizard isOpen={true} onClose={mockOnClose} />,
    );

    // Step 1 -> Step 2
    const nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Tiếp tục") || b.textContent?.includes("Next"));
    if (nextBtn) fireEvent.click(nextBtn);

    // Select "Mất gốc / Bắt đầu từ số 0"
    const zeroOption = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Mất gốc") || b.textContent?.includes("Starting Fresh"));
    expect(zeroOption).toBeDefined();
    if (zeroOption) fireEvent.click(zeroOption);

    // Should display the zero-test note
    expect(
      screen.getByText(/Bắt đầu từ số 0 không cần làm bài kiểm tra|Starting from zero requires no test/i),
    ).toBeDefined();
  });

  it("should allow launching adaptive mini-test from Step 2 (US-LIB-11)", () => {
    render(
      <OnboardingWizard isOpen={true} onClose={mockOnClose} />,
    );

    // Step 1 -> Step 2
    const nextBtn = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Tiếp tục") || b.textContent?.includes("Next"));
    if (nextBtn) fireEvent.click(nextBtn);

    // Default level is BEGINNER -> Should see 60s test prompt
    expect(
      screen.getByText(/Bạn chưa chắc chắn về trình độ|Not sure about your exact level/i),
    ).toBeDefined();

    const startTestBtn = screen.getByRole("button", {
      name: /Kiểm tra 60s|Start Test/i,
    });
    expect(startTestBtn).toBeDefined();
    fireEvent.click(startTestBtn);

    // Mini test should be rendered
    expect(screen.getByTestId("adaptive-mini-test")).toBeDefined();
  });
});

