import React from "react";
import {
  Flame,
  Target,
  BookOpen,
  Layers,
  Clock,
  TrendingUp,
  Sliders,
  Sparkles,
  Shield,
} from "lucide-react";

interface DashboardStatsGridProps {
  currentStreak?: number;
  longestStreak?: number;
  dailyGoal?: number;
  cardsDueToday?: number;
  totalDecks?: number;
  onOpenGoalSettings?: () => void;
  onCreateDeck?: () => void;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  currentStreak = 0,
  longestStreak = 0,
  dailyGoal = 10,
  cardsDueToday = 0,
  totalDecks = 0,
  onOpenGoalSettings,
  onCreateDeck,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {/* ─── Card 1: Current Streak ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#f5a623]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f5a623]/10 group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            Current Streak
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#f5a623]/15 text-[#f5a623] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-[#f5a623]/20">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {currentStreak}
          </span>
          <span className="text-sm font-medium text-[#94a3b8]">Days</span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#f5a623]" /> Best:{" "}
            {longestStreak}d
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#30d158] bg-[#30d158]/10 px-2 py-0.5 rounded-full border border-[#30d158]/20">
            <Shield className="w-2.5 h-2.5" /> Freeze: 1
          </span>
        </div>
      </div>

      {/* ─── Card 2: Daily Goal (Interactive) ─── */}
      <div
        onClick={onOpenGoalSettings}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#f5a623]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#f5a623]/15 group cursor-pointer"
        title="Nhấn để tùy chỉnh mục tiêu hàng ngày"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] group-hover:text-[#f5a623] transition-colors flex items-center gap-1.5">
            Daily Goal
            <Sliders className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {dailyGoal}
          </span>
          <span className="text-sm font-medium text-[#94a3b8]">Cards/day</span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#94a3b8] group-hover:text-[#f5a623] transition-colors flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#f5a623]" />
            <span className="group-hover:underline">Đổi mục tiêu</span>
          </span>
          <span className="text-[11px] text-[#94a3b8]">0 / {dailyGoal}</span>
        </div>
      </div>

      {/* ─── Card 3: Due Today (SM-2 Spaced Repetition) ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#30d158]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#30d158]/10 group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            Due Today
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#30d158]/15 text-[#30d158] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {cardsDueToday}
          </span>
          <span className="text-sm font-medium text-[#94a3b8]">Cards</span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#30d158]">
          <span className="flex items-center gap-1 font-medium">
            ✓{" "}
            {cardsDueToday === 0 ? "All reviews complete!" : "Ready to review"}
          </span>
          <span className="text-[11px] text-[#94a3b8]">SM-2 Active</span>
        </div>
      </div>

      {/* ─── Card 4: Vocabulary Decks ─── */}
      <div
        onClick={onCreateDeck}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1526]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 group cursor-pointer"
        title="Tạo bộ thẻ mới"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
            Vocabulary Decks
          </span>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {totalDecks}
          </span>
          <span className="text-sm font-medium text-[#94a3b8]">Decks</span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#94a3b8]">
          <span className="group-hover:text-purple-300 transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Thêm bộ từ mới</span>
          </span>
          <span className="text-[11px] text-purple-400 font-bold">+ New</span>
        </div>
      </div>
    </div>
  );
};
