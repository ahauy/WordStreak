import React, { useState, useEffect, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";
import {
  getOfflinePreference,
  setOfflinePreference,
} from "../../services/offline/offlineDatabase";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const SNOOZE_PREF_KEY = "pwa_install_snoozed_until";
export const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkSnoozeAndPrompt = async (e?: BeforeInstallPromptEvent) => {
      if (e) {
        e.preventDefault();
        setDeferredPrompt(e);
      }

      const snoozedUntil = await getOfflinePreference<number>(
        SNOOZE_PREF_KEY,
        0,
      );

      if (Date.now() < snoozedUntil) {
        setIsVisible(false);
        return;
      }

      // If app is already installed in standalone mode, don't show
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone;

      if (isStandalone) {
        setIsVisible(false);
        return;
      }

      if (isMounted) {
        setIsVisible(true);
      }
    };

    const handleBeforeInstall = (e: Event) => {
      checkSnoozeAndPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Initial snooze check
    checkSnoozeAndPrompt();

    return () => {
      isMounted = false;
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // If native prompt is not available, show manual install guidance
      alert(
        "To install WordStreak: Tap 'Share' in your browser menu and choose 'Add to Home Screen'.",
      );
      setIsVisible(false);
      return;
    }

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch {
      // User dismissed or prompt error
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleSnooze = useCallback(async () => {
    const snoozeUntil = Date.now() + SNOOZE_DURATION_MS;
    await setOfflinePreference(SNOOZE_PREF_KEY, snoozeUntil);
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="banner"
      aria-label="Install WordStreak App"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-white border border-[#e5e5e5] rounded-2xl shadow-xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-black font-display">
              Install WordStreak
            </h4>
            <p className="text-xs text-[#737373] mt-0.5 leading-snug">
              Study offline anytime with fast access and zero data usage.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSnooze}
          className="text-[#a3a3a3] hover:text-black p-1 rounded-full hover:bg-[#fafafa] transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-[#f5f5f5]">
        <button
          type="button"
          onClick={handleSnooze}
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
        >
          Snooze 7 days
        </button>
        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#090909] active:scale-[0.98] transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstalling ? "Installing..." : "Install App"}</span>
        </button>
      </div>
    </div>
  );
};
