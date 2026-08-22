import React from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Search, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeckEmptyStateProps {
  statusTab: "active" | "archived";
  searchQuery?: string;
  onCreateDeck?: () => void;
  onClearSearch?: () => void;
}

export const DeckEmptyState: React.FC<DeckEmptyStateProps> = ({
  statusTab,
  searchQuery,
  onCreateDeck,
  onClearSearch,
}) => {
  const { t } = useTranslation("decks");

  if (searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 bg-[#fafafa] rounded-2xl border border-dashed border-[#e5e5e5] my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#737373] shadow-sm mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3
          className="text-base font-bold text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("emptyState.searchTitle", "No vocabulary decks found")}
        </h3>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          {t(
            "emptyState.searchDescription",
            'No results match the keyword "{{query}}".',
            { query: searchQuery },
          )}
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="btn-secondary h-8 px-4 text-xs font-semibold mt-4 cursor-pointer"
          >
            {t("emptyState.clearSearch", "Clear search filter")}
          </button>
        )}
      </motion.div>
    );
  }

  if (statusTab === "archived") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 bg-[#fafafa] rounded-2xl border border-dashed border-[#e5e5e5] my-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#737373] shadow-sm mb-3">
          <Archive className="w-6 h-6 text-[#F59E0B]" />
        </div>
        <h3
          className="text-base font-bold text-black"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("emptyState.archivedTitle", "No decks in archive")}
        </h3>
        <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
          {t(
            "emptyState.archivedDescription",
            "When you temporarily pause a deck, choose 'Archive' to keep your main study list organized.",
          )}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-6 bg-[#fafafa] rounded-2xl border border-[#e5e5e5] my-6 relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e5] mx-auto flex items-center justify-center text-[#9333ea] shadow-sm mb-4">
        <Layers className="w-7 h-7" />
      </div>

      <h3
        className="text-lg font-bold text-black tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("emptyState.title", "Start your vocabulary journey")}
      </h3>

      <p className="text-xs sm:text-sm text-[#737373] mt-1.5 max-w-md mx-auto leading-relaxed">
        {t(
          "emptyState.description",
          "Create your first vocabulary deck by topic (IELTS, TOEIC, Conversation) to begin the scientific Spaced Repetition (SM-2) cycle.",
        )}
      </p>

      {onCreateDeck && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onCreateDeck}
            className="btn-primary h-10 px-5 text-xs font-semibold gap-2 cursor-pointer inline-flex items-center"
          >
            <Plus className="w-4 h-4" />
            <span>{t("emptyState.action", "Create First Deck")}</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
