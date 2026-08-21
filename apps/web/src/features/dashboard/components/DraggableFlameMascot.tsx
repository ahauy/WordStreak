import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { StreakFlame } from "./StreakFlame";
import { getFlameTier, REAL_FIRE_TIER } from "../config/flameTiers";
import { Sparkles } from "lucide-react";

interface DraggableFlameMascotProps {
  currentStreak?: number;
  onOpenFlameNurture?: () => void;
  feedingTrigger?: { id: number; wordCount: number } | null;
}

interface WoodParticle {
  id: number;
  startX: number;
  startY: number;
}

const STORAGE_KEY = "wordstreak_flame_mascot_pos";

const CAMPFIRE_SPARKS = [
  {
    x: [-2, -10, -18],
    y: [0, -22, -58],
    size: 3.5,
    duration: 1.1,
    delay: 0.05,
    color: "#facc15",
  },
  {
    x: [2, 12, 22],
    y: [0, -26, -68],
    size: 3,
    duration: 1.3,
    delay: 0.25,
    color: "#ea580c",
  },
  {
    x: [-1, -5, -12],
    y: [0, -35, -82],
    size: 4,
    duration: 1.2,
    delay: 0.5,
    color: "#fbbf24",
  },
  {
    x: [1, 8, 16],
    y: [0, -30, -72],
    size: 2.8,
    duration: 1.4,
    delay: 0.15,
    color: "#f97316",
  },
  {
    x: [-3, 5, -8],
    y: [0, -42, -96],
    size: 3.8,
    duration: 1.5,
    delay: 0.7,
    color: "#fef08a",
  },
  {
    x: [4, -6, 10],
    y: [0, -34, -78],
    size: 3,
    duration: 1.2,
    delay: 0.35,
    color: "#dc2626",
  },
  {
    x: [0, 3, 6],
    y: [0, -48, -106],
    size: 4.2,
    duration: 1.6,
    delay: 0.85,
    color: "#ffffff",
  },
  {
    x: [-2, 10, -4],
    y: [0, -36, -86],
    size: 3.2,
    duration: 1.25,
    delay: 0.4,
    color: "#facc15",
  },
];

export const DraggableFlameMascot: React.FC<DraggableFlameMascotProps> = ({
  currentStreak = 0,
  onOpenFlameNurture,
  feedingTrigger = null,
}) => {
  const dailyTierInfo = getFlameTier(currentStreak);
  const dragControls = useDragControls();
  const mascotRef = useRef<HTMLDivElement>(null);

  // Position state (persisted in localStorage, defaults to bottom-right corner)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            // Keep within viewport boundaries
            const maxX = Math.max(20, window.innerWidth - 88);
            const maxY = Math.max(20, window.innerHeight - 108);
            return {
              x: Math.min(Math.max(20, parsed.x), maxX),
              y: Math.min(Math.max(20, parsed.y), maxY),
            };
          }
        }
      } catch {
        // Fallback below
      }
      return {
        x: Math.max(20, window.innerWidth - 88),
        y: Math.max(20, window.innerHeight - 108),
      };
    }
    return { x: 300, y: 500 };
  });

  // Mascot animation & real-fire states
  const [isSupercharged, setIsSupercharged] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [flyingWoods, setFlyingWoods] = useState<WoodParticle[]>([]);
  const [celebrationText, setCelebrationText] = useState<string | null>(null);
  const [bubbleQuote, setBubbleQuote] = useState<string | null>(null);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  // When burning wood -> use REAL_FIRE_TIER (natural red-orange-yellow fire); otherwise daily streak tier
  const activeTierInfo =
    isSupercharged || isFeeding ? REAL_FIRE_TIER : dailyTierInfo;

  // Track drag vs click threshold
  const dragDistanceRef = useRef(0);

  // Ensure default bottom-right position on initial mount & adjust on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = Math.max(20, window.innerWidth - 88);
        const maxY = Math.max(20, window.innerHeight - 108);
        return {
          x: Math.min(Math.max(20, prev.x), maxX),
          y: Math.min(Math.max(20, prev.y), maxY),
        };
      });
    };

    // If no custom dragged position exists, lock firmly to bottom-right corner
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved && typeof window !== "undefined") {
        setPosition({
          x: Math.max(20, window.innerWidth - 88),
          y: Math.max(20, window.innerHeight - 108),
        });
      }
    } catch {
      // Ignore storage errors
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save position on drag end
  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; point: { x: number; y: number } },
  ) => {
    const newX = Math.min(
      Math.max(20, position.x + info.offset.x),
      window.innerWidth - 88,
    );
    const newY = Math.min(
      Math.max(20, position.y + info.offset.y),
      window.innerHeight - 108,
    );
    setPosition({ x: newX, y: newY });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: newX, y: newY }));
    } catch {
      // Ignore storage errors
    }
  };

  // Watch for feeding triggers (e.g. completed test/review cards)
  useEffect(() => {
    if (!feedingTrigger || feedingTrigger.wordCount <= 0) return;

    const count = feedingTrigger.wordCount;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const startTimer = setTimeout(() => {
      setIsFeeding(true);
      setBubbleQuote(`Nạp ${count} từ vựng! Đang tiếp củi gỗ 🪵...`);
      setIsBubbleVisible(true);

      // Create wood particles flying from screen center towards the mascot
      const logCount = Math.min(Math.max(3, Math.round(count / 2)), 6);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const newWoods: WoodParticle[] = Array.from(
        { length: logCount },
        (_, i) => ({
          id: Date.now() + i,
          startX: centerX + (Math.random() * 100 - 50),
          startY: centerY + (Math.random() * 100 - 50),
        }),
      );

      setFlyingWoods(newWoods);

      // After woods arrive (0.8s), trigger burning real campfire blaze & enlargement
      const superchargeTimer = setTimeout(() => {
        setFlyingWoods([]);
        setIsFeeding(false);
        setIsSupercharged(true);
        setCelebrationText(`+${count} 🪵 Lửa Cháy Rực!`);
        setBubbleQuote("Củi bắt lửa! Ngọn lửa đỏ rực bùng cháy! 🔥");

        // Cooldown and return to base daily streak tier after 3.5s
        const cooldownTimer = setTimeout(() => {
          setIsSupercharged(false);
          setCelebrationText(null);
          setIsBubbleVisible(false);
        }, 3500);
        timeouts.push(cooldownTimer);
      }, 800);

      timeouts.push(superchargeTimer);
    }, 0);

    timeouts.push(startTimer);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [feedingTrigger]);

  const handleMascotClick = () => {
    if (dragDistanceRef.current > 8) {
      // Was a drag, do not trigger click
      return;
    }

    // Interactive speech quotes
    const quotes = [
      "Kéo thả tớ đi đâu cũng được nhé!",
      "Ôn tập từ vựng mỗi ngày để tớ được tiếp củi cháy to!",
      "Chạm vào tớ để mở Khu Vườn Nuôi Lửa!",
      `Hôm nay: ${dailyTierInfo.titleVi} (${currentStreak} ngày)!`,
    ];
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    setBubbleQuote(random);
    setIsBubbleVisible(true);

    // Also trigger modal open
    onOpenFlameNurture?.();

    setTimeout(() => {
      setIsBubbleVisible(false);
    }, 3500);
  };

  const content = (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* ─── Flying Wood Particles Animation ─── */}
      <AnimatePresence>
        {flyingWoods.map((wood, idx) => (
          <motion.div
            key={wood.id}
            initial={{
              x: wood.startX,
              y: wood.startY,
              scale: 0.3,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              x: position.x + 24,
              y: position.y + 24,
              scale: [0.3, 1.1, 0.8, 0.3],
              opacity: [0, 1, 1, 0.2],
              rotate: 360 * (idx % 2 === 0 ? 1 : -1),
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.75,
              delay: idx * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed pointer-events-none z-50 text-xl filter drop-shadow-sm select-none"
          >
            🪵
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ─── Draggable Pure Flame Mascot ─── */}
      <motion.div
        ref={mascotRef}
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.05}
        onDragStart={() => {
          dragDistanceRef.current = 0;
        }}
        onDrag={(_, info) => {
          dragDistanceRef.current +=
            Math.abs(info.delta.x) + Math.abs(info.delta.y);
        }}
        onDragEnd={handleDragEnd}
        animate={{
          x: position.x,
          y: position.y,
          scale: isSupercharged ? 1.45 : isFeeding ? 1.15 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 22,
        }}
        style={{
          touchAction: "none",
        }}
        className="fixed top-0 left-0 pointer-events-auto select-none cursor-grab active:cursor-grabbing group"
      >
        <div className="relative flex flex-col items-center justify-center p-1">
          {/* Floating Speech / Celebration Bubble */}
          <AnimatePresence>
            {(celebrationText || (isBubbleVisible && bubbleQuote)) && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.85 }}
                animate={{ opacity: 1, y: -6, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.85 }}
                className={`absolute bottom-full mb-1 whitespace-nowrap px-3 py-1 rounded-2xl text-xs font-bold shadow-lg border backdrop-blur-md pointer-events-none flex items-center gap-1.5 ${
                  celebrationText
                    ? "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]"
                    : "bg-white/95 text-black border-[#e5e5e5]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 fill-current text-[#ea580c]" />
                <span>{celebrationText || bubbleQuote}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pure Dancing Flame Mascot */}
          <div
            onClick={handleMascotClick}
            className="relative transition-all duration-300 flex items-center justify-center filter drop-shadow-sm hover:drop-shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            title="Ngọn Lửa Đồng Hành (Kéo thả để di chuyển, nhấp để mở Nuôi Lửa)"
          >
            <StreakFlame
              customTierInfo={activeTierInfo}
              size={isSupercharged ? "lg" : "md"}
              showEmbers={true}
              showGlow={true}
            />

            {/* Dynamic realistic flying campfire sparks during wood burning */}
            {isSupercharged && (
              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {CAMPFIRE_SPARKS.map((spark, i) => (
                  <motion.span
                    key={i}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0.7,
                    }}
                    animate={{
                      x: spark.x,
                      y: spark.y,
                      opacity: [0, 1, 0.9, 0],
                      scale: [0.7, 1.3, 0.6, 0],
                    }}
                    transition={{
                      duration: spark.duration,
                      delay: spark.delay,
                      repeat: Infinity,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    style={{
                      position: "absolute",
                      top: "25%",
                      left: "50%",
                      width: `${spark.size}px`,
                      height: `${spark.size}px`,
                      borderRadius: "9999px",
                      backgroundColor: spark.color,
                      boxShadow: `0 0 8px ${spark.color}, 0 0 2px #ffffff`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
};
