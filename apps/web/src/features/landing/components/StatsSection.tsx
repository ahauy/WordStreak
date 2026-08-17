import React, { useEffect, useRef, useState } from "react";
import { Award, Zap, ShieldCheck, Star } from "lucide-react";

interface StatItem {
  id: string;
  icon: React.ElementType;
  targetNum: number;
  prefix?: string;
  suffix: string;
  decimals?: number;
  label: string;
  sublabel: string;
}

const statsData: StatItem[] = [
  {
    id: "words",
    icon: Zap,
    targetNum: 10000,
    suffix: "+",
    label: "Words Mastered",
    sublabel: "Across active decks",
  },
  {
    id: "retention",
    icon: ShieldCheck,
    targetNum: 97,
    suffix: "%",
    label: "Recall Retention",
    sublabel: "Tested after 30 days",
  },
  {
    id: "streak",
    icon: Award,
    targetNum: 45,
    suffix: " Days",
    label: "Average Streak",
    sublabel: "Active daily habit",
  },
  {
    id: "rating",
    icon: Star,
    targetNum: 4.9,
    suffix: " ★",
    decimals: 1,
    label: "Learner Rating",
    sublabel: "From 1,200+ reviews",
  },
];

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    words: 0,
    retention: 0,
    streak: 0,
    rating: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            entry.target.classList.add("revealed");

            // Trigger smooth count-up animation
            const duration = 1800; // ms
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // easeOutQuart
              const easeProgress = 1 - Math.pow(1 - progress, 4);

              setCounts({
                words: Math.floor(easeProgress * 10000),
                retention: Math.floor(easeProgress * 97),
                streak: Math.floor(easeProgress * 45),
                rating: Math.round(easeProgress * 4.9 * 10) / 10,
              });

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setCounts({
                  words: 10000,
                  retention: 97,
                  streak: 45,
                  rating: 4.9,
                });
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.25 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="reveal-section relative z-10 mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32"
    >
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-4 py-1.5 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">
            Proven Results
          </span>
        </div>
        <h2
          className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
        >
          Backed by science.{" "}
          <span className="bg-gradient-to-r from-white via-[#fde68a] to-[#f5a623] bg-clip-text text-transparent">
            Loved by learners.
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const currentVal = counts[stat.id] || 0;
          const formattedVal = stat.decimals
            ? currentVal.toFixed(stat.decimals)
            : currentVal.toLocaleString();

          return (
            <div key={stat.id} className="stat-card text-center group">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-[#f5a623] group-hover:scale-110 transition-transform">
                <Icon className="h-5 w-5" />
              </div>
              <div className="stat-value mb-1">
                {stat.prefix || ""}
                {formattedVal}
                {stat.suffix}
              </div>
              <p className="text-base font-semibold text-white">{stat.label}</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">{stat.sublabel}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
