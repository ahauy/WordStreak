import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Zap,
  Sparkles,
  Shield,
  CheckCircle2,
  Lock,
  Flame,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StreakFlame } from "./StreakFlame";
import { FLAME_TIERS, getFlameTier } from "../config/flameTiers";

interface FlameNurtureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak?: number;
  longestStreak?: number;
  cardsFedToday?: number;
  dailyGoal?: number;
  onStartReview?: () => void;
  onFeedWood?: (count: number) => void;
}

export const FlameNurtureModal: React.FC<FlameNurtureModalProps> = ({
  isOpen,
  onClose,
  currentStreak = 0,
  longestStreak = 0,
  cardsFedToday = 0,
  dailyGoal = 10,
  onStartReview,
  onFeedWood,
}) => {
  const { t, i18n } = useTranslation(["dashboard", "common"]);
  const currentTier = getFlameTier(currentStreak);
  const [selectedTierPreview, setSelectedTierPreview] = useState<number>(
    currentTier.tier,
  );
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionQuote, setInteractionQuote] = useState<string>(() =>
    t(
      "flameModal.touchPrompt",
      "Chạm vào tớ để tiếp thêm động lực học tập nhé!",
    ),
  );

  // Quotes when poking the flame
  const quotes = [
    t(
      "flameModal.quote1",
      "Mỗi từ vựng ôn tập là 1 giọt lửa nuôi dưỡng trí nhớ!",
    ),
    t(
      "flameModal.quote2",
      "Kiên trì mỗi ngày, ngọn lửa của bạn sẽ sớm đạt bậc Kim Cương!",
    ),
    t(
      "flameModal.quote3",
      "Hôm nay bạn đã ôn tập chưa? Tớ đang chờ nạp từ mới nè!",
    ),
    t(
      "flameModal.quote4",
      "Spaced Repetition giúp ngọn lửa không bao giờ tàn!",
    ),
    t(
      "flameModal.quote5",
      "Chuỗi ngày càng dài, ngọn lửa càng tỏa ánh sáng huyền diệu!",
    ),
  ];

  const handlePokeFlame = () => {
    setIsInteracting(true);
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setInteractionQuote(randomQuote);
    setTimeout(() => setIsInteracting(false), 500);
  };

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFedToday = cardsFedToday >= dailyGoal;
  const nextTier =
    currentTier.nextTierDays !== null
      ? FLAME_TIERS[currentTier.tier + 1]
      : null;
  const daysToNextTier =
    currentTier.nextTierDays !== null
      ? Math.max(0, currentTier.nextTierDays - currentStreak)
      : 0;

  const previewTierInfo = FLAME_TIERS[selectedTierPreview];
  const isVi = i18n.language === "vi";
  const currentTierTitle = isVi ? currentTier.titleVi : currentTier.name;
  const previewTierTitle = isVi
    ? previewTierInfo.titleVi
    : previewTierInfo.name;
  const previewTierDesc = isVi
    ? previewTierInfo.descriptionVi
    : previewTierInfo.descriptionEn || previewTierInfo.descriptionVi;
  const nextTierTitle = nextTier
    ? isVi
      ? nextTier.titleVi
      : nextTier.name
    : "";

  const modalContent = (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-[#e5e5e5] shadow-2xl flex flex-col max-h-[88vh] my-auto text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
            <div className="flex items-center gap-2.5">
              <StreakFlame
                streakDays={currentStreak}
                size="sm"
                showEmbers={false}
              />
              <div>
                <h2
                  className="text-base sm:text-lg font-bold text-black tracking-tight flex items-center gap-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span>
                    {t(
                      "flameModal.gardenTitle",
                      "Khu Vườn Nuôi Lửa & Tiến Hóa",
                    )}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentTier.pillBg} ${currentTier.pillText} ${currentTier.pillBorder}`}
                  >
                    Tier {currentTier.tier}: {currentTierTitle}
                  </span>
                </h2>
                <p className="text-xs text-[#737373]">
                  {t(
                    "flameModal.gardenSubtitle",
                    "Duy trì ôn tập mỗi ngày để nạp năng lượng và tiến hóa ngọn lửa.",
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#737373] hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer"
              aria-label={t("actions.close", "Close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
            {/* ─── Hero Flame Stage ─── */}
            <div className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-gradient-to-b from-[#fafafa] to-white p-6 flex flex-col items-center justify-center text-center">
              {/* Poking Speech Bubble */}
              <motion.div
                key={interactionQuote}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e5e5] text-xs font-medium text-black shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9333ea]" />
                <span>{interactionQuote}</span>
              </motion.div>

              {/* Interactive Flame Avatar */}
              <motion.div
                animate={
                  isInteracting
                    ? { scale: [1, 1.15, 0.95, 1], rotate: [0, -5, 5, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                onClick={handlePokeFlame}
                className="cursor-pointer my-2 select-none relative group"
                title={t("flameModal.touchFlameTooltip", "Chạm vào ngọn lửa!")}
              >
                <StreakFlame
                  tier={selectedTierPreview}
                  size="xl"
                  showEmbers={true}
                  showGlow={true}
                />
              </motion.div>

              <h3
                className="text-lg font-extrabold text-black tracking-tight mt-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {previewTierTitle} ({previewTierInfo.daysRange})
              </h3>
              <p className="text-xs text-[#737373] max-w-md mt-1 leading-relaxed">
                {previewTierDesc}
              </p>

              {selectedTierPreview !== currentTier.tier && (
                <button
                  type="button"
                  onClick={() => setSelectedTierPreview(currentTier.tier)}
                  className="mt-3 text-xs font-semibold text-[#9333ea] hover:underline cursor-pointer"
                >
                  {t(
                    "flameModal.returnToCurrent",
                    "← Quay lại ngọn lửa hiện tại của bạn",
                  )}
                </button>
              )}
            </div>

            {/* ─── Daily Nurturing Energy (Fuel Feed) ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1: Hôm nay cho lửa ăn */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#525252] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#9333ea]" />{" "}
                      {t("flameModal.fuelToday", "Nhiên liệu hôm nay")}
                    </span>
                    <span className="font-bold text-black font-mono">
                      {cardsFedToday} / {dailyGoal}{" "}
                      {t("flameModal.cardsUnit", "thẻ")}
                    </span>
                  </div>

                  {/* Energy Progress Bar */}
                  <div className="w-full h-2.5 bg-white border border-[#e5e5e5] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#9333ea] to-[#c084fc] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((cardsFedToday / dailyGoal) * 100))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-[#737373] leading-relaxed">
                    {isFedToday ? (
                      <span className="text-[#16a34a] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                        {t(
                          "flameModal.flameFull",
                          "Ngọn lửa đã no nê và đang bảo vệ chuỗi Streak hôm nay!",
                        )}
                      </span>
                    ) : (
                      <span>
                        {t("flameModal.needMorePrefix", "Cần ôn thêm ")}
                        <strong>
                          {Math.max(0, dailyGoal - cardsFedToday)}{" "}
                          {t("flameModal.cardsUnit", "thẻ")}
                        </strong>{" "}
                        {t(
                          "flameModal.needMoreSuffix",
                          "để giữ ngọn lửa không bị đói.",
                        )}
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex flex-wrap gap-2 justify-between items-center">
                  <span className="text-xs text-[#737373]">
                    {t("flameModal.statusLabel", "Trạng thái: ")}
                    <strong
                      className={
                        isFedToday ? "text-[#16a34a]" : "text-[#d97706]"
                      }
                    >
                      {isFedToday
                        ? t("flameModal.statusFull", "Rực rỡ")
                        : t("flameModal.statusHungry", "Đang đói")}
                    </strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onFeedWood?.(5);
                        onClose();
                      }}
                      className="btn-secondary h-8 px-3 text-xs font-medium gap-1 cursor-pointer"
                      title={t(
                        "flameModal.feedWoodTooltip",
                        "Nạp 5 khúc củi gỗ vào linh vật lửa",
                      )}
                    >
                      <span>{t("flameModal.feedWoodBtn", "🪵 +5 củi")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onStartReview?.();
                      }}
                      className="btn-primary h-8 px-3.5 text-xs font-medium gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{t("flameModal.reviewNowBtn", "Ôn tập ngay")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Tiến trình thăng cấp tiếp theo */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[#525252] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#0284c7]" />{" "}
                      {t("flameModal.nextEvolution", "Tiến hóa tiếp theo")}
                    </span>
                    <span className="font-bold text-[#0284c7] font-mono">
                      {nextTier ? `Tier ${nextTier.tier}` : "MAX TIER"}
                    </span>
                  </div>

                  {nextTier ? (
                    <>
                      <div className="flex items-center gap-2.5 my-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center">
                          <StreakFlame
                            tier={nextTier.tier}
                            size="xs"
                            showEmbers={false}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-black">
                            {nextTierTitle}
                          </p>
                          <p className="text-[11px] text-[#737373]">
                            {t("flameModal.reqStreak", {
                              days: nextTier.minDays,
                              defaultValue: `Yêu cầu: ${nextTier.minDays} ngày liên tục`,
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#737373] mt-2">
                        {t("flameModal.daysRemaining", {
                          days: daysToNextTier,
                          defaultValue: `Còn ${daysToNextTier} ngày nữa để ngọn lửa đổi màu và bùng nổ năng lượng mới!`,
                        })}
                      </p>
                    </>
                  ) : (
                    <div className="text-xs text-[#7e22ce] font-semibold flex items-center gap-1 py-3">
                      <Sparkles className="w-4 h-4" />{" "}
                      {t(
                        "flameModal.maxTierMsg",
                        "Bạn đã đạt cảnh giới Lửa Kim Cương Bất Tử!",
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs text-[#737373]">
                  <span>
                    {t("flameModal.recordStreak", "Chuỗi kỷ lục: ")}
                    <strong className="text-black">
                      {longestStreak} {t("flameModal.daysUnit", "ngày")}
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#16a34a] bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                    <Shield className="w-2.5 h-2.5" /> Freeze: 1
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 8-Tier Evolution Gallery ─── */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#9333ea]" />
                  <span>
                    {t(
                      "flameModal.galleryTitle",
                      "Bộ Sưu Tập 8 Cấp Độ Lửa Streak",
                    )}
                  </span>
                </h4>
                <span className="text-xs text-[#737373]">
                  {t(
                    "flameModal.galleryHint",
                    "Nhấn vào từng Tier để xem trước",
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FLAME_TIERS.map((tier) => {
                  const isUnlocked = currentStreak >= tier.minDays;
                  const isSelected = selectedTierPreview === tier.tier;
                  const tTitle = isVi ? tier.titleVi : tier.name;

                  return (
                    <button
                      key={tier.tier}
                      type="button"
                      onClick={() => setSelectedTierPreview(tier.tier)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                        isSelected
                          ? "border-black bg-[#fafafa] shadow-xs scale-[1.02]"
                          : isUnlocked
                            ? "border-[#e5e5e5] bg-white hover:border-[#d4d4d4] hover:bg-[#fafafa]"
                            : "border-[#e5e5e5] bg-[#fafafa]/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center">
                          <StreakFlame
                            tier={tier.tier}
                            size="xs"
                            showEmbers={false}
                          />
                        </div>
                        {isUnlocked ? (
                          <span className="text-[10px] font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 py-0.5 rounded-full">
                            {t("flameModal.unlocked", "Đã mở")}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#737373] flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {tier.minDays}d
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-black line-clamp-1">
                          {tTitle}
                        </p>
                        <p className="text-[10px] font-mono text-[#737373]">
                          {tier.daysRange}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
