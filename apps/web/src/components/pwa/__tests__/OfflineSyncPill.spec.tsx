import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OfflineSyncPill } from "../OfflineSyncPill";
import * as syncHook from "../../../hooks/useSyncQueue";
import * as netHook from "../../../hooks/useNetworkStatus";

describe("OfflineSyncPill", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-UI-001: displays online and all synced state", () => {
    vi.spyOn(netHook, "useNetworkStatus").mockReturnValue({
      isOnline: true,
      wasOffline: false,
    });
    vi.spyOn(syncHook, "useSyncQueue").mockReturnValue({
      pendingCount: 0,
      syncStatus: "SUCCESS",
      isSyncing: false,
      lastSyncedAt: new Date(),
      lastError: null,
      triggerSync: vi.fn(),
      refreshPendingCount: vi.fn(),
    });

    render(<OfflineSyncPill />);
    expect(screen.getByText(/All synced/i)).toBeInTheDocument();
  });

  it("TC-UI-002: displays offline state with pending queue count", () => {
    vi.spyOn(netHook, "useNetworkStatus").mockReturnValue({
      isOnline: false,
      wasOffline: true,
    });
    vi.spyOn(syncHook, "useSyncQueue").mockReturnValue({
      pendingCount: 5,
      syncStatus: "OFFLINE",
      isSyncing: false,
      lastSyncedAt: null,
      lastError: null,
      triggerSync: vi.fn(),
      refreshPendingCount: vi.fn(),
    });

    render(<OfflineSyncPill />);
    expect(screen.getByText(/Offline • 5 queued/i)).toBeInTheDocument();
  });

  it("TC-UI-003: displays syncing state with spinner", () => {
    vi.spyOn(netHook, "useNetworkStatus").mockReturnValue({
      isOnline: true,
      wasOffline: false,
    });
    vi.spyOn(syncHook, "useSyncQueue").mockReturnValue({
      pendingCount: 2,
      syncStatus: "SYNCING",
      isSyncing: true,
      lastSyncedAt: null,
      lastError: null,
      triggerSync: vi.fn(),
      refreshPendingCount: vi.fn(),
    });

    render(<OfflineSyncPill />);
    expect(screen.getByText(/Syncing\.\.\./i)).toBeInTheDocument();
  });

  it("TC-UI-004: clicking triggers sync when online with pending items", () => {
    const triggerSyncMock = vi.fn();
    vi.spyOn(netHook, "useNetworkStatus").mockReturnValue({
      isOnline: true,
      wasOffline: false,
    });
    vi.spyOn(syncHook, "useSyncQueue").mockReturnValue({
      pendingCount: 3,
      syncStatus: "IDLE",
      isSyncing: false,
      lastSyncedAt: null,
      lastError: null,
      triggerSync: triggerSyncMock,
      refreshPendingCount: vi.fn(),
    });

    render(<OfflineSyncPill />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(triggerSyncMock).toHaveBeenCalledTimes(1);
  });
});
