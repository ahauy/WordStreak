import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Layers, Home, BarChart2, Globe, Menu, X } from "lucide-react";
import { UserAvatar } from "../../user-profile/components/UserAvatar";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { StreakFlame } from "./StreakFlame";
import { TopbarLevelWidget } from "../../gamification/components/TopbarLevelWidget";
import { getFlameTier } from "../config/flameTiers";
import { useAuthStore } from "../../../store/useAuthStore";
import { useMascotStore } from "../../../store/useMascotStore";
import { useStreak } from "../hooks/useStreak";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { OfflineSyncPill } from "../../../components/pwa/OfflineSyncPill";
import { LogoutWarningModal } from "../../../components/pwa/LogoutWarningModal";
import { useSyncQueue } from "../../../hooks/useSyncQueue";
import { purgeOfflineDatabase } from "../../../services/offline/offlineDatabase";
import type { AuthUser } from "@wordstreak/shared-types";

interface DashboardNavbarProps {
  user?: AuthUser | null;
  currentStreak?: number;
  flameTier?: number;
  isActiveToday?: boolean;
  onOpenSettings?: (
    tab?: "profile" | "avatar" | "security" | "gamification",
  ) => void;
  onOpenFlameNurture?: () => void;
  onOpenXpHistory?: () => void;
  onLogout?: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user: propUser,
  currentStreak: propCurrentStreak,
  flameTier: propFlameTier,
  isActiveToday: propIsActiveToday,
  onOpenSettings: propOpenSettings,
  onOpenFlameNurture,
  onOpenXpHistory: propOpenXpHistory,
  onLogout: propLogout,
}) => {
  const { t } = useTranslation(["common", "dashboard", "settings"]);
  const { user: storeUser, logout: storeLogout } = useAuthStore();
  const hookStreak = useStreak({
    enabled: propCurrentStreak === undefined && !!storeUser,
  });
  const location = useLocation();
  const navigate = useNavigate();

  const { pendingCount, triggerSync } = useSyncQueue(storeUser?.id);
  const [isLogoutWarningOpen, setIsLogoutWarningOpen] = useState(false);
  const [isInternalSettingsOpen, setIsInternalSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [internalSettingsTab, setInternalSettingsTab] = useState<
    "profile" | "avatar" | "security" | "gamification"
  >("profile");

  const user = propUser !== undefined ? propUser : storeUser;
  const currentStreak =
    propCurrentStreak !== undefined
      ? propCurrentStreak
      : hookStreak.currentStreak;
  const flameTier =
    propFlameTier !== undefined ? propFlameTier : hookStreak.flameTier;
  const isActiveToday =
    propIsActiveToday !== undefined
      ? propIsActiveToday
      : hookStreak.isActiveToday;
  const tierInfo = getFlameTier(currentStreak);

  const handleOpenSettings = (
    tab: "profile" | "avatar" | "security" | "gamification" = "profile",
  ) => {
    if (propOpenSettings) {
      propOpenSettings(tab);
    } else {
      setInternalSettingsTab(tab);
      setIsInternalSettingsOpen(true);
    }
  };

  const confirmLogout = async () => {
    try {
      await purgeOfflineDatabase();
    } catch {
      // Best effort purge
    }
    if (propLogout) {
      propLogout();
    } else {
      await storeLogout();
      navigate("/login", { replace: true });
    }
  };

  const handleLogout = async () => {
    if (pendingCount > 0) {
      setIsLogoutWarningOpen(true);
    } else {
      await confirmLogout();
    }
  };

  const isDashboardActive = location.pathname === "/dashboard";
  const isDecksActive = location.pathname.startsWith("/decks");

  // Close the mobile menu whenever the route changes (BR-MOBILE-002/003)
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsMobileMenuOpen(false);
  }

  const mobileNavLinkClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
      isActive
        ? "bg-black text-white"
        : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[#e5e5e5] bg-white/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Nav links */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8 shrink-0">
            {/* Mobile Hamburger Toggle (< sm) — BR-MOBILE-002 */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              aria-label={
                isMobileMenuOpen
                  ? t("actions.closeMenu", "Close menu")
                  : t("actions.openMenu", "Open menu")
              }
              className="sm:hidden w-9 h-9 rounded-full border border-[#e5e5e5] bg-white flex items-center justify-center text-black cursor-pointer hover:bg-[#fafafa] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 shrink-0 apple-tap-active"
            >
              {isMobileMenuOpen ? (
                <X className="w-[18px] h-[18px]" />
              ) : (
                <Menu className="w-[18px] h-[18px]" />
              )}
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
            >
              <StreakFlame
                streakDays={currentStreak}
                tier={flameTier}
                size="sm"
                showEmbers={false}
                isActiveToday={isActiveToday}
              />
              <div>
                <span
                  className="text-lg font-extrabold tracking-tight text-black block leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  WordStreak
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-wider text-[#7e22ce] mt-0.5 whitespace-nowrap">
                  {t("brand.tagline", "100% Free Spaced Repetition")}
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav
              className="hidden sm:flex items-center gap-1 shrink-0"
              aria-label="Main Navigation"
            >
              <Link
                to="/dashboard"
                aria-current={isDashboardActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none whitespace-nowrap shrink-0 ${
                  isDashboardActive
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t("nav.dashboard", "Overview")}</span>
              </Link>

              <Link
                to="/decks"
                aria-current={isDecksActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none whitespace-nowrap shrink-0 ${
                  isDecksActive
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t("nav.decks", "Decks")}</span>
              </Link>

              <Link
                to="/community"
                aria-current={
                  location.pathname.startsWith("/community")
                    ? "page"
                    : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none whitespace-nowrap shrink-0 ${
                  location.pathname.startsWith("/community")
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t("nav.community", "Explore")}</span>
              </Link>

              <Link
                to="/analytics"
                aria-current={
                  location.pathname === "/analytics" ? "page" : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none whitespace-nowrap shrink-0 ${
                  location.pathname === "/analytics"
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{t("nav.analytics", "Analytics")}</span>
              </Link>
            </nav>
          </div>

          {/* Right Nav & User Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Learner Level & XP Widget */}
            <TopbarLevelWidget
              onOpenHistory={() => {
                if (propOpenSettings) {
                  propOpenSettings("gamification");
                } else if (propOpenXpHistory) {
                  propOpenXpHistory();
                } else {
                  handleOpenSettings("gamification");
                }
              }}
            />

            {/* Dynamic Multi-Tier Streak Flame Pill (Interactive Nuôi Lửa trigger) */}
            <button
              type="button"
              onClick={
                onOpenFlameNurture ||
                (() => useMascotStore.getState().openFlameNurture())
              }
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus:outline-none whitespace-nowrap shrink-0 ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
              title={t("dashboard:flame.nurtureGarden", "Flame Nurture Garden")}
              aria-label={t(
                "dashboard:flame.nurtureGarden",
                "Flame Nurture Garden",
              )}
            >
              <StreakFlame
                streakDays={currentStreak}
                tier={flameTier}
                size="xs"
                showEmbers={false}
                showGlow={false}
                isActiveToday={isActiveToday}
              />
              <span className="font-mono">
                {t("dashboard:streak.daysStreak", {
                  count: currentStreak,
                  defaultValue: `${currentStreak} Day Streak`,
                })}
              </span>
            </button>

            {/* Offline Sync State Pill */}
            <div className="hidden sm:flex">
              <OfflineSyncPill userId={storeUser?.id} />
            </div>

            {/* Language Switcher Secondary Utility Pill */}
            <div className="hidden sm:flex">
              <LanguageSwitcher />
            </div>

            {/* User Profile & Settings Pill Trigger */}
            <button
              type="button"
              onClick={() => handleOpenSettings("profile")}
              className="flex items-center gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] hover:border-[#d4d4d4] transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 apple-tap-active whitespace-nowrap shrink-0"
              title={t("settings:title", "Account Settings")}
              aria-label={t("settings:title", "Account Settings")}
            >
              <UserAvatar
                avatarUrl={user?.avatarUrl}
                username={user?.username}
                size="sm"
                className="ring-1 ring-[#e5e5e5]"
              />
              <span className="hidden md:inline-block text-xs font-bold text-black pr-1 truncate max-w-[100px]">
                {user?.username || "Learner"}
              </span>
            </button>

            {/* Icon-Only Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#dc2626] border border-[#ff5f56]/30 bg-[#fff5f5] hover:bg-[#ffebeb] hover:border-[#ff5f56]/50 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 apple-tap-active shrink-0"
              aria-label={t("actions.signOut", "Sign Out")}
              title={t("actions.signOut", "Sign Out")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (< sm) — BR-MOBILE-003 */}
        {isMobileMenuOpen && (
          <nav
            id="mobile-nav-menu"
            aria-label="Main Navigation"
            className="sm:hidden absolute inset-x-0 top-full border-b border-[#e5e5e5] bg-white/95 backdrop-blur-md shadow-lg px-3 py-3 flex flex-col gap-1"
          >
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isDashboardActive ? "page" : undefined}
              className={mobileNavLinkClass(isDashboardActive)}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>{t("nav.dashboard", "Overview")}</span>
            </Link>

            <Link
              to="/decks"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isDecksActive ? "page" : undefined}
              className={mobileNavLinkClass(isDecksActive)}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>{t("nav.decks", "Decks")}</span>
            </Link>

            <Link
              to="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={
                location.pathname.startsWith("/community")
                  ? "page"
                  : undefined
              }
              className={mobileNavLinkClass(
                location.pathname.startsWith("/community"),
              )}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>{t("nav.community", "Explore")}</span>
            </Link>

            <Link
              to="/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={
                location.pathname === "/analytics" ? "page" : undefined
              }
              className={mobileNavLinkClass(location.pathname === "/analytics")}
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              <span>{t("nav.analytics", "Analytics")}</span>
            </Link>
          </nav>
        )}
      </header>

      {/* Fallback Internal Settings Modal when not controlled externally */}
      {!propOpenSettings && (
        <SettingsModal
          isOpen={isInternalSettingsOpen}
          initialTab={internalSettingsTab}
          onClose={() => setIsInternalSettingsOpen(false)}
        />
      )}

      {/* Logout Warning Modal for Unsynced Offline Reviews */}
      <LogoutWarningModal
        isOpen={isLogoutWarningOpen}
        unsyncedCount={pendingCount}
        onClose={() => setIsLogoutWarningOpen(false)}
        onConfirmLogout={confirmLogout}
        onSyncAndLogout={triggerSync}
      />
    </>
  );
};
