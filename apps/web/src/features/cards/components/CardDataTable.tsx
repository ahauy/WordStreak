import React, { useState } from "react";
import { Volume2, Edit2, Trash2, Lightbulb, Mic } from "lucide-react";
import { useTranslation } from "react-i18next";
import { playWordPronunciation } from "../utils/speech";
import type { CardResponse } from "@wordstreak/shared-types";

interface CardDataTableProps {
  cards: CardResponse[];
  selectedCardIds: string[];
  onToggleSelect: (cardId: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onEdit: (card: CardResponse) => void;
  onDelete: (card: CardResponse) => void;
  onVoicePractice?: (card: CardResponse) => void;
}

export const CardDataTable: React.FC<CardDataTableProps> = ({
  cards,
  selectedCardIds,
  onToggleSelect,
  onSelectAll,
  isAllSelected,
  onEdit,
  onDelete,
  onVoicePractice,
}) => {
  const { t } = useTranslation(["cards", "ai_vocabulary", "common"]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handlePlayAudio = async (
    e: React.MouseEvent,
    cardId: string,
    word: string,
    audioUrl?: string | null,
  ) => {
    e.stopPropagation();
    try {
      setPlayingAudioId(cardId);
      await playWordPronunciation(word, audioUrl);
    } finally {
      setPlayingAudioId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "MASTERED":
        return {
          label: t("cards:status.mastered", "Mastered"),
          bg: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
        };
      case "LEARNING":
      case "REVIEW":
        return {
          label: t("cards:status.learning", "Learning"),
          bg: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
        };
      case "NEW":
      default:
        return {
          label: t("cards:status.new", "New"),
          bg: "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]",
        };
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-[#737373] uppercase tracking-wider font-mono text-[10px]">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  aria-label={t("cards:bulk.selectDeselectAll", "Select All")}
                  className="w-4 h-4 rounded border-[#d4d4d4] text-[#7e22ce] focus:ring-[#7e22ce] cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-4 font-bold text-black min-w-[180px]">
                {t("cards:table.columnTerm", "Term")} &{" "}
                {t("cards:table.columnPhonetic", "Phonetic")}
              </th>
              <th className="py-3.5 px-4 font-bold text-black min-w-[240px]">
                {t("cards:table.columnDefinition", "Meaning")} &{" "}
                {t("cards:table.columnExample", "Example")}
              </th>
              <th className="py-3.5 px-4 font-bold text-black min-w-[180px]">
                {t("cards:form.notesLabel", "Notes")} &{" "}
                {t("ai_vocabulary:fields.collocations", "Collocations")}
              </th>
              <th className="py-3.5 px-4 font-bold text-black w-32">
                {t("cards:table.columnState", "SRS State")}
              </th>
              <th className="py-3.5 px-4 font-bold text-black w-24 text-right">
                {t("cards:table.columnActions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f0]">
            {cards.map((card) => {
              const isSelected = selectedCardIds.includes(card.id);
              const statusInfo = getStatusBadge(card.progress?.status);
              const isPlaying = playingAudioId === card.id;

              return (
                <tr
                  key={card.id}
                  onClick={() => onToggleSelect(card.id)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected ? "bg-[#f5f3ff]/60" : "hover:bg-[#fafafa]"
                  }`}
                >
                  {/* Checkbox Column */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(card.id)}
                      aria-label={`Chọn thẻ ${card.word}`}
                      className="w-4 h-4 rounded border-[#d4d4d4] text-[#7e22ce] focus:ring-[#7e22ce] cursor-pointer"
                    />
                  </td>

                  {/* Word & Phonetic */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) =>
                            handlePlayAudio(
                              e,
                              card.id,
                              card.word,
                              card.audioUrl,
                            )
                          }
                          aria-label={`${t("cards:table.playPronunciation", "Play pronunciation")}: ${card.word}`}
                          title={t(
                            "cards:table.playPronunciation",
                            "Play pronunciation",
                          )}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            isPlaying
                              ? "bg-[#f3e8ff] text-[#7e22ce] animate-pulse"
                              : "text-[#737373] hover:text-black hover:bg-[#f0f0f0]"
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        {onVoicePractice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onVoicePractice(card);
                            }}
                            aria-label={`${t("cards:table.voicePractice", "Voice practice")}: ${card.word}`}
                            title={t(
                              "cards:table.voicePractice",
                              "Voice practice",
                            )}
                            data-testid={`voice-practice-table-${card.id}`}
                            className="p-1.5 rounded-full text-[#737373] hover:text-[#7e22ce] hover:bg-[#f3e8ff] transition-colors cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-black text-sm block group-hover:text-[#7e22ce] transition-colors">
                          {card.word}
                        </span>
                        {card.phonetic && (
                          <span className="text-[11px] font-mono text-[#737373]">
                            {card.phonetic}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Meaning & Example */}
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-black line-clamp-2">
                      {card.meaning}
                    </p>
                    {card.exampleSentence && (
                      <p className="text-[11px] text-[#737373] italic mt-0.5 line-clamp-2">
                        "{card.exampleSentence}"
                      </p>
                    )}
                  </td>

                  {/* Mnemonic & Collocations */}
                  <td className="py-3.5 px-4">
                    {card.mnemonic && (
                      <div className="flex items-start gap-1 text-[11px] text-[#92400e] bg-[#fffbeb] p-1.5 rounded-md border border-[#fef3c7] mb-1">
                        <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#d97706]" />
                        <span className="line-clamp-2">{card.mnemonic}</span>
                      </div>
                    )}
                    {card.collocations && (
                      <span className="text-[10px] font-mono text-[#525252] line-clamp-1 block">
                        {card.collocations}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="block text-[10px] font-mono text-[#a3a3a3] mt-1">
                      {t("cards:table.repetitions", {
                        count: card.progress?.repetitions ?? 0,
                        defaultValue: `Repetitions: ${card.progress?.repetitions ?? 0}`,
                      })}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {onVoicePractice && (
                        <button
                          type="button"
                          onClick={() => onVoicePractice(card)}
                          aria-label={`${t("cards:table.voicePractice", "Voice practice")}: ${card.word}`}
                          title={t(
                            "cards:table.voicePractice",
                            "Voice practice",
                          )}
                          className="p-1.5 rounded-full text-[#737373] hover:text-[#7e22ce] hover:bg-[#f3e8ff] transition-colors cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(card)}
                        aria-label={`${t("cards:table.editCard", "Edit card")}: ${card.word}`}
                        title={t("cards:table.editCard", "Edit card")}
                        className="p-1.5 rounded-full text-[#737373] hover:text-black hover:bg-[#f0f0f0] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(card)}
                        aria-label={`${t("cards:table.deleteCard", "Delete card")}: ${card.word}`}
                        title={t("cards:table.deleteCard", "Delete card")}
                        className="p-1.5 rounded-full text-[#737373] hover:text-[#ff5f56] hover:bg-[#fff1f2] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
