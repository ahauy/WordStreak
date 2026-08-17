import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Layers,
  Target,
  Flame,
  BarChart3,
  Sparkles,
  Zap,
} from "lucide-react";
import { StreakDashboardShowcase } from "./StreakDashboardShowcase";

const features = [
  {
    icon: Brain,
    title: "Spaced Repetition (SRS)",
    badge: "Smart Algorithm",
    description:
      "The SM-2 engine calculates the exact moment you're about to forget a word, scheduling reviews so knowledge moves to permanent memory.",
  },
  {
    icon: Layers,
    title: "Contextual Flashcards",
    badge: "Multi-sensory",
    description:
      "Study words with crystal-clear IPA audio, natural example sentences, collocations, and your own custom memory hooks (mnemonics).",
  },
  {
    icon: Target,
    title: "Varied Quiz Formats",
    badge: "Active Recall",
    description:
      "Practice with multiple-choice, sentence fill-in-the-blanks, audio listening tests, and word-definition matching to test recall from every angle.",
  },
  {
    icon: Flame,
    title: "Streaks & Daily Goals",
    badge: "Habit Loop",
    description:
      "Build an unbroken learning habit with daily targets and earned streak freezes that keep you motivated even on your busiest days.",
  },
  {
    icon: BarChart3,
    title: "Visual Mastery Analytics",
    badge: "Insights",
    description:
      "Track your progress with GitHub-style consistency heatmaps, retention curves, and clear breakdowns of Mastered vs. Learning words.",
  },
  {
    icon: Sparkles,
    title: "Instant AI Word Generation",
    badge: "Time Saver",
    description:
      "Just enter an English word — AI instantly populates phonetic IPA, nuanced definitions, real-life examples, and synonyms in milliseconds.",
  },
];

const rotatingKeywords = [
  { text: "⚡ 3x Faster Recall", icon: Zap },
  { text: "🧠 SM-2 Spaced Repetition", icon: Brain },
  { text: "🔥 Unbroken Streak Habit", icon: Flame },
  { text: "🎯 Multi-Angle Quizzes", icon: Target },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [keywordIndex, setKeywordIndex] = useState(0);

  // Rotating keyword animation in header
  useEffect(() => {
    const interval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = sectionRef.current?.querySelectorAll(".reveal-section");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const CurrentKeywordIcon = rotatingKeywords[keywordIndex].icon;

  // Duplicate the list once for seamless infinite 60fps marquee loop
  const marqueeFeatures = [...features, ...features];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
    >
      {/* Header Section: Perfectly Centered & Symmetrical */}
      <div className="reveal-section mb-14 flex flex-col items-center justify-center text-center">
        {/* Animated Rotating Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-4 py-1.5 mb-5 shadow-lg shadow-[#f5a623]/15 transition-all duration-300">
          <CurrentKeywordIcon className="w-4 h-4 text-[#f5a623] animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">
            {rotatingKeywords[keywordIndex].text}
          </span>
        </div>

        {/* Dynamic Heading with Animated Gradient Shimmer */}
        <h2
          className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white"
          style={{ fontFamily: "var(--font-display)", lineHeight: 1.15 }}
        >
          Engineered for fast,{" "}
          <span className="animate-shimmer-text block sm:inline mt-1 sm:mt-0">
            effortless retention.
          </span>
        </h2>

        {/* Clean Subtext */}
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#94a3b8] sm:text-lg">
          Swipe through our intelligent learning tools built to turn unfamiliar
          words into fluent, permanent recall.
        </p>
      </div>

      {/* Seamless Infinite Smooth Continuous Marquee ("Chuyển động mượt mà liên tục") */}
      <div className="reveal-section relative my-8 overflow-hidden marquee-container [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee-track py-3">
          {marqueeFeatures.map((feature, idx) => (
            <div
              key={`${feature.title}-${idx}`}
              className="feature-card group w-[310px] sm:w-[360px] flex-shrink-0 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="feature-card-icon">
                    <feature.icon size={24} strokeWidth={2.2} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-[#f5a623]">
                    {feature.badge}
                  </span>
                </div>

                <h3
                  className="mb-2.5 text-2xl font-bold text-white tracking-tight group-hover:text-[#f5a623] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#94a3b8]">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#94a3b8]">
                <span>Smart Mastery Tool</span>
                <span className="text-[#f5a623] font-semibold group-hover:translate-x-1 transition-transform">
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DEDICATED LIVE GITHUB-STYLE STREAK & DASHBOARD SHOWCASE ("Nhấn mạnh streak & dashboard theo dõi luôn động") */}
      <StreakDashboardShowcase />
    </section>
  );
}
