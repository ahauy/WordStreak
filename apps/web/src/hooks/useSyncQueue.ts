import { useState, useEffect, useCallback } from "react";
import { getPendingReviews } from "../services/offline/offlineDatabase";
import { reconnectionSyncEngine } from "../services/offline/reconnectionSyncEngine";
import { useNetworkStatus } from "./useNetworkStatus";
import type { OfflineSyncStatus } from "@wordstreak/shared-types";

export function useSyncQueue(userId?: string) {
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>("IDLE");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      const items = await getPendingReviews(userId);
      setPendingCount(items.length);
    } catch {
      // IndexedDB query error handling
    }
  }, [userId]);

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus("OFFLINE");
      return;
    }

    try {
      setSyncStatus("SYNCING");
      setLastError(null);
      await reconnectionSyncEngine.syncNow(userId);
      setSyncStatus("SUCCESS");
      setLastSyncedAt(new Date());
      await refreshPendingCount();
    } catch (err: unknown) {
      setSyncStatus("ERROR");
      const msg = err instanceof Error ? err.message : "Sync failed";
      setLastError(msg);
    }
  }, [isOnline, userId, refreshPendingCount]);

  useEffect(() => {
    let ignore = false;
    getPendingReviews(userId)
      .then((items) => {
        if (!ignore) {
          setPendingCount(items.length);
        }
      })
      .catch(() => {});

    // Start reconnection engine listener
    reconnectionSyncEngine.startReconnectionListener(userId);

    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{
        status: string;
        pendingCount: number;
      }>;
      if (customEvent.detail?.status === "SYNCING") {
        setSyncStatus("SYNCING");
      }
    };

    const handleSyncCompleted = () => {
      setSyncStatus("SUCCESS");
      setLastSyncedAt(new Date());
      refreshPendingCount().catch(() => {});
    };

    const handleSyncFailed = (e: Event) => {
      const customEvent = e as CustomEvent<{ error: string }>;
      setSyncStatus("ERROR");
      setLastError(customEvent.detail?.error || "Sync failed");
      refreshPendingCount().catch(() => {});
    };

    window.addEventListener("wordstreak:sync-status", handleSyncStatus);
    window.addEventListener("wordstreak:sync-completed", handleSyncCompleted);
    window.addEventListener("wordstreak:sync-failed", handleSyncFailed);

    return () => {
      ignore = true;
      reconnectionSyncEngine.stopReconnectionListener();
      window.removeEventListener("wordstreak:sync-status", handleSyncStatus);
      window.removeEventListener(
        "wordstreak:sync-completed",
        handleSyncCompleted,
      );
      window.removeEventListener("wordstreak:sync-failed", handleSyncFailed);
    };
  }, [userId, refreshPendingCount]);

  const effectiveSyncStatus: OfflineSyncStatus = !isOnline
    ? "OFFLINE"
    : syncStatus;

  return {
    pendingCount,
    syncStatus: effectiveSyncStatus,
    isSyncing: effectiveSyncStatus === "SYNCING",
    lastSyncedAt,
    lastError,
    triggerSync,
    refreshPendingCount,
  };
}
