import {
  ALARM_NAMES,
  REMINDER_LIMITS,
  REMINDER_NOTIFICATION_ID,
  WEB_APP_URL,
} from "../shared/constants";
import { extensionStorage } from "../shared/storage";
import {
  computeNextDailyReminderTime,
  evaluateReminderRules,
  resolveReminderLanguage,
  buildReminderNotificationCopy,
  isCooldownActive,
  getLocalDateAndMinutes,
  normalizeReminderStateForDate,
} from "./reminderRules";
import type {
  ExtensionUserSummary,
  ReminderDecision,
  ReminderNotificationCopy,
  ReminderSettings,
  ReminderState,
  ReminderTriggerSource,
  ReviewSummaryDto,
} from "@wordstreak/shared-types";

export class ReminderManager {
  async ensureDailyReminderAlarm(nowMs: number = Date.now()): Promise<void> {
    const token = await extensionStorage.getToken();
    const settings = await extensionStorage.getSettings();

    if (!token || !settings.remindersEnabled) {
      await chrome.alarms?.clear?.(ALARM_NAMES.DAILY_REMINDER);
      await chrome.alarms?.clear?.(ALARM_NAMES.REMINDER_SNOOZE);
      await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
      return;
    }

    const cached = await extensionStorage.getReviewSummaryCache();
    const when = computeNextDailyReminderTime(
      settings.dailyReminderTime,
      nowMs,
      cached?.summary?.timezone,
    );

    await chrome.alarms?.create?.(ALARM_NAMES.DAILY_REMINDER, {
      when,
      periodInMinutes: REMINDER_LIMITS.DAILY_PERIOD_MINUTES,
    });
  }

  async syncDailyReminderAlarm(nowMs: number = Date.now()): Promise<void> {
    await this.ensureDailyReminderAlarm(nowMs);
  }

  private async showNotification(
    copy: ReminderNotificationCopy,
  ): Promise<void> {
    const iconUrl = chrome.runtime?.getURL
      ? chrome.runtime.getURL("icons/icon128.png")
      : "icons/icon128.png";

    await chrome.notifications?.create?.(REMINDER_NOTIFICATION_ID, {
      type: "basic",
      iconUrl,
      title: copy.title,
      message: copy.message,
      buttons: copy.buttons,
      priority: copy.priority,
    });
  }

  private createNextStateOnNotify(
    normalizedState: ReminderState,
    markDailyReminderSent?: boolean,
    nowMs: number = Date.now(),
  ): ReminderState {
    return {
      ...normalizedState,
      sentTodayCount: normalizedState.sentTodayCount + 1,
      lastNotifiedAt: new Date(nowMs).toISOString(),
      dailyReminderSentToday:
        normalizedState.dailyReminderSentToday ||
        Boolean(markDailyReminderSent),
      activeNotificationId: REMINDER_NOTIFICATION_ID,
      snoozedUntil: null,
    };
  }

  private async persistAndNotify(
    decision: ReminderDecision,
    summary: ReviewSummaryDto,
    user: ExtensionUserSummary | null,
    settings: ReminderSettings,
    nowMs: number,
  ): Promise<void> {
    const lang = resolveReminderLanguage(
      user,
      settings,
      chrome.i18n?.getUILanguage?.(),
    );
    const copy = buildReminderNotificationCopy(
      decision.notificationType!,
      summary,
      lang,
    );
    const nextState = this.createNextStateOnNotify(
      decision.normalizedState,
      decision.markDailyReminderSent,
      nowMs,
    );
    await extensionStorage.setReminderState(nextState);
    await this.showNotification(copy);
  }

  private async reconcileStudyProgress(
    state: ReminderState,
    summary: ReviewSummaryDto | null,
  ): Promise<ReminderState> {
    if (!summary) return state;
    const hasStudiedMore = summary.studiedToday > state.lastStudiedToday;
    const hasCompletedGoal = summary.dueCount <= 0 && summary.goalReached;

    if (hasStudiedMore || hasCompletedGoal) {
      const nextState: ReminderState = {
        ...state,
        consecutiveIgnores: 0,
        lastStudiedToday: summary.studiedToday,
      };
      if (hasCompletedGoal && state.activeNotificationId !== null) {
        const clearedState = {
          ...nextState,
          activeNotificationId: null,
          snoozedUntil: null,
        };
        await extensionStorage.setReminderState(clearedState);
        await chrome.alarms?.clear?.(ALARM_NAMES.REMINDER_SNOOZE);
        await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
        return clearedState;
      }
      return nextState;
    }

    return { ...state, lastStudiedToday: summary.studiedToday };
  }

  private checkSupersededNotification(
    state: ReminderState,
    triggerSource: ReminderTriggerSource,
    nowMs: number,
  ): ReminderState {
    if (
      state.activeNotificationId !== null &&
      (triggerSource !== "PERIODIC_SYNC" ||
        !isCooldownActive(nowMs, state.lastNotifiedAt, state.sentTodayCount))
    ) {
      return {
        ...state,
        consecutiveIgnores: state.consecutiveIgnores + 1,
        activeNotificationId: null,
      };
    }
    return state;
  }

  async evaluateFromSummary(
    summary: ReviewSummaryDto | null,
    triggerSource: ReminderTriggerSource,
    nowMs: number = Date.now(),
  ): Promise<ReminderDecision> {
    const token = await extensionStorage.getToken();
    const settings = await extensionStorage.getSettings();
    const user = await extensionStorage.getUser();
    const state = await extensionStorage.getReminderState();

    const resolvedSummary =
      summary !== null
        ? summary
        : (await extensionStorage.getReviewSummaryCache())?.summary ?? null;

    const { localDate } = getLocalDateAndMinutes(
      nowMs,
      resolvedSummary?.timezone,
    );
    let normalized = normalizeReminderStateForDate(
      state,
      localDate,
      resolvedSummary?.studiedToday,
    );
    normalized = await this.reconcileStudyProgress(
      normalized,
      resolvedSummary,
    );
    normalized = this.checkSupersededNotification(
      normalized,
      triggerSource,
      nowMs,
    );

    const decision = evaluateReminderRules({
      isAuthenticated: Boolean(token),
      summary: resolvedSummary,
      settings,
      state: normalized,
      triggerSource,
      now: nowMs,
      timezone: resolvedSummary?.timezone,
    });

    if (!decision.shouldNotify) {
      const nextState =
        triggerSource === "SNOOZE_ALARM" && decision.normalizedState.snoozedUntil
          ? { ...decision.normalizedState, snoozedUntil: null }
          : decision.normalizedState;
      await extensionStorage.setReminderState(nextState);
      return decision;
    }

    if (decision.notificationType && resolvedSummary) {
      await this.persistAndNotify(decision, resolvedSummary, user, settings, nowMs);
    }

    return decision;
  }

  async evaluateAndNotify(
    triggerSource: ReminderTriggerSource,
    summaryOverride?: ReviewSummaryDto | null,
    nowMs: number = Date.now(),
  ): Promise<ReminderDecision> {
    const summary =
      summaryOverride !== undefined
        ? summaryOverride
        : (await extensionStorage.getReviewSummaryCache())?.summary ?? null;
    return await this.evaluateFromSummary(summary, triggerSource, nowMs);
  }

  async handleAlarm(
    alarmName: string,
    refreshSummaryFn?: () => Promise<ReviewSummaryDto | null>,
  ): Promise<void> {
    if (
      alarmName !== ALARM_NAMES.DAILY_REMINDER &&
      alarmName !== ALARM_NAMES.REMINDER_SNOOZE
    ) {
      return;
    }

    const triggerSource: ReminderTriggerSource =
      alarmName === ALARM_NAMES.DAILY_REMINDER
        ? "DAILY_ALARM"
        : "SNOOZE_ALARM";

    const summary = refreshSummaryFn
      ? await refreshSummaryFn()
      : (await extensionStorage.getReviewSummaryCache())?.summary ?? null;

    await this.evaluateFromSummary(summary, triggerSource);
  }

  async handleNotificationClicked(notificationId: string): Promise<void> {
    if (notificationId !== REMINDER_NOTIFICATION_ID) {
      return;
    }

    const state = await extensionStorage.getReminderState();
    await extensionStorage.setReminderState({
      ...state,
      consecutiveIgnores: 0,
      activeNotificationId: null,
      snoozedUntil: null,
    });

    await chrome.alarms?.clear?.(ALARM_NAMES.REMINDER_SNOOZE);
    await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
    await this.openOrFocusReviewTab();
  }

  async handleNotificationButtonClicked(
    notificationId: string,
    buttonIndex: number,
    nowMs: number = Date.now(),
  ): Promise<void> {
    if (notificationId !== REMINDER_NOTIFICATION_ID) {
      return;
    }

    if (buttonIndex === 0) {
      await this.handleNotificationClicked(notificationId);
      return;
    }

    if (buttonIndex === 1) {
      const state = await extensionStorage.getReminderState();
      const snoozedUntil = new Date(
        nowMs + REMINDER_LIMITS.SNOOZE_MINUTES * 60_000,
      ).toISOString();

      await extensionStorage.setReminderState({
        ...state,
        consecutiveIgnores: 0,
        activeNotificationId: null,
        snoozedUntil,
      });

      await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
      await chrome.alarms?.create?.(ALARM_NAMES.REMINDER_SNOOZE, {
        delayInMinutes: REMINDER_LIMITS.SNOOZE_MINUTES,
      });
    }
  }

  async handleNotificationClosed(
    notificationId: string,
    _byUser?: boolean,
  ): Promise<void> {
    if (notificationId !== REMINDER_NOTIFICATION_ID) {
      return;
    }

    const state = await extensionStorage.getReminderState();
    if (state.activeNotificationId === REMINDER_NOTIFICATION_ID) {
      await extensionStorage.setReminderState({
        ...state,
        consecutiveIgnores: state.consecutiveIgnores + 1,
        activeNotificationId: null,
      });
    }
  }

  async handleWebReviewActivity(
    previousSummary: ReviewSummaryDto | null | undefined,
    nextSummary: ReviewSummaryDto,
  ): Promise<void> {
    const state = await extensionStorage.getReminderState();
    const baselineStudied =
      previousSummary !== null && previousSummary !== undefined
        ? previousSummary.studiedToday
        : state.lastStudiedToday;
    const hasStudiedMore = nextSummary.studiedToday > baselineStudied;
    const hasCompletedGoal =
      nextSummary.dueCount === 0 && nextSummary.goalReached;

    if (hasStudiedMore || hasCompletedGoal) {
      await extensionStorage.setReminderState({
        ...state,
        consecutiveIgnores: 0,
        snoozedUntil: null,
        activeNotificationId: null,
        lastStudiedToday: nextSummary.studiedToday,
      });
      await chrome.alarms?.clear?.(ALARM_NAMES.REMINDER_SNOOZE);
      await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
      return;
    }

    if (state.lastStudiedToday !== nextSummary.studiedToday) {
      await extensionStorage.setReminderState({
        ...state,
        lastStudiedToday: nextSummary.studiedToday,
      });
    }
  }

  async clearRemindersAndAlarms(): Promise<void> {
    await extensionStorage.clearReminderState();
    await chrome.alarms?.clear?.(ALARM_NAMES.DAILY_REMINDER);
    await chrome.alarms?.clear?.(ALARM_NAMES.REMINDER_SNOOZE);
    await chrome.notifications?.clear?.(REMINDER_NOTIFICATION_ID);
  }

  async clearRemindersOnLogout(): Promise<void> {
    await this.clearRemindersAndAlarms();
  }

  async openOrFocusReviewTab(): Promise<void> {
    const tabs =
      (await chrome.tabs?.query?.({ url: `${WEB_APP_URL}/*` })) ?? [];
    const targetTab = tabs.find((t) => t.url?.includes("/review")) ?? tabs[0];

    if (targetTab?.id !== undefined) {
      if (targetTab.windowId !== undefined) {
        await chrome.windows?.update?.(targetTab.windowId, { focused: true });
      }
      await chrome.tabs?.update?.(targetTab.id, {
        active: true,
        url: `${WEB_APP_URL}/review`,
      });
      return;
    }

    await chrome.tabs?.create?.({
      url: `${WEB_APP_URL}/review`,
      active: true,
    });
  }
}

export const reminderManager = new ReminderManager();
