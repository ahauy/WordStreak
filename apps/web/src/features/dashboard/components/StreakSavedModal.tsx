import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Snowflake, ArrowRight, Zap } from "lucide-react";

export interface StreakSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays?: number;
  streakFreezes?: number;
  maxStreakFreezes?: number;
  freezesUsed?: number;
}

export const StreakSavedModal: React.FC<StreakSavedModalProps> = ({
  isOpen,
  onClose,
  streakDays = 1,
  streakFreezes = 1,
  maxStreakFreezes = 2,
  freezesUsed = 1,
}) => {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key and autofocus primary action
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-saved-title"
        onClick={onClose}
      >
        {/* Stable outer container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-[#e5e5e5] p-6 sm:p-8 text-center shadow-2xl text-black my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close streak saved modal"
            className="absolute top-4 right-4 p-2 text-[#737373] hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Ice Frost Cyan Shield Icon */}
          <div className="relative my-4 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-20 h-20 rounded-full bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center text-cyan-600 shadow-sm relative"
            >
              <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700">
                <Snowflake className="w-4 h-4 text-cyan-600" />
              </div>
            </motion.div>

            {/* Frost Badge */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200"
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Streak Freeze Activated</span>
            </motion.div>
          </div>

          {/* Title & Body */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="space-y-3 mt-2"
          >
            <h2
              id="streak-saved-title"
              className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Streak Protected!
            </h2>

            <p
              data-testid="streak-saved-body"
              className="text-sm text-[#737373] leading-relaxed max-w-sm mx-auto"
            >
              {freezesUsed > 1
                ? `You missed ${freezesUsed} days, but your Streak Freezes automatically protected your `
                : "You missed a day, but your Streak Freeze automatically protected your "}
              <strong className="text-black font-semibold font-mono">
                {streakDays}-day
              </strong>{" "}
              streak! 🧊{" "}
              <span className="font-semibold text-cyan-800 font-mono">
                {streakFreezes} freeze{streakFreezes === 1 ? "" : "s"}{" "}
                remaining.
              </span>
            </p>
          </motion.div>

          {/* Protection Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="grid grid-cols-2 gap-3 my-6"
          >
            {/* Preserved Streak */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex flex-col items-center">
              <span className="text-xs font-medium text-[#737373] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#9333ea]" />
                <span>Streak Saved</span>
              </span>
              <span
                className="text-xl font-extrabold text-black font-mono mt-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {streakDays} Days
              </span>
            </div>

            {/* Freezes Remaining */}
            <div className="p-3.5 rounded-2xl bg-cyan-50/50 border border-cyan-200 flex flex-col items-center">
              <span className="text-xs font-medium text-cyan-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                <span>Freezes Left</span>
              </span>
              <span
                className="text-xl font-extrabold text-cyan-900 font-mono mt-0.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {streakFreezes}/{maxStreakFreezes}
              </span>
            </div>
          </motion.div>

          {/* Obsidian Primary Pill CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onClose}
              className="w-full btn-primary h-12 rounded-full text-sm font-medium gap-2 shadow-xs cursor-pointer justify-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <span>Keep Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
