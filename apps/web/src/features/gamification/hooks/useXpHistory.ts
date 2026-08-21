import { useState, useEffect, useCallback } from "react";
import type {
  UserActivityLogItemDto,
  XpActionType,
  XpHistoryResponseDto,
} from "@wordstreak/shared-types";
import { xpApi } from "../api/xpApi";

interface UseXpHistoryOptions {
  initialPage?: number;
  initialLimit?: number;
  activityType?: XpActionType;
  enabled?: boolean;
}

export function useXpHistory(options: UseXpHistoryOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 20,
    activityType: initialActivityType,
    enabled = true,
  } = options;

  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [activityType, setActivityType] = useState<XpActionType | undefined>(
    initialActivityType,
  );
  const [logs, setLogs] = useState<UserActivityLogItemDto[]>([]);
  const [meta, setMeta] = useState<XpHistoryResponseDto["meta"]>({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await xpApi.getXpHistory({
        page,
        limit,
        activityType,
      });
      setLogs(response.data);
      setMeta(response.meta);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load XP history";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, page, limit, activityType]);

  useEffect(() => {
    if (!enabled) return;

    let ignore = false;
    void (async () => {
      try {
        const response = await xpApi.getXpHistory({
          page,
          limit,
          activityType,
        });
        if (!ignore) {
          setLogs(response.data);
          setMeta(response.meta);
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg =
            err instanceof Error ? err.message : "Failed to load XP history";
          setError(msg);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [enabled, page, limit, activityType]);

  const handleSetPage = useCallback((newPage: number) => {
    setIsLoading(true);
    setPage(newPage);
  }, []);

  const handleSetActivityType = useCallback(
    (newType: XpActionType | undefined) => {
      setIsLoading(true);
      setActivityType(newType);
      setPage(1); // Reset to page 1 on filter change
    },
    [],
  );

  const nextPage = useCallback(() => {
    if (page < meta.totalPages) {
      setIsLoading(true);
      setPage((prev) => prev + 1);
    }
  }, [page, meta.totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setIsLoading(true);
      setPage((prev) => prev - 1);
    }
  }, [page]);

  return {
    logs,
    meta,
    page,
    limit,
    activityType,
    isLoading,
    error,
    setPage: handleSetPage,
    setLimit,
    setActivityType: handleSetActivityType,
    nextPage,
    prevPage,
    refetch: fetchHistory,
  };
}
