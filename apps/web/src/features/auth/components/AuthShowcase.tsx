import React, { useState } from "react";
import {
  Flame,
  Brain,
  Volume2,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react";

export const AuthShowcase: React.FC = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [cardMastered, setCardMastered] = useState(false);

  const handlePronounce = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("ephemeral");
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 800);
    }
  };

  return (
    <div className="hidden lg:flex flex-col justify-center p-4 xl:p-6 max-w-lg w-full">
      {/* Top Editorial Brand Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span
              className="text-xl font-bold tracking-tight text-white block leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              WordStreak
            </span>
            <span className="text-[10px] font-bold text-[#F5A623] tracking-widest uppercase mt-0.5 block">
              Vocabulary Mastery
            </span>
          </div>
        </div>

        <h1
          className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.08] pt-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Master words that{" "}
          <span className="bg-gradient-to-r from-white via-[#fde68a] to-[#F5A623] bg-clip-text text-transparent">
            stick.
          </span>
        </h1>
        <p className="text-[15px] text-[var(--color-muted-foreground)] leading-relaxed">
          Algorithmic spaced repetition and active recall engineered into a calm
          daily habit.
        </p>
      </div>

      {/* Interactive Physical Vocabulary Card (Glassmorphic) */}
      <div className="my-6 relative">
        <div className="liquid-glass interactive-flashcard rounded-2xl p-6 space-y-4 border border-white/10 shadow-2xl bg-white/[0.03]">
          {/* Card Header Pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal bg-white/[0.06] text-white border border-white/10">
              <Brain className="w-3.5 h-3.5 text-[#F5A623]" />
              Spaced Repetition · SM-2
            </span>
            <span className="text-xs font-normal text-[var(--color-muted-foreground)] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#30d158]" />
              Review in 4 days
            </span>
          </div>

          {/* Word & Pronunciation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2
                className="text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ephemeral
              </h2>
              <button
                type="button"
                onClick={handlePronounce}
                className={`p-2.5 rounded-full transition-all duration-150 border cursor-pointer apple-tap-active focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] ${
                  isPlayingAudio
                    ? "bg-[#F5A623] text-[#071220] border-[#F5A623] shadow-lg shadow-[#F5A623]/30"
                    : "bg-white/[0.06] text-white hover:text-[#F5A623] hover:border-[#F5A623]/50 border-white/10"
                }`}
                title="Listen to pronunciation"
                aria-label="Listen to pronunciation of ephemeral"
              >
                <Volume2
                  className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <span className="font-mono">/ɪˈfem.ər.əl/</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="italic text-white/70">adjective</span>
            </div>
          </div>

          {/* Definition & Example */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-[14px] font-normal text-white/90 leading-snug">
              Lasting for a very short time; transitory; fleeting.
            </p>
            <p className="text-xs italic text-[var(--color-muted-foreground)] leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5">
              &ldquo;Like morning mist over the valley, moments of clarity feel
              ephemeral yet profound.&rdquo;
            </p>
          </div>

          {/* Micro-learning Status & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-normal text-white bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/10">
                <Flame className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" />
                14-Day Streak
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-normal text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-1 rounded-full border border-[#F5A623]/20">
                <Award className="w-3.5 h-3.5" />
                +25 XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCardMastered((prev) => !prev)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer apple-tap-active ${
                cardMastered
                  ? "bg-[#30d158] text-[#071220] shadow-md shadow-[#30d158]/20"
                  : "bg-white/[0.06] text-white hover:bg-white/[0.12] border border-white/10 hover:border-white/20"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cardMastered ? "Remembered" : "Mark Remembered"}
            </button>
          </div>
        </div>
      </div>

      {/* Credibility & Pedagogical Foundation */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
        <div>
          <p className="font-semibold text-xs text-white">SM-2 Algorithm</p>
          <p className="text-[var(--color-muted-foreground)] leading-tight text-[11px] mt-0.5">
            Optimized review intervals for long-term retention
          </p>
        </div>
        <div>
          <p className="font-semibold text-xs text-white">Active Recall</p>
          <p className="text-[var(--color-muted-foreground)] leading-tight text-[11px] mt-0.5">
            Daily contextual practice that prevents forgetting
          </p>
        </div>
      </div>
    </div>
  );
};
