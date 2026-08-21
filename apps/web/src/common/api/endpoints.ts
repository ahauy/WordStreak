// API Endpoints Mapping

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  DECKS: {
    BASE: "/decks",
    BY_ID: (id: string) => `/decks/${id}`,
  },
  CARDS: {
    BASE: "/cards",
    BY_ID: (id: string) => `/cards/${id}`,
    GENERATE_AI: "/cards/generate-ai",
  },
  REVIEWS: {
    DUE: "/reviews/due",
    SUBMIT: "/reviews/submit",
  },
  EXERCISES: {
    GENERATE: "/exercises/generate-quiz",
  },
  GAMIFICATION: {
    STREAK: "/gamification/streak",
    DAILY_GOALS: "/gamification/daily-goals",
    XP_SUMMARY: "/gamification/xp/summary",
    XP_HISTORY: "/gamification/xp/history",
    XP_PRACTICE: "/gamification/xp/practice",
  },
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    MASTERY_SUMMARY: "/analytics/mastery-summary",
    HEATMAP: "/analytics/activity-heatmap",
    DECK_FORECAST: (deckId: string) => `/analytics/deck-forecast/${deckId}`,
    DECKS_PROGRESS: "/analytics/decks-progress",
  },
} as const;
