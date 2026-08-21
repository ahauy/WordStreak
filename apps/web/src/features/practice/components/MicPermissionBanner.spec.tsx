import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MicPermissionBanner } from "./MicPermissionBanner";

describe("MicPermissionBanner component", () => {
  it("renders permission denied message with actionable retry button", () => {
    const onRetry = vi.fn();
    render(<MicPermissionBanner status="denied" onRetry={onRetry} />);

    expect(screen.getByTestId("mic-permission-denied")).toBeDefined();
    expect(screen.getByText("Microphone Access Required")).toBeDefined();

    const retryBtn = screen.getByTestId("mic-retry-button");
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders unsupported browser message", () => {
    render(<MicPermissionBanner status="unsupported" />);
    expect(screen.getByTestId("mic-permission-unsupported")).toBeDefined();
    expect(screen.getByText("Speech Recognition Unavailable")).toBeDefined();
  });
});
