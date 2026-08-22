import { describe, it, expect, beforeEach } from "vitest";
import {
  mapApiError,
  isDuplicateToast,
  resetToastDeduplication,
} from "../utils/errorMapper";

describe("API Error Code Registry & Mapper (BR-I18N-002, BR-I18N-009)", () => {
  beforeEach(() => {
    resetToastDeduplication();
  });

  describe("mapApiError with known error codes", () => {
    it("maps AUTH_INVALID_CREDENTIALS to errors:auth.invalid_credentials", () => {
      const error = {
        response: {
          data: {
            errorCode: "AUTH_INVALID_CREDENTIALS",
          },
        },
      };
      const result = mapApiError(error);
      expect(result.key).toBe("errors:auth.invalid_credentials");
      expect(result.message).toContain("Invalid email or password");
      expect(result.isDuplicate).toBe(false);
    });

    it("maps DECK_NOT_FOUND to errors:decks.not_found", () => {
      const error = {
        errorCode: "DECK_NOT_FOUND",
      };
      const result = mapApiError(error);
      expect(result.key).toBe("errors:decks.not_found");
      expect(result.message).toContain("Deck not found");
    });

    it("maps direct string error code", () => {
      const result = mapApiError("CARD_LIMIT_EXCEEDED");
      expect(result.key).toBe("errors:cards.limit_exceeded");
      expect(result.message).toContain("Card limit exceeded");
    });
  });

  describe("mapApiError with network & timeout errors", () => {
    it("maps ERR_NETWORK to network.connection_failed", () => {
      const netError = {
        code: "ERR_NETWORK",
        message: "Network Error",
      };
      const result = mapApiError(netError);
      expect(result.key).toBe("errors:network.connection_failed");
      expect(result.message).toContain("Unable to connect to server");
    });

    it("maps ECONNABORTED / timeout to network.connection_failed", () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      };
      const result = mapApiError(timeoutError);
      expect(result.key).toBe("errors:network.connection_failed");
    });
  });

  describe("mapApiError with HTTP Status fallback", () => {
    it("maps HTTP 401 to auth.unauthorized", () => {
      const err = { response: { status: 401 } };
      const result = mapApiError(err);
      expect(result.key).toBe("errors:auth.unauthorized");
    });

    it("maps HTTP 403 to auth.forbidden", () => {
      const err = { response: { status: 403 } };
      const result = mapApiError(err);
      expect(result.key).toBe("errors:auth.forbidden");
    });

    it("maps HTTP 429 to generic.rate_limited", () => {
      const err = { response: { status: 429 } };
      const result = mapApiError(err);
      expect(result.key).toBe("errors:generic.rate_limited");
    });
  });

  describe("mapApiError sanitization on unmapped / 500 exceptions", () => {
    it("suppresses Prisma database error and falls back to generic.unexpected_error", () => {
      const prismaError = {
        response: {
          status: 500,
          data: {
            message:
              "Invalid `prisma.deck.findUnique()` invocation: Table 'users' not found at /app/node_modules/...",
          },
        },
      };

      const result = mapApiError(prismaError);
      expect(result.key).toBe("errors:generic.unexpected_error");
      expect(result.message).not.toContain("prisma");
      expect(result.message).not.toContain("Table");
      expect(result.message).toContain("An unexpected error occurred");
    });
  });

  describe("Toast Rate-Limiting & Deduplication (BR-I18N-009)", () => {
    it("deduplicates identical toast keys within 2000ms window", () => {
      const key = "errors:auth.invalid_credentials";

      // 1st occurrence: allowed
      expect(isDuplicateToast(key, 2000)).toBe(false);

      // 2nd occurrence immediately after: suppressed (duplicate)
      expect(isDuplicateToast(key, 2000)).toBe(true);

      // 3rd occurrence immediately after: suppressed (duplicate)
      expect(isDuplicateToast(key, 2000)).toBe(true);
    });

    it("allows distinct toast keys independently", () => {
      const key1 = "errors:auth.invalid_credentials";
      const key2 = "errors:decks.not_found";

      expect(isDuplicateToast(key1, 2000)).toBe(false);
      expect(isDuplicateToast(key2, 2000)).toBe(false);
    });
  });
});
