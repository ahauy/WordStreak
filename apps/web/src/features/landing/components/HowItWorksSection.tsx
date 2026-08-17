import { useEffect, useRef } from "react";
import { PlusCircle, Repeat, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add your vocabulary",
    description:
      "Type any word you encounter while reading, working, or studying. Our AI instantly gathers definitions, phonetic IPA, audio, and contextual examples.",
  },
  {
    number: "02",
    icon: Repeat,
    title: "Review on smart intervals",
    description:
      "Spend just 5–10 minutes daily. The spaced repetition algorithm presents words right when your brain needs reinforcement, locking them into memory.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Build streaks & mastery",
    description:
      "Watch your vocabulary count soar. Keep your daily streak alive, earn badges, and track your transition from learner to fluent speaker.",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15 },
    );

    const items = sectionRef.current?.querySelectorAll(".reveal-section");
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
    >
      <div className="reveal-section mb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-4 py-1.5 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">
            Simple 3-Step Process
          </span>
        </div>
        <h2
          className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
        >
          How WordStreak builds{" "}
          <span className="bg-gradient-to-r from-white via-[#fde68a] to-[#f5a623] bg-clip-text text-transparent">
            lasting retention.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#94a3b8] sm:text-lg">
          A proven learning framework that requires just minutes of focused
          practice a day.
        </p>
      </div>

      <div className="flex flex-col gap-14 sm:gap-16">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="reveal-section relative flex gap-6 sm:gap-8 group"
            style={{ transitionDelay: `${i * 0.15}s` }}
          >
            {/* Number + Connector Line */}
            <div className="relative">
              <div className="step-number group-hover:border-[#f5a623] group-hover:bg-[#f5a623]/20">
                {step.number}
              </div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>

            {/* Step Card Content */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#0b1526]/60 p-6 sm:p-7 backdrop-blur-md transition-all duration-300 group-hover:border-[#f5a623]/30 group-hover:bg-[#0f1d35]/80">
              <div className="flex items-center gap-3 mb-2">
                <step.icon className="w-5 h-5 text-[#f5a623]" />
                <h3
                  className="text-2xl font-bold text-white tracking-tight sm:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 text-base leading-relaxed text-[#94a3b8]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
