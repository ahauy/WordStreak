import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Edit2,
  Trash2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { playWordPronunciation } from "../utils/speech";
import type { CardResponse } from "@wordstreak/shared-types";

interface CardItemCardProps {
  card: CardResponse;
  deckColor?: string;
  onEdit: (card: CardResponse) => void;
  onDelete: (card: CardResponse) => void;
}

export const CardItemCard: React.FC<CardItemCardProps> = ({
  card,
  deckColor = "#6366F1",
  onEdit,
  onDelete,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsPlayingAudio(true);
      await playWordPronunciation(card.word, card.audioUrl);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "MASTERED":
        return {
          label: "Thành thạo",
          bg: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
        };
      case "LEARNING":
      case "REVIEW":
        return {
          label: "Đang học",
          bg: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
        };
      case "NEW":
      default:
        return {
          label: "Thẻ mới",
          bg: "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]",
        };
    }
  };

  const statusInfo = getStatusBadge(card.progress?.status);
  const collocationsList = card.collocations
    ? card.collocations
        .split(/[,;\n]+/)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const hasExtraContext = Boolean(
    card.exampleSentence ||
    collocationsList.length > 0 ||
    card.mnemonic ||
    card.imageUrl,
  );

  return (
    // Lesson 1 (MEMORY.md): Stable outer anchor to prevent 60Hz hover flicker
    <div className="relative pt-2 -mt-2 pb-2 -mb-2 group">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className="bg-white rounded-2xl border border-[#e5e5e5] hover:border-[#d4d4d4] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-200 p-5 flex flex-col justify-between h-full relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: deckColor }}
        />

        {/* Top Header */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg}`}
            >
              {statusInfo.label}
            </span>

            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePlayAudio}
                aria-label={`Phát âm từ ${card.word}`}
                title="Phát âm từ vựng"
                className={`p-1.5 rounded-full text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer ${
                  isPlayingAudio ? "text-[#7e22ce] bg-[#f3e8ff]" : ""
                }`}
              >
                <Volume2
                  className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
              </button>

              <button
                type="button"
                onClick={() => onEdit(card)}
                aria-label={`Chỉnh sửa thẻ ${card.word}`}
                title="Chỉnh sửa thẻ"
                className="p-1.5 rounded-full text-[#737373] hover:text-black hover:bg-[#fafafa] transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(card)}
                aria-label={`Xóa thẻ ${card.word}`}
                title="Xóa thẻ"
                className="p-1.5 rounded-full text-[#737373] hover:text-[#ff5f56] hover:bg-[#fff1f2] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Word & IPA */}
          <div className="mb-2">
            <h4
              className="text-xl font-bold text-black tracking-tight break-words group-hover:text-[#7e22ce] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {card.word}
            </h4>
            {card.phonetic && (
              <span className="text-xs font-mono text-[#525252] bg-[#fafafa] px-2 py-0.5 rounded-md border border-[#e5e5e5] inline-block mt-1">
                {card.phonetic}
              </span>
            )}
          </div>

          {/* Meaning */}
          <p className="text-sm font-semibold text-black leading-relaxed mb-3">
            {card.meaning}
          </p>

          {/* Extra Context */}
          {hasExtraContext && (
            <div className="pt-2.5 border-t border-[#f0f0f0]">
              {card.exampleSentence && (
                <p className="text-xs text-[#525252] italic mb-2 leading-relaxed bg-[#fafafa] p-2.5 rounded-xl border border-[#e5e5e5]">
                  "{card.exampleSentence}"
                </p>
              )}

              {isExpanded && (
                <div className="space-y-2.5 animate-fadeIn mt-2">
                  {collocationsList.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider block mb-1">
                        Collocations
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {collocationsList.map((col, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#fafafa] text-[#525252] border border-[#e5e5e5]"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {card.mnemonic && (
                    <div className="p-2.5 rounded-xl bg-[#fffbeb] border border-[#fef3c7] flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#92400e] leading-snug">
                        {card.mnemonic}
                      </p>
                    </div>
                  )}

                  {card.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-[#e5e5e5] max-h-28 bg-[#fafafa]">
                      <img
                        src={card.imageUrl}
                        alt={card.word}
                        className="w-full h-28 object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-[11px] font-semibold text-[#737373] hover:text-black flex items-center gap-1 mt-1 transition-colors cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-[#7e22ce]" />
                    <span>Thu gọn chi tiết</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-[#7e22ce]" />
                    <span>Xem mẹo nhớ & collocations</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 mt-3 border-t border-[#f0f0f0] flex items-center justify-between text-[10px] text-[#a3a3a3] font-mono">
          <span>
            Lặp lại: {card.progress?.repetitions ?? 0} (EF:{" "}
            {card.progress?.easeFactor ?? 2.5})
          </span>
          <span>{new Date(card.createdAt).toLocaleDateString("vi-VN")}</span>
        </div>
      </motion.div>
    </div>
  );
};
