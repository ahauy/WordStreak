import { useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Sparkles, Volume2, ArrowRight } from "lucide-react";

export function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlaySound = () => {
    setIsPlaying(true);
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("serendipity");
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 900);
    }
  };

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Optional Video Background */}
      {import.meta.env.VITE_HERO_VIDEO_URL && (
        <div className="hero-video-container">
          <video autoPlay loop muted playsInline poster="" aria-hidden="true">
            <source
              src={import.meta.env.VITE_HERO_VIDEO_URL}
              type="video/mp4"
            />
          </video>
        </div>
      )}

      {/* Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center sm:px-8">
        {/* Habit Badge */}
        <div className="animate-fade-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 backdrop-blur-md mb-8">
          <Sparkles className="w-4 h-4 text-[#f5a623]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white">
            Daily Spaced Repetition for Learners
          </span>
        </div>

        {/* Learner-Friendly Modern Display Headline */}
        <h1
          className="animate-fade-rise mx-auto max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            fontFamily: "var(--font-display)",
            textShadow: "0 4px 28px rgba(0, 0, 0, 0.75)",
          }}
        >
          Master vocabulary.{" "}
          <span className="block mt-2 bg-gradient-to-r from-white via-[#fde68a] to-[#f5a623] bg-clip-text text-transparent">
            Never forget a word.
          </span>
        </h1>

        <p
          className="animate-fade-rise-delay mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-[#cbd5e1] sm:text-lg md:text-xl"
          style={{
            fontFamily: "var(--font-body)",
            textShadow: "0 2px 14px rgba(0, 0, 0, 0.8)",
          }}
        >
          Scientifically scheduled reviews, active recall quizzes, and daily
          streaks designed to turn new English words into permanent memory.
        </p>

        {/* CTA Button Group */}
        <div className="animate-fade-rise-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#f5a623] px-9 py-4 text-base font-bold text-[#060e1a] shadow-lg shadow-[#f5a623]/25 transition-all duration-200 hover:scale-[1.04] hover:bg-[#ffb940] active:scale-95"
          >
            <span>Start Learning for Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="cursor-pointer rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.1] active:scale-95"
          >
            See How It Works ↓
          </button>
        </div>

        {/* Floating Interactive Live Vocab Preview Card */}
        <div className="animate-fade-rise-delay-3 mt-14 flex justify-center">
          <div className="animate-float w-full max-w-md rounded-2xl border border-white/15 bg-[#0b1526]/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#f5a623]/40">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#30d158] animate-ping" />
                <span className="text-xs font-semibold text-white/80">
                  Daily Review · Today's Word
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f5a623]">
                <Flame className="h-3.5 w-3.5 fill-[#f5a623]" /> 12 Streak
              </span>
            </div>

            <div className="mt-3.5 flex items-center justify-between text-left">
              <div>
                <h3
                  className="text-2xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  serendipity
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  <span className="font-mono">/ˌser.ənˈdɪp.ə.ti/</span> ·{" "}
                  <span className="italic">noun</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handlePlaySound}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus:outline-none ${
                  isPlaying
                    ? "border-[#f5a623] bg-[#f5a623] text-[#060e1a] shadow-lg shadow-[#f5a623]/40"
                    : "border-white/10 bg-white/5 text-white hover:border-[#f5a623]/50 hover:text-[#f5a623]"
                }`}
                title="Listen to pronunciation"
                aria-label="Listen to pronunciation"
              >
                <Volume2
                  className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`}
                />
              </button>
            </div>

            <p className="mt-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-left text-xs leading-relaxed text-slate-300">
              &ldquo;Finding this tool was pure serendipity — my vocabulary
              retention doubled in two weeks.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
