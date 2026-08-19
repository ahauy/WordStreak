import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Flame,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { UserAvatar } from "../../user-profile/components/UserAvatar";
import type { AuthUser } from "@wordstreak/shared-types";

interface DashboardNavbarProps {
  user: AuthUser | null;
  onOpenSettings: (tab?: "profile" | "avatar" | "security") => void;
  onLogout: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  user,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/8 bg-[#060e1a]/85 backdrop-blur-2xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f5a623] to-[#ffb940] flex items-center justify-center text-[#060e1a] shadow-lg shadow-[#f5a623]/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span
              className="text-2xl font-extrabold tracking-tight text-white block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WordStreak
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#f5a623]">
              Spaced Repetition
            </span>
          </div>
        </Link>

        {/* Right Nav & User Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Streak Flame Pill */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-xs font-bold shadow-sm shadow-[#f5a623]/15">
            <Flame className="w-4 h-4 fill-[#f5a623] animate-pulse" />
            <span>0 Days Streak</span>
          </div>

          {/* User Profile Pill Trigger */}
          <button
            type="button"
            onClick={() => onOpenSettings("profile")}
            className="flex items-center gap-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer text-left focus:outline-none"
            title="Cài đặt tài khoản"
          >
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              username={user?.username}
              size="sm"
              className="ring-2 ring-[#f5a623]/40"
            />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-white leading-tight">
                {user?.username || "Learner"}
              </p>
              <p className="text-[11px] text-[#94a3b8] font-medium leading-tight truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => onOpenSettings("profile")}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#cbd5e1] border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer focus:outline-none"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Cài đặt</span>
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#f87171] border border-[#ef4444]/20 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 hover:border-[#ef4444]/30 transition-all cursor-pointer focus:outline-none"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
