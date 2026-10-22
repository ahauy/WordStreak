import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import posthog from "posthog-js";
import { analyticsService } from "../analyticsService";
import type {
  StudySessionCompletedProps,
  OnboardingCompletedProps,
  DeckClonedProps,
} from "../types";

vi.mock("posthog-js", () => {
  const mockPosthog = {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    opt_in_capturing: vi.fn(),
    opt_out_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn().mockReturnValue(false),
  };
  return {
    default: mockPosthog,
    ...mockPosthog,
  };
});

describe("analyticsService (US-GROW-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset private service state via init
    analyticsService.resetForTesting();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("TC-ANALYTICS-001: initializes safely without API key and acts as no-op", () => {
    analyticsService.init({ apiKey: "", host: "" });
    expect(posthog.init).not.toHaveBeenCalled();

    analyticsService.trackEvent("study_session_completed", {
      deckId: "d1",
      deckType: "official",
      cardCount: 10,
      xpEarned: 50,
    });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("TC-ANALYTICS-002: initializes posthog when API key is provided and sets consent appropriately", () => {
    localStorage.setItem("wordstreak_cookie_consent", "accepted");
    analyticsService.init({ apiKey: "ph_test_key_123", host: "https://test.posthog.com" });

    expect(posthog.init).toHaveBeenCalledWith(
      "ph_test_key_123",
      expect.objectContaining({
        api_host: "https://test.posthog.com",
        autocapture: false,
      })
    );
  });

  it("TC-ANALYTICS-003: manages consent transitions correctly", () => {
    expect(analyticsService.getConsentStatus()).toBe("pending");

    analyticsService.init({ apiKey: "ph_test_key_123" });

    analyticsService.setConsent("accepted");
    expect(localStorage.getItem("wordstreak_cookie_consent")).toBe("accepted");
    expect(analyticsService.getConsentStatus()).toBe("accepted");
    expect(posthog.opt_in_capturing).toHaveBeenCalled();

    analyticsService.setConsent("declined");
    expect(localStorage.getItem("wordstreak_cookie_consent")).toBe("declined");
    expect(analyticsService.getConsentStatus()).toBe("declined");
    expect(posthog.opt_out_capturing).toHaveBeenCalled();
  });

  it("TC-ANALYTICS-004: does not track events if user declined consent", () => {
    analyticsService.init({ apiKey: "ph_test_key_123" });
    analyticsService.setConsent("declined");

    analyticsService.trackEvent("study_session_completed", {
      deckId: "d1",
      deckType: "custom",
      cardCount: 5,
      xpEarned: 20,
    });

    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("TC-ANALYTICS-005: tracks events when user has accepted consent", () => {
    analyticsService.init({ apiKey: "ph_test_key_123" });
    analyticsService.setConsent("accepted");

    const payload: StudySessionCompletedProps = {
      deckId: "deck-123",
      deckType: "official",
      cardCount: 15,
      xpEarned: 75,
      durationSeconds: 120,
    };

    analyticsService.trackStudySessionCompleted(payload);
    expect(posthog.capture).toHaveBeenCalledWith("study_session_completed", payload);
  });

  it("TC-ANALYTICS-006: supports onboarding and deck cloned event helpers", () => {
    analyticsService.init({ apiKey: "ph_test_key_123" });
    analyticsService.setConsent("accepted");

    const onboardingPayload: OnboardingCompletedProps = {
      learningGoal: "TOEIC",
      startingLevel: "ZERO",
      dailyGoal: 10,
    };
    analyticsService.trackOnboardingCompleted(onboardingPayload);
    expect(posthog.capture).toHaveBeenCalledWith("onboarding_completed", onboardingPayload);

    const deckClonedPayload: DeckClonedProps = {
      deckId: "c-100",
      deckTitle: "IELTS Speaking Part 1",
    };
    analyticsService.trackDeckCloned(deckClonedPayload);
    expect(posthog.capture).toHaveBeenCalledWith("deck_cloned", deckClonedPayload);
  });

  it("TC-ANALYTICS-007: delegates user identification and reset correctly", () => {
    analyticsService.init({ apiKey: "ph_test_key_123" });
    analyticsService.setConsent("accepted");

    analyticsService.identifyUser("u-999", { email: "alex@example.com", startingLevel: "INTERMEDIATE" });
    expect(posthog.identify).toHaveBeenCalledWith("u-999", { email: "alex@example.com", startingLevel: "INTERMEDIATE" });

    analyticsService.resetUser();
    expect(posthog.reset).toHaveBeenCalled();
  });
});
