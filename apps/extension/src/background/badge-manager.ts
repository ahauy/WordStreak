import { BADGE_COLORS, ALARM_NAMES, BADGE_LIMITS } from "../shared/constants";
import { extensionStorage } from "../shared/storage";
import { apiClient } from "./api-client";
import { reminderManager } from "./reminder-manager";
import type { ReviewSummaryDto, ReviewSummaryCacheState } from "@wordstreak/shared-types";

export function formatBadgeText(
  dueCount: number,
  isAuthenticated: boolean,
): string {
  if (!isAuthenticated || dueCount <= 0) {
    return "";
  }
  if (dueCount > BADGE_LIMITS.MAX_DISPLAY_COUNT) {
    return "99+";
  }
  return String(Math.floor(dueCount));
}

export function resolveBadgeColor(streakAtRisk: boolean): string {
  return streakAtRisk ? BADGE_COLORS.AT_RISK_RED : BADGE_COLORS.NORMAL_PURPLE;
}

export function computeNextDueAlarmTime(
  nextDueAt: string | null | undefined,
  nowMs: number = Date.now(),
): number | null {
  if (!nextDueAt) {
    return null;
  }
  const nextDueMs = Date.parse(nextDueAt);
  if (
    Number.isNaN(nextDueMs) ||
    nextDueMs <= nowMs ||
    nextDueMs - nowMs >= BADGE_LIMITS.MAX_NEXT_DUE_WINDOW_MS
  ) {
    return null;
  }
  return Math.max(nowMs + BADGE_LIMITS.MIN_ALARM_DELAY_MS, nextDueMs);
}

export class BadgeManager {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlightPromise: Promise<ReviewSummaryDto | null> | null = null;
  private pendingFollowUp = false;

  async applyBadgeVisuals(
    summary: ReviewSummaryDto | null,
    isAuthenticated: boolean,
    badgeEnabled = true,
  ): Promise<void> {
    if (!badgeEnabled) {
      await chrome.action?.setBadgeText?.({ text: "" });
      return;
    }
    const text = summary ? formatBadgeText(summary.dueCount, isAuthenticated) : "";
    await chrome.action?.setBadgeText?.({ text });

    if (text !== "" && summary) {
      await chrome.action?.setBadgeBackgroundColor?.({
        color: resolveBadgeColor(summary.streakAtRisk),
      });
      try {
        await chrome.action?.setBadgeTextColor?.({
          color: BADGE_COLORS.TEXT_WHITE,
        });
      } catch {
        // Ignored for environments without setBadgeTextColor support
      }
    }
  }

  async refreshBadgeFromCache(): Promise<void> {
    const token = await extensionStorage.getToken();
    const settings = await extensionStorage.getSettings();
    const cached = await extensionStorage.getReviewSummaryCache();
    await this.applyBadgeVisuals(
      cached?.summary ?? null,
      Boolean(token),
      settings.badgeEnabled,
    );
  }

  async ensurePeriodicAlarm(): Promise<void> {
    await chrome.alarms?.create?.(ALARM_NAMES.BADGE_PERIODIC, {
      periodInMinutes: BADGE_LIMITS.PERIODIC_MINUTES,
    });
  }

  async syncNextDueAlarm(
    nextDueAt: string | null | undefined,
    nowMs: number = Date.now(),
  ): Promise<void> {
    const when = computeNextDueAlarmTime(nextDueAt, nowMs);
    if (when !== null) {
      await chrome.alarms?.create?.(ALARM_NAMES.BADGE_NEXT_DUE, { when });
    } else {
      await chrome.alarms?.clear?.(ALARM_NAMES.BADGE_NEXT_DUE);
    }
  }

  async clearAuthAndBadge(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await reminderManager.clearRemindersAndAlarms();
    await extensionStorage.clearAuth();
    await chrome.alarms?.clear?.(ALARM_NAMES.BADGE_NEXT_DUE);
    await chrome.action?.setBadgeText?.({ text: "" });
  }

  scheduleDebouncedRefresh(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.refreshBadgeNow();
    }, BADGE_LIMITS.DEBOUNCE_MS);
  }

  async refreshBadgeNow(
    options?:
      | {
          skipReminderEval?: boolean;
          /** Alias for skipReminderEval for backwards compatibility */
          skipReminderCheck?: boolean;
        }
      | boolean,
  ): Promise<ReviewSummaryDto | null> {
    const normalizedOptions =
      typeof options === "boolean"
        ? { skipReminderEval: options }
        : options;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.inFlightPromise) {
      this.pendingFollowUp = true;
      return this.inFlightPromise;
    }

    this.inFlightPromise = this.executeRefresh(normalizedOptions);
    try {
      const result = await this.inFlightPromise;
      return result;
    } finally {
      this.inFlightPromise = null;
      if (this.pendingFollowUp) {
        this.pendingFollowUp = false;
        void this.refreshBadgeNow();
      }
    }
  }

  private async handleSuccessResult(
    summary: ReviewSummaryDto,
    etag: string | null,
    previousSummary?: ReviewSummaryDto | null,
    options?: { skipReminderEval?: boolean; skipReminderCheck?: boolean },
  ): Promise<ReviewSummaryDto> {
    const cacheToStore: ReviewSummaryCacheState = {
      summary,
      etag,
      fetchedAt: new Date().toISOString(),
    };
    await extensionStorage.setReviewSummaryCache(cacheToStore);
    const settings = await extensionStorage.getSettings();
    await this.applyBadgeVisuals(summary, true, settings.badgeEnabled);
    await this.syncNextDueAlarm(summary.nextDueAt);
    await reminderManager.handleWebReviewActivity(previousSummary, summary);
    if (!options?.skipReminderEval && !options?.skipReminderCheck) {
      await reminderManager.evaluateFromSummary(summary, "PERIODIC_SYNC");
    }
    return summary;
  }

  private async handleNotModifiedResult(
    cached: ReviewSummaryCacheState,
    etag: string | null,
    options?: { skipReminderEval?: boolean; skipReminderCheck?: boolean },
  ): Promise<ReviewSummaryDto> {
    const updatedCache: ReviewSummaryCacheState = {
      ...cached,
      etag: etag ?? cached.etag,
      fetchedAt: new Date().toISOString(),
    };
    await extensionStorage.setReviewSummaryCache(updatedCache);
    const settings = await extensionStorage.getSettings();
    await this.applyBadgeVisuals(cached.summary, true, settings.badgeEnabled);
    await this.syncNextDueAlarm(cached.summary.nextDueAt);
    await reminderManager.handleWebReviewActivity(cached.summary, cached.summary);
    if (!options?.skipReminderEval && !options?.skipReminderCheck) {
      await reminderManager.evaluateFromSummary(cached.summary, "PERIODIC_SYNC");
    }
    return cached.summary;
  }

  private async handleRefreshError(
    err: unknown,
    cached: ReviewSummaryCacheState | null,
  ): Promise<ReviewSummaryDto | null> {
    const msg = String((err as any)?.message || "");
    if (msg.includes("UNAUTHORIZED") || msg.includes("401")) {
      await this.clearAuthAndBadge();
      return null;
    }

    console.warn("[BadgeManager] Transient fetch failure, retaining cached badge:", err);
    if (cached?.summary) {
      const settings = await extensionStorage.getSettings();
      await this.applyBadgeVisuals(cached.summary, true, settings.badgeEnabled);
      return cached.summary;
    }
    return null;
  }

  private async executeRefresh(options?: {
    skipReminderEval?: boolean;
    skipReminderCheck?: boolean;
  }): Promise<ReviewSummaryDto | null> {
    const token = await extensionStorage.getToken();
    if (!token) {
      await this.clearAuthAndBadge();
      return null;
    }

    const cached = await extensionStorage.getReviewSummaryCache();
    const previousSummary = cached?.summary ?? null;
    try {
      const result = await apiClient.getReviewSummary({ etag: cached?.etag });
      if (result.status === 200) {
        return await this.handleSuccessResult(
          result.summary,
          result.etag,
          previousSummary,
          options,
        );
      }
      if (result.status === 304 && cached?.summary) {
        return await this.handleNotModifiedResult(cached, result.etag, options);
      }
      return null;
    } catch (err: unknown) {
      return await this.handleRefreshError(err, cached);
    }
  }
}

export const badgeManager = new BadgeManager();
