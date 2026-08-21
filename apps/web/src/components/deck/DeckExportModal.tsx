import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  exportDeckToFile,
  filterCardsForExport,
} from "../../utils/parsers/exportGenerator";
import { cardsService } from "../../features/cards/services/cardsService";
import type {
  CardResponse,
  DeckResponse,
  DeckExportFormat,
  DeckExportFilter,
} from "@wordstreak/shared-types";

export interface DeckExportModalProps {
  isOpen: boolean;
  deckId?: string;
  deckTitle?: string;
  deck?: DeckResponse | { id: string; title: string };
  cards?: CardResponse[];
  initialCards?: CardResponse[];
  onClose: () => void;
}

export const DeckExportModal: React.FC<DeckExportModalProps> = ({
  isOpen,
  deckId: propDeckId,
  deckTitle: propDeckTitle,
  deck,
  cards: propCards,
  initialCards = [],
  onClose,
}) => {
  const activeDeckId = deck?.id || propDeckId || "";
  const activeDeckTitle = deck?.title || propDeckTitle || "Bộ từ vựng";
  const initialCardsList = propCards || initialCards;

  const [format, setFormat] = useState<DeckExportFormat>("CSV");
  const [filter, setFilter] = useState<DeckExportFilter>("ALL");
  const [allCards, setAllCards] = useState<CardResponse[]>(initialCardsList);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedInfo, setExportedInfo] = useState<{
    totalExported: number;
    filename: string;
  } | null>(null);

  // Fetch all cards when modal opens if needed
  useEffect(() => {
    if (!isOpen || !activeDeckId || initialCardsList.length > 0) return;
    let ignore = false;
    cardsService
      .getAllDeckCards(activeDeckId)
      .then((cards) => {
        if (!ignore) setAllCards(cards);
      })
      .catch(() => {
        if (!ignore) setAllCards([]);
      })
      .finally(() => {
        if (!ignore) setIsLoadingCards(false);
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, activeDeckId, initialCardsList.length]);

  const handleClose = useCallback(() => {
    if (isExporting) return;
    setExportedInfo(null);
    onClose();
  }, [isExporting, onClose]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isExporting) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, handleClose]);

  if (!isOpen) return null;

  const filteredCards = filterCardsForExport(allCards, filter);

  const handleTriggerExport = () => {
    try {
      setIsExporting(true);
      const result = exportDeckToFile(
        activeDeckTitle,
        allCards,
        format,
        filter,
      );
      setExportedInfo(result);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#e5e5e5] w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <h2
                id="export-modal-title"
                className="text-base sm:text-lg font-bold text-black"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Xuất danh sách từ vựng
              </h2>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              Bộ từ: <strong className="text-black">{activeDeckTitle}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cửa sổ"
            className="p-1.5 rounded-full hover:bg-[#f5f5f5] text-[#737373] hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373] block mb-2">
              1. Chọn định dạng xuất
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  format === "csv"
                    ? "border-black bg-white shadow-xs"
                    : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white text-[#737373]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet
                    className={`w-4 h-4 ${
                      format === "csv" ? "text-black" : "text-[#737373]"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      format === "csv" ? "text-black" : "text-[#525252]"
                    }`}
                  >
                    CSV (Excel / UTF-8)
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] leading-tight">
                  Tương thích hoàn toàn với Excel, Google Sheets, LibreOffice.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormat("apkg")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  format === "apkg"
                    ? "border-black bg-white shadow-xs"
                    : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white text-[#737373]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText
                    className={`w-4 h-4 ${
                      format === "apkg" ? "text-black" : "text-[#737373]"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      format === "apkg" ? "text-black" : "text-[#525252]"
                    }`}
                  >
                    Anki (.txt / TSV)
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] leading-tight">
                  Nhập nhanh vào ứng dụng Anki Desktop / AnkiMobile.
                </p>
              </button>
            </div>
          </div>

          {/* Filter Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#737373] block mb-2">
              2. Bộ lọc trạng thái từ
            </label>
            <div className="space-y-2">
              {[
                {
                  id: "ALL" as DeckExportFilter,
                  label: "Tất cả từ vựng",
                  desc: "Xuất toàn bộ thẻ từ có trong bộ này.",
                },
                {
                  id: "MASTERED" as DeckExportFilter,
                  label: "Chỉ từ đã thành thạo (Mastered)",
                  desc: "Chỉ bao gồm các từ đã nắm vững kiến thức.",
                },
                {
                  id: "LEARNING" as DeckExportFilter,
                  label: "Chỉ từ đang học / Thẻ mới (Learning & New)",
                  desc: "Xuất những từ cần tập trung củng cố ôn luyện.",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    filter === opt.id
                      ? "border-black bg-white shadow-xs"
                      : "border-[#e5e5e5] bg-[#fafafa] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="export-filter"
                      value={opt.id}
                      checked={filter === opt.id}
                      onChange={() => setFilter(opt.id)}
                      className="w-3.5 h-3.5 text-black border-[#d4d4d4] focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-black">
                        {opt.label}
                      </span>
                      <p className="text-[11px] text-[#737373]">{opt.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Count Stats */}
          <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#737373]">
              <Filter className="w-3.5 h-3.5 text-black" />
              <span>Số từ dự kiến xuất:</span>
            </div>
            <span className="font-mono font-bold text-black text-sm">
              {isLoadingCards ? "..." : `${filteredCards.length} từ`}
            </span>
          </div>

          {/* Success Toast */}
          {exportedInfo && (
            <div className="p-3.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] flex items-start gap-2 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đã tạo tập tin tải về thành công!</p>
                <p className="text-[11px] mt-0.5 font-mono">
                  {exportedInfo.filename} ({exportedInfo.totalExported} từ)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#fafafa] border-t border-[#e5e5e5] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-xs font-semibold text-black transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={filteredCards.length === 0 || isLoadingCards}
            onClick={handleTriggerExport}
            className="h-9 px-5 rounded-full bg-black text-white hover:bg-[#171717] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải về máy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
