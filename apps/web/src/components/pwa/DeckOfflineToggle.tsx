import React, { useState, useEffect } from "react";
import { CloudDownload, Check, Loader2, Trash2 } from "lucide-react";
import { precacheManager } from "../../services/offline/precacheManager";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

interface DeckOfflineToggleProps {
  deckId: string;
  deckTitle?: string;
  cardCount?: number;
  className?: string;
  onStatusChange?: (isOffline: boolean) => void;
}

export const DeckOfflineToggle: React.FC<DeckOfflineToggleProps> = ({
  deckId,
  className = "",
  onStatusChange,
}) => {
  const { isOnline } = useNetworkStatus();
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    precacheManager
      .isDeckCached(deckId)
      .then((cached) => {
        if (!ignore) {
          setIsCached(cached);
          onStatusChange?.(cached);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsCached(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [deckId, onStatusChange]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isOnline || isLoading) return;

    try {
      setIsLoading(true);
      await precacheManager.cacheDeckForOffline(deckId);
      setIsCached(true);
      onStatusChange?.(true);
    } catch (err: unknown) {
      console.error("Failed to cache deck offline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      await precacheManager.removeDeckFromOffline(deckId);
      setIsCached(false);
      onStatusChange?.(false);
    } catch (err: unknown) {
      console.error("Failed to remove offline deck:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-[#737373] border border-[#e5e5e5] ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
        <span>Saving offline...</span>
      </div>
    );
  }

  if (isCached) {
    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered ? (
          <button
            type="button"
            onClick={handleRemove}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fff5f5] text-[#dc2626] border border-[#ff5f56]/30 hover:bg-[#ffebeb] transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${className}`}
            aria-label="Remove deck from offline storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove offline</span>
          </button>
        ) : (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-black border border-[#e5e5e5] shadow-xs select-none cursor-default ${className}`}
            role="status"
            aria-label="Available offline"
          >
            <Check className="w-3.5 h-3.5 text-[#27c93f]" />
            <span>Offline Ready</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!isOnline}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black ${
        isOnline
          ? "bg-white text-black border border-[#e5e5e5] hover:border-[#000000] hover:bg-[#fafafa]"
          : "bg-[#fafafa] text-[#a3a3a3] border border-[#e5e5e5] cursor-not-allowed"
      } ${className}`}
      aria-label="Download deck for offline study"
      title={
        isOnline
          ? "Download for offline study"
          : "Connect to internet to download"
      }
    >
      <CloudDownload className="w-3.5 h-3.5" />
      <span>Save Offline</span>
    </button>
  );
};
