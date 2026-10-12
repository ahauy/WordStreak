import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ExtensionApiClient } from "./api-client";
import { extensionStorage } from "../shared/storage";
import type { ReviewSummaryDto } from "@wordstreak/shared-types";

describe("ExtensionApiClient.getReviewSummary", () => {
  let apiClient: ExtensionApiClient;
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

  beforeEach(() => {
    apiClient = new ExtensionApiClient("http://localhost:3000/api");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-EDB-002: sends Authorization, X-Timezone, and If-None-Match headers and returns 200 result with ETag", async () => {
    vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({
        etag: 'W/"rev-abc"',
      }),
      json: vi.fn().mockResolvedValue({ data: mockSummary }),
    });
    (globalThis as any).fetch = mockFetch;

    const result = await (apiClient as any).getReviewSummary({
      etag: 'W/"prev-etag"',
      timezone: "Asia/Ho_Chi_Minh",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("http://localhost:3000/api/reviews/summary");
    expect(calledOptions.method).toBe("GET");
    expect(calledOptions.headers.Authorization).toBe("Bearer jwt-token-123");
    expect(calledOptions.headers["X-Timezone"]).toBe("Asia/Ho_Chi_Minh");
    expect(calledOptions.headers["If-None-Match"]).toBe('W/"prev-etag"');

    expect(result).toEqual({
      status: 200,
      summary: mockSummary,
      etag: 'W/"rev-abc"',
    });
  });

  it("TC-EDB-002: also accepts ifNoneMatch option alias and defaults timezone if omitted", async () => {
    vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-456");

    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({
        etag: 'W/"new-etag"',
      }),
      json: vi.fn().mockResolvedValue(mockSummary),
    });
    (globalThis as any).fetch = mockFetch;

    const result = await (apiClient as any).getReviewSummary({
      ifNoneMatch: 'W/"old-etag"',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, calledOptions] = mockFetch.mock.calls[0];
    expect(calledOptions.headers["If-None-Match"]).toBe('W/"old-etag"');
    expect(calledOptions.headers["X-Timezone"]).toBeDefined();
    expect(result.status).toBe(200);
    expect(result.summary).toEqual(mockSummary);
  });

  it("TC-EDB-003: handles 304 Not Modified without calling response.json()", async () => {
    vi.spyOn(extensionStorage, "getToken").mockResolvedValue("jwt-token-123");

    const jsonSpy = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      status: 304,
      ok: false,
      headers: new Headers({
        etag: 'W/"cached-etag"',
      }),
      json: jsonSpy,
    });
    (globalThis as any).fetch = mockFetch;

    const result = await (apiClient as any).getReviewSummary({
      etag: 'W/"cached-etag"',
    });

    expect(jsonSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 304,
      etag: 'W/"cached-etag"',
    });
  });

  it("TC-EDB-004: clears token, user, and review summary cache and throws UNAUTHORIZED on 401", async () => {
    vi.spyOn(extensionStorage, "getToken").mockResolvedValue("expired-token");
    const setTokenSpy = vi.spyOn(extensionStorage, "setToken").mockResolvedValue();
    const setUserSpy = vi.spyOn(extensionStorage, "setUser").mockResolvedValue();
    const setCacheSpy = vi
      .spyOn(extensionStorage as any, "setReviewSummaryCache")
      .mockResolvedValue(undefined);

    const mockFetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({ message: "Unauthorized token" }),
    });
    (globalThis as any).fetch = mockFetch;

    await expect((apiClient as any).getReviewSummary()).rejects.toThrow(
      /UNAUTHORIZED/i,
    );

    expect(setTokenSpy).toHaveBeenCalledWith(null);
    expect(setUserSpy).toHaveBeenCalledWith(null);
    expect(setCacheSpy).toHaveBeenCalledWith(null);
  });
});
