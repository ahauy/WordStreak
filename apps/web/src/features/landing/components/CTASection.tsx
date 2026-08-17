import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export function CTASection() {
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
      { threshold: 0.2 },
    );

    const el = sectionRef.current?.querySelector(".reveal-section");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:px-8 sm:py-32"
    >
      <div className="reveal-section cta-glow rounded-3xl border border-white/15 bg-[#0b1526]/70 px-8 py-16 text-center sm:px-16 sm:py-24 shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-4 py-1.5">
          <Flame className="w-4 h-4 text-[#f5a623] fill-[#f5a623]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">
            Start Your Streak Today
          </span>
        </div>

        <h2
          className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
        >
          Ready to remember words{" "}
          <span className="bg-gradient-to-r from-white via-[#fde68a] to-[#f5a623] bg-clip-text text-transparent">
            permanently?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#cbd5e1] sm:text-lg">
          Join language learners who turn just 5 minutes a day into an
          unstoppable English vocabulary habit. Completely free to get started.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#f5a623] px-10 py-4 text-base font-bold text-[#060e1a] shadow-xl shadow-[#f5a623]/25 transition-all duration-200 hover:scale-[1.04] hover:bg-[#ffb940] active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-base font-medium text-white backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.1] active:scale-95"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    </section>
  );
}
