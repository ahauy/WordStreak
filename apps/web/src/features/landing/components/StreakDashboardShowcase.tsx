import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Flame,
  Shield,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Play,
  Pause,
} from "lucide-react";

interface HeatmapCell {
  index: number;
  day: number;
  week: number;
  level: number; // 0 to 4
  reviews: number;
  dateStr: string;
}

export const StreakDashboardShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<{
    week: number;
    day: number;
    reviews: number;
    dateStr: string;
  } | null>(null);

  // Progressive day filling state (0 to 168)
  const [filledCount, setFilledCount] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [isInView, setIsInView] = useState<boolean>(false);

  const [recentWord, setRecentWord] = useState<{
    word: string;
    status: string;
    time: string;
  }>({
    word: "ubiquitous",
    status: "+25 XP · Mastered",
    time: "Just now",
  });

  const totalWeeks = 24;
  const daysPerWeek = 7;
  const totalDays = totalWeeks * daysPerWeek; // 168 days

  // Generate deterministic heatmap data
  const { flatCells, heatmapData } = useMemo(() => {
    const weeks: HeatmapCell[][] = [];
    const flat: HeatmapCell[] = [];
    let globalIdx = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const rand = ((w * 13 + d * 7 + 11) % 100) / 100;
        let level = 0;
        let reviews = 0;

        if (w > totalWeeks - 5) {
          level = rand > 0.15 ? Math.floor(rand * 3) + 2 : 1;
          reviews = level * 6 + Math.floor(rand * 8);
        } else if (rand > 0.35) {
          level = rand > 0.75 ? 3 : rand > 0.5 ? 2 : 1;
          reviews = level * 5 + Math.floor(rand * 5);
        }

        const cell: HeatmapCell = {
          index: globalIdx++,
          week: w,
          day: d,
          level: Math.min(level, 4),
          reviews,
          dateStr: `Month ${Math.floor(w / 4) + 1}, Week ${(w % 4) + 1} · Day ${d + 1}`,
        };

        week.push(cell);
        flat.push(cell);
      }
      weeks.push(week);
    }
    return { flatCells: flat, heatmapData: weeks };
  }, [totalWeeks, daysPerWeek]);

  // IntersectionObserver to start gradual completion when user scrolls in
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.25 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Gradual Day-by-Day Completion Loop ("Hoàn thiện dần các ngày")
  useEffect(() => {
    if (!isInView || !isPlayingAnimation) return;

    const interval = setInterval(() => {
      setFilledCount((prev) => {
        if (prev >= totalDays) {
          // Completed all 168 days -> pause at full glory for 5s, then restart journey
          setTimeout(() => {
            setFilledCount(0);
          }, 4500);
          return totalDays;
        }
        // Accelerate slightly as progress grows
        return prev + 1;
      });
    }, 28); // ~4.7s for all 168 days

    return () => clearInterval(interval);
  }, [isInView, isPlayingAnimation, totalDays]);

  // Rotating vocabulary mastery tickers during simulation
  useEffect(() => {
    const wordsList = [
      { word: "resilient", status: "+25 XP · Mastered" },
      { word: "eloquent", status: "+15 XP · Reviewed" },
      { word: "ephemeral", status: "+25 XP · Mastered" },
      { word: "lucid", status: "+10 XP · Streak +" },
      { word: "pragmatic", status: "+20 XP · Mastered" },
      { word: "tenacious", status: "+30 XP · Level Up" },
      { word: "serendipity", status: "+25 XP · Mastered" },
      { word: "luminescence", status: "+20 XP · Streak +" },
    ];

    let wordIdx = 0;
    const interval = setInterval(() => {
      wordIdx = (wordIdx + 1) % wordsList.length;
      setRecentWord({
        ...wordsList[wordIdx],
        time: "Just now",
      });
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  // Compute animated dynamic metrics according to filled progress
  const progressRatio = Math.min(filledCount / totalDays, 1);
  const currentStreak = Math.min(Math.floor(progressRatio * 14) + 1, 14);
  const currentMasteredCount = Math.floor(progressRatio * 1251);
  const dailyGoalPercent = Math.min(Math.floor(progressRatio * 100), 100);

  // Cell background color computation
  const getCellClasses = (cell: HeatmapCell) => {
    const isFilled = cell.index <= filledCount;
    const isCurrentActiveDay =
      cell.index === filledCount &&
      isPlayingAnimation &&
      filledCount < totalDays;
    const isHovered =
      activeCell?.week === cell.week && activeCell?.day === cell.day;

    if (isHovered) {
      return "bg-[#ffb940] ring-2 ring-[#f5a623] shadow-lg shadow-[#f5a623]/80 scale-125 z-20";
    }

    if (isCurrentActiveDay) {
      return "bg-white ring-2 ring-[#ffb940] shadow-md shadow-[#f5a623] scale-125 z-10 animate-ping";
    }

    if (!isFilled) {
      return "bg-white/[0.03] border border-white/5 opacity-40";
    }

    switch (cell.level) {
      case 0:
        return "bg-white/[0.06] border border-white/5";
      case 1:
        return "bg-[#78350f]/80 border border-[#92400e]/40 shadow-sm";
      case 2:
        return "bg-[#b45309] border border-[#d97706]/50 shadow-sm";
      case 3:
        return "bg-[#d97706] border border-[#f59e0b] shadow-sm";
      case 4:
        return "bg-[#f5a623] border border-[#fbbf24] shadow-md shadow-[#f5a623]/40";
      default:
        return "bg-white/[0.04]";
    }
  };

  const handleRestart = () => {
    setFilledCount(0);
    setIsPlayingAnimation(true);
  };

  return (
    <div
      ref={containerRef}
      className="reveal-section my-16 rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b1526]/90 via-[#071222]/80 to-[#040914]/90 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#f5a623]/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#38bdf8]/10 blur-3xl" />

      {/* Top Header Badge & Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3.5 py-1 mb-2.5">
            <Flame className="w-4 h-4 text-[#f5a623] fill-[#f5a623] animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5a623]">
              Interactive Habit Matrix
            </span>
          </div>
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Daily Vocabulary Heatmap
          </h3>
          <p className="text-sm text-[#94a3b8] mt-1">
            Visual consistency tracker inspired by GitHub. Watch every completed
            day build permanent recall.
          </p>
        </div>

        {/* Live Activity Counter */}
        <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3 shrink-0">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-[#30d158]" />
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#30d158] animate-ping" />
          </div>
          <div>
            <div className="text-xs text-[#94a3b8]">Live Mastered Words</div>
            <div className="text-xl font-extrabold text-white font-mono tracking-tight">
              {currentMasteredCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Stats & Right Progressive GitHub-Style Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-7 items-center">
        {/* Left Column: Dynamic Streak & Goal Progress */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Active Streak Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 relative overflow-hidden group hover:border-[#f5a623]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                Current Streak
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#30d158] bg-[#30d158]/10 px-2.5 py-0.5 rounded-full border border-[#30d158]/20">
                <Shield className="w-3 h-3" /> Streak Freeze Active
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2">
              <span
                className="text-5xl font-black text-white tracking-tight flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentStreak}
                <Flame className="w-9 h-9 text-[#f5a623] fill-[#f5a623] filter drop-shadow-[0_0_12px_rgba(245,166,35,0.7)] animate-pulse" />
              </span>
              <span className="text-lg font-bold text-[#f5a623]">
                Days Streak
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1.5">
              Consistent daily practice triggers the fastest long-term
              retention.
            </p>
          </div>

          {/* Daily Goal Progress Bar with Dynamic Completion */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-[#f5a623]/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-white">
                Daily Goal:{" "}
                {Math.min(Math.floor((dailyGoalPercent / 100) * 10), 10)}/10
                Words
              </span>
              <span className="font-bold text-[#f5a623]">
                {dailyGoalPercent}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f5a623] to-[#ffb940] shadow-md shadow-[#f5a623]/40 transition-all duration-300"
                style={{ width: `${dailyGoalPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mt-2">
              <span className="flex items-center gap-1 text-[#30d158]">
                <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                {dailyGoalPercent === 100
                  ? "Goal Achieved Today"
                  : "Reviewing in progress"}
              </span>
              <span>Next Review: 8:00 AM</span>
            </div>
          </div>

          {/* Live Recent Review Activity Popup */}
          <div className="rounded-2xl border border-[#f5a623]/25 bg-[#f5a623]/[0.06] p-4 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5a623] text-[#060e1a] font-bold shadow-md shadow-[#f5a623]/30">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">
                  {recentWord.word}
                </div>
                <div className="text-xs text-[#f5a623] font-medium">
                  {recentWord.status}
                </div>
              </div>
            </div>
            <span className="text-[11px] text-[#94a3b8] bg-white/5 px-2 py-1 rounded-md border border-white/5">
              {recentWord.time}
            </span>
          </div>
        </div>

        {/* Right Column: GitHub-Style Heatmap with Gradual Day Completion */}
        <div className="lg:col-span-8 flex flex-col justify-center rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#f5a623]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Annual Consistency Matrix ({Math.min(filledCount, totalDays)} /{" "}
                {totalDays} Days Completed)
              </span>
            </div>

            {/* Simulation Controls: Replay / Play / Pause */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#cbd5e1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title={
                  isPlayingAnimation ? "Pause Simulation" : "Resume Simulation"
                }
              >
                {isPlayingAnimation ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                <span>{isPlayingAnimation ? "Pause" : "Play"}</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#f5a623] hover:text-[#ffb940] bg-[#f5a623]/10 hover:bg-[#f5a623]/20 border border-[#f5a623]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Replay from Day 1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Replay</span>
              </button>
            </div>
          </div>

          {/* The Matrix Grid: Dynamically Illuminating Day by Day */}
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <div className="flex gap-1.5 min-w-[560px] justify-between">
              {heatmapData.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                  {week.map((cell) => {
                    return (
                      <div
                        key={`${cell.week}-${cell.day}`}
                        onMouseEnter={() =>
                          setActiveCell({
                            week: cell.week,
                            day: cell.day,
                            reviews: cell.reviews,
                            dateStr: cell.dateStr,
                          })
                        }
                        onMouseLeave={() => setActiveCell(null)}
                        className={`h-4 w-full rounded-sm transition-all duration-300 cursor-pointer ${getCellClasses(
                          cell,
                        )}`}
                        title={`${cell.dateStr}: ${cell.reviews} reviews completed`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Footer Legend & Tooltip Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-white/10 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#30d158]" />
              {activeCell ? (
                <span className="text-white font-medium">
                  {activeCell.dateStr}:{" "}
                  <strong className="text-[#f5a623]">
                    {activeCell.reviews} reviews
                  </strong>
                </span>
              ) : (
                <span className="text-white font-medium">
                  <strong className="text-[#f5a623]">{filledCount} days</strong>{" "}
                  of vocabulary practice simulated
                </span>
              )}
            </div>

            {/* Legend Scale */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Less</span>
              <div className="w-3.5 h-3.5 rounded-sm bg-white/[0.04] border border-white/5" />
              <div className="w-3.5 h-3.5 rounded-sm bg-[#78350f]/80" />
              <div className="w-3.5 h-3.5 rounded-sm bg-[#b45309]" />
              <div className="w-3.5 h-3.5 rounded-sm bg-[#d97706]" />
              <div className="w-3.5 h-3.5 rounded-sm bg-[#f5a623] shadow-sm shadow-[#f5a623]/50" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
