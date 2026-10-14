import type { AppLanguage } from "./auth.js";
import type { CardResponse } from "./cards.js";
import type { ReviewSummaryDto, SubmitReviewDto } from "./reviews.js";

export interface QuickCaptureCardDto {
  word: string;
  deckId?: string;
  contextSentence?: string;
  sourceUrl?: string;
  customDefinition?: string;
}

export interface QuickCaptureResponseDto {
  message: string;
  card: CardResponse;
  isDuplicate: boolean;
  deck: {
    id: string;
    title: string;
  };
}

export interface ExtensionUserSummary {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  preferredLanguage?: AppLanguage;
}

export interface ReminderSettings {
  badgeEnabled?: boolean;
  remindersEnabled: boolean;
  dailyReminderTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  streakAtRiskReminderEnabled: boolean;
  preferredLanguage?: AppLanguage;
}

export interface ExtensionSettingsPayload extends ReminderSettings {
  badgeEnabled: boolean;
  pinnedDeckId: string | null;
  autoShowFloatingIcon: boolean;
  shortcutKey: string;
  blacklistedDomains: string[];
}

export interface ReminderState {
  /** Local calendar date ("YYYY-MM-DD") when daily counters were last reset */
  lastResetDate: string;
  /** Number of reminder notifications sent on lastResetDate (0..3) */
  sentTodayCount: number;
  /** Whether the scheduled daily reminder (or catch-up) has already fired on lastResetDate */
  dailyReminderSentToday: boolean;
  /** Consecutive notifications closed/superseded without click, snooze, or Web App study (>= 3 reduces cap to 1/day) */
  consecutiveIgnores: number;
  /** ISO 8601 timestamp of the most recent notification shown (nullable) */
  lastNotifiedAt: string | null;
  /** ISO 8601 timestamp until which automatic reminders are snoozed (nullable) */
  snoozedUntil: string | null;
  /** Notification ID currently displayed and awaiting user interaction or close (nullable) */
  activeNotificationId: string | null;
  /** Last observed ReviewSummaryDto.studiedToday on lastResetDate to detect Web App study activity */
  lastStudiedToday: number;
}

export type ReminderTriggerSource =
  | "DAILY_ALARM"
  | "SNOOZE_ALARM"
  | "PERIODIC_SYNC";

export type ReminderNotificationType =
  | "STREAK_AT_RISK"
  | "DUE_CARDS"
  | "DAILY_GOAL";

export type ReminderTriggerReason =
  | "DAILY_SCHEDULED"
  | "STREAK_AT_RISK"
  | "SNOOZE_REMINDER";

export type ReminderSuppressionReason =
  | "UNAUTHENTICATED"
  | "REMINDERS_DISABLED"
  | "QUIET_HOURS"
  | "DAILY_CAP_REACHED"
  | "SNOOZED_ACTIVE"
  | "COOLDOWN_ACTIVE"
  | "NO_STUDY_NEEDED"
  | "NOT_YET_SCHEDULED_TIME";

export type ReminderReason =
  | ReminderTriggerReason
  | ReminderSuppressionReason;

export interface ReminderEvaluationInput {
  isAuthenticated: boolean;
  summary: ReviewSummaryDto | null;
  settings: ReminderSettings;
  state: ReminderState;
  triggerSource: ReminderTriggerSource;
  now?: Date | number;
  timezone?: string;
}

export type ReminderEvaluationContext = ReminderEvaluationInput;

export interface ReminderDecision {
  shouldNotify: boolean;
  reason: ReminderReason;
  notificationType?: ReminderNotificationType;
  effectiveDailyCap: 1 | 3;
  markDailyReminderSent?: boolean;
  normalizedState: ReminderState;
}

export interface ReminderNotificationCopy {
  title: string;
  message: string;
  buttons: [{ title: string }, { title: string }];
  priority: 1 | 2;
}

export interface RecentCaptureItem {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  deckTitle: string;
  capturedAt: string;
  sourceUrl?: string | null;
}

export interface ReviewSummaryCacheState {
  summary: ReviewSummaryDto;
  etag: string | null;
  fetchedAt: string;
}

export interface ExtensionStorageState {
  token: string | null;
  user: ExtensionUserSummary | null;
  settings: ExtensionSettingsPayload;
  recentCaptures: RecentCaptureItem[];
  reviewSummaryCache?: ReviewSummaryCacheState | null;
  reminderState?: ReminderState | null;
}

export type ExtensionMessage =
  | { type: "QUICK_CAPTURE"; payload: QuickCaptureCardDto }
  | { type: "GET_AUTH_STATUS" }
  | { type: "LOGIN"; payload: { identifier: string; password: string } }
  | { type: "SET_AUTH_TOKEN"; payload: { token: string } }
  | { type: "LOGOUT" }
  | { type: "FETCH_DECKS" }
  | { type: "GET_SETTINGS" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<ExtensionSettingsPayload> }
  | { type: "REFRESH_BADGE"; payload?: { immediate?: boolean } }
  | { type: "FETCH_DUE_CARDS"; payload?: { limit?: number; deckId?: string } }
  | { type: "SUBMIT_MICRO_REVIEW"; payload: SubmitReviewDto };
