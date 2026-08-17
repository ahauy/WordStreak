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
          <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] dark:bg-white flex items-center justify-center text-white dark:text-[#1d1d1f]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-white block leading-none">
              WordStreak
            </span>
            <span className="text-[11px] font-normal text-[#86868b] tracking-wide uppercase">
              Vocabulary Mastery
            </span>
          </div>
        </div>

        <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white leading-[1.12] pt-1">
          Master words that stick.
        </h1>
        <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6] leading-[1.4]">
          Algorithmic spaced repetition and active recall engineered into a calm
          daily habit.
        </p>
      </div>

      {/* Interactive Physical Vocabulary Card (Resting on canvas with single signature shadow) */}
      <div className="my-5 relative">
        <div className="interactive-flashcard apple-card shadow-apple-product p-5 space-y-4">
          {/* Card Header Pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal bg-[#f5f5f7] dark:bg-[#333336] text-[#1d1d1f] dark:text-[#f5f5f7] border border-[#e0e0e0] dark:border-white/10">
              <Brain className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              Spaced Repetition · Optimal Interval
            </span>
            <span className="text-xs font-normal text-[#86868b] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#30d158]" />
              Review in 4 days
            </span>
          </div>

          {/* Word & Pronunciation */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                ephemeral
              </h2>
              <button
                type="button"
                onClick={handlePronounce}
                className={`p-2 rounded-full transition-all duration-150 border cursor-pointer apple-tap-active focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${
                  isPlayingAudio
                    ? "bg-[#0066cc] text-white border-[#0066cc]"
                    : "bg-[#f5f5f7] dark:bg-[#333336] text-[#1d1d1f] dark:text-white hover:text-[#0066cc] dark:hover:text-[#2997ff] border-[#e0e0e0] dark:border-white/10"
                }`}
                title="Listen to pronunciation"
                aria-label="Listen to pronunciation of ephemeral"
              >
                <Volume2
                  className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <span className="font-mono">/ɪˈfem.ər.əl/</span>
              <span className="w-1 h-1 rounded-full bg-[#86868b]" />
              <span className="italic">adjective</span>
            </div>
          </div>

          {/* Definition & Example */}
          <div className="space-y-2 pt-2 border-t border-[#f0f0f0] dark:border-white/10">
            <p className="text-[14px] font-normal text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
              Lasting for a very short time; transitory; fleeting.
            </p>
            <p className="text-xs italic text-[#86868b] dark:text-[#a1a1a6] leading-relaxed bg-[#f5f5f7] dark:bg-[#1d1d1f] p-2.5 rounded-[10px] border border-[#e0e0e0]/70 dark:border-white/10">
              &ldquo;Like morning mist over the valley, moments of clarity feel
              ephemeral yet profound.&rdquo;
            </p>
          </div>

          {/* Micro-learning Status & Action */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-normal text-[#1d1d1f] dark:text-white bg-[#f5f5f7] dark:bg-[#333336] px-2.5 py-1 rounded-full border border-[#e0e0e0] dark:border-white/10">
                <Flame className="w-3.5 h-3.5 text-[#ff9500] fill-[#ff9500]" />
                14-Day Streak
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-normal text-[#1d1d1f] dark:text-white bg-[#f5f5f7] dark:bg-[#333336] px-2.5 py-1 rounded-full border border-[#e0e0e0] dark:border-white/10">
                <Award className="w-3.5 h-3.5 text-[#30d158]" />
                +25 XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCardMastered((prev) => !prev)}
              className={`text-xs font-normal px-3 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 cursor-pointer apple-tap-active ${
                cardMastered
                  ? "bg-[#30d158] text-white"
                  : "bg-[#fafafc] dark:bg-[#333336] text-[#1d1d1f] dark:text-white hover:bg-[#f0f0f2] dark:hover:bg-[#3d3d42] border border-[#e0e0e0] dark:border-white/10"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cardMastered ? "Remembered" : "Mark Remembered"}
            </button>
          </div>
        </div>
      </div>

      {/* Credibility & Pedagogical Foundation */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e0e0e0] dark:border-white/10 text-xs">
        <div>
          <p className="font-semibold text-xs text-[#1d1d1f] dark:text-white">
            SM-2 Algorithm
          </p>
          <p className="text-[#86868b] leading-tight text-[11px] mt-0.5">
            Optimized review intervals for long-term retention
          </p>
        </div>
        <div>
          <p className="font-semibold text-xs text-[#1d1d1f] dark:text-white">
            Active Recall
          </p>
          <p className="text-[#86868b] leading-tight text-[11px] mt-0.5">
            Daily contextual practice that prevents forgetting
          </p>
        </div>
      </div>
    </div>
  );
};
