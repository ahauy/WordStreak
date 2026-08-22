/**
 * Namespace Contracts for WordStreak 9 Domain Namespaces
 * Feature: US-I18N-01 (Core i18n Infrastructure & Instant Language Switcher)
 */

export interface CommonNamespace {
  brand: {
    name: string;
    tagline: string;
    badgeFree: string;
  };
  nav: {
    dashboard: string;
    decks: string;
    community: string;
    analytics: string;
    searchPlaceholder: string;
    interactiveDemo: string;
    features: string;
    howItWorks: string;
    studyGoals: string;
    faq: string;
  };
  actions: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    close: string;
    confirm: string;
    startLearning: string;
    signIn: string;
    signUp: string;
    signOut: string;
  };
  switcher: {
    toggleAriaVi: string;
    toggleAriaEn: string;
  };
  status: {
    loading: string;
    error: string;
    success: string;
    empty: string;
  };
}

export interface AuthNamespace {
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    forgotPassword: string;
    noAccount: string;
    signUpLink: string;
  };
  register: {
    title: string;
    subtitle: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    hasAccount: string;
    signInLink: string;
  };
  errors: {
    invalidCredentials: string;
    userNotFound: string;
    emailInUse: string;
    networkError: string;
  };
}

export interface DashboardNamespace {
  welcome: {
    greeting: string;
    subtitle: string;
  };
  streak: {
    daysLabel: string;
    flameGardenTooltip: string;
    activeToday: string;
    restDay: string;
  };
  stats: {
    cardsStudied: string;
    accuracy: string;
    timeSpent: string;
    currentLevel: string;
  };
  quickActions: {
    startDailyReview: string;
    exploreCommunity: string;
    createNewDeck: string;
  };
}

export interface DecksNamespace {
  title: string;
  subtitle: string;
  createDeck: string;
  importDeck: string;
  exportDeck: string;
  cardCount_one: string;
  cardCount_other: string;
  emptyState: {
    title: string;
    description: string;
    action: string;
  };
}

export interface StudyNamespace {
  session: {
    cardOf: string;
    flipPrompt: string;
    flipHint: string;
  };
  rating: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
  complete: {
    title: string;
    subtitle: string;
    backToDashboard: string;
    studyAgain: string;
  };
}

export interface PracticeNamespace {
  title: string;
  subtitle: string;
  modes: {
    multipleChoice: string;
    fillInBlank: string;
    wordMatching: string;
    pronunciation: string;
  };
  quiz: {
    questionOf: string;
    submit: string;
    nextQuestion: string;
    score: string;
  };
}

export interface CommunityNamespace {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  filters: {
    all: string;
    popular: string;
    trending: string;
    recent: string;
  };
  actions: {
    cloneDeck: string;
    viewDetails: string;
  };
}

export interface AnalyticsNamespace {
  title: string;
  subtitle: string;
  retentionRate: string;
  xpHistory: string;
  studyHeatmap: string;
  masteryDistribution: string;
}

export interface SettingsNamespace {
  title: string;
  tabs: {
    profile: string;
    avatar: string;
    security: string;
    gamification: string;
  };
  language: {
    title: string;
    description: string;
    selectLabel: string;
  };
}

export interface TranslationResources {
  common: CommonNamespace;
  auth: AuthNamespace;
  dashboard: DashboardNamespace;
  decks: DecksNamespace;
  study: StudyNamespace;
  practice: PracticeNamespace;
  community: CommunityNamespace;
  analytics: AnalyticsNamespace;
  settings: SettingsNamespace;
}
