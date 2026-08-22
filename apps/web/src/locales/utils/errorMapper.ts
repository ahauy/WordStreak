import type { ErrorCodeKey, ErrorRegistryEntry } from "../types";
import i18n from "../i18n";

/**
 * Centralized API Error Code Registry (BR-I18N-002)
 */
export const errorRegistry: Record<ErrorCodeKey, ErrorRegistryEntry> = {
  AUTH_INVALID_CREDENTIALS: {
    namespace: "errors",
    keyPath: "auth.invalid_credentials",
    fallbackMessage: "Invalid email or password.",
  },
  AUTH_EMAIL_ALREADY_EXISTS: {
    namespace: "errors",
    keyPath: "auth.email_already_exists",
    fallbackMessage: "This email is already registered.",
  },
  AUTH_UNAUTHORIZED: {
    namespace: "errors",
    keyPath: "auth.unauthorized",
    fallbackMessage: "Session expired. Please log in again.",
  },
  AUTH_FORBIDDEN: {
    namespace: "errors",
    keyPath: "auth.forbidden",
    fallbackMessage: "You do not have permission to perform this action.",
  },
  AUTH_ACCOUNT_LOCKED: {
    namespace: "errors",
    keyPath: "auth.account_locked",
    fallbackMessage: "Account is temporarily locked. Please try again later.",
  },
  AUTH_INVALID_TOKEN: {
    namespace: "errors",
    keyPath: "auth.invalid_token",
    fallbackMessage: "Invalid verification token.",
  },
  AUTH_TOKEN_EXPIRED: {
    namespace: "errors",
    keyPath: "auth.token_expired",
    fallbackMessage: "Verification token has expired.",
  },
  DECK_NOT_FOUND: {
    namespace: "errors",
    keyPath: "decks.not_found",
    fallbackMessage: "Deck not found or has been deleted.",
  },
  DECK_TITLE_REQUIRED: {
    namespace: "errors",
    keyPath: "decks.title_required",
    fallbackMessage: "Deck title is required.",
  },
  DECK_PERMISSION_DENIED: {
    namespace: "errors",
    keyPath: "decks.permission_denied",
    fallbackMessage: "You do not have permission to edit this deck.",
  },
  CARD_NOT_FOUND: {
    namespace: "errors",
    keyPath: "cards.not_found",
    fallbackMessage: "Vocabulary card not found.",
  },
  CARD_LIMIT_EXCEEDED: {
    namespace: "errors",
    keyPath: "cards.limit_exceeded",
    fallbackMessage: "Card limit exceeded for this deck.",
  },
  PRACTICE_NO_CARDS_DUE: {
    namespace: "errors",
    keyPath: "practice.no_cards_due",
    fallbackMessage: "No cards due for review at this time!",
  },
  PRACTICE_SESSION_EXPIRED: {
    namespace: "errors",
    keyPath: "practice.session_expired",
    fallbackMessage: "Practice session has expired.",
  },
  AI_GENERATION_FAILED: {
    namespace: "errors",
    keyPath: "ai.generation_failed",
    fallbackMessage: "AI service is temporarily busy. Please try again.",
  },
  AI_QUOTA_EXCEEDED: {
    namespace: "errors",
    keyPath: "ai.quota_exceeded",
    fallbackMessage: "Daily AI generation quota reached.",
  },
  AI_WORD_NOT_FOUND: {
    namespace: "errors",
    keyPath: "ai.word_not_found",
    fallbackMessage: "Unable to find definition for this word.",
  },
  RATE_LIMIT_EXCEEDED: {
    namespace: "errors",
    keyPath: "generic.rate_limited",
    fallbackMessage: "Too many requests. Please slow down.",
  },
  NETWORK_ERROR: {
    namespace: "errors",
    keyPath: "network.connection_failed",
    fallbackMessage: "Unable to connect to server. Check your connection.",
  },
  UNEXPECTED_ERROR: {
    namespace: "errors",
    keyPath: "generic.unexpected_error",
    fallbackMessage: "An unexpected error occurred. Please try again.",
  },
};

// Toast deduplication timestamp cache (BR-I18N-009)
const toastHistory = new Map<string, number>();

/**
 * Determines whether an error toast is duplicate within the deduplication window (default: 2000ms).
 */
export function isDuplicateToast(
  key: string,
  windowMs: number = 2000,
): boolean {
  const now = Date.now();
  const lastTime = toastHistory.get(key);

  if (lastTime && now - lastTime < windowMs) {
    return true;
  }

  toastHistory.set(key, now);
  return false;
}

/**
 * Resets the toast deduplication cache (useful for unit testing).
 */
export function resetToastDeduplication(): void {
  toastHistory.clear();
}

export interface MappedErrorResult {
  key: string;
  message: string;
  isDuplicate: boolean;
  code?: string;
}

/**
 * Maps any unknown API / Axios error or exception to a sanitized, localized string.
 */
interface GenericErrorObj {
  code?: string;
  errorCode?: string;
  status?: number;
  message?: string;
  response?: {
    status?: number;
    data?: {
      code?: string;
      errorCode?: string;
      message?: string;
    };
  };
}

export function mapApiError(
  error: unknown,
  t?: (key: string, options?: Record<string, unknown>) => string,
): MappedErrorResult {
  const translate =
    t ||
    ((key: string, options?: Record<string, unknown>) =>
      i18n.isInitialized
        ? (
            i18n.t as unknown as (
              k: string,
              opt?: Record<string, unknown>,
            ) => string
          )(key, options)
        : key);

  // 1. Direct string error code check
  if (typeof error === "string" && error in errorRegistry) {
    const entry = errorRegistry[error as ErrorCodeKey];
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    const message = translate(fullKey, { defaultValue: entry.fallbackMessage });
    return {
      key: fullKey,
      message,
      isDuplicate: isDuplicateToast(fullKey),
      code: error,
    };
  }

  // 2. Axios / Fetch Error inspection
  const errObj = (
    typeof error === "object" && error !== null ? error : null
  ) as GenericErrorObj | null;

  // Check network disconnection or timeout
  if (
    errObj?.code === "ERR_NETWORK" ||
    errObj?.code === "ECONNABORTED" ||
    errObj?.message?.toLowerCase().includes("network error") ||
    errObj?.message?.toLowerCase().includes("timeout")
  ) {
    const entry = errorRegistry.NETWORK_ERROR;
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    const message = translate(fullKey, { defaultValue: entry.fallbackMessage });
    return {
      key: fullKey,
      message,
      isDuplicate: isDuplicateToast(fullKey),
      code: "NETWORK_ERROR",
    };
  }

  // Check backend structured response errorCode (NestJS standard)
  const backendCode =
    errObj?.response?.data?.errorCode ||
    errObj?.response?.data?.code ||
    errObj?.errorCode ||
    errObj?.code;

  if (
    backendCode &&
    typeof backendCode === "string" &&
    backendCode in errorRegistry
  ) {
    const entry = errorRegistry[backendCode as ErrorCodeKey];
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    const message = translate(fullKey, { defaultValue: entry.fallbackMessage });
    return {
      key: fullKey,
      message,
      isDuplicate: isDuplicateToast(fullKey),
      code: backendCode,
    };
  }

  // Check HTTP Status fallback
  const status = errObj?.response?.status || errObj?.status;
  if (status === 401) {
    const entry = errorRegistry.AUTH_UNAUTHORIZED;
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    return {
      key: fullKey,
      message: translate(fullKey, { defaultValue: entry.fallbackMessage }),
      isDuplicate: isDuplicateToast(fullKey),
      code: "AUTH_UNAUTHORIZED",
    };
  }
  if (status === 403) {
    const entry = errorRegistry.AUTH_FORBIDDEN;
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    return {
      key: fullKey,
      message: translate(fullKey, { defaultValue: entry.fallbackMessage }),
      isDuplicate: isDuplicateToast(fullKey),
      code: "AUTH_FORBIDDEN",
    };
  }
  if (status === 429) {
    const entry = errorRegistry.RATE_LIMIT_EXCEEDED;
    const fullKey = `${entry.namespace}:${entry.keyPath}`;
    return {
      key: fullKey,
      message: translate(fullKey, { defaultValue: entry.fallbackMessage }),
      isDuplicate: isDuplicateToast(fullKey),
      code: "RATE_LIMIT_EXCEEDED",
    };
  }

  // Generic fallback with strict sanitization (BR-I18N-002)
  const genericEntry = errorRegistry.UNEXPECTED_ERROR;
  const genericKey = `${genericEntry.namespace}:${genericEntry.keyPath}`;
  const genericMessage = translate(genericKey, {
    defaultValue: genericEntry.fallbackMessage,
  });

  return {
    key: genericKey,
    message: genericMessage,
    isDuplicate: isDuplicateToast(genericKey),
    code: "UNEXPECTED_ERROR",
  };
}
