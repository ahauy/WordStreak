import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Layers, Home } from "lucide-react";
import { UserAvatar } from "../../user-profile/components/UserAvatar";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier } from "../config/flameTiers";
import { useAuthStore } from "../../../store/useAuthStore";
import { useStreak } from "../hooks/useStreak";
import type { AuthUser } from "@wordstreak/shared-types";

interface DashboardNavbarProps {
  user?: AuthUser | null;
  currentStreak?: number;
  flameTier?: number;
  isActiveToday?: boolean;
  onOpenSettings?: (tab?: "profile" | "avatar" | "security") => void;
  onOpenFlameNurture?: () => void;
  onLogout?: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user: propUser,
  currentStreak: propCurrentStreak,
  flameTier: propFlameTier,
  isActiveToday: propIsActiveToday,
  onOpenSettings: propOpenSettings,
  onOpenFlameNurture,
  onLogout: propLogout,
}) => {
  const { user: storeUser, logout: storeLogout } = useAuthStore();
  const hookStreak = useStreak({
    enabled: propCurrentStreak === undefined && !!storeUser,
  });
  const location = useLocation();
  const navigate = useNavigate();

  const [isInternalSettingsOpen, setIsInternalSettingsOpen] = useState(false);
  const [internalSettingsTab, setInternalSettingsTab] = useState<
    "profile" | "avatar" | "security"
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
    tab: "profile" | "avatar" | "security" = "profile",
  ) => {
    if (propOpenSettings) {
      propOpenSettings(tab);
    } else {
      setInternalSettingsTab(tab);
      setIsInternalSettingsOpen(true);
    }
  };

  const handleLogout = async () => {
    if (propLogout) {
      propLogout();
    } else {
      await storeLogout();
      navigate("/login", { replace: true });
    }
  };

  const isDashboardActive = location.pathname === "/dashboard";
  const isDecksActive = location.pathname.startsWith("/decks");

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[#e5e5e5] bg-white/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Nav links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none"
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
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-wider text-[#7e22ce] mt-0.5">
                  100% Free Spaced Repetition
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav
              className="hidden sm:flex items-center gap-1"
              aria-label="Main Navigation"
            >
              <Link
                to="/dashboard"
                aria-current={isDashboardActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none ${
                  isDashboardActive
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Tổng quan</span>
              </Link>

              <Link
                to="/decks"
                aria-current={isDecksActive ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:outline-none ${
                  isDecksActive
                    ? "bg-black text-white"
                    : "text-[#737373] hover:text-black hover:bg-[#fafafa]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Bộ từ vựng</span>
              </Link>
            </nav>
          </div>

          {/* Right Nav & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dynamic Multi-Tier Streak Flame Pill (Interactive Nuôi Lửa trigger) */}
            <button
              type="button"
              onClick={onOpenFlameNurture}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus:outline-none ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
              title="Nhấn để mở Khu Vườn Nuôi Lửa & Tiến Hóa"
              aria-label="Mở khu vườn nuôi lửa streak và tiến hóa"
            >
              <StreakFlame
                streakDays={currentStreak}
                tier={flameTier}
                size="xs"
                showEmbers={false}
                showGlow={false}
                isActiveToday={isActiveToday}
              />
              <span className="font-mono">{currentStreak} Ngày Streak</span>
              <span className="hidden md:inline-block text-[10px] opacity-75 font-normal">
                • {tierInfo.titleVi}
              </span>
            </button>

            {/* User Profile & Settings Pill Trigger */}
            <button
              type="button"
              onClick={() => handleOpenSettings("profile")}
              className="flex items-center gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#fafafa] hover:border-[#d4d4d4] transition-all cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 apple-tap-active"
              title="Cài đặt tài khoản & Mục tiêu học"
              aria-label="Cài đặt tài khoản và hồ sơ người dùng"
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#dc2626] border border-[#ff5f56]/30 bg-[#fff5f5] hover:bg-[#ffebeb] hover:border-[#ff5f56]/50 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 apple-tap-active"
              aria-label="Đăng xuất khỏi tài khoản"
              title="Đăng xuất khỏi tài khoản"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Fallback Internal Settings Modal when not controlled externally */}
      {!propOpenSettings && (
        <SettingsModal
          isOpen={isInternalSettingsOpen}
          initialTab={internalSettingsTab}
          onClose={() => setIsInternalSettingsOpen(false)}
        />
      )}
    </>
  );
};
