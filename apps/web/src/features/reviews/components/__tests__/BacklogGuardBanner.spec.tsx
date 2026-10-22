import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { BacklogGuardBanner } from "../BacklogGuardBanner";
import type { BacklogWarningDto } from "@wordstreak/shared-types";

describe("BacklogGuardBanner (US-UX-03)", () => {
  const overwhelmedWarning: BacklogWarningDto = {
    isOverwhelmed: true,
    dueCount: 42,
    threshold: 30,
    dailyGoal: 10,
    suggestedBatchSize: 10,
  };

  const healthyWarning: BacklogWarningDto = {
    isOverwhelmed: false,
    dueCount: 15,
    threshold: 30,
    dailyGoal: 10,
    suggestedBatchSize: 10,
  };

  it("TC-BG-003a: returns null when backlogWarning is undefined or not overwhelmed", () => {
    const { container: emptyContainer } = render(<BacklogGuardBanner />);
    expect(emptyContainer).toBeEmptyDOMElement();

    const { container: healthyContainer } = render(
      <BacklogGuardBanner backlogWarning={healthyWarning} />,
    );
    expect(healthyContainer).toBeEmptyDOMElement();
  });

  it("TC-BG-003b: renders alert banner when isOverwhelmed is true", () => {
    render(<BacklogGuardBanner backlogWarning={overwhelmedWarning} />);

    expect(screen.getByTestId("backlog-guard-banner")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Chế độ chống ngợp (Backlog Guard)")).toBeInTheDocument();
    expect(screen.getByText("42 thẻ đến hạn")).toBeInTheDocument();
    expect(screen.getByText(/tạm dừng nạp từ mới/i)).toBeInTheDocument();
    expect(screen.getByText("10 từ")).toBeInTheDocument();
  });

  it("TC-BG-003c: renders express session button and fires callback on click", () => {
    const onStartExpressSession = vi.fn();
    render(
      <BacklogGuardBanner
        backlogWarning={overwhelmedWarning}
        onStartExpressSession={onStartExpressSession}
      />,
    );

    const expressButton = screen.getByTestId("express-session-button");
    expect(expressButton).toBeInTheDocument();
    expect(screen.getByText("Ôn nhanh 5 phút")).toBeInTheDocument();

    fireEvent.click(expressButton);
    expect(onStartExpressSession).toHaveBeenCalledTimes(1);
  });
});
