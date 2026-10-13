import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_REMINDER_STATE,
} from "./constants";
import type {
  ExtensionStorageState,
  ExtensionSettingsPayload,
  ExtensionUserSummary,
  RecentCaptureItem,
  ReviewSummaryCacheState,
  ReminderState,
} from "@wordstreak/shared-types";

const getLocalStorage = (): Storage | null => {
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
};

export const extensionStorage = {
  async getToken(): Promise<string | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      return getLocalStorage()?.getItem(STORAGE_KEYS.TOKEN) ?? null;
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.TOKEN);
    return (result[STORAGE_KEYS.TOKEN] as string) || null;
  },

  async setToken(token: string | null): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const storage = getLocalStorage();
      if (token) storage?.setItem(STORAGE_KEYS.TOKEN, token);
      else storage?.removeItem(STORAGE_KEYS.TOKEN);
      return;
    }
    if (token) {
      await chrome.storage.local.set({ [STORAGE_KEYS.TOKEN]: token });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.TOKEN);
    }
  },

  async getUser(): Promise<ExtensionUserSummary | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = getLocalStorage()?.getItem(STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.USER);
    return (result[STORAGE_KEYS.USER] as ExtensionUserSummary) || null;
  },

  async setUser(user: ExtensionUserSummary | null): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const storage = getLocalStorage();
      if (user) storage?.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else storage?.removeItem(STORAGE_KEYS.USER);
      return;
    }
    if (user) {
      await chrome.storage.local.set({ [STORAGE_KEYS.USER]: user });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.USER);
    }
  },

  async getReviewSummaryCache(): Promise<ReviewSummaryCacheState | null> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = getLocalStorage()?.getItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      return raw ? JSON.parse(raw) : null;
    }
    const result = await chrome.storage.local.get(
      STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
    );
    return (
      (result[STORAGE_KEYS.REVIEW_SUMMARY_CACHE] as ReviewSummaryCacheState) ||
      null
    );
  },

  async setReviewSummaryCache(
    cache: ReviewSummaryCacheState | null,
  ): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const storage = getLocalStorage();
      if (cache) {
        storage?.setItem(
          STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
          JSON.stringify(cache),
        );
      } else {
        storage?.removeItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      }
      return;
    }
    if (cache) {
      await chrome.storage.local.set({
        [STORAGE_KEYS.REVIEW_SUMMARY_CACHE]: cache,
      });
    } else {
      await chrome.storage.local.remove(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
    }
  },

  async clearAuth(): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const storage = getLocalStorage();
      storage?.removeItem(STORAGE_KEYS.TOKEN);
      storage?.removeItem(STORAGE_KEYS.USER);
      storage?.removeItem(STORAGE_KEYS.REVIEW_SUMMARY_CACHE);
      storage?.removeItem(STORAGE_KEYS.REMINDER_STATE);
      return;
    }
    await chrome.storage.local.remove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.REVIEW_SUMMARY_CACHE,
      STORAGE_KEYS.REMINDER_STATE,
    ]);
  },

  async getSettings(): Promise<ExtensionSettingsPayload> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = getLocalStorage()?.getItem(STORAGE_KEYS.SETTINGS);
      return raw
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
        : { ...DEFAULT_SETTINGS };
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    return result[STORAGE_KEYS.SETTINGS]
      ? {
          ...DEFAULT_SETTINGS,
          ...(result[STORAGE_KEYS.SETTINGS] as ExtensionSettingsPayload),
        }
      : { ...DEFAULT_SETTINGS };
  },

  async updateSettings(
    settings: Partial<ExtensionSettingsPayload>,
  ): Promise<ExtensionSettingsPayload> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      getLocalStorage()?.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updated),
      );
      return updated;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
    return updated;
  },

  async getRecentCaptures(): Promise<RecentCaptureItem[]> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = getLocalStorage()?.getItem(STORAGE_KEYS.RECENT_CAPTURES);
      return raw ? JSON.parse(raw) : [];
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.RECENT_CAPTURES);
    return (result[STORAGE_KEYS.RECENT_CAPTURES] as RecentCaptureItem[]) || [];
  },

  async addRecentCapture(item: RecentCaptureItem): Promise<void> {
    const list = await this.getRecentCaptures();
    const filtered = list.filter(
      (x) => x.word.toLowerCase() !== item.word.toLowerCase(),
    );
    const updated = [item, ...filtered].slice(0, 10);
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      getLocalStorage()?.setItem(
        STORAGE_KEYS.RECENT_CAPTURES,
        JSON.stringify(updated),
      );
      return;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_CAPTURES]: updated });
  },

  async getReminderState(): Promise<ReminderState> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      const raw = getLocalStorage()?.getItem(STORAGE_KEYS.REMINDER_STATE);
      return raw
        ? { ...DEFAULT_REMINDER_STATE, ...JSON.parse(raw) }
        : { ...DEFAULT_REMINDER_STATE };
    }
    const result = await chrome.storage.local.get(STORAGE_KEYS.REMINDER_STATE);
    const stored = result[STORAGE_KEYS.REMINDER_STATE] as
      | Partial<ReminderState>
      | undefined;
    return stored
      ? { ...DEFAULT_REMINDER_STATE, ...stored }
      : { ...DEFAULT_REMINDER_STATE };
  },

  async setReminderState(state: ReminderState): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      getLocalStorage()?.setItem(
        STORAGE_KEYS.REMINDER_STATE,
        JSON.stringify(state),
      );
      return;
    }
    await chrome.storage.local.set({ [STORAGE_KEYS.REMINDER_STATE]: state });
  },

  async clearReminderState(): Promise<void> {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      getLocalStorage()?.removeItem(STORAGE_KEYS.REMINDER_STATE);
      return;
    }
    await chrome.storage.local.remove(STORAGE_KEYS.REMINDER_STATE);
  },

  async resetReminderState(): Promise<ReminderState> {
    await this.clearReminderState();
    return { ...DEFAULT_REMINDER_STATE };
  },

  async getAll(): Promise<ExtensionStorageState> {
    const [
      token,
      user,
      settings,
      recentCaptures,
      reviewSummaryCache,
      reminderState,
    ] = await Promise.all([
      this.getToken(),
      this.getUser(),
      this.getSettings(),
      this.getRecentCaptures(),
      this.getReviewSummaryCache(),
      this.getReminderState(),
    ]);
    return {
      token,
      user,
      settings,
      recentCaptures,
      reviewSummaryCache,
      reminderState,
    };
  },
};
