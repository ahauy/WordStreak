import { useState, useRef } from "react";
import { Lock, Download, ShieldCheck, HardDrive } from "lucide-react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface PrivacyData {
  icon: React.ElementType;
  title: string;
  tag: string;
  desc: string;
  angle: number;
  fannedX: number;
  fannedY: number;
}

const privacyCards: PrivacyData[] = [
  {
    icon: Download,
    title: "Universal Deck Export",
    tag: "Anki / CSV / JSON",
    desc: "Export all your flashcards, tags, and SM-2 repetition logs to standard Anki (.apkg) or CSV files anytime in one click.",
    angle: -11,
    fannedX: -270,
    fannedY: 14,
  },
  {
    icon: HardDrive,
    title: "Local-First Offline Sync",
    tag: "No Internet Needed",
    desc: "Review your vocabulary during commutes or flights without internet. Reviews sync seamlessly the moment you reconnect.",
    angle: 0,
    fannedX: 0,
    fannedY: -28, // Elevated center apex
  },
  {
    icon: ShieldCheck,
    title: "Zero Vendor Lock-In",
    tag: "100% Free Forever",
    desc: "No paywalls on words you created. Your vocabulary data, mnemonics, and study progress belong completely to you.",
    angle: 11,
    fannedX: 270,
    fannedY: 14,
  },
];

interface PrivacyCardItemProps {
  item: PrivacyData;
  idx: number;
  fanProgress: MotionValue<number>;
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
}

function PrivacyCardItem({
  item,
  idx,
  fanProgress,
  hoveredIdx,
  setHoveredIdx,
}: PrivacyCardItemProps) {
  const Icon = item.icon;
  const isHovered = hoveredIdx === idx;

  const pullDistance = 40;
  const rad = (item.angle * Math.PI) / 180;
  const pullDx = pullDistance * Math.sin(rad);
  const pullDy = -pullDistance * Math.cos(rad);

  const stackedX = (idx - 1) * 1.5;
  const stackedY = idx * -1;
  const stackedRotate = (idx - 1) * 0.5;

  const currentX = useTransform(
    fanProgress,
    (p) => p * item.fannedX + (1 - p) * stackedX,
  );
  const currentY = useTransform(
    fanProgress,
    (p) => p * item.fannedY + (1 - p) * stackedY,
  );
  const currentRotate = useTransform(
    fanProgress,
    (p) => p * item.angle + (1 - p) * stackedRotate,
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
        <div className="flex items-center justify-between mb-3.5 border-b border-[#e5e5e5] pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
            <Icon className="h-4 w-4 stroke-[1.75]" />
          </div>
          <span className="text-[11px] font-mono text-[#737373] border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-0.5 rounded-full">
            {item.tag}
          </span>
        </div>

        <h3 className="heading-sm text-black">{item.title}</h3>
        <p className="body-sm mt-2 leading-relaxed text-[#525252]">
          {item.desc}
        </p>

        <div className="mt-5 pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs text-[#a3a3a3] font-mono">
          <span>ZERO LOCK-IN</span>
          <span className="text-black font-medium">
            {isHovered ? "DRAWN ↑" : idx === 1 ? "PEAK APEX" : "ALWAYS OPEN"}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DataPrivacySection() {
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
      className="landing-section border-t border-[#e5e5e5] overflow-hidden"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Stroke-only Line-Drawn Lock Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa]"
        >
          <Lock className="h-5 w-5 text-black stroke-[1.5]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="display-lg max-w-xl mx-auto"
        >
          Your words and memory data stay yours.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="body-md mt-3 max-w-lg mx-auto"
        >
          We believe language learners should never be trapped in proprietary
          systems. Your decks, custom mnemonics, and mastery curves are always
          100% exportable.
        </motion.p>

        {/* Desktop: Scroll-driven Progressive Fan Deck */}
        <div className="hidden md:flex justify-center items-center min-h-[420px] relative py-12 select-none">
          <div className="relative flex justify-center items-center w-full max-w-2xl text-left">
            {privacyCards.map((item, idx) => (
              <PrivacyCardItem
                key={item.title}
                item={item}
                idx={idx}
                fanProgress={fanProgress}
                hoveredIdx={hoveredIdx}
                setHoveredIdx={setHoveredIdx}
              />
            ))}
          </div>
        </div>

        {/* Mobile: Grid Stack */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden pt-4 text-left">
          {privacyCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className="h-5 w-5 text-black stroke-[1.75]" />
                  <span className="text-[11px] font-mono text-[#737373] border border-[#e5e5e5] bg-white px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <h3 className="heading-sm text-black">{item.title}</h3>
                <p className="body-sm mt-1.5 leading-relaxed text-[#525252]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
