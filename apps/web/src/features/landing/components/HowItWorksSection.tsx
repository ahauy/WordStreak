import { useState, useRef } from "react";
import { PlusCircle, RotateCw, Trophy } from "lucide-react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface StepData {
  number: string;
  icon: React.ElementType;
  title: string;
  tag: string;
  description: string;
  angle: number;
  fannedX: number;
  fannedY: number;
}

const steps: StepData[] = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add your vocabulary",
    tag: "Capture",
    description:
      "Type any word you encounter while reading or studying. Our AI auto-populates phonetic IPA, audio, and contextual examples in milliseconds.",
    angle: -11,
    fannedX: -270,
    fannedY: 14,
  },
  {
    number: "02",
    icon: RotateCw,
    title: "Review on smart intervals",
    tag: "SM-2 Algorithm",
    description:
      "Spend just 5–10 minutes daily. The SM-2 algorithm calculates the exact threshold of forgetting to lock words permanently into long-term memory.",
    angle: 0,
    fannedX: 0,
    fannedY: -28, // Elevated center apex
  },
  {
    number: "03",
    icon: Trophy,
    title: "Build streaks & fluency",
    tag: "Mastery Loop",
    description:
      "Watch your vocabulary count soar. Keep your daily streak burning, protect it with streak freezes, and transition from learner to fluent speaker.",
    angle: 11,
    fannedX: 270,
    fannedY: 14,
  },
];

interface StepCardItemProps {
  step: StepData;
  idx: number;
  fanProgress: MotionValue<number>;
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
}

function StepCardItem({
  step,
  idx,
  fanProgress,
  hoveredIdx,
  setHoveredIdx,
}: StepCardItemProps) {
  const Icon = step.icon;
  const isHovered = hoveredIdx === idx;

  const pullDistance = 40;
  const rad = (step.angle * Math.PI) / 180;
  const pullDx = pullDistance * Math.sin(rad);
  const pullDy = -pullDistance * Math.cos(rad);

  const stackedX = (idx - 1) * 1.5;
  const stackedY = idx * -1;
  const stackedRotate = (idx - 1) * 0.5;

  const currentX = useTransform(
    fanProgress,
    (p) => p * step.fannedX + (1 - p) * stackedX,
  );
  const currentY = useTransform(
    fanProgress,
    (p) => p * step.fannedY + (1 - p) * stackedY,
  );
  const currentRotate = useTransform(
    fanProgress,
    (p) => p * step.angle + (1 - p) * stackedRotate,
  );

  return (
    // Stable outer container anchor: prevents hover oscillation / flickering
    <motion.div
      style={{
        x: currentX,
        y: currentY,
        rotate: currentRotate,
        transformOrigin: "bottom center",
        zIndex: isHovered ? 60 : idx === 1 ? 25 : 15,
      }}
      onMouseEnter={() => setHoveredIdx(idx)}
      onMouseLeave={() => setHoveredIdx(null)}
      className="absolute w-[295px] pt-14 -mt-14 pb-6 -mb-6 cursor-pointer"
    >
      {/* Inner visual card: translates smoothly without moving the hit test anchor */}
      <motion.div
        animate={{
          x: isHovered ? pullDx : 0,
          y: isHovered ? pullDy : 0,
          scale: isHovered ? 1.06 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 24,
          mass: 0.6,
        }}
        className={`w-full rounded-xl border bg-white p-6 transition-colors shadow-md ${
          isHovered
            ? "border-black shadow-2xl ring-2 ring-black/10"
            : "border-[#e5e5e5] hover:border-black/50"
        }`}
      >
        <div className="flex items-center justify-between mb-4 border-b border-[#e5e5e5] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-black border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-0.5 rounded-full">
              {step.number}
            </span>
            <span className="text-[11px] font-mono text-[#737373]">
              {step.tag}
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <h3 className="heading-md text-black">{step.title}</h3>
        <p className="body-sm mt-2.5 leading-relaxed text-[#525252]">
          {step.description}
        </p>

        <div className="mt-6 pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs text-[#a3a3a3] font-mono">
          <span>STEP {step.number} OF 03</span>
          <span className="text-black font-medium">
            {isHovered ? "DRAWN ↑" : idx === 1 ? "PEAK APEX" : "100% FREE"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const fanProgress = useTransform(
    scrollYProgress,
    [0.12, 0.42, 0.58, 0.88],
    [0, 1, 1, 0],
  );

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="landing-section border-t border-[#e5e5e5] overflow-hidden"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-xl mx-auto mb-6"
        >
          <span className="command-tag-chip mb-3">Scroll-Driven Deck</span>
          <h2 className="display-lg">How WordStreak builds retention.</h2>
          <p className="body-md mt-2">
            Cards fan out as you scroll to the center and gather back as you
            scroll past. Hover to draw any card instantly.
          </p>
        </motion.div>

        {/* Desktop: Scroll-driven Progressive Fan Deck */}
        <div className="hidden md:flex justify-center items-center min-h-[440px] relative py-12 select-none">
          <div className="relative flex justify-center items-center w-full max-w-2xl">
            {steps.map((step, idx) => (
              <StepCardItem
                key={step.number}
                step={step}
                idx={idx}
                fanProgress={fanProgress}
                hoveredIdx={hoveredIdx}
                setHoveredIdx={setHoveredIdx}
              />
            ))}
          </div>
        </div>

        {/* Mobile / Narrow: Stacked clean cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden pt-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="clean-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-black border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-0.5 rounded-full">
                    {step.number}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="heading-sm text-black">{step.title}</h3>
                <p className="body-sm mt-1.5 leading-relaxed text-[#525252]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
