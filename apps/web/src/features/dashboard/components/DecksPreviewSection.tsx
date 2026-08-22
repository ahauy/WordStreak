import React from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  Plus,
  Zap,
  CheckCircle2,
  Globe,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { DeckResponse } from "@wordstreak/shared-types";

interface DecksPreviewSectionProps {
  decks?: DeckResponse[];
  isLoading?: boolean;
  onStartPractice?: (deckId?: string) => void;
  onCreateDeck?: () => void;
}

export const DecksPreviewSection: React.FC<DecksPreviewSectionProps> = ({
  decks = [],
  isLoading = false,
  onStartPractice,
  onCreateDeck,
}) => {
  const { t } = useTranslation(["dashboard", "common"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-3 py-1 mb-2 text-[#7e22ce]">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              {t("decksSection.badge", "Vocabulary Decks")}
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl font-bold text-black tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("decksSection.title", "Your Vocabulary Decks")}
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] mt-0.5">
            {t(
              "decksSection.subtitle",
              "Decks scheduled with scientific Spaced Repetition (SM-2).",
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/decks"
            className="btn-secondary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
          >
            <Layers className="w-3.5 h-3.5 text-[#525252]" />
            <span>{t("decksSection.manageAll", "Manage All")}</span>
          </Link>

          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-primary h-10 px-4 text-xs font-semibold gap-1.5 cursor-pointer inline-flex items-center"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>{t("decksSection.createNew", "Create Deck")}</span>
          </button>
        </div>
      </div>

      {/* Decks Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-48 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-20 h-5 bg-[#e5e5e5] rounded-full" />
                <div className="w-3/4 h-6 bg-[#e5e5e5] rounded-md" />
                <div className="w-full h-3.5 bg-[#e5e5e5] rounded-md" />
              </div>
              <div className="w-full h-8 bg-[#e5e5e5] rounded-full" />
            </div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        /* Zero Data Empty State for Brand New Users */
        <div className="rounded-3xl border border-[#e5e5e5] bg-[#fafafa] p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f3e8ff] border border-[#e9d5ff] text-[#7e22ce] flex items-center justify-center mb-4 shadow-xs">
            <Layers className="w-7 h-7" />
          </div>

          <h3
            className="text-lg sm:text-xl font-bold text-black tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("decksSection.emptyTitle", "No Vocabulary Decks Yet")}
          </h3>

          <p className="text-xs sm:text-sm text-[#737373] max-w-md mb-6 leading-relaxed">
            {t(
              "decksSection.emptyDesc",
              "Start your vocabulary journey by creating your first deck or explore high-quality community decks.",
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onCreateDeck}
              className="btn-primary h-10 px-5 text-xs font-semibold gap-2 shadow-xs cursor-pointer inline-flex items-center"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{t("decksSection.createFirst", "Create First Deck")}</span>
            </button>

            <Link
              to="/community"
              className="btn-secondary h-10 px-5 text-xs font-semibold gap-2 cursor-pointer inline-flex items-center"
            >
              <Globe className="w-4 h-4 text-[#525252]" />
              <span>
                {t("decksSection.exploreCommunity", "Explore Community Decks")}
              </span>
            </Link>
          </div>
        </div>
      ) : (
        /* Real Decks Grid (up to 3 recent decks) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {decks.slice(0, 3).map((deck) => {
            const dueCards = deck.stats?.dueCards || 0;
            const totalCards = deck.stats?.totalCards || 0;
            const masteredCards = deck.stats?.masteredCards || 0;
            const retentionRate =
              totalCards > 0
                ? Math.round((masteredCards / totalCards) * 100)
                : 0;
            const hasDue = dueCards > 0;
            const tag =
              deck.tags?.[0] || t("decksSection.defaultTag", "Vocabulary Deck");

            return (
              <motion.div
                key={deck.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white p-5 sm:p-6 shadow-xs hover:border-black flex flex-col justify-between group transition-colors"
              >
                <div>
                  {/* Top Deck Tag & Due Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fafafa] text-[#525252] border border-[#e5e5e5]">
                      {tag}
                    </span>
                    {hasDue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7e22ce] bg-[#f3e8ff] px-2.5 py-0.5 rounded-full border border-[#e9d5ff]">
                        <Zap className="w-3 h-3 fill-current" />{" "}
                        {t("decksSection.dueBadge", {
                          count: dueCards,
                          defaultValue: `${dueCards} due`,
                        })}
                      </span>
                    ) : totalCards === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#737373] bg-[#fafafa] px-2.5 py-0.5 rounded-full border border-[#e5e5e5]">
                        <Sparkles className="w-3 h-3" />{" "}
                        {t("decksSection.noCards", "No cards")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                        <CheckCircle2 className="w-3 h-3" />{" "}
                        {t("decksSection.completed", "Completed")}
                      </span>
                    )}
                  </div>

                  {/* Deck Title & Description */}
                  <h3
                    className="text-base sm:text-lg font-bold text-black tracking-tight group-hover:text-[#7e22ce] transition-colors line-clamp-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {deck.title}
                  </h3>
                  <p className="text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed">
                    {deck.description ||
                      t("decksSection.noDesc", "No description provided.")}
                  </p>
                </div>

                {/* Deck Stats & Action */}
                <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                  <div className="text-xs text-[#737373]">
                    {t("decksSection.cardsCount", {
                      count: totalCards,
                      defaultValue: `${totalCards} cards`,
                    })}{" "}
                    ·{" "}
                    <span className="text-[#16a34a] font-semibold">
                      {t("decksSection.retentionRate", {
                        rate: retentionRate,
                        defaultValue: `${retentionRate}% retained`,
                      })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartPractice?.(deck.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:text-[#7e22ce] transition-colors cursor-pointer"
                  >
                    <span>
                      {hasDue
                        ? t("decksSection.studyNow", "Study Now")
                        : totalCards === 0
                          ? t("decksSection.viewDetails", "View Details")
                          : t("decksSection.practice", "Practice")}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
