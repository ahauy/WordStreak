import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { extensionStorage } from "./storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_REMINDER_STATE } from "./constants";
import type {
  ReviewSummaryCacheState,
  ReviewSummaryDto,
  ReminderState,
} from "@wordstreak/shared-types";

describe("extensionStorage - Review Summary Cache", () => {
  const mockSummary: ReviewSummaryDto = {
    dueCount: 18,
    newAvailable: 5,
    studiedToday: 12,
    dailyGoal: 20,
    goalReached: false,
    currentStreak: 4,
    streakAtRisk: true,
    timezone: "Asia/Ho_Chi_Minh",
    endOfDayAt: "2026-10-12T17:00:00.000Z",
    nextDueAt: "2026-10-12T09:00:00.000Z",
  };

  const mockCache: ReviewSummaryCacheState = {
    summary: mockSummary,
    etag: 'W/"hash123"',
    fetchedAt: "2026-10-12T08:00:00.000Z",
  };

  describe("TC-EDB-001: chrome.storage.local environment", () => {
    let storageMap: Record<string, any>;

    beforeEach(() => {
      storageMap = {};
      (globalThis as any).chrome = {
        storage: {
          local: {
            get: vi.fn(async (keys: string | string[]) => {
              if (typeof keys === "string") {
                return { [keys]: storageMap[keys] };
              }
              const result: Record<string, any> = {};
              for (const k of keys) {
                result[k] = storageMap[k];
              }
              return result;
            }),
            set: vi.fn(async (items: Record<string, any>) => {
              Object.assign(storageMap, items);
            }),
            remove: vi.fn(async (keys: string | string[]) => {
              const list = Array.isArray(keys) ? keys : [keys];
              for (const k of list) {
                delete storageMap[k];
              }
            }),
          },
        },
      };
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("persists review summary cache under ws_review_summary_cache key and retrieves it", async () => {
      await (extensionStorage as any).setReviewSummaryCache(mockCache);

      expect((globalThis as any).chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.REVIEW_SUMMARY_CACHE]: mockCache,
      });

      const retrieved = await (extensionStorage as any).getReviewSummaryCache();
      expect(retrieved).toEqual(mockCache);
    });

    it("returns null when review summary cache is not present", async () => {
      const retrieved = await (extensionStorage as any).getReviewSummaryCache();
      expect(retrieved).toBeNull();
    });

    it("removes cache when setReviewSummaryCache(null) is called", async () => {
      await (extensionStorage as any).setReviewSummaryCache(mockCache);
      expect(await (extensionStorage as any).getReviewSummaryCache()).toEqual(mockCache);

      await (extensionStorage as any).setReviewSummaryCache(null);
      expect((globalThis as any).chrome.storage.local.remove).toHaveBeenCalledWith(
        STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
      );
      expect(await (extensionStorage as any).getReviewSummaryCache()).toBeNull();
    });

    it("includes reviewSummaryCache in getAll() result", async () => {
      await extensionStorage.setToken("token-xyz");
      await (extensionStorage as any).setReviewSummaryCache(mockCache);

      const all = await extensionStorage.getAll();
      expect(all.token).toBe("token-xyz");
      expect((all as any).reviewSummaryCache).toEqual(mockCache);
    });

    it("clears token, user, and review summary cache when clearAuth is invoked", async () => {
      await extensionStorage.setToken("token-xyz");
      await extensionStorage.setUser({
        id: "u1",
        email: "test@ws.com",
        username: "learner",
      });
      await (extensionStorage as any).setReviewSummaryCache(mockCache);

      await (extensionStorage as any).clearAuth();

      expect(await extensionStorage.getToken()).toBeNull();
      expect(await extensionStorage.getUser()).toBeNull();
      expect(await (extensionStorage as any).getReviewSummaryCache()).toBeNull();
    });
  });

  describe("TC-EDB-001: localStorage fallback environment", () => {
    let localStore: Record<string, string>;

    beforeEach(() => {
      delete (globalThis as any).chrome;
      localStore = {};
      (globalThis as any).localStorage = {
        getItem: vi.fn((key: string) => localStore[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStore[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStore[key];
        }),
        clear: vi.fn(() => {
          localStore = {};
        }),
      };
    });

    afterEach(() => {
      delete (globalThis as any).localStorage;
    });

    it("persists and retrieves review summary cache in localStorage", async () => {
      await (extensionStorage as any).setReviewSummaryCache(mockCache);

      const raw = localStorage.getItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toEqual(mockCache);

      const retrieved = await (extensionStorage as any).getReviewSummaryCache();
      expect(retrieved).toEqual(mockCache);
    });

    it("removes cache from localStorage when setReviewSummaryCache(null) is called", async () => {
      await (extensionStorage as any).setReviewSummaryCache(mockCache);
      await (extensionStorage as any).setReviewSummaryCache(null);

      expect(localStorage.getItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE)).toBeNull();
      expect(await (extensionStorage as any).getReviewSummaryCache()).toBeNull();
    });

    it("clears auth tokens, user and cache via clearAuth in localStorage", async () => {
      await extensionStorage.setToken("token-abc");
      await extensionStorage.setUser({
        id: "u2",
        email: "user2@ws.com",
        username: "learner2",
      });
      await (extensionStorage as any).setReviewSummaryCache(mockCache);

      await (extensionStorage as any).clearAuth();

      expect(await extensionStorage.getToken()).toBeNull();
      expect(await extensionStorage.getUser()).toBeNull();
      expect(await (extensionStorage as any).getReviewSummaryCache()).toBeNull();
    });
  });
});

describe("TC-REMD-001: Reminder State & Default Settings Merge", () => {
  const sampleReminderState: ReminderState = {
    lastResetDate: "2026-10-13",
    sentTodayCount: 1,
    dailyReminderSentToday: true,
    consecutiveIgnores: 0,
    lastNotifiedAt: "2026-10-13T13:00:00.000Z",
    snoozedUntil: null,
    activeNotificationId: "ws-study-reminder",
    lastStudiedToday: 5,
  };

  describe("chrome.storage.local environment", () => {
    let storageMap: Record<string, any>;

    beforeEach(() => {
      storageMap = {};
      (globalThis as any).chrome = {
        storage: {
          local: {
            get: vi.fn(async (keys: string | string[]) => {
              if (typeof keys === "string") {
                return { [keys]: storageMap[keys] };
              }
              const result: Record<string, any> = {};
              for (const k of keys) {
                result[k] = storageMap[k];
              }
              return result;
            }),
            set: vi.fn(async (items: Record<string, any>) => {
              Object.assign(storageMap, items);
            }),
            remove: vi.fn(async (keys: string | string[]) => {
              const list = Array.isArray(keys) ? keys : [keys];
              for (const k of list) {
                delete storageMap[k];
              }
            }),
          },
        },
      };
    });

    afterEach(() => {
      delete (globalThis as any).chrome;
    });

    it("getSettings() merges DEFAULT_SETTINGS with reminder defaults when unset", async () => {
      const settings = await extensionStorage.getSettings();
      expect(settings).toEqual(expect.objectContaining(DEFAULT_SETTINGS));
      expect(settings.remindersEnabled).toBe(true);
      expect(settings.dailyReminderTime).toBe("20:00");
      expect(settings.quietHoursStart).toBe("22:00");
      expect(settings.quietHoursEnd).toBe("07:00");
      expect(settings.streakAtRiskReminderEnabled).toBe(true);
    });

    it("getReminderState() returns a fresh clone of DEFAULT_REMINDER_STATE when unset", async () => {
      const state1 = await extensionStorage.getReminderState();
      expect(state1).toEqual(DEFAULT_REMINDER_STATE);

      // Verify immutability / fresh clone
      state1.sentTodayCount = 99;
      const state2 = await extensionStorage.getReminderState();
      expect(state2.sentTodayCount).toBe(0);
      expect(state2).toEqual(DEFAULT_REMINDER_STATE);
    });

    it("setReminderState persists to STORAGE_KEYS.REMINDER_STATE and getReminderState retrieves merged state", async () => {
      await extensionStorage.setReminderState(sampleReminderState);

      expect((globalThis as any).chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.REMINDER_STATE]: sampleReminderState,
      });

      const retrieved = await extensionStorage.getReminderState();
      expect(retrieved).toEqual(sampleReminderState);
    });

    it("getReminderState merges partial stored state with DEFAULT_REMINDER_STATE", async () => {
      storageMap[STORAGE_KEYS.REMINDER_STATE] = {
        sentTodayCount: 2,
        consecutiveIgnores: 1,
      };

      const retrieved = await extensionStorage.getReminderState();
      expect(retrieved).toEqual({
        ...DEFAULT_REMINDER_STATE,
        sentTodayCount: 2,
        consecutiveIgnores: 1,
      });
    });

    it("clearReminderState and resetReminderState remove STORAGE_KEYS.REMINDER_STATE", async () => {
      await extensionStorage.setReminderState(sampleReminderState);
      expect(await extensionStorage.getReminderState()).toEqual(sampleReminderState);

      await extensionStorage.clearReminderState();
      expect((globalThis as any).chrome.storage.local.remove).toHaveBeenCalledWith(
        STORAGE_KEYS.REMINDER_STATE,
      );
      expect(await extensionStorage.getReminderState()).toEqual(DEFAULT_REMINDER_STATE);

      await extensionStorage.setReminderState(sampleReminderState);
      const resetResult = await extensionStorage.resetReminderState();
      expect(resetResult).toEqual(DEFAULT_REMINDER_STATE);
      expect(await extensionStorage.getReminderState()).toEqual(DEFAULT_REMINDER_STATE);
    });

    it("clearAuth removes TOKEN, USER, REVIEW_SUMMARY_CACHE, and REMINDER_STATE", async () => {
      await extensionStorage.setToken("tok");
      await extensionStorage.setUser({ id: "1", email: "a@b.c", username: "u" });
      await extensionStorage.setReminderState(sampleReminderState);

      await extensionStorage.clearAuth();

      expect((globalThis as any).chrome.storage.local.remove).toHaveBeenCalledWith([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
        STORAGE_KEYS.REMINDER_STATE,
      ]);
      expect(await extensionStorage.getReminderState()).toEqual(DEFAULT_REMINDER_STATE);
    });

    it("getAll includes reminderState in returned storage state", async () => {
      await extensionStorage.setReminderState(sampleReminderState);

      const all = await extensionStorage.getAll();
      expect(all.reminderState).toEqual(sampleReminderState);
    });
  });

  describe("localStorage fallback environment", () => {
    let localStore: Record<string, string>;

    beforeEach(() => {
      delete (globalThis as any).chrome;
      localStore = {};
      (globalThis as any).localStorage = {
        getItem: vi.fn((key: string) => localStore[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStore[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStore[key];
        }),
        clear: vi.fn(() => {
          localStore = {};
        }),
      };
    });

    afterEach(() => {
      delete (globalThis as any).localStorage;
    });

    it("persists and retrieves reminder state via localStorage fallback", async () => {
      await extensionStorage.setReminderState(sampleReminderState);

      const raw = localStorage.getItem(STORAGE_KEYS.REMINDER_STATE);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toEqual(sampleReminderState);

      const retrieved = await extensionStorage.getReminderState();
      expect(retrieved).toEqual(sampleReminderState);
    });

    it("clears reminder state on clearReminderState and resetReminderState in localStorage", async () => {
      await extensionStorage.setReminderState(sampleReminderState);
      await extensionStorage.clearReminderState();

      expect(localStorage.getItem(STORAGE_KEYS.REMINDER_STATE)).toBeNull();
      expect(await extensionStorage.getReminderState()).toEqual(DEFAULT_REMINDER_STATE);

      await extensionStorage.setReminderState(sampleReminderState);
      const resetResult = await extensionStorage.resetReminderState();
      expect(resetResult).toEqual(DEFAULT_REMINDER_STATE);
      expect(localStorage.getItem(STORAGE_KEYS.REMINDER_STATE)).toBeNull();
    });

    it("clears reminder state along with auth in clearAuth fallback", async () => {
      await extensionStorage.setReminderState(sampleReminderState);
      await extensionStorage.clearAuth();

      expect(localStorage.getItem(STORAGE_KEYS.REMINDER_STATE)).toBeNull();
      expect(await extensionStorage.getReminderState()).toEqual(DEFAULT_REMINDER_STATE);
    });
  });
});

