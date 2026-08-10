// API Endpoints Mapping

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  DECKS: {
    BASE: '/decks',
    BY_ID: (id: string) => `/decks/${id}`,
  },
  CARDS: {
    BASE: '/cards',
    BY_ID: (id: string) => `/cards/${id}`,
    GENERATE_AI: '/cards/generate-ai',
  },
  REVIEWS: {
    DUE: '/reviews/due',
    SUBMIT: '/reviews/submit',
  },
  EXERCISES: {
    GENERATE: '/exercises/generate-quiz',
  },
  GAMIFICATION: {
    STREAK: '/gamification/streak',
    DAILY_GOALS: '/gamification/daily-goals',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
  },
} as const;
