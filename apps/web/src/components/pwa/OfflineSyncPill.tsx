import React from "react";
import { WifiOff, Loader2, CloudUpload, Check } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { useSyncQueue } from "../../hooks/useSyncQueue";

interface OfflineSyncPillProps {
  className?: string;
  userId?: string;
  compact?: boolean;
}

export const OfflineSyncPill: React.FC<OfflineSyncPillProps> = ({
  className = "",
  userId,
  compact = false,
}) => {
  const { isOnline } = useNetworkStatus();
  const { pendingCount, isSyncing, triggerSync } = useSyncQueue(userId);

  const handleClick = () => {
    if (isOnline && !isSyncing && pendingCount > 0) {
      triggerSync();
    }
  };

  if (!isOnline) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#171717] text-white border border-[#333333] shadow-xs select-none ${className}`}
        role="status"
        aria-label="Offline study mode active"
      >
        <WifiOff className="w-3.5 h-3.5 text-[#ffbd2e]" />
        <span>
          {pendingCount > 0 ? `Offline • ${pendingCount} queued` : "Offline"}
        </span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-black border border-[#e5e5e5] shadow-xs select-none ${className}`}
        role="status"
        aria-label="Synchronizing offline reviews with server"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#000000] text-white hover:bg-[#090909] transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 select-none ${className}`}
        aria-label={`Sync ${pendingCount} queued review${pendingCount > 1 ? "s" : ""}`}
      >
        <CloudUpload className="w-3.5 h-3.5 text-white" />
        <span>{`Sync (${pendingCount})`}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-[#737373] border border-[#e5e5e5] shadow-xs select-none ${className}`}
      role="status"
      aria-label="All offline reviews synced"
    >
      <Check className="w-3.5 h-3.5 text-[#27c93f]" />
      {!compact && <span>All synced</span>}
    </div>
  );
};
