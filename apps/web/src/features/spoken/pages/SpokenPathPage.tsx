import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, ChevronRight } from "lucide-react";
import { DashboardNavbar } from "../../dashboard/components/DashboardNavbar";
import { SourceAttributionBadge } from "../../library/components/SourceAttributionBadge";
import { getSpokenDecksByContext } from "../data/spokenDecks";
import type { SpokenDeckSummary } from "../data/spokenDecks";

export const SpokenPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedContext, setSelectedContext] = useState<"ALL" | "DAILY_LIFE" | "WORKPLACE" | "TRAVEL" | "EMOTIONS" | "SOCIALIZING">("ALL");

  const filteredDecks = useMemo(() => {
    return getSpokenDecksByContext(selectedContext);
  }, [selectedContext]);

  const totalWords = useMemo(() => {
    return filteredDecks.reduce((sum, d) => sum + d.cardsCount, 0);
  }, [filteredDecks]);

  const handleStartDeck = (deck: SpokenDeckSummary) => {
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

          <SourceAttributionBadge license="CC BY-SA 4.0" authors="Browne & Culligan (NGSL-S)" showAuthors />
        </div>

        {/* Page Title Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-[#000000] text-white rounded-full flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Lộ trình Giao tiếp Hàng ngày (NGSL-S 721 từ)
            </span>
            <span className="text-xs font-mono text-[#737373] bg-[#fafafa] px-2 py-0.5 rounded border border-[#e5e5e5]">
              NGSL-S Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#090909] font-nunito">
            Bản đồ Tiến trình Từ vựng & Hội thoại Giao tiếp
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] max-w-3xl leading-relaxed">
            24 chặng đàm thoại phản xạ tự nhiên dựa trên New General Service List - Spoken (NGSL-S),
            giúp làm chủ 90% vốn từ thông dụng nhất trong giao tiếp nói hàng ngày của người bản xứ.
          </p>
        </div>

        {/* NGSL-S Coverage Bar */}
        <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase tracking-wider">
                Độ phủ Đàm thoại NGSL-S
              </span>
              <div className="text-xl font-extrabold font-nunito text-[#090909]">
                24 Chặng · 721 Từ vựng Giao tiếp
              </div>
            </div>
            <div className="text-xs sm:text-right text-[#525252]">
              <span className="font-semibold text-[#090909]">Đạt 90% độ phủ</span> trong hội thoại nói tiếng Anh đời thực
            </div>
          </div>

          <div className="w-full bg-[#e5e5e5] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#000000] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((totalWords / 721) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] mt-2">
            <span>Hiển thị: {filteredDecks.length}/24 chặng</span>
            <span>{totalWords}/721 từ đàm thoại</span>
          </div>
        </div>

        {/* Context Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          {(
            [
              { id: "ALL", label: "Tất cả 24 Chặng" },
              { id: "DAILY_LIFE", label: "Đời sống Thường nhật (5 Chặng)" },
              { id: "WORKPLACE", label: "Công sở Đàm thoại (5 Chặng)" },
              { id: "SOCIALIZING", label: "Giao lưu Bạn bè (5 Chặng)" },
              { id: "TRAVEL", label: "Du lịch & Di chuyển (5 Chặng)" },
              { id: "EMOTIONS", label: "Cảm xúc & Tâm trạng (4 Chặng)" },
            ] as const
          ).map((ctx) => (
            <button
              key={ctx.id}
              role="tab"
              aria-selected={selectedContext === ctx.id}
              onClick={() => setSelectedContext(ctx.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedContext === ctx.id
                  ? "bg-[#000000] text-white"
                  : "bg-white text-[#525252] border border-[#e5e5e5] hover:border-[#000000]"
              }`}
            >
              {ctx.label}
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
                    {deck.contextLabel}
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
                  Luyện đàm thoại <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
