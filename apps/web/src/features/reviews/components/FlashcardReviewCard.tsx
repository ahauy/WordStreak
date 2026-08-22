import React, { useEffect, useCallback } from "react";
import { Volume2, BookOpen, Lightbulb, RotateCw, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DueCardItem, SrsRating } from "@wordstreak/shared-types";

interface FlashcardReviewCardProps {
  card: DueCardItem;
  isFlipped: boolean;
  isSubmitting: boolean;
  onFlip: () => void;
  onRate: (rating: SrsRating) => void;
  onOpenVoicePractice?: () => void;
}

export const FlashcardReviewCard: React.FC<FlashcardReviewCardProps> = ({
  card,
  isFlipped,
  isSubmitting,
  onFlip,
  onRate,
  onOpenVoicePractice,
}) => {
  const { t, i18n } = useTranslation([
    "study",
    "cards",
    "ai_vocabulary",
    "common",
  ]);
  const isVi = (i18n.resolvedLanguage || i18n.language || "").startsWith("vi");

  const speakWord = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Audio playback handler (Native audio or SpeechSynthesis fallback)
  const playAudio = useCallback(() => {
    if (card.audioUrl) {
      const audio = new Audio(card.audioUrl);
      audio.play().catch(() => {
        // Fallback to Web Speech API
        speakWord(card.word);
      });
    } else {
      speakWord(card.word);
    }
  }, [card.audioUrl, card.word, speakWord]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onFlip();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        playAudio();
      } else if (isFlipped && !isSubmitting) {
        if (e.key === "1") {
          e.preventDefault();
          onRate(1);
        } else if (e.key === "2") {
          e.preventDefault();
          onRate(2);
        } else if (e.key === "3") {
          e.preventDefault();
          onRate(3);
        } else if (e.key === "4") {
          e.preventDefault();
          onRate(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isSubmitting, onFlip, onRate, playAudio]);

  const unitDay = isVi ? " ngày" : "d";
  const goodInterval =
    card.repetitions === 0
      ? `1${unitDay}`
      : card.repetitions === 1
        ? `6${unitDay}`
        : `${Math.round(card.interval * card.easeFactor)}${unitDay}`;

  const easyInterval =
    card.repetitions === 0
      ? `4${unitDay}`
      : `${Math.round(card.interval * card.easeFactor * 1.3)}${unitDay}`;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 3D Perspective Card Container */}
      <div
        className="w-full min-h-[380px] perspective-1000 cursor-pointer select-none"
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard for ${card.word}. Click or press space to flip.`}
      >
        <div
          className={`relative w-full min-h-[380px] rounded-2xl transition-transform duration-500 transform-style-3d border border-[#e5e5e5] bg-[#ffffff] shadow-sm hover:border-[#d4d4d4] ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT FACE (UGC word/IPA rendered verbatim) */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-8 flex flex-col justify-between rounded-2xl bg-[#ffffff]">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fafafa] border border-[#e5e5e5] text-[#525252]">
                <BookOpen className="w-3.5 h-3.5 text-[#737373]" />
                {card.deckTitle}
              </span>
              <span className="text-xs text-[#a3a3a3] font-mono">
                {card.status === "NEW"
                  ? t("cards:status.new", "New Word")
                  : `${card.interval}${unitDay}`}
              </span>
            </div>

            {/* Word & IPA (100% UGC) */}
            <div className="my-auto text-center py-6">
              <h2 className="text-4xl sm:text-5xl font-semibold text-[#000000] tracking-tight font-display mb-3">
                {card.word}
              </h2>
              <div className="flex items-center justify-center gap-2">
                {card.phonetic && (
                  <span className="text-lg text-[#737373] font-mono">
                    {card.phonetic}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio();
                  }}
                  className="p-1.5 rounded-full hover:bg-[#fafafa] text-[#525252] hover:text-[#000000] transition-colors cursor-pointer"
                  title="Listen pronunciation (R)"
                  aria-label="Listen pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                {onOpenVoicePractice && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenVoicePractice();
                    }}
                    className="p-1.5 rounded-full hover:bg-[#f3e8ff] text-[#7e22ce] hover:text-[#6b21a8] transition-colors cursor-pointer"
                    title={t(
                      "practice:modes.pronunciation",
                      "Pronunciation Practice",
                    )}
                    aria-label={t(
                      "practice:modes.pronunciation",
                      "Pronunciation Practice",
                    )}
                    data-testid="voice-practice-trigger-front"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Flip prompt */}
            <div className="text-center text-xs text-[#a3a3a3] flex items-center justify-center gap-1.5 pt-2 border-t border-[#f5f5f5]">
              <RotateCw className="w-3 h-3 animate-spin-slow" />
              <span>
                {t(
                  "study:session.flipPrompt",
                  "Click card or press Space to flip",
                )}
              </span>
            </div>
          </div>

          {/* BACK FACE (UGC meaning/example rendered verbatim) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-8 flex flex-col justify-between rounded-2xl bg-[#ffffff] overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#f5f5f5] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold text-[#000000] font-display">
                    {card.word}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio();
                    }}
                    className="p-1 rounded-full hover:bg-[#fafafa] text-[#737373] hover:text-[#000000] cursor-pointer"
                    title="Replay audio (R)"
                    aria-label="Replay audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  {onOpenVoicePractice && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenVoicePractice();
                      }}
                      className="p-1 rounded-full hover:bg-[#f3e8ff] text-[#7e22ce] hover:text-[#6b21a8] transition-colors cursor-pointer"
                      title={t(
                        "practice:modes.pronunciation",
                        "Pronunciation Practice",
                      )}
                      aria-label={t(
                        "practice:modes.pronunciation",
                        "Pronunciation Practice",
                      )}
                      data-testid="voice-practice-trigger-back"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {card.phonetic && (
                  <span className="text-sm text-[#737373] font-mono">
                    {card.phonetic}
                  </span>
                )}
              </div>

              {/* Meaning (UGC) */}
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#a3a3a3] mb-1">
                  {t("cards:table.columnDefinition", "Meaning")}
                </p>
                <p className="text-lg font-medium text-[#000000] leading-relaxed">
                  {card.meaning}
                </p>
              </div>

              {/* Example Sentence (UGC) */}
              {card.exampleSentence && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs uppercase tracking-wider font-semibold text-[#737373] mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />{" "}
                    {t("cards:table.columnExample", "Example")}
                  </p>
                  <p className="text-sm text-[#090909] italic leading-normal">
                    "{card.exampleSentence}"
                  </p>
                </div>
              )}

              {/* Collocations (UGC) */}
              {card.collocations && (
                <div className="mb-3 text-xs text-[#525252]">
                  <span className="font-semibold text-[#737373] uppercase tracking-wider">
                    {t("ai_vocabulary:fields.collocations", "Collocations")}
                    :{" "}
                  </span>
                  <span className="font-medium text-[#000000]">
                    {card.collocations}
                  </span>
                </div>
              )}

              {/* Mnemonic (UGC) */}
              {card.mnemonic && (
                <div className="flex items-start gap-1.5 text-xs text-[#737373] bg-[#fafafa] p-2.5 rounded-lg border border-[#e5e5e5]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#ffbd2e] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#525252]">
                      {t("ai_vocabulary:fields.mnemonic", "Memory Tip")}:
                    </strong>{" "}
                    {card.mnemonic}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-[#a3a3a3] pt-2 border-t border-[#f5f5f5] mt-2">
              {t("study:session.shortcutsHint", "Shortcuts: 1-4 for ratings")}
            </div>
          </div>
        </div>
      </div>

      {/* 4-TIER OBSIDIAN SRS RATING BUTTONS (BR-I18N-008) */}
      <div className="w-full mt-6 flex flex-col items-center gap-3">
        {isFlipped ? (
          <div className="grid grid-cols-4 gap-2.5 w-full">
            {/* AGAIN (1) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onRate(1)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:bg-[#fafafa] hover:border-[#d4d4d4] active:bg-[#f5f5f5] transition-all disabled:opacity-50 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#ff5f56]">
                {t("study:rating.again", "Again")}
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5">
                {t("study:rating.intervalShort", "< 10m")}
              </span>
              <kbd className="mt-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[#fafafa] border border-[#e5e5e5] font-mono text-[#737373] group-hover:text-[#000000]">
                1
              </kbd>
            </button>

            {/* HARD (2) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onRate(2)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:bg-[#fafafa] hover:border-[#d4d4d4] active:bg-[#f5f5f5] transition-all disabled:opacity-50 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#ffbd2e]">
                {t("study:rating.hard", "Hard")}
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5">
                {t("study:rating.intervalOneDay", "1d")}
              </span>
              <kbd className="mt-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[#fafafa] border border-[#e5e5e5] font-mono text-[#737373] group-hover:text-[#000000]">
                2
              </kbd>
            </button>

            {/* GOOD (3) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onRate(3)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:bg-[#fafafa] hover:border-[#d4d4d4] active:bg-[#f5f5f5] transition-all disabled:opacity-50 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#27c93f]">
                {t("study:rating.good", "Good")}
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5">
                {goodInterval}
              </span>
              <kbd className="mt-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[#fafafa] border border-[#e5e5e5] font-mono text-[#737373] group-hover:text-[#000000]">
                3
              </kbd>
            </button>

            {/* EASY (4) */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onRate(4)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#e5e5e5] bg-[#ffffff] hover:bg-[#fafafa] hover:border-[#d4d4d4] active:bg-[#f5f5f5] transition-all disabled:opacity-50 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-[#000000]">
                {t("study:rating.easy", "Easy")}
              </span>
              <span className="text-[11px] text-[#737373] mt-0.5">
                {easyInterval}
              </span>
              <kbd className="mt-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[#fafafa] border border-[#e5e5e5] font-mono text-[#737373] group-hover:text-[#000000]">
                4
              </kbd>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onFlip}
            className="w-full py-3 px-6 rounded-full bg-[#000000] text-[#ffffff] font-medium text-sm hover:bg-[#090909] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{t("study:session.showAnswer", "Show Answer")}</span>
            <kbd className="px-2 py-0.5 text-xs rounded-full bg-[#262626] font-mono text-[#a3a3a3]">
              Space
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
};
