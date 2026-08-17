import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";
import { Button } from "../../../common/components/Button";
import { UserAvatar } from "../../user-profile/components/UserAvatar";
import { SettingsModal } from "../../user-profile/components/SettingsModal";
import {
  LogOut,
  Flame,
  BookOpen,
  Target,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  PlusCircle,
  Clock,
  TrendingUp,
  Settings as SettingsIcon,
  Sliders,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "profile" | "avatar" | "security"
  >("profile");

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const openSettings = (tab: "profile" | "avatar" | "security" = "profile") => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-mesh-glow text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block">
                WordStreak
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Spaced Repetition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => openSettings("profile")}
              className="text-right hidden sm:block group cursor-pointer focus:outline-none"
              title="Cài đặt tài khoản"
            >
              <p className="text-sm font-bold text-white group-hover:text-[#F5A623] transition-colors">
                {user?.username || "Learner"}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {user?.email}
              </p>
            </button>

            <button
              onClick={() => openSettings("avatar")}
              className="cursor-pointer group relative focus:outline-none"
              title="Đổi Avatar"
            >
              <UserAvatar
                avatarUrl={user?.avatarUrl}
                username={user?.username}
                size="md"
                className="group-hover:scale-105 transition-transform"
              />
            </button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => openSettings("profile")}
              leftIcon={<SettingsIcon className="w-4 h-4" />}
              className="hidden sm:inline-flex"
            >
              Cài đặt
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Welcome & Streak Banner */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />{" "}
                Multi-Session Active & Secured
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready for today's streak, {user?.username}? 🚀
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Your spaced repetition review session is ready. Practice now to
                reinforce short-term memory into permanent recall.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-indigo-500/30"
                leftIcon={<Zap className="w-5 h-5 fill-current" />}
              >
                Start Daily Review
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                Create Deck
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1: Current Streak */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Streak
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 fill-current" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">
              0 <span className="text-sm font-medium text-slate-400">Days</span>
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Practice today to keep it
              burning
            </p>
          </div>

          {/* Stat 2: Daily Goal (Interactive) */}
          <div
            onClick={() => openSettings("profile")}
            className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-[#F5A623]/60 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            title="Nhấn để tùy chỉnh mục tiêu hàng ngày"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#F5A623] transition-colors flex items-center gap-1.5">
                Daily Goal
                <Sliders className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">
              {user?.dailyGoal || 10}{" "}
              <span className="text-sm font-medium text-slate-400">Cards</span>
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="group-hover:underline">
                Nhấn để thay đổi mục tiêu
              </span>
            </p>
          </div>

          {/* Stat 3: Due Today */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Due Today
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">
              0{" "}
              <span className="text-sm font-medium text-slate-400">Cards</span>
            </p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              ✓ All reviews up to date!
            </p>
          </div>

          {/* Stat 4: Decks */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vocabulary Decks
              </span>
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">
              0{" "}
              <span className="text-sm font-medium text-slate-400">Decks</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Add your first vocabulary deck
            </p>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
};
