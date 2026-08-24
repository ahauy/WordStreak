import React, { useState } from "react";
import { AlertTriangle, CloudUpload, LogOut, Loader2 } from "lucide-react";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

interface LogoutWarningModalProps {
  isOpen: boolean;
  unsyncedCount: number;
  onClose: () => void;
  onConfirmLogout: () => void;
  onSyncAndLogout: () => Promise<void>;
}

export const LogoutWarningModal: React.FC<LogoutWarningModalProps> = ({
  isOpen,
  unsyncedCount,
  onClose,
  onConfirmLogout,
  onSyncAndLogout,
}) => {
  const { isOnline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSyncAndLogout = async () => {
    try {
      setIsSyncing(true);
      await onSyncAndLogout();
    } catch {
      // Sync failure handled in sync engine
    } finally {
      setIsSyncing(false);
      onConfirmLogout();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-warning-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#e5e5e5] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-full bg-[#fff5f5] border border-[#ff5f56]/30 flex items-center justify-center text-[#ff5f56] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="logout-warning-title"
              className="text-base font-extrabold text-black font-display"
            >
              Unsynced Offline Reviews
            </h3>
            <p className="text-xs text-[#737373] mt-0.5">
              You have {unsyncedCount} review{unsyncedCount > 1 ? "s" : ""}{" "}
              waiting to sync.
            </p>
          </div>
        </div>

        <p className="text-sm text-[#525252] leading-relaxed mb-6">
          Logging out will clear your offline cache. If you log out without
          syncing, your offline study progress and streak updates may be lost.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSyncing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirmLogout}
            disabled={isSyncing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-semibold text-[#dc2626] border border-[#ff5f56]/30 bg-[#fff5f5] hover:bg-[#ffebeb] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Anyway</span>
          </button>

          {isOnline && (
            <button
              type="button"
              onClick={handleSyncAndLogout}
              disabled={isSyncing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#090909] active:scale-[0.98] transition-all cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-3.5 h-3.5" />
                  <span>Sync & Log Out</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
