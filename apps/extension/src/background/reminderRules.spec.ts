import { describe, it, expect } from "vitest";
import {
  parseTimeToMinutes,
  getLocalDateAndMinutes,
  isWithinQuietHours,
  normalizeReminderStateForDate,
  computeNextDailyReminderTime,
  evaluateReminderRules,
  resolveReminderLanguage,
  buildReminderNotificationCopy,
} from "./reminderRules";
import {
  REMINDER_LIMITS,
  DEFAULT_REMINDER_STATE,
  DEFAULT_SETTINGS,
} from "../shared/constants";
import type {
  ReminderState,
  ReminderSettings,
  ReviewSummaryDto,
  ReminderEvaluationInput,
} from "@wordstreak/shared-types";

describe("Pure Reminder Rules Engine (reminderRules)", () => {
  describe("parseTimeToMinutes", () => {
    it("parses valid HH:mm time formats correctly", () => {
      expect(parseTimeToMinutes("00:00")).toBe(0);
      expect(parseTimeToMinutes("07:00")).toBe(420);
      expect(parseTimeToMinutes("13:45")).toBe(825);
      expect(parseTimeToMinutes("20:00")).toBe(1200);
      expect(parseTimeToMinutes("23:59")).toBe(1439);
    });

    it("falls back to fallbackMinutes or 20:00 (1200) when given malformed input", () => {
      expect(parseTimeToMinutes("")).toBe(1200);
      expect(parseTimeToMinutes("24:00")).toBe(1200);
      expect(parseTimeToMinutes("invalid", 420)).toBe(420);
      expect(parseTimeToMinutes("12:60", 600)).toBe(600);
      expect(parseTimeToMinutes("9:30", 300)).toBe(300);
    });
  });

  describe("getLocalDateAndMinutes", () => {
    it("extracts localDate and currentMinutes correctly in UTC", () => {
      // 2026-10-13T13:45:00.000Z
      const epoch = Date.UTC(2026, 9, 13, 13, 45, 0);
      const res = getLocalDateAndMinutes(epoch, "UTC");
      expect(res.localDate).toBe("2026-10-13");
      expect(res.currentMinutes).toBe(13 * 60 + 45);
    });

    it("extracts local date and minutes across positive timezone offset (Asia/Ho_Chi_Minh = UTC+7)", () => {
      // 2026-10-13T17:30:00.000Z -> 2026-10-14 00:30 in Asia/Ho_Chi_Minh
      const epoch = Date.UTC(2026, 9, 13, 17, 30, 0);
      const res = getLocalDateAndMinutes(epoch, "Asia/Ho_Chi_Minh");
      expect(res.localDate).toBe("2026-10-14");
      expect(res.currentMinutes).toBe(30);
    });

    it("safely falls back to system timezone / UTC without throwing on invalid timezone string", () => {
      const epoch = Date.UTC(2026, 9, 13, 10, 0, 0);
      expect(() => getLocalDateAndMinutes(epoch, "Invalid/Timezone")).not.toThrow();
      const res = getLocalDateAndMinutes(epoch, "Invalid/Timezone");
      expect(typeof res.localDate).toBe("string");
      expect(res.localDate.length).toBe(10);
      expect(typeof res.currentMinutes).toBe("number");
    });
  });

  describe("TC-REMD-003: isWithinQuietHours (Quiet Hours Evaluation)", () => {
    it("handles overnight wrap-around window (22:00–07:00)", () => {
      // Create UTC epochs where Asia/Ho_Chi_Minh (UTC+7) maps to test times
      // ICT 21:59 = UTC 14:59
      const t2159 = Date.UTC(2026, 9, 13, 14, 59, 0);
      // ICT 22:00 = UTC 15:00
      const t2200 = Date.UTC(2026, 9, 13, 15, 0, 0);
      // ICT 02:30 = UTC 19:30 (prev day)
      const t0230 = Date.UTC(2026, 9, 12, 19, 30, 0);
      // ICT 06:59 = UTC 23:59 (prev day)
      const t0659 = Date.UTC(2026, 9, 12, 23, 59, 0);
      // ICT 07:00 = UTC 00:00
      const t0700 = Date.UTC(2026, 9, 13, 0, 0, 0);

      expect(isWithinQuietHours(t2159, "Asia/Ho_Chi_Minh", "22:00", "07:00")).toBe(false);
      expect(isWithinQuietHours(t2200, "Asia/Ho_Chi_Minh", "22:00", "07:00")).toBe(true);
      expect(isWithinQuietHours(t0230, "Asia/Ho_Chi_Minh", "22:00", "07:00")).toBe(true);
      expect(isWithinQuietHours(t0659, "Asia/Ho_Chi_Minh", "22:00", "07:00")).toBe(true);
      expect(isWithinQuietHours(t0700, "Asia/Ho_Chi_Minh", "22:00", "07:00")).toBe(false);
    });

    it("handles same-day quiet hours window (13:00–15:00)", () => {
      // In UTC:
      const t1259 = Date.UTC(2026, 9, 13, 12, 59, 0);
      const t1300 = Date.UTC(2026, 9, 13, 13, 0, 0);
      const t1430 = Date.UTC(2026, 9, 13, 14, 30, 0);
      const t1500 = Date.UTC(2026, 9, 13, 15, 0, 0);

      expect(isWithinQuietHours(t1259, "UTC", "13:00", "15:00")).toBe(false);
      expect(isWithinQuietHours(t1300, "UTC", "13:00", "15:00")).toBe(true);
      expect(isWithinQuietHours(t1430, "UTC", "13:00", "15:00")).toBe(true);
      expect(isWithinQuietHours(t1500, "UTC", "13:00", "15:00")).toBe(false);
    });

    it("disables quiet hours when start === end (e.g. 00:00–00:00)", () => {
      const t1200 = Date.UTC(2026, 9, 13, 12, 0, 0);
      const t0000 = Date.UTC(2026, 9, 13, 0, 0, 0);

      expect(isWithinQuietHours(t1200, "UTC", "00:00", "00:00")).toBe(false);
      expect(isWithinQuietHours(t0000, "UTC", "00:00", "00:00")).toBe(false);
      expect(isWithinQuietHours(t1200, "UTC", "22:00", "22:00")).toBe(false);
    });
  });

  describe("TC-REMD-004: normalizeReminderStateForDate (Date Rollover & State Normalization)", () => {
    it("preserves state without modification when date matches lastResetDate", () => {
      const state: ReminderState = {
        lastResetDate: "2026-10-13",
        sentTodayCount: 2,
        dailyReminderSentToday: true,
        consecutiveIgnores: 1,
        lastNotifiedAt: "2026-10-13T10:00:00.000Z",
        snoozedUntil: null,
        activeNotificationId: "ws-study-reminder",
        lastStudiedToday: 3,
      };

      const normalized = normalizeReminderStateForDate(state, "2026-10-13", 5);
      expect(normalized).toEqual(state);
      expect(normalized).not.toBe(state); // Immutable copy
    });

    it("initializes lastResetDate when state has empty lastResetDate", () => {
      const state: ReminderState = {
        ...DEFAULT_REMINDER_STATE,
        lastResetDate: "",
      };

      const normalized = normalizeReminderStateForDate(state, "2026-10-13", 4);
      expect(normalized.lastResetDate).toBe("2026-10-13");
      expect(normalized.lastStudiedToday).toBe(4);
      expect(normalized.sentTodayCount).toBe(0);
    });

    it("resets sentTodayCount and dailyReminderSentToday on date rollover while preserving consecutiveIgnores and lastNotifiedAt", () => {
      const state: ReminderState = {
        lastResetDate: "2026-10-12",
        sentTodayCount: 3,
        dailyReminderSentToday: true,
        consecutiveIgnores: 2,
        lastNotifiedAt: "2026-10-12T19:00:00.000Z",
        snoozedUntil: null,
        activeNotificationId: null,
        lastStudiedToday: 10,
      };

      const normalized = normalizeReminderStateForDate(state, "2026-10-13", 0);
      expect(normalized.lastResetDate).toBe("2026-10-13");
      expect(normalized.sentTodayCount).toBe(0);
      expect(normalized.dailyReminderSentToday).toBe(false);
      expect(normalized.consecutiveIgnores).toBe(2);
      expect(normalized.lastNotifiedAt).toBe("2026-10-12T19:00:00.000Z");
      expect(normalized.activeNotificationId).toBeNull();
      expect(normalized.lastStudiedToday).toBe(0);
    });

    it("increments consecutiveIgnores when activeNotificationId was not null across date rollover (EC-REMD-04)", () => {
      const state: ReminderState = {
        lastResetDate: "2026-10-12",
        sentTodayCount: 1,
        dailyReminderSentToday: true,
        consecutiveIgnores: 1,
        lastNotifiedAt: "2026-10-12T20:00:00.000Z",
        snoozedUntil: null,
        activeNotificationId: "ws-study-reminder",
        lastStudiedToday: 2,
      };

      const normalized = normalizeReminderStateForDate(state, "2026-10-13", 0);
      expect(normalized.lastResetDate).toBe("2026-10-13");
      expect(normalized.consecutiveIgnores).toBe(2); // 1 + 1
      expect(normalized.activeNotificationId).toBeNull();
      expect(normalized.sentTodayCount).toBe(0);
      expect(normalized.dailyReminderSentToday).toBe(false);
    });
  });

  describe("TC-REMD-005: computeNextDailyReminderTime (Daily Alarm Scheduling)", () => {
    it("schedules for today when dailyReminderTime is later than current time", () => {
      // 18:30 in UTC: target 20:00 today
      const nowMs = Date.UTC(2026, 9, 13, 18, 30, 0);
      const nextTime = computeNextDailyReminderTime("20:00", nowMs, "UTC");
      const expectedTime = Date.UTC(2026, 9, 13, 20, 0, 0);

      expect(nextTime).toBe(expectedTime);
      expect(nextTime - nowMs).toBe(90 * 60 * 1000);
    });

    it("schedules for tomorrow when dailyReminderTime has already passed today", () => {
      // 20:30 in UTC: target 20:00 tomorrow
      const nowMs = Date.UTC(2026, 9, 13, 20, 30, 0);
      const nextTime = computeNextDailyReminderTime("20:00", nowMs, "UTC");
      const expectedTime = Date.UTC(2026, 9, 14, 20, 0, 0);

      expect(nextTime).toBe(expectedTime);
      expect(nextTime - nowMs).toBe((24 * 60 - 30) * 60 * 1000);
    });

    it("clamps to at least nowMs + 60_000ms when scheduled target is less than 60s away", () => {
      // 19:59:45 in UTC: target 20:00 is only 15 seconds away
      const nowMs = Date.UTC(2026, 9, 13, 19, 59, 45);
      const nextTime = computeNextDailyReminderTime("20:00", nowMs, "UTC");

      expect(nextTime).toBeGreaterThanOrEqual(nowMs + REMINDER_LIMITS.MIN_ALARM_DELAY_MS);
      expect(nextTime).toBe(nowMs + REMINDER_LIMITS.MIN_ALARM_DELAY_MS);
    });
  });

  describe("evaluateReminderRules (11-Step Pure Rule Engine)", () => {
    const baseSummary: ReviewSummaryDto = {
      dueCount: 10,
      newAvailable: 0,
      studiedToday: 2,
      dailyGoal: 10,
      goalReached: false,
      currentStreak: 5,
      streakAtRisk: false,
      nextDueAt: null,
      endOfDayAt: "2026-10-13T23:59:59.000Z",
      timezone: "UTC",
    };

    const baseSettings: ReminderSettings = {
      ...DEFAULT_SETTINGS,
      remindersEnabled: true,
      dailyReminderTime: "20:00",
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
      streakAtRiskReminderEnabled: true,
    };

    const baseState: ReminderState = {
      lastResetDate: "2026-10-13",
      sentTodayCount: 0,
      dailyReminderSentToday: false,
      consecutiveIgnores: 0,
      lastNotifiedAt: null,
      snoozedUntil: null,
      activeNotificationId: null,
      lastStudiedToday: 2,
    };

    const createInput = (overrides?: Partial<ReminderEvaluationInput>): ReminderEvaluationInput => ({
      isAuthenticated: true,
      summary: { ...baseSummary },
      settings: { ...baseSettings },
      state: { ...baseState },
      triggerSource: "DAILY_ALARM",
      now: Date.UTC(2026, 9, 13, 20, 0, 0), // 20:00 UTC
      timezone: "UTC",
      ...overrides,
    });

    it("Step 1: Suppresses when unauthenticated or summary is null", () => {
      const resUnauth = evaluateReminderRules(createInput({ isAuthenticated: false }));
      expect(resUnauth.shouldNotify).toBe(false);
      expect(resUnauth.reason).toBe("UNAUTHENTICATED");

      const resNoSummary = evaluateReminderRules(createInput({ summary: null }));
      expect(resNoSummary.shouldNotify).toBe(false);
      expect(resNoSummary.reason).toBe("UNAUTHENTICATED");
    });

    it("Step 2: Suppresses when remindersEnabled is false", () => {
      const res = evaluateReminderRules(
        createInput({
          settings: { ...baseSettings, remindersEnabled: false },
        }),
      );
      expect(res.shouldNotify).toBe(false);
      expect(res.reason).toBe("REMINDERS_DISABLED");
    });

    it("Step 3: Suppresses during quiet hours (e.g. 22:30 UTC)", () => {
      const res = evaluateReminderRules(
        createInput({
          now: Date.UTC(2026, 9, 13, 22, 30, 0),
        }),
      );
      expect(res.shouldNotify).toBe(false);
      expect(res.reason).toBe("QUIET_HOURS");
    });

    describe("TC-REMD-006: Step 4: Daily Notification Ceiling & 3-Ignore Frequency Backoff", () => {
      it("allows up to 3 notifications when consecutiveIgnores < 3", () => {
        const input2 = createInput({
          state: { ...baseState, sentTodayCount: 2, consecutiveIgnores: 2 },
        });
        const res2 = evaluateReminderRules(input2);
        expect(res2.effectiveDailyCap).toBe(3);
        expect(res2.shouldNotify).toBe(true);

        const input3 = createInput({
          state: { ...baseState, sentTodayCount: 3, consecutiveIgnores: 2 },
        });
        const res3 = evaluateReminderRules(input3);
        expect(res3.effectiveDailyCap).toBe(3);
        expect(res3.shouldNotify).toBe(false);
        expect(res3.reason).toBe("DAILY_CAP_REACHED");
      });

      it("reduces effective daily cap to 1 when consecutiveIgnores >= 3", () => {
        const input0 = createInput({
          state: { ...baseState, sentTodayCount: 0, consecutiveIgnores: 3 },
        });
        const res0 = evaluateReminderRules(input0);
        expect(res0.effectiveDailyCap).toBe(1);
        expect(res0.shouldNotify).toBe(true);

        const input1 = createInput({
          state: { ...baseState, sentTodayCount: 1, consecutiveIgnores: 3 },
        });
        const res1 = evaluateReminderRules(input1);
        expect(res1.effectiveDailyCap).toBe(1);
        expect(res1.shouldNotify).toBe(false);
        expect(res1.reason).toBe("DAILY_CAP_REACHED");
      });
    });

    describe("TC-REMD-007: Steps 5 & 6: Active Snooze & 120-Minute Cooldown", () => {
      it("Step 5: Suppresses non-snooze triggers when snoozedUntil is active in future", () => {
        const futureSnooze = new Date(Date.UTC(2026, 9, 13, 20, 30, 0)).toISOString();
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 20, 0, 0),
            state: { ...baseState, snoozedUntil: futureSnooze },
            triggerSource: "DAILY_ALARM",
          }),
        );
        expect(res.shouldNotify).toBe(false);
        expect(res.reason).toBe("SNOOZED_ACTIVE");
      });

      it("Step 6: Suppresses non-snooze triggers when last notification was sent < 120 minutes ago on same day", () => {
        const lastNotifiedAt = new Date(Date.UTC(2026, 9, 13, 19, 0, 0)).toISOString(); // 60 mins ago
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 20, 0, 0),
            state: {
              ...baseState,
              sentTodayCount: 1,
              lastNotifiedAt,
            },
            triggerSource: "DAILY_ALARM",
          }),
        );
        expect(res.shouldNotify).toBe(false);
        expect(res.reason).toBe("COOLDOWN_ACTIVE");
      });

      it("bypasses snooze and cooldown checks for SNOOZE_ALARM trigger", () => {
        const lastNotifiedAt = new Date(Date.UTC(2026, 9, 13, 19, 30, 0)).toISOString(); // 30 mins ago
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 20, 0, 0),
            state: {
              ...baseState,
              sentTodayCount: 1,
              lastNotifiedAt,
              snoozedUntil: new Date(Date.UTC(2026, 9, 13, 20, 0, 0)).toISOString(),
            },
            triggerSource: "SNOOZE_ALARM",
          }),
        );
        expect(res.shouldNotify).toBe(true);
        expect(res.reason).toBe("SNOOZE_REMINDER");
      });

      it("still suppresses SNOOZE_ALARM during quiet hours (EC-REMD-02)", () => {
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 22, 15, 0), // Inside quiet hours
            triggerSource: "SNOOZE_ALARM",
          }),
        );
        expect(res.shouldNotify).toBe(false);
        expect(res.reason).toBe("QUIET_HOURS");
      });
    });

    describe("TC-REMD-008: Steps 7–11: Study Condition, Trigger Eligibility & Priority", () => {
      it("Step 7: Suppresses when no study is needed (dueCount === 0, goalReached === true, streakAtRisk === false)", () => {
        const res = evaluateReminderRules(
          createInput({
            summary: {
              ...baseSummary,
              dueCount: 0,
              goalReached: true,
              streakAtRisk: false,
            },
          }),
        );
        expect(res.shouldNotify).toBe(false);
        expect(res.reason).toBe("NO_STUDY_NEEDED");
      });

      it("Step 9: Triggers on DAILY_ALARM and marks markDailyReminderSent: true", () => {
        const res = evaluateReminderRules(
          createInput({
            triggerSource: "DAILY_ALARM",
            summary: { ...baseSummary, dueCount: 8 },
          }),
        );
        expect(res.shouldNotify).toBe(true);
        expect(res.reason).toBe("DAILY_SCHEDULED");
        expect(res.markDailyReminderSent).toBe(true);
        expect(res.notificationType).toBe("DUE_CARDS");
      });

      it("Step 9: Triggers catch-up on PERIODIC_SYNC after dailyReminderTime if dailyReminderSentToday === false (Scenario 7, EC-REMD-01)", () => {
        // Current time: 20:40 UTC, dailyReminderTime: 20:00
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 20, 40, 0),
            triggerSource: "PERIODIC_SYNC",
            state: { ...baseState, dailyReminderSentToday: false },
            summary: { ...baseSummary, dueCount: 5 },
          }),
        );
        expect(res.shouldNotify).toBe(true);
        expect(res.reason).toBe("DAILY_SCHEDULED");
        expect(res.markDailyReminderSent).toBe(true);
        expect(res.notificationType).toBe("DUE_CARDS");
      });

      it("Step 10: Triggers on PERIODIC_SYNC when streakAtRisk === true and streakAtRiskReminderEnabled === true", () => {
        // Current time: 14:00 UTC (before dailyReminderTime)
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 14, 0, 0),
            triggerSource: "PERIODIC_SYNC",
            summary: { ...baseSummary, streakAtRisk: true, dueCount: 0, goalReached: false },
            settings: { ...baseSettings, streakAtRiskReminderEnabled: true },
          }),
        );
        expect(res.shouldNotify).toBe(true);
        expect(res.reason).toBe("STREAK_AT_RISK");
        expect(res.notificationType).toBe("STREAK_AT_RISK");
      });

      it("Step 11: Suppresses PERIODIC_SYNC before dailyReminderTime when streakAtRisk is false", () => {
        // Current time: 14:00 UTC (before 20:00)
        const res = evaluateReminderRules(
          createInput({
            now: Date.UTC(2026, 9, 13, 14, 0, 0),
            triggerSource: "PERIODIC_SYNC",
            summary: { ...baseSummary, streakAtRisk: false, dueCount: 10 },
          }),
        );
        expect(res.shouldNotify).toBe(false);
        expect(res.reason).toBe("NOT_YET_SCHEDULED_TIME");
      });

      it("Priority Order: STREAK_AT_RISK > DUE_CARDS > DAILY_GOAL", () => {
        // All 3 conditions hold: streakAtRisk + dueCount > 0 + !goalReached
        const res1 = evaluateReminderRules(
          createInput({
            summary: { ...baseSummary, streakAtRisk: true, dueCount: 15, goalReached: false },
          }),
        );
        expect(res1.notificationType).toBe("STREAK_AT_RISK");

        // streakAtRisk is false, dueCount > 0 + !goalReached
        const res2 = evaluateReminderRules(
          createInput({
            summary: { ...baseSummary, streakAtRisk: false, dueCount: 15, goalReached: false },
          }),
        );
        expect(res2.notificationType).toBe("DUE_CARDS");

        // streakAtRisk is false, dueCount === 0, but goalReached === false
        const res3 = evaluateReminderRules(
          createInput({
            summary: { ...baseSummary, streakAtRisk: false, dueCount: 0, goalReached: false },
          }),
        );
        expect(res3.notificationType).toBe("DAILY_GOAL");
      });
    });
  });

  describe("TC-REMD-009: resolveReminderLanguage & buildReminderNotificationCopy", () => {
    describe("resolveReminderLanguage", () => {
      it("prioritizes user.preferredLanguage when present", () => {
        expect(
          resolveReminderLanguage({ preferredLanguage: "en" }, { preferredLanguage: "vi" }, "vi"),
        ).toBe("en");
        expect(
          resolveReminderLanguage({ preferredLanguage: "vi" }, { preferredLanguage: "en" }, "en"),
        ).toBe("vi");
      });

      it("falls back to settings.preferredLanguage when user language is undefined", () => {
        expect(
          resolveReminderLanguage(null, { preferredLanguage: "en" }, "vi"),
        ).toBe("en");
        expect(
          resolveReminderLanguage(undefined, { preferredLanguage: "vi" }, "en-US"),
        ).toBe("vi");
      });

      it("falls back to browser UI language when user and settings are undefined", () => {
        expect(resolveReminderLanguage(null, null, "en-US")).toBe("en");
        expect(resolveReminderLanguage(null, null, "en-GB")).toBe("en");
        expect(resolveReminderLanguage(null, null, "vi-VN")).toBe("vi");
      });

      it("defaults to 'vi' for unsupported browser UI languages or undefined", () => {
        expect(resolveReminderLanguage(null, null, "fr-FR")).toBe("vi");
        expect(resolveReminderLanguage(null, null, "ja")).toBe("vi");
        expect(resolveReminderLanguage(null, null, undefined)).toBe("vi");
      });
    });

    describe("buildReminderNotificationCopy", () => {
      const summary = {
        dueCount: 12,
        currentStreak: 7,
        studiedToday: 3,
        dailyGoal: 10,
      };

      it("generates STREAK_AT_RISK copy in Vietnamese and English", () => {
        const viCopy = buildReminderNotificationCopy("STREAK_AT_RISK", summary, "vi");
        expect(viCopy.title).toBe("🔥 Chuỗi 7 ngày sắp mất!");
        expect(viCopy.message).toBe("Bạn còn 12 thẻ đến hạn. Ôn ngay để giữ chuỗi ngày học!");
        expect(viCopy.buttons).toEqual([{ title: "Học ngay" }, { title: "Để sau" }]);
        expect(viCopy.priority).toBe(2);

        const enCopy = buildReminderNotificationCopy("STREAK_AT_RISK", summary, "en");
        expect(enCopy.title).toBe("🔥 Your 7-day streak is at risk!");
        expect(enCopy.message).toBe(
          "You have 12 due cards waiting. Review now to keep your streak alive!",
        );
        expect(enCopy.buttons).toEqual([{ title: "Study Now" }, { title: "Snooze" }]);
        expect(enCopy.priority).toBe(2);

        // When dueCount is 0:
        const viZeroDue = buildReminderNotificationCopy(
          "STREAK_AT_RISK",
          { ...summary, dueCount: 0 },
          "vi",
        );
        expect(viZeroDue.message).toBe(
          "Hoàn thành phiên ôn tập hôm nay trước nửa đêm để bảo vệ chuỗi ngày học!",
        );

        const enZeroDue = buildReminderNotificationCopy(
          "STREAK_AT_RISK",
          { ...summary, dueCount: 0 },
          "en",
        );
        expect(enZeroDue.message).toBe(
          "Complete a quick review before midnight to protect your study streak!",
        );
      });

      it("generates DUE_CARDS copy in Vietnamese and English", () => {
        const viCopy = buildReminderNotificationCopy("DUE_CARDS", summary, "vi");
        expect(viCopy.title).toBe("📚 Đến giờ ôn tập WordStreak!");
        expect(viCopy.message).toBe("Bạn có 12 thẻ từ vựng đến hạn cần ôn tập hôm nay.");
        expect(viCopy.buttons).toEqual([{ title: "Học ngay" }, { title: "Để sau" }]);
        expect(viCopy.priority).toBe(1);

        const enCopy = buildReminderNotificationCopy("DUE_CARDS", summary, "en");
        expect(enCopy.title).toBe("📚 Time for your WordStreak review!");
        expect(enCopy.message).toBe(
          "You have 12 vocabulary cards due for review today.",
        );
        expect(enCopy.buttons).toEqual([{ title: "Study Now" }, { title: "Snooze" }]);
        expect(enCopy.priority).toBe(1);
      });

      it("generates DAILY_GOAL copy in Vietnamese and English", () => {
        const viCopy = buildReminderNotificationCopy("DAILY_GOAL", summary, "vi");
        expect(viCopy.title).toBe("🎯 Hoàn thành mục tiêu từ vựng hôm nay!");
        expect(viCopy.message).toBe(
          "Bạn đã học 3/10 thẻ hôm nay. Chỉ còn 7 thẻ nữa để đạt mục tiêu!",
        );
        expect(viCopy.buttons).toEqual([{ title: "Học ngay" }, { title: "Để sau" }]);
        expect(viCopy.priority).toBe(1);

        const enCopy = buildReminderNotificationCopy("DAILY_GOAL", summary, "en");
        expect(enCopy.title).toBe("🎯 Reach your daily vocabulary goal!");
        expect(enCopy.message).toBe(
          "You've studied 3/10 cards today. Just 7 more to hit your daily goal!",
        );
        expect(enCopy.buttons).toEqual([{ title: "Study Now" }, { title: "Snooze" }]);
        expect(enCopy.priority).toBe(1);
      });
    });
  });
});
