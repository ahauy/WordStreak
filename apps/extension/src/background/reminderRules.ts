import { REMINDER_LIMITS } from "../shared/constants";
import type {
  AppLanguage,
  ExtensionUserSummary,
  ReminderDecision,
  ReminderEvaluationInput,
  ReminderNotificationCopy,
  ReminderNotificationType,
  ReminderSettings,
  ReminderState,
  ReviewSummaryDto,
} from "@wordstreak/shared-types";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates and converts an "HH:mm" time string into minutes past midnight (0..1439).
 */
export function parseTimeToMinutes(
  hhmm: string,
  fallbackMinutes: number = 20 * 60,
): number {
  if (!hhmm || typeof hhmm !== "string") {
    return fallbackMinutes;
  }
  const match = hhmm.match(TIME_REGEX);
  if (!match) {
    return fallbackMinutes;
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Formats a given timestamp into local "YYYY-MM-DD" and current minutes (0..1439) in the specified timezone.
 */
export function getLocalDateAndMinutes(
  now: Date | number,
  timezone?: string,
): { localDate: string; currentMinutes: number } {
  const dateObj = typeof now === "number" ? new Date(now) : now;
  let validTimezone = timezone;
  if (validTimezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: validTimezone });
    } catch {
      validTimezone = undefined;
    }
  }

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: validTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = dtf.formatToParts(dateObj);
  let year = "";
  let month = "";
  let day = "";
  let hour = "0";
  let minute = "0";

  for (const part of parts) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
    else if (part.type === "hour") hour = part.value;
    else if (part.type === "minute") minute = part.value;
  }

  let h = parseInt(hour, 10);
  if (h === 24) h = 0;
  const m = parseInt(minute, 10);
  const currentMinutes = h * 60 + m;
  const localDate = `${year}-${month}-${day}`;

  return { localDate, currentMinutes };
}

/**
 * Evaluates whether the current local time falls into the [quietHoursStart, quietHoursEnd) window.
 */
export function isWithinQuietHours(
  now: Date | number,
  timezone: string | undefined,
  quietHoursStart: string,
  quietHoursEnd: string,
): boolean {
  const startMinutes = parseTimeToMinutes(quietHoursStart, 22 * 60);
  const endMinutes = parseTimeToMinutes(quietHoursEnd, 7 * 60);

  if (startMinutes === endMinutes) {
    return false;
  }

  const { currentMinutes } = getLocalDateAndMinutes(now, timezone);

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

/**
 * Resets daily counters on local date rollover and accounts for unclicked notifications.
 */
export function normalizeReminderStateForDate(
  state: ReminderState,
  currentLocalDate: string,
  currentStudiedToday?: number,
): ReminderState {
  if (!state.lastResetDate) {
    return {
      ...state,
      lastResetDate: currentLocalDate,
      lastStudiedToday: currentStudiedToday ?? state.lastStudiedToday,
    };
  }

  if (state.lastResetDate === currentLocalDate) {
    return { ...state };
  }

  const consecutiveIgnores =
    state.activeNotificationId !== null
      ? state.consecutiveIgnores + 1
      : state.consecutiveIgnores;

  return {
    ...state,
    lastResetDate: currentLocalDate,
    sentTodayCount: 0,
    dailyReminderSentToday: false,
    consecutiveIgnores,
    activeNotificationId: null,
    lastStudiedToday: currentStudiedToday ?? 0,
  };
}

/**
 * Calculates the next epoch timestamp for dailyReminderTime, clamping to >= nowMs + MIN_ALARM_DELAY_MS.
 */
export function computeNextDailyReminderTime(
  dailyReminderTime: string,
  nowMs: number = Date.now(),
  timezone?: string,
): number {
  const targetMinutes = parseTimeToMinutes(dailyReminderTime, 20 * 60);
  const { currentMinutes } = getLocalDateAndMinutes(nowMs, timezone);

  let deltaMinutes: number;
  if (targetMinutes > currentMinutes) {
    deltaMinutes = targetMinutes - currentMinutes;
  } else {
    deltaMinutes = 24 * 60 - currentMinutes + targetMinutes;
  }

  const secondsAndMs = nowMs % 60_000;
  const scheduledMs = nowMs - secondsAndMs + deltaMinutes * 60_000;

  return Math.max(nowMs + REMINDER_LIMITS.MIN_ALARM_DELAY_MS, scheduledMs);
}

function resolveNotificationType(
  summary: ReviewSummaryDto,
  streakAtRiskEligible: boolean,
): ReminderNotificationType {
  if (streakAtRiskEligible) {
    return "STREAK_AT_RISK";
  }
  if (summary.dueCount > 0) {
    return "DUE_CARDS";
  }
  return "DAILY_GOAL";
}

export function isCooldownActive(
  nowMs: number,
  lastNotifiedAt: string | null,
  sentTodayCount: number,
): boolean {
  if (!lastNotifiedAt || sentTodayCount === 0) {
    return false;
  }
  const lastMs = new Date(lastNotifiedAt).getTime();
  return !isNaN(lastMs) && nowMs - lastMs < REMINDER_LIMITS.MIN_COOLDOWN_MS;
}

function isSnoozeActive(nowMs: number, snoozedUntil: string | null): boolean {
  if (!snoozedUntil) {
    return false;
  }
  const snoozeMs = new Date(snoozedUntil).getTime();
  return !isNaN(snoozeMs) && snoozeMs > nowMs;
}

function checkSuppressionReasons(
  input: ReminderEvaluationInput,
  nowMs: number,
  tz: string | undefined,
  normalizedState: ReminderState,
  effectiveDailyCap: 1 | 3,
): ReminderDecision["reason"] | null {
  if (!input.isAuthenticated || !input.summary) {
    return "UNAUTHENTICATED";
  }
  if (!input.settings.remindersEnabled) {
    return "REMINDERS_DISABLED";
  }
  if (isWithinQuietHours(nowMs, tz, input.settings.quietHoursStart, input.settings.quietHoursEnd)) {
    return "QUIET_HOURS";
  }
  if (normalizedState.sentTodayCount >= effectiveDailyCap) {
    return "DAILY_CAP_REACHED";
  }
  if (input.triggerSource !== "SNOOZE_ALARM") {
    if (isSnoozeActive(nowMs, normalizedState.snoozedUntil)) {
      return "SNOOZED_ACTIVE";
    }
    if (isCooldownActive(nowMs, normalizedState.lastNotifiedAt, normalizedState.sentTodayCount)) {
      return "COOLDOWN_ACTIVE";
    }
  }

  const streakAtRiskEligible = Boolean(
    input.summary.streakAtRisk && input.settings.streakAtRiskReminderEnabled,
  );
  if (!streakAtRiskEligible && input.summary.dueCount <= 0 && input.summary.goalReached) {
    return "NO_STUDY_NEEDED";
  }

  return null;
}

function resolveTriggerDecision(
  input: ReminderEvaluationInput,
  currentMinutes: number,
  normalizedState: ReminderState,
  effectiveDailyCap: 1 | 3,
  notificationType: ReminderNotificationType,
  streakAtRiskEligible: boolean,
): ReminderDecision {
  if (input.triggerSource === "SNOOZE_ALARM") {
    return { shouldNotify: true, reason: "SNOOZE_REMINDER", notificationType, effectiveDailyCap, normalizedState };
  }

  const dailyMinutes = parseTimeToMinutes(input.settings.dailyReminderTime, 20 * 60);
  const isCatchUp =
    input.triggerSource === "PERIODIC_SYNC" &&
    !normalizedState.dailyReminderSentToday &&
    currentMinutes >= dailyMinutes;

  if (input.triggerSource === "DAILY_ALARM" || isCatchUp) {
    return {
      shouldNotify: true,
      reason: "DAILY_SCHEDULED",
      notificationType,
      effectiveDailyCap,
      markDailyReminderSent: true,
      normalizedState,
    };
  }

  if (input.triggerSource === "PERIODIC_SYNC" && streakAtRiskEligible) {
    return {
      shouldNotify: true,
      reason: "STREAK_AT_RISK",
      notificationType: "STREAK_AT_RISK",
      effectiveDailyCap,
      normalizedState,
    };
  }

  return { shouldNotify: false, reason: "NOT_YET_SCHEDULED_TIME", effectiveDailyCap, normalizedState };
}

/**
 * Pure 11-step conditional study reminder evaluation engine.
 */
export function evaluateReminderRules(
  input: ReminderEvaluationInput,
): ReminderDecision {
  const nowMs = typeof input.now === "number" ? input.now : input.now?.getTime() ?? Date.now();
  const tz = input.timezone || input.summary?.timezone;
  const { localDate, currentMinutes } = getLocalDateAndMinutes(nowMs, tz);
  const normalizedState = normalizeReminderStateForDate(
    input.state,
    localDate,
    input.summary?.studiedToday,
  );

  const effectiveDailyCap: 1 | 3 =
    normalizedState.consecutiveIgnores >= REMINDER_LIMITS.IGNORE_BACKOFF_THRESHOLD
      ? 1
      : 3;

  const suppressionReason = checkSuppressionReasons(
    input,
    nowMs,
    tz,
    normalizedState,
    effectiveDailyCap,
  );
  if (suppressionReason) {
    return { shouldNotify: false, reason: suppressionReason, effectiveDailyCap, normalizedState };
  }

  const streakAtRiskEligible = Boolean(
    input.summary?.streakAtRisk && input.settings.streakAtRiskReminderEnabled,
  );
  const notificationType = resolveNotificationType(input.summary!, streakAtRiskEligible);

  return resolveTriggerDecision(
    input,
    currentMinutes,
    normalizedState,
    effectiveDailyCap,
    notificationType,
    streakAtRiskEligible,
  );
}

/**
 * Resolves user language preference with fallback to settings, browser UI, and default "vi".
 */
export function resolveReminderLanguage(
  user?: Pick<ExtensionUserSummary, "preferredLanguage"> | null,
  settings?: Pick<ReminderSettings, "preferredLanguage"> | null,
  browserUiLang?: string | null,
): AppLanguage {
  if (user?.preferredLanguage === "vi" || user?.preferredLanguage === "en") {
    return user.preferredLanguage;
  }
  if (settings?.preferredLanguage === "vi" || settings?.preferredLanguage === "en") {
    return settings.preferredLanguage;
  }
  if (browserUiLang) {
    const lower = browserUiLang.toLowerCase();
    if (lower.startsWith("en")) {
      return "en";
    }
    if (lower.startsWith("vi")) {
      return "vi";
    }
  }
  return "vi";
}

function buildStreakAtRiskCopy(
  summary: Pick<ReviewSummaryDto, "dueCount" | "currentStreak">,
  lang: AppLanguage,
): ReminderNotificationCopy {
  if (lang === "en") {
    return {
      title: `🔥 Your ${summary.currentStreak}-day streak is at risk!`,
      message:
        summary.dueCount > 0
          ? `You have ${summary.dueCount} due cards waiting. Review now to keep your streak alive!`
          : "Complete a quick review before midnight to protect your study streak!",
      buttons: [{ title: "Study Now" }, { title: "Snooze" }],
      priority: 2,
    };
  }
  return {
    title: `🔥 Chuỗi ${summary.currentStreak} ngày sắp mất!`,
    message:
      summary.dueCount > 0
        ? `Bạn còn ${summary.dueCount} thẻ đến hạn. Ôn ngay để giữ chuỗi ngày học!`
        : "Hoàn thành phiên ôn tập hôm nay trước nửa đêm để bảo vệ chuỗi ngày học!",
    buttons: [{ title: "Học ngay" }, { title: "Để sau" }],
    priority: 2,
  };
}

function buildDueCardsCopy(
  summary: Pick<ReviewSummaryDto, "dueCount">,
  lang: AppLanguage,
): ReminderNotificationCopy {
  if (lang === "en") {
    return {
      title: "📚 Time for your WordStreak review!",
      message: `You have ${summary.dueCount} vocabulary cards due for review today.`,
      buttons: [{ title: "Study Now" }, { title: "Snooze" }],
      priority: 1,
    };
  }
  return {
    title: "📚 Đến giờ ôn tập WordStreak!",
    message: `Bạn có ${summary.dueCount} thẻ từ vựng đến hạn cần ôn tập hôm nay.`,
    buttons: [{ title: "Học ngay" }, { title: "Để sau" }],
    priority: 1,
  };
}

function buildDailyGoalCopy(
  summary: Pick<ReviewSummaryDto, "studiedToday" | "dailyGoal">,
  lang: AppLanguage,
): ReminderNotificationCopy {
  const remaining = Math.max(1, summary.dailyGoal - summary.studiedToday);
  if (lang === "en") {
    return {
      title: "🎯 Reach your daily vocabulary goal!",
      message: `You've studied ${summary.studiedToday}/${summary.dailyGoal} cards today. Just ${remaining} more to hit your daily goal!`,
      buttons: [{ title: "Study Now" }, { title: "Snooze" }],
      priority: 1,
    };
  }
  return {
    title: "🎯 Hoàn thành mục tiêu từ vựng hôm nay!",
    message: `Bạn đã học ${summary.studiedToday}/${summary.dailyGoal} thẻ hôm nay. Chỉ còn ${remaining} thẻ nữa để đạt mục tiêu!`,
    buttons: [{ title: "Học ngay" }, { title: "Để sau" }],
    priority: 1,
  };
}

/**
 * Constructs bilingual notification title, body, action buttons, and priority.
 */
export function buildReminderNotificationCopy(
  notificationType: ReminderNotificationType,
  summary: Pick<
    ReviewSummaryDto,
    "dueCount" | "currentStreak" | "studiedToday" | "dailyGoal"
  >,
  lang: AppLanguage,
): ReminderNotificationCopy {
  if (notificationType === "STREAK_AT_RISK") {
    return buildStreakAtRiskCopy(summary, lang);
  }
  if (notificationType === "DUE_CARDS") {
    return buildDueCardsCopy(summary, lang);
  }
  return buildDailyGoalCopy(summary, lang);
}
