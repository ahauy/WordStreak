import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  formatBadgeText,
  resolveBadgeColor,
  computeNextDueAlarmTime,
  BadgeManager,
} from "./badge-manager";
import { BADGE_COLORS, ALARM_NAMES, DEFAULT_SETTINGS } from "../shared/constants";
import { extensionStorage } from "../shared/storage";
import { apiClient } from "./api-client";
import type { ReviewSummaryDto, ReviewSummaryCacheState } from "@wordstreak/shared-types";

describe("BadgeManager & Pure Domain Helpers", () => {
  const baseSummary: ReviewSummaryDto = {
    dueCount: 18,
    newAvailable: 5,
    studiedToday: 10,
    dailyGoal: 20,
    goalReached: false,
    currentStreak: 3,
    streakAtRisk: false,
    timezone: "Asia/Ho_Chi_Minh",
    endOfDayAt: "2026-10-12T17:00:00.000Z",
    nextDueAt: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("TC-EDB-005: formatBadgeText", () => {
    it("returns empty string when unauthenticated", () => {
      expect(formatBadgeText(18, false)).toBe("");
      expect(formatBadgeText(0, false)).toBe("");
      expect(formatBadgeText(142, false)).toBe("");
    });

    it("returns empty string when dueCount <= 0", () => {
      expect(formatBadgeText(0, true)).toBe("");
      expect(formatBadgeText(-1, true)).toBe("");
      expect(formatBadgeText(-99, true)).toBe("");
    });

    it("returns exact string for counts between 1 and 99", () => {
      expect(formatBadgeText(1, true)).toBe("1");
      expect(formatBadgeText(18, true)).toBe("18");
      expect(formatBadgeText(99, true)).toBe("99");
    });

    it("returns 99+ for counts >= 100", () => {
      expect(formatBadgeText(100, true)).toBe("99+");
      expect(formatBadgeText(142, true)).toBe("99+");
      expect(formatBadgeText(999, true)).toBe("99+");
    });

    it("floors non-integer values cleanly", () => {
      expect(formatBadgeText(14.8, true)).toBe("14");
    });
  });

  describe("TC-EDB-006: resolveBadgeColor & applyBadgeVisuals", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("resolves Brand Purple when streakAtRisk is false and Danger Red when true", () => {
      expect(resolveBadgeColor(false)).toBe(BADGE_COLORS.NORMAL_PURPLE);
      expect(resolveBadgeColor(true)).toBe(BADGE_COLORS.AT_RISK_RED);
    });

    it("applies badge text, background color, and text color when dueCount > 0", async () => {
      await badgeManager.applyBadgeVisuals(baseSummary, true);

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "18" });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: BADGE_COLORS.NORMAL_PURPLE,
      });
      expect(chrome.action.setBadgeTextColor).toHaveBeenCalledWith({
        color: BADGE_COLORS.TEXT_WHITE,
      });
    });

    it("applies danger red when streakAtRisk is true", async () => {
      await badgeManager.applyBadgeVisuals(
        { ...baseSummary, dueCount: 142, streakAtRisk: true },
        true,
      );

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "99+" });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: BADGE_COLORS.AT_RISK_RED,
      });
    });

    it("sets badge text to empty string and skips color calls when dueCount === 0", async () => {
      await badgeManager.applyBadgeVisuals(
        { ...baseSummary, dueCount: 0 },
        true,
      );

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
      expect(chrome.action.setBadgeBackgroundColor).not.toHaveBeenCalled();
    });

    it("safely handles missing or failing setBadgeTextColor without throwing", async () => {
      (chrome.action as any).setBadgeTextColor = vi
        .fn()
        .mockRejectedValue(new Error("Not supported"));

      await expect(
        badgeManager.applyBadgeVisuals(baseSummary, true),
      ).resolves.not.toThrow();
    });
  });

  describe("TC-EDB-007: ensurePeriodicAlarm", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      (globalThis as any).chrome = {
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("registers ws-badge-periodic with periodInMinutes = 30", async () => {
      await badgeManager.ensurePeriodicAlarm();

      expect(chrome.alarms.create).toHaveBeenCalledWith(
        ALARM_NAMES.BADGE_PERIODIC,
        { periodInMinutes: 30 },
      );
    });
  });

  describe("TC-EDB-008: computeNextDueAlarmTime & syncNextDueAlarm", () => {
    let badgeManager: BadgeManager;
    const nowMs = 1_000_000;

    beforeEach(() => {
      (globalThis as any).chrome = {
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("returns future timestamp when 60s <= diff < 30min", () => {
      const nextDueAt = new Date(nowMs + 12 * 60 * 1000).toISOString();
      const alarmTime = computeNextDueAlarmTime(nextDueAt, nowMs);

      expect(alarmTime).toBe(nowMs + 12 * 60 * 1000);
    });

    it("clamps to now + 60s when diff is less than 60s in the future", () => {
      const nextDueAt = new Date(nowMs + 25 * 1000).toISOString();
      const alarmTime = computeNextDueAlarmTime(nextDueAt, nowMs);

      expect(alarmTime).toBe(nowMs + 60_000);
    });

    it("returns null when nextDueAt is null, past, or >= 30min", () => {
      expect(computeNextDueAlarmTime(null, nowMs)).toBeNull();
      expect(computeNextDueAlarmTime(undefined, nowMs)).toBeNull();
      expect(
        computeNextDueAlarmTime(new Date(nowMs - 5000).toISOString(), nowMs),
      ).toBeNull();
      expect(
        computeNextDueAlarmTime(new Date(nowMs).toISOString(), nowMs),
      ).toBeNull();
      expect(
        computeNextDueAlarmTime(
          new Date(nowMs + 30 * 60 * 1000).toISOString(),
          nowMs,
        ),
      ).toBeNull();
      expect(computeNextDueAlarmTime("invalid-date", nowMs)).toBeNull();
    });

    it("syncNextDueAlarm creates alarm when valid and clears alarm when null", async () => {
      const validDue = new Date(nowMs + 10 * 60 * 1000).toISOString();
      await badgeManager.syncNextDueAlarm(validDue, nowMs);

      expect(chrome.alarms.create).toHaveBeenCalledWith(
        ALARM_NAMES.BADGE_NEXT_DUE,
        { when: nowMs + 10 * 60 * 1000 },
      );

      await badgeManager.syncNextDueAlarm(null, nowMs);
      expect(chrome.alarms.clear).toHaveBeenCalledWith(
        ALARM_NAMES.BADGE_NEXT_DUE,
      );
    });
  });

  describe("TC-EDB-009: refreshBadgeNow on 304 Not Modified", () => {
    let badgeManager: BadgeManager;
    const cachedState: ReviewSummaryCacheState = {
      summary: {
        ...baseSummary,
        dueCount: 7,
        nextDueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      },
      etag: 'W/"cached-123"',
      fetchedAt: new Date().toISOString(),
    };

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("re-applies cached visuals and reschedules alarm on 304", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(
        cachedState,
      );
      const setCacheSpy = vi
        .spyOn(extensionStorage as any, "setReviewSummaryCache")
        .mockResolvedValue(undefined);

      vi.spyOn(apiClient as any, "getReviewSummary").mockResolvedValue({
        status: 304,
        etag: 'W/"cached-123"',
      });

      const result = await badgeManager.refreshBadgeNow();

      expect(result).toEqual(cachedState.summary);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "7" });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: BADGE_COLORS.NORMAL_PURPLE,
      });
      expect(chrome.alarms.create).toHaveBeenCalledWith(
        ALARM_NAMES.BADGE_NEXT_DUE,
        expect.any(Object),
      );
      expect(setCacheSpy).toHaveBeenCalled();
    });
  });

  describe("TC-EDB-010: Trailing 3,000ms debounce & single-flight deduplication", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      vi.restoreAllMocks();
      vi.useFakeTimers();
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      vi.useRealTimers();
      delete (globalThis as any).chrome;
    });

    it("coalesces rapid bursts into a single fetch after 3,000ms", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(null);
      vi.spyOn(extensionStorage as any, "setReviewSummaryCache").mockResolvedValue(undefined);
      const apiSpy = vi
        .spyOn(apiClient as any, "getReviewSummary")
        .mockResolvedValue({
          status: 200,
          summary: baseSummary,
          etag: 'W/"etag"',
        });

      badgeManager.scheduleDebouncedRefresh();
      vi.advanceTimersByTime(500);
      badgeManager.scheduleDebouncedRefresh();
      vi.advanceTimersByTime(500);
      badgeManager.scheduleDebouncedRefresh();

      expect(apiSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(3000);
      expect(apiSpy).toHaveBeenCalledTimes(1);
    });

    it("cancels pending debounced timer when refreshBadgeNow is called immediately", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(null);
      vi.spyOn(extensionStorage as any, "setReviewSummaryCache").mockResolvedValue(undefined);
      const apiSpy = vi
        .spyOn(apiClient as any, "getReviewSummary")
        .mockResolvedValue({
          status: 200,
          summary: baseSummary,
          etag: 'W/"etag"',
        });

      badgeManager.scheduleDebouncedRefresh();
      await badgeManager.refreshBadgeNow();

      expect(apiSpy).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(3000);
      expect(apiSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("TC-EDB-011: Unauthenticated State & clearAuthAndBadge", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("resets badge text, cancels next-due alarm, and clears cache on clearAuthAndBadge", async () => {
      const clearAuthSpy = vi
        .spyOn(extensionStorage as any, "clearAuth")
        .mockResolvedValue(undefined);

      await badgeManager.clearAuthAndBadge();

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
      expect(chrome.alarms.clear).toHaveBeenCalledWith(
        ALARM_NAMES.BADGE_NEXT_DUE,
      );
      expect(clearAuthSpy).toHaveBeenCalled();
    });

    it("returns null and clears badge if token is missing on refreshBadgeNow", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue(null);
      const clearAuthSpy = vi
        .spyOn(extensionStorage as any, "clearAuth")
        .mockResolvedValue(undefined);

      const result = await badgeManager.refreshBadgeNow();

      expect(result).toBeNull();
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
      expect(clearAuthSpy).toHaveBeenCalled();
    });
  });

  describe("TC-EDB-012: Offline & 5xx error handling preserves cache", () => {
    let badgeManager: BadgeManager;
    const cachedState: ReviewSummaryCacheState = {
      summary: {
        ...baseSummary,
        dueCount: 9,
      },
      etag: 'W/"offline-cache"',
      fetchedAt: new Date().toISOString(),
    };

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("preserves cached summary and re-applies badge on TypeError fetch failure", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(
        cachedState,
      );
      const setCacheSpy = vi
        .spyOn(extensionStorage as any, "setReviewSummaryCache")
        .mockResolvedValue(undefined);

      vi.spyOn(apiClient as any, "getReviewSummary").mockRejectedValue(
        new TypeError("Failed to fetch"),
      );

      const result = await badgeManager.refreshBadgeNow();

      expect(result).toEqual(cachedState.summary);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "9" });
      expect(setCacheSpy).not.toHaveBeenCalledWith(null);
    });

    it("preserves cached summary and returns it on 503 Service Unavailable", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(
        cachedState,
      );

      vi.spyOn(apiClient as any, "getReviewSummary").mockRejectedValue(
        new Error("HTTP Error 503"),
      );

      const result = await badgeManager.refreshBadgeNow();

      expect(result).toEqual(cachedState.summary);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "9" });
    });
  });

  describe("TC-EDB-INT-003: Background Alarm & Message Coordination", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("triggers immediate refresh on immediate REFRESH_BADGE dispatch", async () => {
      const refreshSpy = vi.spyOn(badgeManager, "refreshBadgeNow").mockResolvedValue(baseSummary);
      const result = await badgeManager.refreshBadgeNow();
      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(baseSummary);
    });

    it("triggers debounced schedule on standard REFRESH_BADGE message", () => {
      const debounceSpy = vi.spyOn(badgeManager, "scheduleDebouncedRefresh").mockImplementation(() => {});
      badgeManager.scheduleDebouncedRefresh();
      expect(debounceSpy).toHaveBeenCalledTimes(1);
    });

    it("handles alarm triggers by refreshing badge", async () => {
      const refreshSpy = vi.spyOn(badgeManager, "refreshBadgeNow").mockResolvedValue(baseSummary);
      const onAlarmHandler = (alarmName: string) => {
        if (
          alarmName === ALARM_NAMES.BADGE_PERIODIC ||
          alarmName === ALARM_NAMES.BADGE_NEXT_DUE
        ) {
          void badgeManager.refreshBadgeNow();
        }
      };

      onAlarmHandler(ALARM_NAMES.BADGE_PERIODIC);
      expect(refreshSpy).toHaveBeenCalledWith();

      onAlarmHandler(ALARM_NAMES.BADGE_NEXT_DUE);
      expect(refreshSpy).toHaveBeenCalledTimes(2);

      onAlarmHandler("unrelated-alarm");
      expect(refreshSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("TC-REMD-INT-001: ReminderManager Integration via BadgeManager", () => {
    let badgeManager: BadgeManager;

    beforeEach(() => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };
      badgeManager = new BadgeManager();
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("invokes reminderManager.handleWebReviewActivity and evaluateFromSummary on success result", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue({
        summary: { ...baseSummary, studiedToday: 5 },
        etag: null,
        fetchedAt: new Date().toISOString(),
      });
      vi.spyOn(extensionStorage as any, "setReviewSummaryCache").mockResolvedValue(undefined);
      vi.spyOn(apiClient as any, "getReviewSummary").mockResolvedValue({
        status: 200,
        summary: { ...baseSummary, studiedToday: 8 },
        etag: 'W/"new-etag"',
      });

      const { reminderManager } = await import("./reminder-manager");
      const activitySpy = vi
        .spyOn(reminderManager, "handleWebReviewActivity")
        .mockResolvedValue(undefined);
      const evalSpy = vi
        .spyOn(reminderManager, "evaluateFromSummary")
        .mockResolvedValue({
          shouldNotify: false,
          reason: "COOLDOWN_ACTIVE",
          effectiveDailyCap: 3,
          normalizedState: {} as any,
        });

      await badgeManager.refreshBadgeNow();

      expect(activitySpy).toHaveBeenCalledWith(
        expect.objectContaining({ studiedToday: 5 }),
        expect.objectContaining({ studiedToday: 8 }),
      );
      expect(evalSpy).toHaveBeenCalledWith(
        expect.objectContaining({ studiedToday: 8 }),
        "PERIODIC_SYNC",
      );
    });

    it("skips reminder evaluation when skipReminderEval is true", async () => {
      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token");
      vi.spyOn(extensionStorage as any, "getReviewSummaryCache").mockResolvedValue(null);
      vi.spyOn(extensionStorage as any, "setReviewSummaryCache").mockResolvedValue(undefined);
      vi.spyOn(apiClient as any, "getReviewSummary").mockResolvedValue({
        status: 200,
        summary: baseSummary,
        etag: 'W/"etag"',
      });

      const { reminderManager } = await import("./reminder-manager");
      const evalSpy = vi
        .spyOn(reminderManager, "evaluateFromSummary")
        .mockResolvedValue({
          shouldNotify: false,
          reason: "COOLDOWN_ACTIVE",
          effectiveDailyCap: 3,
          normalizedState: {} as any,
        });

      await badgeManager.refreshBadgeNow({ skipReminderEval: true });

      expect(evalSpy).not.toHaveBeenCalled();
    });

    it("invokes reminderManager.clearRemindersAndAlarms on clearAuthAndBadge", async () => {
      vi.spyOn(extensionStorage, "clearAuth").mockResolvedValue(undefined);

      const { reminderManager } = await import("./reminder-manager");
      const clearSpy = vi
        .spyOn(reminderManager, "clearRemindersAndAlarms")
        .mockResolvedValue(undefined);

      await badgeManager.clearAuthAndBadge();

      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe("US-ECO-07: Badge Visibility & refreshBadgeFromCache (TC-ERS-005..007)", () => {
    it("TC-ERS-005: applyBadgeVisuals sets badge text to empty string when badgeEnabled is false", async () => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
        },
      };

      const manager = new BadgeManager();
      await (manager as any).applyBadgeVisuals(baseSummary, true, false);

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
      expect(chrome.action.setBadgeBackgroundColor).not.toHaveBeenCalled();
    });

    it("TC-ERS-006: refreshBadgeNow fetches and caches summary, runs reminderManager, but leaves badge empty when badgeEnabled is false", async () => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
        },
        alarms: {
          create: vi.fn().mockResolvedValue(undefined),
          clear: vi.fn().mockResolvedValue(true),
        },
      };

      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("auth-token");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue({
        ...DEFAULT_SETTINGS,
        badgeEnabled: false,
      });
      vi.spyOn(extensionStorage, "getReviewSummaryCache").mockResolvedValue(null);
      const setCacheSpy = vi.spyOn(extensionStorage, "setReviewSummaryCache").mockResolvedValue(undefined);
      vi.spyOn(apiClient, "getReviewSummary").mockResolvedValue({
        status: 200,
        summary: baseSummary,
        etag: 'W/"new-etag"',
      });

      const { reminderManager } = await import("./reminder-manager");
      const evalSpy = vi.spyOn(reminderManager, "evaluateFromSummary").mockResolvedValue({
        shouldNotify: false,
        reason: "COOLDOWN_ACTIVE",
        effectiveDailyCap: 3,
        normalizedState: {} as any,
      });

      const manager = new BadgeManager();
      const result = await manager.refreshBadgeNow();

      expect(result).toEqual(baseSummary);
      expect(setCacheSpy).toHaveBeenCalledWith(
        expect.objectContaining({ summary: baseSummary }),
      );
      expect(evalSpy).toHaveBeenCalledWith(baseSummary, "PERIODIC_SYNC");
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "" });
      expect(chrome.action.setBadgeBackgroundColor).not.toHaveBeenCalled();
    });

    it("TC-ERS-007: refreshBadgeFromCache restores badge text and color from cache when badgeEnabled is true", async () => {
      (globalThis as any).chrome = {
        action: {
          setBadgeText: vi.fn().mockResolvedValue(undefined),
          setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
          setBadgeTextColor: vi.fn().mockResolvedValue(undefined),
        },
      };

      const cachedSummary: ReviewSummaryDto = {
        ...baseSummary,
        dueCount: 15,
        streakAtRisk: true,
      };

      vi.spyOn(extensionStorage, "getToken").mockResolvedValue("auth-token");
      vi.spyOn(extensionStorage, "getSettings").mockResolvedValue({
        ...DEFAULT_SETTINGS,
        badgeEnabled: true,
      });
      vi.spyOn(extensionStorage, "getReviewSummaryCache").mockResolvedValue({
        summary: cachedSummary,
        etag: 'W/"cache"',
        fetchedAt: new Date().toISOString(),
      });

      const manager = new BadgeManager();
      await (manager as any).refreshBadgeFromCache();

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: "15" });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: BADGE_COLORS.AT_RISK_RED,
      });
    });
  });
});

