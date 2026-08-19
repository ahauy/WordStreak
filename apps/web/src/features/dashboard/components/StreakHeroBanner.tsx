import React from "react";
import {
  ShieldCheck,
  Zap,
  PlusCircle,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface StreakHeroBannerProps {
  username?: string;
  currentStreak?: number;
  onStartReview?: () => void;
  onCreateDeck?: () => void;
}

export const StreakHeroBanner: React.FC<StreakHeroBannerProps> = ({
  username = "Learner",
  currentStreak = 0,
  onStartReview,
  onCreateDeck,
}) => {
  // Days of current week representation (Mon -> Sun)
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1526]/90 via-[#071222]/85 to-[#040914]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
      {/* Background celestial ambient light & nebulae glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#f5a623]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#38bdf8]/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Column: Greeting & Mission */}
        <div className="space-y-4 max-w-2xl">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#30d158]/12 text-[#30d158] border border-[#30d158]/25 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Multi-Session Active &
              Secured
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#f5a623]/12 text-[#f5a623] border border-[#f5a623]/25 shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-[#f5a623]" /> Spaced Repetition
              (SM-2)
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready for today's streak,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#fde68a] to-[#f5a623]">
              {username}
            </span>
            ? 🚀
          </h1>

          {/* Subtext */}
          <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
            Your spaced repetition review session is ready. Practice now to
            reinforce short-term memory into permanent recall and keep your{" "}
            <strong className="text-white">{currentStreak}-day streak</strong>{" "}
            burning!
          </p>

          {/* 7-Day Weekly Streak Tracker */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#cbd5e1] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#f5a623]" /> This Week's
              Streak:
            </span>
            <div className="flex items-center gap-2">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === todayIndex;
                const isCompleted = idx < todayIndex && currentStreak > 0;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1"
                    title={`${dayNames[idx]}${isToday ? " (Today)" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#f5a623] text-[#060e1a] shadow-md shadow-[#f5a623]/40"
                          : isToday
                            ? "bg-[#f5a623]/20 border-2 border-[#f5a623] text-[#f5a623] shadow-lg shadow-[#f5a623]/30 scale-105 animate-pulse"
                            : "bg-white/[0.04] border border-white/10 text-[#64748b]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      ) : (
                        day
                      )}
                    </div>
                    <span className="text-[10px] text-[#64748b] font-medium">
                      {dayNames[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: High-Impact CTAs */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 sm:w-auto w-full">
          <button
            type="button"
            onClick={onStartReview}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-[#f5a623] to-[#ffb940] hover:from-[#ffb940] hover:to-[#f5a623] text-[#060e1a] font-bold text-base shadow-xl shadow-[#f5a623]/30 hover:shadow-[#f5a623]/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Start Daily Review</span>
          </button>

          <button
            type="button"
            onClick={onCreateDeck}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-white/12 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/25 text-white font-semibold text-base backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Deck</span>
          </button>
        </div>
      </div>
    </div>
  );
};
