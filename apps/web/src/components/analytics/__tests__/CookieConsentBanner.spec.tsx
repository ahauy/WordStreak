import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookieConsentBanner } from "../CookieConsentBanner";
import { analyticsService } from "../../../services/analytics/analyticsService";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}));

describe("CookieConsentBanner Component (US-GROW-03)", () => {
  beforeEach(() => {
    localStorage.clear();
    analyticsService.resetForTesting();
  });

  it("TC-ANALYTICS-008: renders the banner when consent status is pending", () => {
    render(<CookieConsentBanner />);
    expect(screen.getByRole("region", { name: /cookie consent/i })).toBeInTheDocument();
    expect(screen.getByText(/chúng tôi tôn trọng quyền riêng tư/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /chấp nhận/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /từ chối/i })).toBeInTheDocument();
  });

  it("TC-ANALYTICS-009: does not render when user has already accepted or declined", () => {
    localStorage.setItem("wordstreak_cookie_consent", "accepted");
    const { container } = render(<CookieConsentBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("TC-ANALYTICS-010: accepting consent sets status and hides banner", () => {
    const setConsentSpy = vi.spyOn(analyticsService, "setConsent");
    render(<CookieConsentBanner />);

    const acceptBtn = screen.getByRole("button", { name: /chấp nhận/i });
    fireEvent.click(acceptBtn);

    expect(setConsentSpy).toHaveBeenCalledWith("accepted");
    expect(localStorage.getItem("wordstreak_cookie_consent")).toBe("accepted");
    expect(screen.queryByRole("region", { name: /cookie consent/i })).toBeNull();
  });

  it("TC-ANALYTICS-011: declining consent sets status to declined and hides banner", () => {
    const setConsentSpy = vi.spyOn(analyticsService, "setConsent");
    render(<CookieConsentBanner />);

    const declineBtn = screen.getByRole("button", { name: /từ chối/i });
    fireEvent.click(declineBtn);

    expect(setConsentSpy).toHaveBeenCalledWith("declined");
    expect(localStorage.getItem("wordstreak_cookie_consent")).toBe("declined");
    expect(screen.queryByRole("region", { name: /cookie consent/i })).toBeNull();
  });
});
