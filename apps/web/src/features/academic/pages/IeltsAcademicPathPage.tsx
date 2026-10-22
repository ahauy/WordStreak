import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, ChevronRight } from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SourceAttributionBadge } from "../../library/components/SourceAttributionBadge";
import { getIeltsPathTierDecks } from "../data/nawlDecks";
import type { IeltsPathDeckSummary } from "../data/nawlDecks";

export const IeltsAcademicPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<"ALL" | "BAND_5_6" | "BAND_6_7" | "BAND_7_PLUS">("ALL");

  const filteredDecks = useMemo(() => {
    return getIeltsPathTierDecks(selectedTier);
  }, [selectedTier]);

  const totalWords = useMemo(() => {
    return filteredDecks.reduce((sum, d) => sum + d.cardsCount, 0);
  }, [filteredDecks]);

  const handleStartDeck = (deck: IeltsPathDeckSummary) => {
    // Navigate to deck detail or study session
    navigate(`/library/decks/${deck.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#090909]">
      <DashboardNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#525252] hover:text-[#000000] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Thư viện</span>
          </Link>

          <SourceAttributionBadge license="CC BY-SA 4.0" authors="Browne, Culligan & Phillips (NAWL)" showAuthors />
        </div>

        {/* Page Title Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#000000] text-white rounded-full flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> Lộ trình IELTS Academic 960 từ
            </span>
            <span className="text-xs font-mono text-[#737373] bg-[#fafafa] px-2 py-0.5 rounded border border-[#e5e5e5]">
              NAWL 1.2 Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#090909] font-nunito">
            Bản đồ Tiến trình Từ vựng IELTS Academic
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] max-w-3xl leading-relaxed">
            32 chặng học thuật chuyên sâu được phân cấp theo mục tiêu Band điểm (5.5 - 8.0+), cung cấp vốn từ vựng nền tảng
            để giải quyết các bài đọc khó trong IELTS Reading và lập luận sắc bén trong IELTS Writing Task 2.
          </p>
        </div>

        {/* NAWL Coverage Bar */}
        <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                Độ phủ Học thuật NAWL
              </span>
              <div className="text-xl font-extrabold font-nunito text-[#090909]">
                32 Chặng · 960 Từ vựng Học thuật
              </div>
            </div>
            <div className="text-xs sm:text-right text-[#525252]">
              <span className="font-semibold text-[#090909]">Đạt 92% độ phủ</span> trong bài báo khoa học và tạp chí học thuật
            </div>
          </div>

          <div className="w-full bg-[#e5e5e5] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#000000] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((totalWords / 960) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] mt-2">
            <span>Hiển thị: {filteredDecks.length}/32 chặng</span>
            <span>{totalWords}/960 từ vựng</span>
          </div>
        </div>

        {/* Band Tier Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          {(
            [
              { id: "ALL", label: "Tất cả 32 Chặng" },
              { id: "BAND_5_6", label: "Band 5.5 - 6.5 (10 Chặng)" },
              { id: "BAND_6_7", label: "Band 6.5 - 7.5 (12 Chặng)" },
              { id: "BAND_7_PLUS", label: "Band 7.5+ (10 Chặng)" },
            ] as const
          ).map((tier) => (
            <button
              key={tier.id}
              role="tab"
              aria-selected={selectedTier === tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTier === tier.id
                  ? "bg-[#000000] text-white"
                  : "bg-white text-[#525252] border border-[#e5e5e5] hover:border-[#000000]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="group bg-white border border-[#e5e5e5] rounded-xl p-5 hover:border-[#000000] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#737373]">
                    CHẶNG {String(deck.order).padStart(2, "0")}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fafafa] border border-[#e5e5e5] text-[#090909]">
                    {deck.tierLabel}
                  </span>
                </div>

                <h3 className="font-nunito font-bold text-base text-[#090909] group-hover:text-black mb-1 line-clamp-1">
                  {deck.titleVi}
                </h3>
                <p className="text-xs font-mono text-[#737373] mb-3 line-clamp-1">
                  {deck.title}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f5f5f5] text-xs">
                <span className="font-mono text-[#737373]">
                  {deck.cardsCount} từ · ~{deck.estMinutes}p
                </span>

                <button
                  onClick={() => handleStartDeck(deck)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold bg-[#000000] text-white hover:bg-[#262626] transition-colors"
                >
                  Học chặng <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
