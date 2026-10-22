import posthog from "posthog-js";
import type {
  CookieConsentStatus,
  AnalyticsEventName,
  AnalyticsEventMap,
  StudySessionCompletedProps,
  OnboardingCompletedProps,
  DeckClonedProps,
} from "./types";

const CONSENT_STORAGE_KEY = "wordstreak_cookie_consent";

interface InitOptions {
  apiKey?: string;
  host?: string;
}

class AnalyticsService {
  private isInitialized = false;

  public init(options?: InitOptions): void {
    const key = options?.apiKey ?? import.meta.env.VITE_POSTHOG_KEY ?? "";
    const host = options?.host ?? import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

    if (!key) {
      this.isInitialized = false;
      return;
    }

    const consent = this.getConsentStatus();

    posthog.init(key, {
      api_host: host,
      autocapture: false,
      capture_pageview: false,
      persistence: consent === "accepted" ? "localStorage+cookie" : "memory",
      disable_session_recording: true,
      opt_out_capturing_by_default: consent !== "accepted",
      loaded: (ph) => {
        if (consent === "declined") {
          ph.opt_out_capturing();
        } else if (consent === "accepted") {
          ph.opt_in_capturing();
        }
      },
    });

    this.isInitialized = true;
  }

  public getConsentStatus(): CookieConsentStatus {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === "accepted" || stored === "declined") {
        return stored;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return "pending";
  }

  public setConsent(status: "accepted" | "declined"): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch {
      // Ignore localStorage write error
    }

    if (this.isInitialized) {
      if (status === "accepted") {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }
  }

  public trackEvent<E extends AnalyticsEventName>(
    event: E,
    properties?: AnalyticsEventMap[E]
  ): void {
    if (!this.isInitialized || this.getConsentStatus() !== "accepted") {
      return;
    }

    try {
      posthog.capture(event, properties);
    } catch {
      // Telemetry failure should never break UI
    }
  }

  public trackStudySessionCompleted(props: StudySessionCompletedProps): void {
    this.trackEvent("study_session_completed", props);
  }

  public trackOnboardingCompleted(props: OnboardingCompletedProps): void {
    this.trackEvent("onboarding_completed", props);
  }

  public trackDeckCloned(props: DeckClonedProps): void {
    this.trackEvent("deck_cloned", props);
  }

  public identifyUser(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isInitialized || this.getConsentStatus() !== "accepted") {
      return;
    }
    try {
      posthog.identify(userId, traits);
    } catch {
      // Ignore identification error
    }
  }

  public resetUser(): void {
    if (!this.isInitialized) return;
    try {
      posthog.reset();
    } catch {
      // Ignore reset error
    }
  }

  public resetForTesting(): void {
    this.isInitialized = false;
  }
}

export const analyticsService = new AnalyticsService();
