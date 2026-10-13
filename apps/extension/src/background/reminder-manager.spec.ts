import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ReminderManager, reminderManager } from "./reminder-manager";
import {
  ALARM_NAMES,
  REMINDER_NOTIFICATION_ID,
  REMINDER_LIMITS,
  WEB_APP_URL,
  DEFAULT_REMINDER_STATE,
  DEFAULT_SETTINGS,
} from "../shared/constants";
import { extensionStorage } from "../shared/storage";
import type {
  ReviewSummaryDto,
  ReminderState,
  ExtensionSettingsPayload,
  ExtensionUserSummary,
} from "@wordstreak/shared-types";

describe("ReminderManager (TC-REMD-010 .. TC-REMD-016)", () => {
  const baseSummary: ReviewSummaryDto = {
    dueCount: 8,
    newAvailable: 3,
    studiedToday: 2,
    dailyGoal: 15,
    goalReached: false,
    currentStreak: 4,
    streakAtRisk: false,
    timezone: "Asia/Ho_Chi_Minh",
    endOfDayAt: "2026-10-13T17:00:00.000Z",
    nextDueAt: null,
  };

  const defaultSettings: ExtensionSettingsPayload = {
    ...DEFAULT_SETTINGS,
    remindersEnabled: true,
    dailyReminderTime: "20:00",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    streakAtRiskReminderEnabled: true,
  };

  const defaultUser: ExtensionUserSummary = {
    id: "user-123",
    email: "learner@wordstreak.com",
    username: "learner",
    preferredLanguage: "vi",
  };

  let manager: ReminderManager;

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).chrome = {
      alarms: {
        create: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn().mockResolvedValue(true),
      },
      notifications: {
        create: vi.fn().mockResolvedValue(REMINDER_NOTIFICATION_ID),
        clear: vi.fn().mockResolvedValue(true),
      },
      tabs: {
        query: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 101, url: `${WEB_APP_URL}/review` }),
        update: vi.fn().mockResolvedValue({ id: 101, active: true }),
      },
      windows: {
        update: vi.fn().mockResolvedValue({ id: 1, focused: true }),
      },
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://wordstreak/${path}`),
      },
      i18n: {
        getUILanguage: vi.fn().mockReturnValue("vi"),
      },
    };
    manager = new ReminderManager();
  });

  afterEach(() => {
    delete (globalThis as any).chrome;
  });

  describe("TC-REMD-010: ensureDailyReminderAlarm & syncDailyReminderAlarm", () => {
    it("exports singleton reminderManager instance", () => {
      expect(reminderManager).toBeInstanceOf(ReminderManager);
    });

    it("registers daily-reminder alarm with periodInMinutes: 1440 when authenticated and enabled", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);
      vi.spyOn(extensionStorage, "getReviewSummaryCache").mockResolvedValue({
        summary: baseSummary,
        etag: null,
        fetchedAt: new Date().toISOString(),
      });

      const fixedNow = new Date("2026-10-13T10:00:00.000Z").getTime();
      await manager.ensureDailyReminderAlarm(fixedNow);

      expect(chrome.alarms.create).toHaveBeenCalledWith(
        ALARM_NAMES.DAILY_REMINDER,
        expect.objectContaining({
          periodInMinutes: REMINDER_LIMITS.DAILY_PERIOD_MINUTES,
          when: expect.any(Number),
        }),
      );
    });

    it("clears daily-reminder and ws-reminder-snooze alarms when unauthenticated", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue(null);
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);

      await manager.ensureDailyReminderAlarm();

      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.DAILY_REMINDER);
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.alarms.create).not.toHaveBeenCalled();
    });

    it("clears alarms when remindersEnabled is false", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue({
        ...defaultSettings,
        remindersEnabled: false,
      });

      await manager.syncDailyReminderAlarm();

      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.DAILY_REMINDER);
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.alarms.create).not.toHaveBeenCalled();
    });
  });

  describe("TC-REMD-011: evaluateFromSummary & evaluateAndNotify", () => {
    it("creates localized OS notification and updates ReminderState when rules evaluate to notify", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);
      vi.spyOn(extensionStorage, "getUser").mockResolvedValue(defaultUser);
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue({
        ...DEFAULT_REMINDER_STATE,
        lastResetDate: "2026-10-13",
        sentTodayCount: 0,
      });
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      // Fixed 20:05 local time in Vietnam (13:05 UTC)
      const nowMs = new Date("2026-10-13T13:05:00.000Z").getTime();
      const decision = await manager.evaluateFromSummary(baseSummary, "DAILY_ALARM", nowMs);

      expect(decision.shouldNotify).toBe(true);
      expect(decision.notificationType).toBe("DUE_CARDS");
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        REMINDER_NOTIFICATION_ID,
        expect.objectContaining({
          type: "basic",
          title: "📚 Đến giờ ôn tập WordStreak!",
          message: "Bạn có 8 thẻ từ vựng đến hạn cần ôn tập hôm nay.",
          priority: 1,
          buttons: [{ title: "Học ngay" }, { title: "Để sau" }],
        }),
      );
      expect(setReminderStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sentTodayCount: 1,
          dailyReminderSentToday: true,
          activeNotificationId: REMINDER_NOTIFICATION_ID,
          snoozedUntil: null,
          lastNotifiedAt: expect.any(String),
        }),
      );
    });

    it("supports evaluateAndNotify alias reading cached summary", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);
      vi.spyOn(extensionStorage, "getUser").mockResolvedValue({ ...defaultUser, preferredLanguage: "en" });
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue({
        ...DEFAULT_REMINDER_STATE,
        lastResetDate: "2026-10-13",
      });
      vi.spyOn(extensionStorage, "getReviewSummaryCache").mockResolvedValue({
        summary: { ...baseSummary, streakAtRisk: true },
        etag: null,
        fetchedAt: new Date().toISOString(),
      });
      vi.spyOn(extensionStorage, "setReminderState").mockResolvedValue(undefined);

      const nowMs = new Date("2026-10-13T13:05:00.000Z").getTime();
      const decision = await manager.evaluateAndNotify("DAILY_ALARM", undefined, nowMs);

      expect(decision.shouldNotify).toBe(true);
      expect(decision.notificationType).toBe("STREAK_AT_RISK");
      expect(chrome.notifications.create).toHaveBeenCalledWith(
        REMINDER_NOTIFICATION_ID,
        expect.objectContaining({
          title: "🔥 Your 4-day streak is at risk!",
          buttons: [{ title: "Study Now" }, { title: "Snooze" }],
          priority: 2,
        }),
      );
    });

    it("handleAlarm routes DAILY_REMINDER and REMINDER_SNOOZE", async () => {
      const refreshSummaryFn = vi.fn().mockResolvedValue(baseSummary);
      const evalSpy = vi.spyOn(manager, "evaluateFromSummary").mockResolvedValue({
        shouldNotify: false,
        reason: "COOLDOWN_ACTIVE",
        effectiveDailyCap: 3,
        normalizedState: DEFAULT_REMINDER_STATE,
      });

      await manager.handleAlarm(ALARM_NAMES.DAILY_REMINDER, refreshSummaryFn);
      expect(refreshSummaryFn).toHaveBeenCalled();
      expect(evalSpy).toHaveBeenCalledWith(baseSummary, "DAILY_ALARM");

      await manager.handleAlarm(ALARM_NAMES.REMINDER_SNOOZE, refreshSummaryFn);
      expect(evalSpy).toHaveBeenCalledWith(baseSummary, "SNOOZE_ALARM");
    });
  });

  describe("TC-REMD-012: handleNotificationClicked & Button 0 (Study Now)", () => {
    it("ignores clicks on foreign notification IDs", async () => {
      const setReminderStateSpy = vi.spyOn(extensionStorage, "setReminderState");

      await manager.handleNotificationClicked("unrelated-id");
      await manager.handleNotificationButtonClicked("unrelated-id", 0);

      expect(setReminderStateSpy).not.toHaveBeenCalled();
      expect(chrome.notifications.clear).not.toHaveBeenCalled();
    });

    it("resets consecutiveIgnores, clears notification & snooze alarm, and focuses existing tab", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 2,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
        snoozedUntil: "2026-10-13T15:00:00.000Z",
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      (chrome.tabs.query as any).mockResolvedValue([
        { id: 42, windowId: 9, url: `${WEB_APP_URL}/dashboard` },
      ]);

      await manager.handleNotificationClicked(REMINDER_NOTIFICATION_ID);

      // Verify state was saved with reset counters BEFORE clearing
      expect(setReminderStateSpy).toHaveBeenCalledWith({
        ...initialState,
        consecutiveIgnores: 0,
        activeNotificationId: null,
        snoozedUntil: null,
      });
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.notifications.clear).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);
      expect(chrome.windows.update).toHaveBeenCalledWith(9, { focused: true });
      expect(chrome.tabs.update).toHaveBeenCalledWith(42, {
        active: true,
        url: `${WEB_APP_URL}/review`,
      });
      expect(chrome.tabs.create).not.toHaveBeenCalled();
    });

    it("creates a new review tab when no Web App tab is currently open", async () => {
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(DEFAULT_REMINDER_STATE);
      vi.spyOn(extensionStorage, "setReminderState").mockResolvedValue(undefined);
      (chrome.tabs.query as any).mockResolvedValue([]);

      await manager.handleNotificationButtonClicked(REMINDER_NOTIFICATION_ID, 0);

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: `${WEB_APP_URL}/review`,
        active: true,
      });
    });
  });

  describe("TC-REMD-013: handleNotificationButtonClicked (Button 1: Snooze)", () => {
    it("sets snoozedUntil, schedules ws-reminder-snooze alarm, and clears notification", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 2,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      const nowMs = 1_000_000;
      await manager.handleNotificationButtonClicked(REMINDER_NOTIFICATION_ID, 1, nowMs);

      const expectedSnoozeTime = new Date(nowMs + 60 * 60_000).toISOString();
      expect(setReminderStateSpy).toHaveBeenCalledWith({
        ...initialState,
        consecutiveIgnores: 0,
        activeNotificationId: null,
        snoozedUntil: expectedSnoozeTime,
      });
      expect(chrome.alarms.create).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE, {
        delayInMinutes: REMINDER_LIMITS.SNOOZE_MINUTES,
      });
      expect(chrome.notifications.clear).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);
    });

    it("prevents subsequent onClosed event from incrementing consecutiveIgnores", async () => {
      // Once button click runs, activeNotificationId is null in storage
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue({
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 0,
        activeNotificationId: null,
      });
      const setReminderStateSpy = vi.spyOn(extensionStorage, "setReminderState");

      await manager.handleNotificationClosed(REMINDER_NOTIFICATION_ID, true);

      expect(setReminderStateSpy).not.toHaveBeenCalled();
    });
  });

  describe("TC-REMD-014: handleNotificationClosed & ignore accounting", () => {
    it("increments consecutiveIgnores when notification was dismissed without clicking", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 1,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      await manager.handleNotificationClosed(REMINDER_NOTIFICATION_ID, true);

      expect(setReminderStateSpy).toHaveBeenCalledWith({
        ...initialState,
        consecutiveIgnores: 2,
        activeNotificationId: null,
      });
    });

    it("ignores closed events for unrelated notification IDs", async () => {
      const setReminderStateSpy = vi.spyOn(extensionStorage, "setReminderState");

      await manager.handleNotificationClosed("other-notification", true);

      expect(setReminderStateSpy).not.toHaveBeenCalled();
    });

    it("counts unclicked active notification as ignore before new rule evaluation on same day", async () => {
      const nowMs = new Date("2026-10-13T13:05:00.000Z").getTime();
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        lastResetDate: "2026-10-13",
        sentTodayCount: 1,
        consecutiveIgnores: 2,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
        lastNotifiedAt: new Date(nowMs - 150 * 60_000).toISOString(),
        lastStudiedToday: 2,
      };
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);
      vi.spyOn(extensionStorage, "getUser").mockResolvedValue(defaultUser);
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      const decision = await manager.evaluateFromSummary(baseSummary, "DAILY_ALARM", nowMs);

      expect(decision.shouldNotify).toBe(false);
      expect(decision.reason).toBe("DAILY_CAP_REACHED");
      expect(decision.effectiveDailyCap).toBe(1);
      expect(setReminderStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutiveIgnores: 3,
          activeNotificationId: null,
        }),
      );
    });
  });

  describe("TC-REMD-015: handleWebReviewActivity", () => {
    it("resets consecutiveIgnores and clears notification & snooze when studiedToday increases", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 3,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
        snoozedUntil: "2026-10-13T14:00:00.000Z",
        lastStudiedToday: 2,
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      const prevSummary = { ...baseSummary, studiedToday: 2 };
      const nextSummary = { ...baseSummary, studiedToday: 4 };

      await manager.handleWebReviewActivity(prevSummary, nextSummary);

      expect(setReminderStateSpy).toHaveBeenCalledWith({
        ...initialState,
        consecutiveIgnores: 0,
        snoozedUntil: null,
        activeNotificationId: null,
        lastStudiedToday: 4,
      });
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.notifications.clear).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);
    });

    it("resets consecutiveIgnores and clears notification when dueCount is 0 and goalReached", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 2,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
        snoozedUntil: "2026-10-13T14:00:00.000Z",
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      const nextSummary: ReviewSummaryDto = {
        ...baseSummary,
        dueCount: 0,
        goalReached: true,
      };

      await manager.handleWebReviewActivity(null, nextSummary);

      expect(setReminderStateSpy).toHaveBeenCalledWith({
        ...initialState,
        consecutiveIgnores: 0,
        snoozedUntil: null,
        activeNotificationId: null,
        lastStudiedToday: 2,
      });
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.notifications.clear).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);
    });

    it("does not clear notifications when study progress has not advanced", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        consecutiveIgnores: 2,
        activeNotificationId: REMINDER_NOTIFICATION_ID,
        lastStudiedToday: 2,
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi.spyOn(extensionStorage, "setReminderState");

      await manager.handleWebReviewActivity(baseSummary, baseSummary);

      expect(setReminderStateSpy).not.toHaveBeenCalled();
      expect(chrome.notifications.clear).not.toHaveBeenCalled();
    });

    it("uses state.lastStudiedToday fallback when previousSummary is null in handleWebReviewActivity", async () => {
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        lastStudiedToday: 5,
        consecutiveIgnores: 2,
      };
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi.spyOn(extensionStorage, "setReminderState");

      const nextSummary = { ...baseSummary, studiedToday: 5 };
      await manager.handleWebReviewActivity(null, nextSummary);

      expect(setReminderStateSpy).not.toHaveBeenCalled();
    });

    it("reconciles Web App study progress in evaluateFromSummary when studiedToday advances", async () => {
      const nowMs = new Date("2026-10-13T13:05:00.000Z").getTime();
      const initialState: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        lastResetDate: "2026-10-13",
        consecutiveIgnores: 3,
        lastStudiedToday: 2,
      };
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue(defaultSettings);
      vi.spyOn(extensionStorage, "getUser").mockResolvedValue(defaultUser);
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(initialState);
      const setReminderStateSpy = vi
        .spyOn(extensionStorage, "setReminderState")
        .mockResolvedValue(undefined);

      const advancedSummary = { ...baseSummary, studiedToday: 5 };
      await manager.evaluateFromSummary(advancedSummary, "PERIODIC_SYNC", nowMs);

      expect(setReminderStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutiveIgnores: 0,
          lastStudiedToday: 5,
        }),
      );
    });
  });

  describe("TC-REMD-016: clearRemindersAndAlarms & clearRemindersOnLogout", () => {
    it("clears alarms, notification, and clears reminder storage before notification clear", async () => {
      const clearStorageSpy = vi
        .spyOn(extensionStorage, "clearReminderState")
        .mockResolvedValue(undefined);
      const notifClearSpy = vi.spyOn(chrome.notifications, "clear");

      await manager.clearRemindersAndAlarms();

      expect(clearStorageSpy).toHaveBeenCalled();
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.DAILY_REMINDER);
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(notifClearSpy).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);

      const clearStorageOrder = clearStorageSpy.mock.invocationCallOrder[0];
      const notifClearOrder = notifClearSpy.mock.invocationCallOrder[0];
      expect(clearStorageOrder).toBeLessThan(notifClearOrder);

      // Verify subsequent onClosed does not increment consecutiveIgnores
      vi.spyOn(extensionStorage, "getReminderState").mockResolvedValue(DEFAULT_REMINDER_STATE);
      const setReminderSpy = vi.spyOn(extensionStorage, "setReminderState");
      await manager.handleNotificationClosed(REMINDER_NOTIFICATION_ID, true);
      expect(setReminderSpy).not.toHaveBeenCalled();
    });

    it("clearRemindersOnLogout alias works identically", async () => {
      const clearSpy = vi.spyOn(manager, "clearRemindersAndAlarms").mockResolvedValue(undefined);
      await manager.clearRemindersOnLogout();
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe("US-ECO-07: Options Page Side-Effects & Alarms (TC-ERS-008..010)", () => {
    it("TC-ERS-008: ensureDailyReminderAlarm clears alarms and active notification when remindersEnabled is false", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("tok-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue({
        ...defaultSettings,
        remindersEnabled: false,
      });

      await manager.ensureDailyReminderAlarm();

      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.DAILY_REMINDER);
      expect(chrome.alarms.clear).toHaveBeenCalledWith(ALARM_NAMES.REMINDER_SNOOZE);
      expect(chrome.notifications.clear).toHaveBeenCalledWith(REMINDER_NOTIFICATION_ID);
      expect(chrome.alarms.create).not.toHaveBeenCalled();
    });

    it("TC-ERS-009: ensureDailyReminderAlarm reschedules daily-reminder alarm at new dailyReminderTime when remindersEnabled is true", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("tok-123");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue({
        ...defaultSettings,
        remindersEnabled: true,
        dailyReminderTime: "18:45",
      });
      vi.spyOn(extensionStorage, "getReviewSummaryCache").mockResolvedValue({
        summary: baseSummary,
        etag: null,
        fetchedAt: "",
      });

      const fixedNow = new Date("2026-10-13T10:00:00.000Z").getTime();
      await manager.ensureDailyReminderAlarm(fixedNow);

      expect(chrome.alarms.create).toHaveBeenCalledWith(
        ALARM_NAMES.DAILY_REMINDER,
        expect.objectContaining({
          periodInMinutes: REMINDER_LIMITS.DAILY_PERIOD_MINUTES,
          when: expect.any(Number),
        }),
      );
    });

    it("TC-ERS-010: handleSettingsUpdated dispatches both refreshBadgeFromCache and ensureDailyReminderAlarm", async () => {
      const { badgeManager } = await import("./badge-manager");
      const refreshBadgeSpy = vi.spyOn(badgeManager, "refreshBadgeFromCache").mockResolvedValue(undefined);
      const ensureAlarmSpy = vi.spyOn(reminderManager, "ensureDailyReminderAlarm").mockResolvedValue(undefined);
      const updateStorageSpy = vi.spyOn(extensionStorage, "updateSettings").mockResolvedValue({
        ...defaultSettings,
        badgeEnabled: false,
      });

      const { handleSettingsUpdated } = await import("./index");
      const result = await handleSettingsUpdated({ badgeEnabled: false });

      expect(updateStorageSpy).toHaveBeenCalledWith({ badgeEnabled: false });
      expect(refreshBadgeSpy).toHaveBeenCalled();
      expect(ensureAlarmSpy).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ badgeEnabled: false }));
    });
  });
});
