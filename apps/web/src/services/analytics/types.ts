export type CookieConsentStatus = "accepted" | "declined" | "pending";

export interface StudySessionCompletedProps {
  deckId: string;
  deckType: "official" | "custom";
  cardCount: number;
  xpEarned: number;
  durationSeconds?: number;
}

export interface OnboardingCompletedProps {
  learningGoal: string;
  startingLevel: string;
  dailyGoal: number;
}

export interface DeckClonedProps {
  deckId: string;
  deckTitle: string;
}

export interface AnalyticsEventMap {
  study_session_completed: StudySessionCompletedProps;
  onboarding_completed: OnboardingCompletedProps;
  deck_cloned: DeckClonedProps;
  cookie_consent_updated: { status: CookieConsentStatus };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
