import { useEffect, useRef, useMemo } from "react";
import {
  Brain,
  Layers,
  Target,
  Flame,
  Sparkles,
  BarChart3,
  Sparkle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface FeatureConfig {
  id: string;
  icon: React.ElementType;
  badgeNumber: string;
}

const featureConfigs: FeatureConfig[] = [
  { id: "srs", icon: Brain, badgeNumber: "01" },
  { id: "cards", icon: Layers, badgeNumber: "02" },
  { id: "quiz", icon: Target, badgeNumber: "03" },
  { id: "streak", icon: Flame, badgeNumber: "04" },
  { id: "ai", icon: Sparkles, badgeNumber: "05" },
  { id: "metrics", icon: BarChart3, badgeNumber: "06" },
];

export function FeaturesSection() {
  const { t } = useTranslation("landing");
  const offsetRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const features = useMemo(() => {
    return featureConfigs.map((cfg) => ({
      ...cfg,
      title: t(`features.items.${cfg.id}.title`, cfg.id),
      tag: t(`features.items.${cfg.id}.tag`, "Feature"),
      description: t(`features.items.${cfg.id}.desc`, ""),
    }));
  }, [t]);

  // Duplicate into 2 sets of 6 for seamless infinite sliding ribbon
  const duplicatedFeatures = useMemo(
    () => [...features, ...features],
    [features],
  );

  const cardSpacing = 310; // px
  const totalCards = duplicatedFeatures.length; // 12
  const loopWidth = (totalCards / 2) * cardSpacing; // 1860 px
  const speed = 42; // px per second (continuous Left to Right sliding speed)

  // 60fps GPU-accelerated continuous sliding loop along the curved arc
  useEffect(() => {
    let rafId: number;

    const loop = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        // Continuously advance offset from Left to Right
        offsetRef.current = (offsetRef.current + speed * delta) % loopWidth;
      }
      lastTimeRef.current = time;

      const currentOffset = offsetRef.current;
      cardElementsRef.current.forEach((el, i) => {
        if (!el) return;

        // Position on linear track centered at 0
        let pos = (i * cardSpacing + currentOffset) % loopWidth;
        if (pos > loopWidth / 2) pos -= loopWidth;

        // Curved arc calculation (parabolic arch with apex at pos = 0)
        const normalizedX = pos / 480;
        const x = pos;
        const y = Math.pow(normalizedX, 2) * 36; // drops by 36px on outer edges
        const angle = normalizedX * 9.5; // tilts along curved arch (-9.5deg to +9.5deg)

        const scale = 1 - Math.min(Math.abs(normalizedX) * 0.04, 0.12);
        const opacity =
          Math.abs(pos) > 780
            ? 0
            : Math.max(1 - Math.pow(Math.abs(pos) / 780, 2) * 0.9, 0);
        const zIndex = 20 - Math.floor(Math.abs(normalizedX) * 5);

        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(${scale})`;
        el.style.opacity = `${opacity}`;
        el.style.zIndex = `${zIndex}`;
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [loopWidth, cardSpacing]);

  return (
    <section
      id="features"
      className="landing-section border-t border-[#e5e5e5] overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <span className="command-tag-chip mb-3">
            <Sparkle className="h-3.5 w-3.5 mr-1 text-black" />
            {t("features.tag", "Core Features")}
          </span>
          <h2 className="display-lg">
            {t("features.title", "Engineered for permanent retention.")}
          </h2>
          <p className="body-md mt-2">
            {t(
              "features.subtitle",
              "Every feature is built around the science of human memory decay and habit formation.",
            )}
          </p>
        </motion.div>
      </div>

      {/* Desktop: Pure Continuous Curved Arc Left-to-Right Sliding Stream */}
      <div
        className="hidden md:flex justify-center items-center min-h-[460px] relative py-8 select-none overflow-hidden pointer-events-none"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <div className="relative flex justify-center items-center w-full max-w-5xl h-[340px]">
          {duplicatedFeatures.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={`${item.id}-${idx}`}
                ref={(el) => {
                  cardElementsRef.current[idx] = el;
                }}
                style={{
                  position: "absolute",
                  width: "295px",
                  willChange: "transform, opacity",
                  transformOrigin: "bottom center",
                }}
                className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm min-h-[210px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-[#e5e5e5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-black border border-[#e5e5e5] bg-[#fafafa] px-2 py-0.5 rounded-full">
                        {item.badgeNumber}
                      </span>
                      <span className="text-[11px] font-mono text-[#737373]">
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <h3
                    className="text-base font-bold text-black tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#525252] mt-2 leading-relaxed line-clamp-3 min-h-[48px]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#e5e5e5] flex items-center justify-between text-[11px] font-mono text-[#a3a3a3]">
                  <span>100% FREE</span>
                  <span className="text-black font-medium">SM-2 Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Clean static grid fallback */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-4 px-4 sm:px-6 pt-4">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="clean-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-black border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-0.5 rounded-full">
                  {item.badgeNumber}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="heading-sm text-black">{item.title}</h3>
              <p className="body-sm mt-1.5 leading-relaxed text-[#525252]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
